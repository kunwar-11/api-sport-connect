const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "first name is required"],
  },
  lastName: {
    type: String,
    required: [true, "last name is required"],
  },
  userName: {
    type: String,
    required: [true, "user name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email alredy exists"],
    validate: {
      validator: (v) => {
        return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          v
        );
      },
      message: (props) => `${props.value} is not a valid Email Id`,
    },
  },
  profilePicture: String,
  password: {
    type: String,
    required: [true, "password is required"],
  },
  posts: [
    {
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    },
  ],
  followers: [
    {
      uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  following: [
    {
      uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  notification: [
    {
      uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      type: String,
      enum: ["Like", "Comment"],
      required: true,
    },
  ],
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };
