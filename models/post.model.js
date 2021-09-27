const mongoose = require("mongoose");
const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    description: String,
    media: {
      type: String,
      required: [true, "Choose a Media"],
    },
    likes: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    comments: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", PostSchema);

module.exports = { Post };
