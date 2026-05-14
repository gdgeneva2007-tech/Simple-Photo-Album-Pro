// controllers/authController.js
// TEMPLATE: copy as-is, works for any project using email + password

const bcrypt = require("bcryptjs");
const passport = require("../config/passport");
const db = require("../db/queries");
const { body, validationResult } = require("express-validator");

const signupValidationRules = [
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("lastName").trim().notEmpty().withMessage("Last name is required."),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Enter a valid email.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    })
];

const loginValidationRules = [
  body("email")
    .trim()
    .normalizeEmail()   // ← converts to lowercase before passport runs
    .isEmail()
    .withMessage("Please enter a valid email."),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
];


const getSignupForm = (req, res) => {
  res.render("signup", { title: "Sign Up", errors: [], formData: {} });
};

const postSignup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup", {
        title: "Sign Up",
        errors: errors.array(),
        formData: req.body
      });
    }
    const existingUser = await db.getUserByEmail(req.body.email);
    if (existingUser) {
      return res.render("signup", {
        title: "Sign Up",
        errors: [{ msg: "An account with this email already exists." }],
        formData: req.body
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await db.createUser({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword
    });
    res.redirect("/auth/login");
  } catch (err) {
    next(err);
  }
};

const getLoginForm = (req, res) => {
  res.render("login", {
    title: "Log In",
    error: req.session.messages ? req.session.messages.pop() : null
  });
};

const postLogin = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/auth/login",
  failureMessage: true
});

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

module.exports = {
  signupValidationRules,loginValidationRules,
  getSignupForm,
  postSignup,
  getLoginForm,
  postLogin,
  logout
};