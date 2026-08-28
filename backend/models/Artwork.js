const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        category: {
            type: String,
            enum: ["painting", "photography", "digital", "sculpture", "illustration", "premium", "other"],
            default: "other"
        },

        // Local file path — stored as /uploads/artworks/filename.jpg
        // Served statically from Express
        imageUrl: {
            type: String,
            required: true
        },

        // Original filename for display/download
        imageName: {
            type: String,
            default: ""
        },

        // draft = only seller + admin can see
        // published = everyone can see
        // early_access = only buyers with feature:early_access + seller + admin
        status: {
            type: String,
            enum: ["draft", "published", "early_access"],
            default: "draft"
        },

        // The seller who uploaded this artwork
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // How many times this artwork has been viewed
        views: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Artwork = mongoose.model("Artwork", artworkSchema);
module.exports = Artwork;