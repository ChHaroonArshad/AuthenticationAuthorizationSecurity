const Post = require("../models/post.js");

// Get all posts
const getAllPosts = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    // Filter by owner
    if (query.owner) {
        filter.owner = query.owner;     // ← was "user", now "owner"
    }

    // Search by title
    if (query.search) {
        filter.title = {
            $regex: query.search,
            $options: "i"
        };
    }

    const posts = await Post.find(filter)
        .populate("owner", "name email")    // ← was "user"
        .select("title content owner createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    return posts;
};

// Get single post
const getPostById = async (id) => {
    const post = await Post.findById(id)
        .populate("owner", "name email");   // ← was "user"

    if (!post) {
        throw new Error("Post not found");
    }

    return post;
};

// Create post
const createPost = async (data) => {
    const post = await Post.create(data);
    return post;
};

// Update post
const updatePost = async (id, updateData) => {
    const post = await Post.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!post) {
        throw new Error("Post not found");
    }

    return post;
};

// Delete post
const deletePost = async (id) => {
    const post = await Post.findByIdAndDelete(id);

    if (!post) {
        throw new Error("Post not found");
    }

    return post;
};

// Aggregation: posts per user
const getPostsPerUser = async () => {
    const statistics = await Post.aggregate([
        {
            $group: {
                _id: "$owner",          // ← was "$user"
                totalPosts: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "owner"             // ← was "user"
            }
        },
        { $unwind: "$owner" },
        {
            $project: {
                _id: 0,
                user: "$owner.name",
                email: "$owner.email",
                totalPosts: 1
            }
        },
        { $sort: { totalPosts: -1 } }
    ]);

    return statistics;
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getPostsPerUser
};