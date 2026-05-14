// app.js
// TEMPLATE: middleware order never changes
// Only thing you change: add your own routers at the bottom

require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("./config/passport");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./db/prisma");

// ── ADD YOUR ROUTERS HERE ──────────────────────────────
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
// const yourRouter = require("./routes/yourRouter");
// ──────────────────────────────────────────────────────
const albumsRouter=require("./routes/albums")
const photosRouter=require("./routes/photos")


const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// SESSION - must be before passport
app.use(session({
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// PASSPORT - must be after session
app.use(passport.initialize());
app.use(passport.session());

// Make user available in all EJS views
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// ── ADD YOUR ROUTES HERE ───────────────────────────────
app.use("/", indexRouter);
app.use("/auth", authRouter);
// app.use("/your-resource", yourRouter);
// ──────────────────────────────────────────────────────
app.use("/albums",albumsRouter)
app.use("/photos",photosRouter)


// 404
app.use((req, res) => {
  res.status(404).render("error", {
    title: "Not Found",
    message: "Page not found."
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Something went wrong."
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});