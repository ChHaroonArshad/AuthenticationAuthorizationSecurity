const artworkService = require("../services/Artworkservice");
const { cloudinary }  = require("../middleware/Uploadmiddleware");
const clearCache = require("../utils/clearCache");
// ======================================================
// GET ALL ARTWORKS
// ======================================================
const getArtworks = async (req, res, next) => {
    try {
        const result = await artworkService.getArtworks(
            req.query,
            req.user || null
        );

        res.status(200).json({
            message: "Artworks fetched successfully",
            data: result.artworks,
            meta: {
                total: result.total,
                page:  result.page,
                limit: result.limit,
                pages: Math.ceil(result.total / result.limit)
            }
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET SINGLE ARTWORK
// ======================================================
const getArtworkById = async (req, res, next) => {
    try {
        const artwork = await artworkService.getArtworkById(
            req.params.id,
            req.user || null
        );

        res.status(200).json({
            message: "Artwork found",
            data: artwork
        });
    } catch (error) {
        if (error.message === "Artwork not found") {
            return res.status(404).json({ message: "Artwork not found" });
        }
        next(error);
    }
};


// CREATE ARTWORK
const createArtwork = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const { title, description, price, category, status } = req.body;
        const imageUrl = `/uploads/artworks/${req.file.filename}`;

        const artwork = await artworkService.createArtwork({
            title,
            description,
            price: Number(price),
            category,
            status: status || "draft",
            imageUrl,
            imageName: req.file.originalname,
            owner: req.user._id
        });

        await clearCache("/artwork");   // ← invalidate artwork list cache

        res.status(201).json({
            message: "Artwork created successfully",
            data: artwork
        });
    } catch (error) {
        if (req.file) {
            const filePath = path.join(__dirname, "../uploads/artworks", req.file.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        next(error);
    }
};


// UPDATE ARTWORK
const updateArtwork = async (req, res, next) => {
    try {
        const { title, description, price, category, status } = req.body;
        const updateData = {};

        if (title)       updateData.title       = title;
        if (description) updateData.description = description;
        if (price)       updateData.price       = Number(price);
        if (category)    updateData.category    = category;
        if (status)      updateData.status      = status;

        if (req.file) {
            const oldArtwork = req.resource;
            if (oldArtwork?.imageUrl) {
                const oldPath = path.join(__dirname, "../", oldArtwork.imageUrl.replace(/^\//, ""));
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateData.imageUrl  = `/uploads/artworks/${req.file.filename}`;
            updateData.imageName = req.file.originalname;
        }

        const artwork = await artworkService.updateArtwork(req.resource._id, updateData);

        await clearCache("/artwork");   // ← invalidate artwork list cache

        res.status(200).json({
            message: "Artwork updated successfully",
            data: artwork
        });
    } catch (error) {
        if (req.file) {
            const filePath = path.join(__dirname, "../uploads/artworks", req.file.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        next(error);
    }
};


// DELETE ARTWORK
const deleteArtwork = async (req, res, next) => {
    try {
        await artworkService.deleteArtwork(req.resource._id);

        await clearCache("/artwork");   // ← invalidate artwork list cache

        res.status(200).json({
            message: "Artwork deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getArtworks,
    getArtworkById,
    createArtwork,
    updateArtwork,
    deleteArtwork
};