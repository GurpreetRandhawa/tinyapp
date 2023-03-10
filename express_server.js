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
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("user_register", templateVars);
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

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  req.body.longURL.slice(0, 7) === "http://"
    ? (urlDatabase[id] = req.body.longURL)
    : (urlDatabase[id] = "http://" + req.body.longURL);
  res.redirect(`/urls/${id}`);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const userObject = {
    id: id,
    email: req.body.email,
    password: req.body.password,
  };
  users[id] = userObject;
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
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

function generateRandomString() {
  return Array.from(Array(6), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
