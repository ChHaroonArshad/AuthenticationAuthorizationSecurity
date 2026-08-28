const express = require("express");

const ZodMiddleware =
    require("../middleware/ZodMiddleware");

const AuthMiddleware =
    require("../middleware/AuthMiddleware");
const RoleMiddleware = require("../middleware/RoleMiddleware");
const {
    createUserSchema,
    updateUserSchema,
    getUserSchema
} = require("../validator/userSchema");
const PermissionMiddleware = require("../middleware/PermissionMiddleware");
const userController =
    require("../controllers/userController");
const rateLimit = require("express-rate-limit");
const router = express.Router();


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1,
    message: {
        message: "Too many login attempts. Please try again after 15 minutes"
    }
});

// ======================================================
// GRANT PERMISSION — admin only
// ======================================================
router.post(
    "/admin/grant-permission",
    AuthMiddleware,
    RoleMiddleware("admin"),
    userController.grantPermission
);

// ======================================================
// REVOKE PERMISSION — admin only
// ======================================================
router.post(
    "/admin/revoke-permission",
    AuthMiddleware,
    RoleMiddleware("admin"),
    userController.revokePermission
);
// ======================================================
// ADMIN ONLY — get all users
// ======================================================
router.get(
    "/admin/users",
    AuthMiddleware,
    RoleMiddleware("admin"),
    userController.getAllUsers
);

// ======================================================
// SELLER ONLY — seller dashboard placeholder
// ======================================================
router.get(
    "/seller/dashboard",
    AuthMiddleware,
    RoleMiddleware("seller"),
    (req, res) => {
        res.status(200).json({
            message: `Welcome seller ${req.user.name}`
        });
    }
);

// ======================================================
// ADMIN OR SELLER — shared route example
// ======================================================
router.get(
    "/manage/products",
    AuthMiddleware,
    RoleMiddleware("admin", "seller"),
    (req, res) => {
        res.status(200).json({
            message: `Welcome ${req.user.role} ${req.user.name}`
        });
    }
);
// Resend verification email
router.post(
    "/resend-verification",
    userController.resendVerification
);
// ======================================================
// EMAIL VERIFICATION
// ======================================================

router.get(
    "/verify-email/:token",
    userController.verifyEmail
);


// ======================================================
// LOGIN
// ======================================================

router.post(
    "/login",
    loginLimiter,
    userController.login
);

// ======================================================
// REGISTER
// ======================================================

router.post(
    "/register",
    ZodMiddleware(createUserSchema),
    userController.createUser
);


// ======================================================
// FORGOT PASSWORD
// ======================================================

router.post(
    "/forgot-password",
    userController.forgotPassword
);


// ======================================================
// RESET PASSWORD
// ======================================================

router.post(
    "/reset-password",
    userController.resetPassword
);


// ======================================================
// REFRESH TOKEN
// ======================================================

router.post(
    "/refresh",
    userController.RefreshAcessToken
);


// ======================================================
// PROTECTED PROFILE TEST
// ======================================================

router.get(
    "/profile",
    AuthMiddleware,
    userController.getAllUsers
);


// ======================================================
// GET ALL USERS
// ======================================================

router.get(
    "/",
    userController.getAllUsers
);


// ======================================================
// GET USER BY ID
// ======================================================

router.get(
    "/:id",
    ZodMiddleware(getUserSchema),
    userController.getUserById
);


// ======================================================
// UPDATE USER
// ======================================================

router.put(
    "/:id",
    ZodMiddleware(updateUserSchema),
    userController.updateUser
);


// ======================================================
// DELETE USER
// ======================================================

router.delete(
    "/:id",
    ZodMiddleware(getUserSchema),
    userController.deleteUser
);


module.exports = router;