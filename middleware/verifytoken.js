const express = require("express");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  try {
    const decoded = jwt.verify(token, process.env.KEY);
    req.userId = decoded.userId;
    return next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: "token expired" });
  }
};

module.exports = { verifyToken };
