const { generateTokens } = require("../utils/generate_token");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  const { name, mobile, email, pin, nid, role } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ mobile }, { email }, { nid }],
    });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: "Mobile, email, or NID already exists" });
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    let balance = 0;
    if (role === "user") {
      balance = 40; 
    } else if (role === "agent") {
      balance = 100000;
    }

    const user = new User({
      name,
      mobile,
      email,
      pin: hashedPin,
      nid,
      role,
      balance,
      isApproved: role === "user",
    });

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, { maxAge: 1 * 24 * 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).send({ message: "Registration successful", accessToken });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { mobile, pin } = req.body;

  try {
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    if (user.refreshToken) {
      try {
        jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN_SECRET);
        return res
          .status(403)
          .send({ message: "You are already logged in from another device" });
      } catch (err) {
        user.refreshToken = null;
      }
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, { maxAge: 1 * 24 * 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).send({ message: "Login successful", accessToken });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};
exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).send({ message: "Refresh token is required" });
  }

  try {
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    user.refreshToken = null;
    await user.save();

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).send({ message: "Logout successful" });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

// exports.refreshToken = async (req, res) => {
//   const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) {
//     return res.status(401).send({ message: "Refresh token is required" });
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user || user.refreshToken !== refreshToken) {
//       return res.status(403).send({ message: "Invalid refresh token" });
//     }
//     const { accessToken } = generateTokens(user._id);
//     res.status(200).send({ message: "Access token refreshed", accessToken });
//   } catch (err) {
//     res.status(403).send({ message: "Invalid or expired refresh token" });
//   }
// };
