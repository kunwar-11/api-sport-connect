// to get the loggedin user feed -->  done
const express = require("express");
const { verifyToken } = require("../middleware/verifytoken");
const { Feed } = require("../models/feeds.model");
const router = express.Router();
const { Post } = require("../models/post.model");

router.use(verifyToken);

router.route("/").get(async (req, res) => {
  const { userId } = req;
  try {
    let feeds = await Feed.findOne({ _id: userId });
    let posts = await Post.find({});
    feeds.feeds = posts;
    await feeds.save();
    feeds = await feeds.populate("feeds._id").execPopulate();
    const NormalizedFeed = feeds.feeds.map((each) => each._id._doc);
    res.status(200).json({ success: true, feeds: NormalizedFeed });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
