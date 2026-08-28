const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ======================================================
// STEP 1 HELPER — Build the URL that sends user to Google
// ======================================================
const getGoogleAuthURL = () => {

    // state = random string to prevent CSRF attacks
    // If someone forges a callback request, their state
    // won't match what we stored in the cookie → rejected
    const state = crypto.randomBytes(16).toString("hex");

    // codeVerifier = random string we keep secret
    // codeChallenge = SHA-256 hash of codeVerifier
    // We send challenge to Google, keep verifier ourselves
    // When we exchange the code, we prove we started the flow
    const codeVerifier = crypto.randomBytes(32).toString("hex");

    const codeChallenge = crypto
        .createHash("sha256")
        .update(codeVerifier)
        .digest("base64url"); // base64url, NOT base64

    // Build the Google authorization URL manually
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        response_type: "code",
        scope: "openid email profile",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        access_type: "offline",
        prompt: "select_account"  // always show account picker
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return { url, state, codeVerifier };
};


// ======================================================
// STEP 2 HELPER — Exchange the code Google gave us
// for a real Google access token
// ======================================================
const exchangeCodeForToken = async (code, codeVerifier) => {

    const params = new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
        code_verifier: codeVerifier  // prove we started the flow
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("Google token exchange failed:", error);
        throw new Error("Failed to exchange authorization code");
    }

    const data = await response.json();
    return data.access_token;
};


// ======================================================
// STEP 3 HELPER — Use Google access token to get
// the user's actual profile info
// ======================================================
const getGoogleUserInfo = async (googleAccessToken) => {

    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch Google user info");
    }

    const data = await response.json();

    // data contains: { id, email, name, picture, verified_email }
    return data;
};


// ======================================================
// STEP 4 HELPER — Find or create user in YOUR database
// Then issue YOUR OWN JWTs (same as your login() function)
// ======================================================
const findOrCreateGoogleUser = async (googleUser) => {
    const { id: googleId, email, name } = googleUser;

    // Case 1: Already used Google login before → just log in
    let user = await User.findOne({ googleId });

    if (user) {
        const accessToken = jwt.sign(
            { userID: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        const refreshToken = jwt.sign(
            { userID: user._id, role: user.role },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );
        return { user, accessToken, refreshToken, isNew: false };
    }

    // Case 2: Registered with email+password before → link accounts, log in
    user = await User.findOne({ email });

    if (user) {
        user.googleId = googleId;
        user.emailVerified = true;
        await user.save();

        const accessToken = jwt.sign(
            { userID: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        const refreshToken = jwt.sign(
            { userID: user._id, role: user.role },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );
        return { user, accessToken, refreshToken, isNew: false };
    }

    // Case 3: Brand new user → don't create yet, need role first
    return { isNew: true, pendingProfile: { googleId, email, name } };
};

module.exports = {
    getGoogleAuthURL,
    exchangeCodeForToken,
    getGoogleUserInfo,
    findOrCreateGoogleUser
};