const mongoose = require("mongoose");
const { Schema } = mongoose;

const FeedSchema = new Schema({
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  posts: [
    {
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    },
  ],
});

const Feed = mongoose.model("Feed", FeedSchema);

module.exports = { Feed };
