// to get the loggedin user feed -->  done
const express = require("express");
const { each } = require("lodash");
const { verifyToken } = require("../middleware/verifytoken");
const { Feed } = require("../models/feeds.model");
const router = express.Router();
const { Post } = require("../models/post.model");
const { User } = require("../models/user.model");

router.use(verifyToken);

router.route("/").get(async (req, res) => {
  const { userId } = req;
  try {
    let feeds = await Feed.findOne({ _id: userId });
    let posts = await Post.find({});
    let { following } = await User.findById(userId);
    console.log("before", posts);
    console.log(following);
    let Newposts = posts.map((item) => {
      if (
        following.some((each) => each._id.toString() == item.uid.toString())
      ) {
        return item;
      }
      return null;
    });
    Newposts = Newposts.filter((each) => each !== null);
    console.log("after", Newposts);
    feeds.feeds = Newposts;
    await feeds.save();
    feeds = await feeds.populate("feeds._id").execPopulate();
    const NormalizedFeed = feeds.feeds.map((each) => each._id._doc);
    res.status(200).json({ success: true, feeds: NormalizedFeed });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
