// to edit user details like change profile picture , username, etc ---> done
// get the logged in user details --->  done
//add the user you followed to your following and you in the following array of the user you followed same if you unfollow a user --->done
//add new post or delete a post for the user ---> done
const express = require("express");
const { extend } = require("lodash");
const { verifyToken } = require("../middleware/verifytoken");
const { User } = require("../models/user.model");
const { Post } = require("../models/post.model");
const { Feed } = require("../models/feeds.model");
const router = express.Router();

router.use(verifyToken);

router
  .route("/")
  .get(async (req, res) => {
    const { userId } = req;
    try {
      let user = await User.findById(userId);
      let feeds = await Feed.findById(userId);
      if (user) {
        user.password = undefined;
        user.email = undefined;
        user.__v = undefined;
        user = await user
          .populate("posts._id")
          .populate("followers._id")
          .populate("following._id")
          .populate("notification._id")
          .execPopulate();
        feeds = await feeds.populate("feeds._id").execPopulate();
        const NormalizedFeeds = feeds.feeds.map((item) => item._id._doc);
        console.log(user);
        const NormalizedPost = user.posts.map((item) => item._id._doc);
        const NormalizedFollowers = user.followers.map((item) => item._id._doc);
        const NormalizedFollowing = user.following.map((item) => item._id._doc);
        const NormalizedNotification = user.notification.map(
          (item) => item._id._doc
        );
        const UserDetails = {
          ...user._doc,
          posts: NormalizedPost,
          followers: NormalizedFollowers,
          following: NormalizedFollowing,
          notification: NormalizedNotification,
          feeds: NormalizedFeeds,
        };
        return res.status(200).json({ success: true, user: UserDetails });
      }
      return res
        .status(404)
        .json({ success: false, message: "User not found!!" });
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

router.route("/:userId").get(async (req, res) => {
  const { userId } = req.params;
  try {
    let user = await User.findById(userId);
    if (user) {
      user = await user
        .populate("posts._id")
        .populate("followers._id")
        .populate("following._id")
        .execPopulate();
      const NormalizedPost = user.posts.map((item) => item._id._doc);
      const NormalizedFollowers = user.followers.map((item) => item._id._doc);
      const NormalizedFollowing = user.following.map((item) => item._id._doc);
      const UserDetails = {
        ...user._doc,
        posts: NormalizedPost,
        followers: NormalizedFollowers,
        following: NormalizedFollowing,
      };
      return res.status(200).json({ success: true, user: UserDetails });
    }
    return res
      .status(404)
      .json({ success: false, message: "User Not Found!!!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.route("/follow").post(async (req, res) => {
  const { userId } = req;
  const { followingID } = req.body;
  try {
    let user = await User.findById(userId);
    let followedUser = await User.findById(followingID);
    if (user && followedUser) {
      user.following.push({ _id: followingID });
      followedUser.followers.push({ _id: userId });
      await user.save();
      await followedUser.save();
      return res.status(201).json({ success: true, followedUser });
    }
    return res
      .status(404)
      .json({ success: false, message: "User not found!!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.route("/unfollow").post(async (req, res) => {
  const { userId } = req;
  const { unFollowingID } = req.body;
  try {
    let user = await User.findById(userId);
    let unFollowedUser = await User.findById(unFollowingID);
    if (user && unFollowedUser) {
      user.following.pull({ _id: unFollowingID });
      unFollowedUser.followers.pull({ _id: userId });
      await user.save();
      await unFollowedUser.save();
      return res.status(201).json({ success: true, unFollowingID });
    }
    return res
      .status(404)
      .json({ success: false, message: "User not found!!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.route("/posts").post(async (req, res) => {
  const { userId } = req;
  const postDetails = req.body;
  try {
    const user = await User.findById(userId);
    if (user) {
      const NewPost = new Post({
        uid: userId,
        ...postDetails,
        likes: [],
        comments: [],
      });
      await NewPost.save();
      user.posts.push({ _id: NewPost._id });
      await user.save();
      return res.status(201).json({ success: true, post: NewPost });
    }
    return res
      .status(404)
      .json({ success: false, message: "User Not Found!!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.route("/posts/:postId").post(async (req, res) => {
  const { userId } = req;
  const { postId } = req.params;
  try {
    const user = await User.findById(userId);
    if (user) {
      user.posts.pull({ _id: postId });
      await user.save();
      await Post.remove({ _id: postId });
      return res.status(201).json({ success: true, postId });
    }
    return res
      .status(404)
      .json({ success: false, message: "User Not Found!!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
