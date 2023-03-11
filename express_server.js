const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("user_register", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.cookies["user_id"]) {
    if (urlDatabase[req.params.id]) {
      if (urlDatabase[req.params.id].userID === req.cookies["user_id"]) {
        const longURL = urlDatabase[req.params.id].longURL;
        const templateVars = {
          user: users[req.cookies["user_id"]],
          id: req.params.id,
          longURL,
        };
        res.render("urls_show", templateVars);
      } else {
        res.send("This short URL is not accessible to you.");
      }
    } else {
      res.send("Wrong short URL ");
    }
  } else {
    res.send("Please register/login first");
  }
});

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const refinedUrlDatabase = urlsForUser(req.cookies["user_id"]);
    const templateVars = {
      user: users[req.cookies["user_id"]],
      urls: refinedUrlDatabase,
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("You need to register/login first");
  }
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.send("<h2>This short url does not exist.</h2>");
  }
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_login", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const id = generateRandomString();
    let longURL = "";
    req.body.longURL.slice(0, 7) === "http://"
      ? (longURL = req.body.longURL)
      : (longURL = "http://" + req.body.longURL);
    urlDatabase[id] = { longURL, userID: req.cookies["user_id"] };
    res.redirect(`/urls/${id}`);
  } else {
    res.send("<h2>Plese login to use this feature.</h2>");
  }
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  } else if (findUserbyEmail(req.body.email)) {
    res.sendStatus(400);
  } else {
    const id = generateRandomString();
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userObject = {
      id: id,
      email: req.body.email,
      password: hashedPassword,
    };
    users[id] = userObject;
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const userFinder = findUserbyEmail(req.body.email);
  if (!userFinder) {
    res.sendStatus(403);
  } else {
    if (bcrypt.compareSync(req.body.password, userFinder.password)) {
      res.cookie("user_id", userFinder.id);
      res.redirect("urls");
    } else {
      res.sendStatus(403);
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/urls/:id", (req, res) => {
  if (req.cookies["user_id"]) {
    if (urlDatabase[req.params.id]) {
      if (urlDatabase[req.params.id].userID === req.cookies["user_id"]) {
        const id = req.params.id;
        let newURL = "";
        req.body.newURL.slice(0, 7) === "http://"
          ? (newURL = req.body.newURL)
          : (newURL = "http://" + req.body.newURL);
        urlDatabase[id] = { longURL: newURL, userID: req.cookies["user_id"] };
        res.redirect("/urls");
      } else {
        res.send(
          "You can not edit it as this short URL is not accessible to you."
        );
      }
    } else {
      res.send("Wrong short URL id ");
    }
  } else {
    res.send("Please register/login first");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.cookies["user_id"]) {
    if (urlDatabase[req.params.id]) {
      if (urlDatabase[req.params.id].userID === req.cookies["user_id"]) {
        const id = req.params.id;
        delete urlDatabase[id];
        res.redirect("/urls");
      } else {
        res.send(
          "You can not delete it as this short URL is not accessible to you."
        );
      }
    } else {
      res.send("Wrong short URL id ");
    }
  } else {
    res.send("Please register/login first");
  }
});

/**
 * Function to find if a particular user exists or not by taking email from form as parameter.
 * @param {*} email
 * @returns null i user not found, if user found then returns the specific user object.
 */
function findUserbyEmail(email) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return null;
}

/**
 * Function to generate random six digit alphanumeric string
 * @returns six digit random alphanumeric string
 */
function generateRandomString() {
  return Array.from(Array(6), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
}

/**
 *
 * @param {*} id
 * @return URLs where the userID is equal to the id of the current logged-in user.
 */
function urlsForUser(id) {
  const updatedUrlDatabase = {};
  for (let i in urlDatabase) {
    if (urlDatabase[i].userID === id) {
      updatedUrlDatabase[i] = urlDatabase[i];
    }
  }
  return updatedUrlDatabase;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
