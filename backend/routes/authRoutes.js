const express = require("express");
const router = express.Router();
const {
    redirectToGoogle,
    handleGoogleCallback,
    completeGoogleRegistration
} = require("../controllers/googleAuthController");
// New user picks their role after Google OAuth
router.post("/google/complete", completeGoogleRegistration);
// Redirect to Google consent screen
router.get("/google", redirectToGoogle);

// Google redirects back here
router.get("/google/callback", handleGoogleCallback);

module.exports = router;