const express = require("express");

const ZodMiddleware =
    require("../middleware/ZodMiddleware");

const AuthMiddleware =
    require("../middleware/AuthMiddleware");

const {
    createUserSchema,
    updateUserSchema,
    getUserSchema
} = require("../validator/userSchema");

const userController =
    require("../controllers/userController");

const router = express.Router();

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