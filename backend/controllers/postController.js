const postService = require("../services/postService");


// Get all posts
const getAllPosts = async (req, res, next) => {

    try {

        const posts = await postService.getAllPosts(req.query);

        res.status(200).json({
            message: "Posts fetched successfully",
            data: posts
        });

    } catch (error) {

        next(error);

    }
};


// Get single post
const getPostById = async (req, res, next) => {

    try {

        const post = await postService.getPostById(req.params.id);

        res.status(200).json({
            message: "Post found",
            data: post
        });

    } catch (error) {

        next(error);

    }
};


// Create post
const createPost = async (req, res, next) => {

    try {

        const post = await postService.createPost(req.body);

        res.status(201).json({
            message: "Post created successfully",
            data: post
        });

    } catch (error) {

        next(error);

    }
};


// Update post
const updatePost = async (req, res, next) => {

    try {

        const post = await postService.updatePost(
            req.params.id,
            req.body
        );

        res.status(200).json({
            message: "Post updated successfully",
            data: post
        });

    } catch (error) {

        next(error);

    }
};


// Delete post
const deletePost = async (req, res, next) => {

    try {

        await postService.deletePost(req.params.id);

        res.status(200).json({
            message: "Post deleted successfully"
        });

    } catch (error) {

        next(error);

    }
};


// Aggregation
const getPostsPerUser = async (req, res, next) => {

    try {

        const statistics = await postService.getPostsPerUser();

        res.status(200).json({
            message: "Post statistics fetched successfully",
            data: statistics
        });

    } catch (error) {

        next(error);

    }
};


module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getPostsPerUser
};