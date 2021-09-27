const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");

router.route("/signup").post(async (req, res) => {
  const user = req.body;
  try {
    const checkUser = await User.findOne({ email: user?.email });
    if (checkUser) {
      return res.status(403).json({
        success: true,
        message: "User Already Exist! please Login !!!",
      });
    }
    const NewUser = new User({
      ...user,
      profilePicture: "",
      posts: [],
      followers: [],
      following: [],
      notification: [],
    });
    const salt = await bcrypt.genSalt(10);
    NewUser.password = await bcrypt.hash(NewUser.password, salt);
    await NewUser.save();
    res.status(201).json({ success: true, user: NewUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.route("/login").post(async (req, res) => {
  const { userName, password } = req.body;
  try {
    const user = await User.findOne({ email: userName });
    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        const token = jwt.sign({ userId: user._id }, process.env.KEY, {
          expiresIn: "24h",
        });
        res.status(200).json({
          firstName: user.firstName,
          lastName: user.lastName,
          token,
          userId: user._id,
        });
      } else {
        res.status(401).json({ success: false, message: "Incorrect Password" });
      }
    } else {
      res
        .status(401)
        .json({ success: false, message: "User not found ! Please Sign Up" });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
