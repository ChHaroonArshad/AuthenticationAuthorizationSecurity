const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middleware/AuthMiddleware");
const PermissionMiddleware = require("../middleware/PermissionMiddleware");

// ======================================================
// EARLY ACCESS DROPS
// Requires: logged in + has "feature:early_access" permission
// Admins always pass through (PermissionMiddleware skips for admin)
// ======================================================
router.get(
    "/early",
    AuthMiddleware,
    PermissionMiddleware("feature:early_access"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome to early access!",
            data: {
                user: req.user.name,
                role: req.user.role,
                permissions: req.user.permissions,
                drops: [
                    { id: 1, title: "Neon Horizons",    artist: "Zara M.",   price: "$340", available: "Dec 1"  },
                    { id: 2, title: "Silent Forest #3", artist: "Kai L.",    price: "$210", available: "Dec 3"  },
                    { id: 3, title: "Urban Pulse",      artist: "Priya D.",  price: "$580", available: "Dec 7"  },
                ]
            }
        });
    }
);

module.exports = router;