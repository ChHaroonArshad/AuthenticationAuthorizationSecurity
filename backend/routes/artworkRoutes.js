const express = require("express");
const router  = express.Router();

const AuthMiddleware      = require("../middleware/AuthMiddleware");
const RoleMiddleware      = require("../middleware/RoleMiddleware");
const OwnershipMiddleware = require("../middleware/OwnershipMiddleware");
const { upload }          = require("../middleware/Uploadmiddleware");
const Artwork             = require("../models/Artwork");
const artworkController   = require("../controllers/Artworkcontroller");
const cache      = require("../middleware/cacheMiddleware");
const clearCache = require("../utils/clearCache");

// ======================================================
// OPTIONAL AUTH MIDDLEWARE
// Tries to attach req.user if a token is present.
// Does NOT block the request if there is no token.
// Used on GET routes so unauthenticated users can still
// browse published artworks, but authenticated users
// get the correct visibility (early_access, drafts etc.)
// ======================================================
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return next();

    const token = parts[1];
    const jwt  = require("jsonwebtoken");
    const User = require("../models/User");

    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
        if (err) return next();
        const user = await User.findById(payload.userID);
        if (user) req.user = user;
        next();
    });
};

// ======================================================
// GET ALL ARTWORKS — public with optional auth
// ======================================================
// router.get("/", optionalAuth, artworkController.getArtworks);

// ======================================================
// GET SINGLE ARTWORK — public with optional auth
// ======================================================
// router.get("/:id", optionalAuth, artworkController.getArtworkById);









// GET ALL — cache for 60 seconds
router.get(
    "/",
    optionalAuth,
    cache(60),                    // ← add this
    artworkController.getArtworks
);

// GET ONE — cache for 120 seconds
router.get(
    "/:id",
    optionalAuth,
    cache(120),                   // ← add this
    artworkController.getArtworkById
);
// ======================================================
// CREATE ARTWORK — seller or admin only
// upload.single("image") sends file straight to Cloudinary
// ======================================================
// CREATE
router.post(
    "/",
    AuthMiddleware,
    RoleMiddleware("seller", "admin"),
    upload.single("image"),
    artworkController.createArtwork,
    async (req, res, next) => { await clearCache("/artwork"); } // ← won't work like this
);
// ======================================================
// UPDATE ARTWORK — seller or admin + must own it
// Image upload is optional on update
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