const User = require("../models/user");
const jwt = require("jsonwebtoken");
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.status(201).json({ token });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).exec();
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.status(200).json({ token });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password").exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
