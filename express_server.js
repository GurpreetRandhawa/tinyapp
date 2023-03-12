const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const methodOverride = require("method-override");
const {
  findUserbyEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["test"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
app.use(methodOverride("_method"));

const urlDatabase = {};

const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("user_register", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.session.user_id) {
    if (urlDatabase[req.params.id]) {
      if (urlDatabase[req.params.id].userID === req.session.user_id) {
        const longURL = urlDatabase[req.params.id].longURL;
        const templateVars = {
          user: users[req.session.user_id],
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
  const refinedUrlDatabase = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    user: users[req.session.user_id],
    urls: refinedUrlDatabase,
  };
  res.render("urls_index", templateVars);
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
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_login", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const id = generateRandomString();
    let longURL = "";
    req.body.longURL.slice(0, 7) === "http://"
      ? (longURL = req.body.longURL)
      : (longURL = "http://" + req.body.longURL);
    urlDatabase[id] = { longURL, userID: req.session.user_id };
    res.redirect(`/urls/${id}`);
  } else {
    res.send("<h2>Plese login to use this feature.</h2>");
  }
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  } else if (findUserbyEmail(req.body.email, users)) {
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
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const userFinder = findUserbyEmail(req.body.email, users);
  if (!userFinder) {
    res.sendStatus(403);
  } else {
    if (bcrypt.compareSync(req.body.password, userFinder.password)) {
      req.session.user_id = userFinder.id;
      res.redirect("urls");
    } else {
      res.sendStatus(403);
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect("/login");
});

app.put("/urls/:id", (req, res) => {
  if (req.session.user_id) {
    if (urlDatabase[req.params.id]) {
      if (urlDatabase[req.params.id].userID === req.session.user_id) {
        const id = req.params.id;
        let newURL = "";
        req.body.newURL.slice(0, 7) === "http://"
          ? (newURL = req.body.newURL)
          : (newURL = "http://" + req.body.newURL);
        urlDatabase[id] = { longURL: newURL, userID: req.session.user_id };
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

app.delete("/urls/:id/delete", (req, res) => {
  if (req.session.user_id) {
    if (urlDatabase[req.params.id]) {
      if (urlDatabase[req.params.id].userID === req.session.user_id) {
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
