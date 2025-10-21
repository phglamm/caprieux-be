var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var mongoose = require("mongoose");

// Load environment variables from .env when present
require("dotenv").config();

var app = express();

// Mount modular routers (products and payments)
var productsRouter = require("./routes/products");
var paymentsRouter = require("./routes/payments");

// Connect to MongoDB (use MONGODB_URI env var or default local DB)
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/caprieux-be";
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error(
      "MongoDB connection error:",
      err && err.message ? err.message : err
    );
  });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/products", productsRouter);
app.use("/api/payments", paymentsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
