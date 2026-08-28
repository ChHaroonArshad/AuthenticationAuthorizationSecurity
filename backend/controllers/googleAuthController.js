const User = require("../models/User");
const jwt = require('jsonwebtoken')
const {
    getGoogleAuthURL,
    exchangeCodeForToken,
    getGoogleUserInfo,
    findOrCreateGoogleUser
} = require("../services/googleAuthService");

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,       // set true in production (HTTPS)
    sameSite: "lax",     // lax (not strict) — needed for OAuth redirects
    maxAge: 10 * 60 * 1000  // 10 minutes — just long enough for the flow
};

// ======================================================
// ROUTE 1: GET /auth/google
// Redirects the browser to Google's consent screen
// ======================================================
const redirectToGoogle = (req, res) => {

    const { url, state, codeVerifier } = getGoogleAuthURL();

    // Store state + codeVerifier in short-lived cookies
    // These only exist to verify the callback — gone after 10 min
    res.cookie("oauth_state", state, COOKIE_OPTIONS);
    res.cookie("oauth_code_verifier", codeVerifier, COOKIE_OPTIONS);

    // Send the browser to Google
    res.redirect(url);
};


// ======================================================
// ROUTE 2: GET /auth/google/callback
// Google sends the user back here after they approve
// ======================================================
const handleGoogleCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        const storedState = req.cookies.oauth_state;
        const storedCodeVerifier = req.cookies.oauth_code_verifier;

        if (!code || !state || state !== storedState || !storedCodeVerifier) {
            return res.redirect(`http://localhost:5173/login?error=invalid_state`);
        }

        res.clearCookie("oauth_state");
        res.clearCookie("oauth_code_verifier");

        const googleAccessToken = await exchangeCodeForToken(code, storedCodeVerifier);
        const googleUser = await getGoogleUserInfo(googleAccessToken);
        const result = await findOrCreateGoogleUser(googleUser);

        // ── Existing user → log in immediately ──────────────
        if (!result.isNew) {
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            return res.redirect(`http://localhost:5173/oauth/callback?token=${result.accessToken}`);
        }

        // ── New user → store profile in cookie, go to role picker ──
        res.cookie("pending_google_profile", JSON.stringify(result.pendingProfile), {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 10 * 60 * 1000   // 10 minutes to pick a role
        });

        return res.redirect(`http://localhost:5173/select-role`);

    } catch (error) {
        console.error("Google OAuth error:", error.message);
        res.redirect(`http://localhost:5173/login?error=oauth_failed`);
    }
};








const completeGoogleRegistration = async (req, res) => {
    try {
        const { role } = req.body;

        // Validate role — only buyer or seller allowed here
        if (!["buyer", "seller"].includes(role)) {
            return res.status(400).json({ message: "Invalid role selected" });
        }

        // Read the pending profile cookie
        const raw = req.cookies.pending_google_profile;
        if (!raw) {
            return res.status(400).json({ message: "Session expired. Please sign in with Google again." });
        }

        const { googleId, email, name } = JSON.parse(raw);

        // Safety check — don't create if they somehow already exist
        const existing = await User.findOne({ $or: [{ googleId }, { email }] });
        if (existing) {
            return res.status(400).json({ message: "Account already exists. Please log in." });
        }

        // Create the user now with the role they chose
        const user = await User.create({
            name,
            email,
            googleId,
            role,
            emailVerified: true
        });

        // Clear the pending cookie — done with it
        res.clearCookie("pending_google_profile");

        // Issue tokens exactly like normal login
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

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ accessToken });

    } catch (error) {
        console.error("Complete Google registration error:", error.message);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
};
module.exports = {
    redirectToGoogle,
    handleGoogleCallback,
    completeGoogleRegistration    // ← add this
};