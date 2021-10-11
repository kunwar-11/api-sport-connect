// to edit user details like change profile picture , username, etc ---> done
// get the logged in user details --->  done
//add the user you followed to your following and you in the following array of the user you followed same if you unfollow a user --->done
//add new post or delete a post for the user ---> done
const express = require("express");
const { extend } = require("lodash");
const { verifyToken } = require("../middleware/verifytoken");
const { User } = require("../models/user.model");
const { Post } = require("../models/post.model");
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
        user.__v = undefined;
        user.notification = undefined;
        user = await user
          .populate("posts._id")
          .populate("followers._id", "userName profilePicture")
          .populate("following._id", "userName profilePicture")
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

router.route("/suggestedusers").get(async (req, res) => {
  const { userId } = req;
  try {
    const users = await User.find({});
    const { following } = await User.findById(userId);
    const FilterOutSelf = users.filter(
      (each) => each._id.toString() !== userId.toString()
    );
    let SuggestedUsers = FilterOutSelf.map((item) => {
      if (
        following.some((each) => each._id.toString() == item._id.toString())
      ) {
        return null;
      }
      return item;
    });
    SuggestedUsers = SuggestedUsers.filter((each) => each !== null);
    SuggestedUsers = SuggestedUsers.map((each) => ({
      profilePicture: each.profilePicture,
      firstName: each.firstName,
      lastName: each.lastName,
      userName: each.userName,
      _id: each._id,
    }));
    res.status(200).json({ success: true, SuggestedUsers });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.route("/:userId").get(async (req, res) => {
  const { userId } = req.params;
  try {
    let user = await User.findById(userId);
    if (user) {
      user.password = undefined;
      user.email = undefined;
      user.__v = undefined;
      user.notification = undefined;
      user = await user
        .populate("posts._id")
        .populate("followers._id", "userName profilePicture")
        .populate("following._id", "userName profilePicture")
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

router.route("/removefollower").post(async (req, res) => {
  let { userId } = req;
  let { removedUserId } = req.body;
  try {
    let user = await User.findById(userId);
    let removedUser = await User.findById(removedUserId);
    if (user && removedUser) {
      user.followers.pull({ _id: removedUserId });
      removedUser.following.pull({ _id: userId });
      await user.save();
      await removedUser.save();
      return res.status(201).json({ success: true, removedUserId });
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
