const assert = require("chai").assert;
const { findUserbyEmail, urlsForUser } = require("../helpers.js");

const testUsers = {
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

const testDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  z3BoGr: {
    longURL: "https://www.yahoo.ca",
    userID: "bJ48lW",
  },
  x3BoGr: {
    longURL: "https://www.wikipedia.ca",
    userID: "aJ48lW",
  },
  o3BoGr: {
    longURL: "https://www.msn.ca",
    userID: "dJ48lW",
  },
};

describe("getUserByEmail", () => {
  it("should return a user with valid email", () => {
    const user = findUserbyEmail("user@example.com", testUsers);
    const actualUser = testUsers["userRandomID"];
    assert.deepEqual(user, actualUser);
  });
  it("should return null with invalid email", () => {
    const user = findUserbyEmail("user3@example.com", testUsers);
    const actualUser = null;
    assert.equal(user, actualUser);
  });
});

describe("getURLsForUser", () => {
  it("should return URLs for a speciic user ID ", () => {
    const expectedURLs = urlsForUser("aJ48lW", testDatabase);
    const actualURLs = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
      },
      x3BoGr: {
        longURL: "https://www.wikipedia.ca",
        userID: "aJ48lW",
      },
    };
    assert.deepEqual(expectedURLs, actualURLs);
  });
});
