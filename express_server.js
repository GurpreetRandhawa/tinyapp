const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

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
  const longURL = urlDatabase[req.params.id];
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  longURL
    ? res.redirect(longURL)
    : res.send("<h2>This short url does not exist.</h2>");
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
    req.body.longURL.slice(0, 7) === "http://"
      ? (urlDatabase[id] = req.body.longURL)
      : (urlDatabase[id] = "http://" + req.body.longURL);
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
    const userObject = {
      id: id,
      email: req.body.email,
      password: req.body.password,
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
    if (userFinder.password === req.body.password) {
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
  const id = req.params.id;
  req.body.newURL.slice(0, 7) === "http://"
    ? (urlDatabase[id] = req.body.newURL)
    : (urlDatabase[id] = "http://" + req.body.newURL);
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
