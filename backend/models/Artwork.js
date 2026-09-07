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
            enum: ["painting", "photography", "digital", "sculpture", "illustration", "other"],
            default: "other"
        },

        // Full Cloudinary URL — used directly in <img src>
        imageUrl: {
            type: String,
            required: true
        },

        // Original filename for display
        imageName: {
            type: String,
            default: ""
        },

        // Cloudinary public_id — needed to delete the image later
        // e.g. "artspace/artworks/artwork-userId-timestamp"
        publicId: {
            type: String,
            default: ""
        },

        // draft        = only seller + admin can see
        // published    = everyone can see
        // early_access = buyers with feature:early_access + seller + admin
        status: {
            type: String,
            enum: ["draft", "published", "early_access"],
            default: "draft"
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

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