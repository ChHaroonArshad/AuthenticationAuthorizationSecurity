const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");

const AuthMiddleware      = require("../middleware/AuthMiddleware");
const RoleMiddleware      = require("../middleware/RoleMiddleware");
const OwnershipMiddleware = require("../middleware/OwnershipMiddleware");
const upload              = require("../middleware/uploadMiddleware");
const Artwork             = require("../models/Artwork");
const artworkController   = require("../controllers/artworkController");

// ======================================================
// OPTIONAL AUTH — attaches req.user if token exists
// but does NOT block the request if there is no token.
// Used on public browse routes so buyers with
// feature:early_access permission see more artworks.
// ======================================================
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.userID);
        if (user) req.user = user;
    } catch {
        // Invalid token — just continue as unauthenticated
    }
    next();
};

// ======================================================
// GET ALL ARTWORKS — public, optional auth
// ======================================================
router.get(
    "/",
    optionalAuth,
    artworkController.getArtworks
);

// ======================================================
// GET SINGLE ARTWORK — public, optional auth
// ======================================================
router.get(
    "/:id",
    optionalAuth,
    artworkController.getArtworkById
);

// ======================================================
// CREATE ARTWORK — seller or admin only
// ======================================================
router.post(
    "/",
    AuthMiddleware,
    RoleMiddleware("seller", "admin"),
    upload.single("image"),
    artworkController.createArtwork
);

// ======================================================
// UPDATE ARTWORK — seller or admin + must own it
// ======================================================
router.put(
    "/:id",
    AuthMiddleware,
    RoleMiddleware("seller", "admin"),
    OwnershipMiddleware(Artwork),
    upload.single("image"),
    artworkController.updateArtwork
);

// ======================================================
// DELETE ARTWORK — seller or admin + must own it
// ======================================================
router.delete(
    "/:id",
    AuthMiddleware,
    RoleMiddleware("seller", "admin"),
    OwnershipMiddleware(Artwork),
    artworkController.deleteArtwork
);

module.exports = router;