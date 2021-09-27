// to edit user details like change profile picture , username, etc
// get the logged in user details
//add the user you followed to your following and you in the following array of the user you followed same if you unfollow a user
//add new post or delete a post for the user
const express = require("express");
const { extend } = require("lodash");
const { verifyToken } = require("../middleware/verifytoken");
const { User } = require("../models/user.model");
const router = express.Router();

router.use(verifyToken);

router
  .route("/")
  .get(async (req, res) => {
    const { userId } = req;
    try {
      let user = await User.findById(userId);
      if (user) {
        user.password = undefined;
        user.email = undefined;
        //   user = await user
        //     .populate("posts.postId")
        //     .populate("followers.uid")
        //     .populate("following.uid")
        //     .execPopulate();

        return res.status(200).json({ success: true, user });
      }
      return res
        .status(404)
        .json({ success: false, message: "USer not found!!" });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  })
  .post(async (req, res) => {
    const editProfile = req.body;
    const { userId } = req;
    try {
      let user = await User.findById(userId);
      if (user) {
        user = extend(user, editProfile);
        await user.save();
        return res.status(200).json({ success: true, user });
      }
      return res
        .status(404)
        .json({ success: false, message: "User Not Found!!" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

module.exports = router;
