const Artwork = require("../models/Artwork");

// ======================================================
// GET ARTWORKS
// Role logic:
//   admin          → sees all (draft + published + early_access)
//   seller         → sees published + early_access + their own drafts
//   buyer (normal) → sees published only
//   buyer (early)  → sees published + early_access
// ======================================================
const getArtworks = async (query, requestingUser) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;

    let filter = {};

    // Build visibility filter based on role + permissions
    if (!requestingUser) {
        // Unauthenticated — published only
        filter.status = "published";

    } else if (requestingUser.role === "admin") {
        // Admin sees everything — no filter

    } else if (requestingUser.role === "seller") {
        // Seller sees published + early_access + their own drafts
        filter.$or = [
            { status: { $in: ["published", "early_access"] } },
            { status: "draft", owner: requestingUser._id }
        ];

    } else {
        // Buyer
        const hasEarlyAccess = (requestingUser.permissions || [])
            .includes("feature:early_access");

        filter.status = hasEarlyAccess
            ? { $in: ["published", "early_access"] }
            : "published";
    }

    // Category filter
    if (query.category && query.category !== "all") {
        filter.category = query.category;
    }

    // Price range
    if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice) filter.price.$gte = Number(query.minPrice);
        if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }

    // Search by title
    if (query.search) {
        filter.title = { $regex: query.search, $options: "i" };
    }

    // Mine filter — seller viewing only their artworks
    if (query.mine === "true" && requestingUser) {
        filter.owner = requestingUser._id;
        delete filter.status;
        delete filter.$or;
    }

    const [artworks, total] = await Promise.all([
        Artwork.find(filter)
            .populate("owner", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Artwork.countDocuments(filter)
    ]);

    return { artworks, total, page, limit };
};


// ======================================================
// GET SINGLE ARTWORK
// ======================================================
const getArtworkById = async (id, requestingUser) => {
    // ONE query — find, populate, and increment views in a single round trip
    const artwork = await Artwork.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }              // return the updated document
    ).populate("owner", "name email");
    if (!artwork) throw new Error("Artwork not found");

    // Visibility check
    if (artwork.status === "draft") {
        if (!requestingUser) throw new Error("Artwork not found");
        const isOwner = artwork.owner._id.toString() === requestingUser._id.toString();
        if (!isOwner && requestingUser.role !== "admin") {
            throw new Error("Artwork not found");
        }
    }

    if (artwork.status === "early_access") {
        if (!requestingUser) throw new Error("Artwork not found");
        const hasAccess =
            requestingUser.role === "admin" ||
            requestingUser.role === "seller" ||
            (requestingUser.permissions || []).includes("feature:early_access");
        if (!hasAccess) throw new Error("Artwork not found");
    }

    // Increment view count
    // await Artwork.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return artwork;
};


// ======================================================
// CREATE ARTWORK
// ======================================================
const createArtwork = async (data) => {
    const artwork = await Artwork.create(data);
    return artwork;
};


// ======================================================
// UPDATE ARTWORK
// ======================================================
const updateArtwork = async (id, updateData) => {
    const artwork = await Artwork.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!artwork) throw new Error("Artwork not found");
    return artwork;
};


// ======================================================
// DELETE ARTWORK
// No file deletion here — controller handles cloudinary
// ======================================================
const deleteArtwork = async (id) => {
    const artwork = await Artwork.findByIdAndDelete(id);
    if (!artwork) throw new Error("Artwork not found");
    return artwork;
};


module.exports = {
    getArtworks,
    getArtworkById,
    createArtwork,
    updateArtwork,
    deleteArtwork
};