/**
 * Function to find if a particular user exists or not by taking email from form as parameter.
 * @param {*} email
 * @returns null i user not found, if user found then returns the specific user object.
 */
const findUserbyEmail = function (email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return null;
};

/**
 * Function to generate random six digit alphanumeric string
 * @returns six digit random alphanumeric string
 */
const generateRandomString = function () {
  return Array.from(Array(6), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
};

/**
 *
 * @param {*} id
 * @return URLs where the userID is equal to the id of the current logged-in user.
 */
const urlsForUser = function (id, database) {
  const updatedUrlDatabase = {};
  for (let i in database) {
    if (database[i].userID === id) {
      updatedUrlDatabase[i] = database[i];
    }
  }
  return updatedUrlDatabase;
};
module.exports = { findUserbyEmail, generateRandomString, urlsForUser };
