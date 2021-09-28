const mongoose = require("mongoose");
const { Schema } = mongoose;

const FeedSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  feeds: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    },
  ],
});

const Feed = mongoose.model("Feed", FeedSchema);

module.exports = { Feed };
