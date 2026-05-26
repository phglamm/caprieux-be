const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // Profile fields
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    dob: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    address: {
      street: { type: String, default: "" },
      ward: { type: String, default: "" },
      district: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "Vietnam" },
    },
  },
  {
    timestamps: true,
  },
);
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
module.exports = mongoose.model("User", UserSchema);
