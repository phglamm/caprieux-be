const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const authenticateUser = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader)
    return res
      .status(401)
      .json({ message: "Access Denied. No Token Provided." });

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. Invalid Token Format." });
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user payload to request object
      next();
    } catch (error) {
      res.status(400).json({ message: "Invalid Token" });
    }
  }
};

// Middleware to check if user is an Admin
const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required." });
  }
  next();
};

module.exports = { authenticateUser, authorizeAdmin };
