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
var chatRouter = require("./routes/chat");
var orderRouter = require("./routes/order");
var authRouter = require("./routes/authRouter");
// Connect to MongoDB (use MONGODB_URI env var or default local DB)
const connectDB = require("./config/database");
connectDB();

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
app.use("/api/chat", chatRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/orders", orderRouter);
app.use("/api/auth", authRouter);
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
