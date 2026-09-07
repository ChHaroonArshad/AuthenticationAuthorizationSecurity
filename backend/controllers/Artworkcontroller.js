const artworkService = require("../services/artworkService");
const { cloudinary }  = require("../middleware/Uploadmiddleware");

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


// ======================================================
// CREATE ARTWORK
// ======================================================
const createArtwork = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const { title, description, price, category, status } = req.body;

        // Cloudinary gives us the URL and public_id directly on req.file
        // req.file.path      = the full cloudinary URL
        // req.file.filename  = the public_id (used later for deletion)
        const artwork = await artworkService.createArtwork({
            title,
            description,
            price:     Number(price),
            category,
            status:    status || "draft",
            imageUrl:  req.file.path,          // full cloudinary URL
            imageName: req.file.originalname,
            publicId:  req.file.filename,      // cloudinary public_id for deletion
            owner:     req.user._id
        });

        res.status(201).json({
            message: "Artwork created successfully",
            data: artwork
        });
    } catch (error) {
        // If DB save fails, delete the already-uploaded cloudinary file
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
        }
        next(error);
    }
};


// ======================================================
// UPDATE ARTWORK
// ======================================================
const updateArtwork = async (req, res, next) => {
    try {
        const { title, description, price, category, status } = req.body;

        const updateData = {};
        if (title)       updateData.title       = title;
        if (description) updateData.description = description;
        if (price)       updateData.price       = Number(price);
        if (category)    updateData.category    = category;
        if (status)      updateData.status      = status;

        // If a new image was uploaded
        if (req.file) {
            // Delete the OLD image from cloudinary
            const oldArtwork = req.resource;  // attached by OwnershipMiddleware
            if (oldArtwork && oldArtwork.publicId) {
                await cloudinary.uploader.destroy(oldArtwork.publicId).catch(() => {});
            }

            // Store new cloudinary URL and public_id
            updateData.imageUrl  = req.file.path;
            updateData.imageName = req.file.originalname;
            updateData.publicId  = req.file.filename;
        }

        const artwork = await artworkService.updateArtwork(
            req.resource._id,
            updateData
        );

        res.status(200).json({
            message: "Artwork updated successfully",
            data: artwork
        });
    } catch (error) {
        // If DB update fails and we uploaded a new image, clean it up
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
        }
        next(error);
    }
};


// ======================================================
// DELETE ARTWORK
// ======================================================
const deleteArtwork = async (req, res, next) => {
    try {
        // Get publicId before deletion so we can remove from cloudinary
        const publicId = req.resource.publicId;

        await artworkService.deleteArtwork(req.resource._id);

        // Delete from cloudinary after DB deletion succeeds
        if (publicId) {
            await cloudinary.uploader.destroy(publicId).catch(() => {});
        }

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