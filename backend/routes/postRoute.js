const express = require("express");
const ZodMiddleware = require("../middleware/ZodMiddleware");
const AuthMiddleware = require("../middleware/AuthMiddleware");
const RoleMiddleware = require("../middleware/RoleMiddleware");
const OwnershipMiddleware = require("../middleware/OwnershipMiddleware");
const Post = require("../models/post");

const {
    createPostSchema,
    getPostSchema,
    updatePostSchema
} = require("../validator/postSchema.js");

const postController = require("../controllers/postController");

const router = express.Router();

// ======================================================
// GET ALL POSTS — public
// ======================================================
router.get(
    "/",
    postController.getAllPosts
);

// ======================================================
// GET ONE POST — public
// ======================================================
router.get(
    "/:id",
    ZodMiddleware(getPostSchema),
    postController.getPostById
);

// ======================================================
// CREATE POST — seller or admin only
// ======================================================
router.post(
    "/",
    AuthMiddleware,
    RoleMiddleware("seller", "admin"),
    ZodMiddleware(createPostSchema),
    postController.createPost
);

// ======================================================
// UPDATE POST — seller or admin + must own the post
// ======================================================
router.put(
    "/:id",
    AuthMiddleware,
    RoleMiddleware("seller", "admin"),
    OwnershipMiddleware(Post),
    ZodMiddleware(updatePostSchema),
    postController.updatePost
);

// ======================================================
// DELETE POST — seller or admin + must own the post
// ======================================================
router.delete(
    "/:id",
    AuthMiddleware,
    RoleMiddleware("seller", "admin"),
    OwnershipMiddleware(Post),
    ZodMiddleware(getPostSchema),
    postController.deletePost
);

module.exports = router;