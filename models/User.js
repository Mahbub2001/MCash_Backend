const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    pin: {
      type: String,
      required: true,
      minlength: 5,
    },
    nid: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["user", "agent", "admin"],
      default: "user",
    },
    isBlocked: { type: Boolean, default: false },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "user";
      },
    },
    refreshToken: {
      type: String,
      default: null,
      index: true,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("pin")) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
