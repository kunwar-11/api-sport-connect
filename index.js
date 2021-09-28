const { initializeConncetion } = require("./dbConnection/db.connect");
const auth = require("./routes/auth.route");
const user = require("./routes/user.route");
const post = require("./routes/post.route");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 8000;
initializeConncetion();

app.use("/auth", auth);
app.use("/user", user);
app.use("/post", post);

app.use("/", (req, res) => {
  res.json({ success: true, message: "this is an API for Sport Connect" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "page not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "something went wrong",
    error: err.message,
  });
});
app.listen(PORT, () => console.log("server started at port", PORT));
