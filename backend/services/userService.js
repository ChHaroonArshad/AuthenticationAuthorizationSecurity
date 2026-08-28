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
  const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  console.log("🔍 Hashed token:", hashedToken);

  const user = await User.findOne({ emailVerificationToken: hashedToken });
  console.log("🔍 User found:", user ? user.email : "None");

  if (!user) throw new Error("Invalid verification token");
  if (!user.emailVerificationExpires || user.emailVerificationExpires.getTime() < Date.now())
    throw new Error("Verification link has expired");
  if (user.emailVerified) throw new Error("Email is already verified");

  user.emailVerified = true;
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
        userID: user._id,
        role: user.role
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
        throw new Error("Invalid email or password");
    }

    const pepper = process.env.PASSWORD_PEPPER;

    const checkPassword = await bcrypt.compare(
        password + pepper,
        user.password
    );

    if (!checkPassword) {
        throw new Error("Invalid email or password");
    }

    // role is now inside the token
    const accessToken = jwt.sign(
        {
            userID: user._id,
            role: user.role        // ← only change
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
        {
            userID: user._id,
            role: user.role        // ← only change
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { user, accessToken, refreshToken };
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

    // Determine role safely
    // Only buyer or seller allowed from UI
    // Admin only via secret key
    let role = "buyer";

    if (userData.adminKey) {
        if (userData.adminKey === process.env.ADMIN_SECRET_KEY) {
            role = "admin";
        } else {
            throw new Error("Invalid admin key");
        }
    } else if (userData.role === "seller") {
        role = "seller";
    }

    const verificationToken = crypto
        .randomBytes(32)
        .toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role,
        emailVerified: false,
        emailVerificationToken: hashedToken,
        emailVerificationExpires: Date.now() + 15 * 60 * 1000
    });

    await sendVerificationEmail(user.email, verificationToken);

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

// ======================================================
// GRANT PERMISSION
// ======================================================
const grantPermission = async (userId, permission) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // Don't duplicate — only add if not already there
    if (!user.permissions.includes(permission)) {
        user.permissions.push(permission);
        await user.save();
    }

    return user;
};


// ======================================================
// REVOKE PERMISSION
// ======================================================
const revokePermission = async (userId, permission) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    user.permissions = user.permissions.filter(p => p !== permission);
    await user.save();

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
    resendVerification,
    grantPermission,      // ← add
    revokePermission      // ← add
};