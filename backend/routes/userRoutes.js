const express = require("express");
const ZodMiddleware = require("../middleware/ZodMiddleware");
const AuthMiddleware = require('../middleware/AuthMiddleware')

const {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
} = require("../validator/userSchema");

const userController = require("../controllers/userController");

const router = express.Router();

// Get all users
router.get("/", userController.getAllUsers);
router.post("/login", userController.login);
// reset password 
router.post(
    "/reset-password",
    userController.resetPassword
);

// forgot password route 
router.post(
    "/forgot-password",
    userController.forgotPassword
);

// refresh route 
router.post(
    "/refresh",
    userController.RefreshAcessToken
);
// test route for jwt  
router.get(
    "/profile",
    AuthMiddleware,
    userController.getAllUsers
);
// Get one user
router.get(
  "/:id",
  ZodMiddleware(getUserSchema),
  userController.getUserById
);

// Create user
router.post(
  "/",
  ZodMiddleware(createUserSchema),
  userController.createUser
);

// Update user
router.put(
  "/:id",
  ZodMiddleware(updateUserSchema),
  userController.updateUser
);

// Delete user
router.delete(
  "/:id",
  ZodMiddleware(getUserSchema),
  userController.deleteUser
);

module.exports = router;