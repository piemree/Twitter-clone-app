const router = require("express").Router();
const passport = require("passport");
const Post = require("../models/postModel");
const User = require("../models/userModel");

router.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let text = req.body.text.trim();
    
    const newPost = new Post({
      user: {
        id: req.user.id,
        login: req.user.login,
        picture:req.user.picture
      },
      text: text,
    });

    newPost
      .save()
      .then((post) => res.status(200).json(post))
      .catch((err) => res.status(404).json(err));
  }
);

router.get("/", (req, res) => {
  Post.find()
    .sort({ createdAt: -1 })
    .then((posts) => res.status(200).json(posts))
    .catch((err) => res.status(404).json(err));
});

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let user = await User.findOne({ login: req.params.id });

      let isFollowed = user.followers.find((userId) => {
        return userId === req.user.id;
      });

      user["password"] = "secret";
      let posts = await Post.find({
        "user.id": user.id,
      }).sort({ createdAt: -1 });

      res.status(200).json({
        user: user,
        posts: posts,
        isMe: req.user.id === user.id,
        isFollow: isFollowed ? true : false,
      });
    } catch (error) {
      res.status(404).json(error);
    }
  }
);

router.post(
  "/like",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let postId = req.body.id;
    let currentUser = req.user.id;

    try {
      let post = await Post.findByIdAndUpdate(
        postId,
        { $push: { likes: currentUser } },
        { new: true }
      );

      let isLiked = post.likes.find((userId) => userId === req.user.id);

      res.status(200).json({
        post: post,
        isLiked: isLiked ? true : false,
      });
    } catch (error) {
      res.status(404).json(error);
    }
  }
);

router.post(
  "/unlike",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let postId = req.body.id;
    let currentUser = req.user.id;

    try {
      let post = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: currentUser } },
        { new: true }
      );

      let isLiked = post.likes.find((userId) => userId === req.user.id);

      res.status(200).json({
        post: post,
        isLiked: isLiked ? true : false,
      });
    } catch (error) {
      res.status(404).json(error);
    }
  }
);
module.exports = router;
