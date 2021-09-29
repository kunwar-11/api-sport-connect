//get all notification --->  done
const express = require("express");
const { verifyToken } = require("../middleware/verifytoken");
const { User } = require("../models/user.model");
const router = express.Router();

router.use(verifyToken);

router.route("/").get(async (req, res) => {
  const { userId } = req;
  try {
    let user = await User.findById(userId);
    if (user) {
      user = await user
        .populate("notification.uid", "userName profilePicture")
        .execPopulate();
      const NormalizedNotification = user.notification.map((each) => ({
        ...each.uid._doc,
        pid: each.pid,
        notificationType: each.notificationType,
      }));
      return res
        .status(200)
        .json({ success: true, notification: NormalizedNotification });
    }
    return res
      .status(404)
      .json({ success: false, message: "User not found!!" });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
});

module.exports = router;
