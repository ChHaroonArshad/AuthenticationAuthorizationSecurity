const bcrypt = require("bcrypt");
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const {
    sendResetEmail,
    sendVerificationEmail
} = require("../utils/email.js");

//resendVerification mail
const resendVerification = async (email) => {

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.emailVerified) {
        throw new Error("Email is already verified");
    }

    // Generate NEW verification token
    const verificationToken =
        crypto.randomBytes(32).toString("hex");

    // Hash token before storing it
    const hashedToken =
        crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

    // Save NEW token and NEW expiry
    user.emailVerificationToken = hashedToken;

    user.emailVerificationExpires =
        Date.now() + 15 * 60 * 1000;

    await user.save();

    // Send the PLAIN token through email
    await sendVerificationEmail(
        user.email,
        verificationToken
    );

    console.log("NEW VERIFICATION TOKEN:");
    console.log(verificationToken);

    return true;
};
// ======================================================
// VERIFY EMAIL
// ======================================================
const verifyEmail = async (verificationToken) => {

    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    // First find the user using the token
    const user = await User.findOne({
        emailVerificationToken: hashedToken
    });

    // Token does not exist in database
    if (!user) {
        throw new Error("Invalid verification token");
    }

    // Token exists but has expired
    if (user.emailVerificationExpires < Date.now()) {
        throw new Error("Verification link has expired");
    }

    // Email is already verified
    if (user.emailVerified) {
        throw new Error("Email is already verified");
    }

    // Verify email
    user.emailVerified = true;

    // Remove verification token
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return user;
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

const forgotPassword = async (email) => {

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    const resetToken =
        crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordToken = hashedToken;

    user.resetPasswordExpires =
        Date.now() + 15 * 60 * 1000;

    await user.save();

    await sendResetEmail(
        user.email,
        resetToken
    );

    console.log("RESET TOKEN:", resetToken);

    return resetToken;
};


// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (token, newPassword) => {

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    });

    if (!user) {
        throw new Error(
            "Invalid or expired reset token"
        );
    }

    // pre("save") hashes the password
    user.password = newPassword;

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return true;
};


// ======================================================
// REFRESH ACCESS TOKEN
// ======================================================

const refreshAccessToken = async (refreshToken) => {

    if (!refreshToken) {
        throw new Error(
            "Refresh token is required"
        );
    }

    const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(
        payload.userID
    );

    if (!user) {
        throw new Error("User not found");
    }

    const accessToken = jwt.sign(
        {
            userID: user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );

    return accessToken;
};


// ======================================================
// LOGIN
// ======================================================

const login = async (email, password) => {

    const user = await User
        .findOne({ email })
        .select("+password");

    if (!user) {
        throw new Error(
            "Invalid email or password"
        );
    }

    const pepper =
        process.env.PASSWORD_PEPPER;

    const checkPassword =
        await bcrypt.compare(
            password + pepper,
            user.password
        );

    if (!checkPassword) {
        throw new Error(
            "Invalid email or password"
        );
    }

    const accessToken = jwt.sign(
        {
            userID: user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    const refreshToken = jwt.sign(
        {
            userID: user._id
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d"
        }
    );

    return {
        user,
        accessToken,
        refreshToken
    };
};


// ======================================================
// CREATE USER / REGISTER
// ======================================================
const createUser = async (userData) => {
    const existingUser = await User.findOne({
        email: userData.email
    });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    // 1. Generate plain verification token
    const verificationToken = crypto
        .randomBytes(32)
        .toString("hex");

    // 2. Hash token
    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    console.log("PLAIN VERIFICATION TOKEN:", verificationToken);
    console.log("HASHED VERIFICATION TOKEN:", hashedToken);

    // 3. Create user WITH verification data
    const user = await User.create({
        ...userData,

        emailVerified: false,

        emailVerificationToken: hashedToken,

        emailVerificationExpires:
            Date.now() + 15 * 60 * 1000
    });

    // 4. Confirm what was actually saved in MongoDB
    console.log("SAVED USER TOKEN:", user.emailVerificationToken);
    console.log(
        "SAVED USER EXPIRY:",
        user.emailVerificationExpires
    );

    // 5. Send plain token through email
    await sendVerificationEmail(
        user.email,
        verificationToken
    );

    console.log("VERIFICATION EMAIL SENT");

    return user;
};

// ======================================================
// GET ALL USERS
// ======================================================

const getAllUsers = async () => {

    return await User.find();
};


// ======================================================
// GET USER BY ID
// ======================================================

const getUserById = async (id) => {

    const user =
        await User.findById(id);

    if (!user) {
        throw new Error(
            "User not found"
        );
    }

    return user;
};


// ======================================================
// UPDATE USER
// ======================================================

const updateUser = async (
    id,
    updateData
) => {

    const user =
        await User.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

    if (!user) {
        throw new Error(
            "User not found"
        );
    }

    return user;
};


// ======================================================
// DELETE USER
// ======================================================

const deleteUser = async (id) => {

    const user =
        await User.findByIdAndDelete(id);

    if (!user) {
        throw new Error(
            "User not found"
        );
    }

    return user;
};


module.exports = {
    login,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification
};