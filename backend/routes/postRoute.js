const express = require("express");
const ZodMiddleware = require("../middleware/ZodMiddleware");

const {
    createPostSchema,
    getPostSchema,
    updatePostSchema
} = require("../validator/postSchema.js");

const postController = require("../controllers/postController");

const router = express.Router();

// Get all users
router.get("/", postController.getAllPosts);

// Get one user
router.get(
  "/:id",
  ZodMiddleware(getPostSchema),
  postController.getPostById
);

// Create user
router.post(
  "/",
  ZodMiddleware(createPostSchema),
  postController.createPost
);

// Update user
router.put(
  "/:id",
  ZodMiddleware(updatePostSchema),
  postController.updatePost
);

// Delete user
router.delete(
  "/:id",
  ZodMiddleware(getPostSchema),
  postController.deletePost
);

module.exports = router;