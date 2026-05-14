// middleware/auth.js
// TEMPLATE: copy to every auth project as-is

const ensureLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/auth/login");
};

const ensureGuest = (req, res, next) => {
  if (!req.isAuthenticated()) return next();
  res.redirect("/");
};

// OPTIONAL: only keep these if your project needs roles
const ensureMember = (req, res, next) => {
  if (req.isAuthenticated() && req.user.is_member) return next();
  res.redirect("/");
};

const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.is_admin) return next();
  res.status(403).render("error", {
    title: "Forbidden",
    message: "You do not have permission to do that."
  });
};

module.exports = { ensureLoggedIn, ensureGuest, ensureMember, ensureAdmin };