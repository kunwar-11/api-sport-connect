// to manipulate a post adding removing like, adding removing editing comment --> done
//get inidividual post --> done
// and if liked or commented push a notification to the user who have posted --> done

const express = require("express");
const { extend } = require("lodash");
const { verifyToken } = require("../middleware/verifytoken");
const { Post } = require("../models/post.model");
const { User } = require("../models/user.model");
const router = express.Router();

router.use(verifyToken);

router.route("/:postId").get(async (req, res) => {
  const { postId } = req.params;
  try {
    let post = await Post.findById(postId);
    if (post) {
      post = await post
        .populate("uid", "userName profilePicture")
        .populate("comments.uid", "userName , profilePicture")
        .execPopulate();
      const NormalizedComment = post.comments.map((item) => {
        return {
          ...item._doc,
          user: item.uid._doc,
          uid: undefined,
        };
      });
      return res.status(200).json({
        success: true,
        post: {
          ...post._doc,
          comments: NormalizedComment,
        },
      });
    }
    return res
      .status(404)
      .json({ success: false, message: "Post Not Found!!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.route("/:postId/updateLike").post(async (req, res) => {
  const { userId } = req;
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    const user = await User.findById(post.uid);
    if (post) {
      if (
        post.likes.some((each) => each._id.toString() === userId.toString())
      ) {
        post.likes.pull({ _id: userId });
      } else {
        post.likes.push({ _id: userId });
        if (post.uid.toString() !== userId.toString())
          user.notification.push({
            uid: userId,
            notificationType: "Like",
            pid: postId,
          });
        await user.save();
      }
      await post.save();
      return res.status(201).json({ success: true, postId, userId });
    }
    return res
      .status(404)
      .json({ success: false, message: "Post Not Found!!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.route("/:postId/addComment").post(async (req, res) => {
  const { userId } = req;
  const { postId } = req.params;
  const { text } = req.body;
  try {
    const post = await Post.findById(postId);
    const user = await User.findById(post.uid);
    const commentedUser = await User.findById(userId);
    if (post) {
      post.comments.push({ uid: userId, text });
      await post.save();
      if (post.uid.toString() !== userId.toString()) {
        user.notification.push({
          uid: userId,
          notificationType: "Comment",
          pid: postId,
        });
        await user.save();
      }
      return res.status(201).json({
        success: true,
        postId,
        userName: commentedUser.userName,
        profilePicture: commentedUser.profilePicture,
        userId,
        _id: post.comments[post.comments.length - 1]._id,
      });
    }
    return res
      .status(404)
      .json({ success: false, message: "Post Not Found!!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router
  .route("/:postId/:commentId")
  .delete(async (req, res) => {
    const { postId, commentId } = req.params;
    try {
      const post = await Post.findById(postId);
      if (post) {
        post.comments.pull({ _id: commentId });
        await post.save();
        return res.status(201).json({
          success: true,
          postId,
          commentId,
        });
      }
      return res
        .status(404)
        .json({ success: false, message: "Post Not Found!!" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  })

  .post(async (req, res) => {
    const { postId, commentId } = req.params;
    const updateComment = req.body;
    try {
      const post = await Post.findById(postId);
      let comment = post.comments.find((each) => each._id == commentId);
      if (post && comment) {
        comment = extend(comment, updateComment);
        await post.save();
        const UpdateComment = post.comments.find(
          (each) => each._id == commentId
        );
        return res.status(200).json({ success: true, UpdateComment });
      }
      return res
        .status(404)
        .json({ success: false, message: "Post Not Found!!" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

module.exports = router;
