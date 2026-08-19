const bcrypt = require("bcrypt");
const User = require("../models/User.js");
const jwt = require('jsonwebtoken')
const crypto = require("crypto");

const sendResetEmail = require("../utils/email");
// forget pasword  
const forgotPassword = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordToken = hashedToken;

    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    await sendResetEmail(
    user.email,
    resetToken
);

    console.log("RESET TOKEN:", resetToken);

    return resetToken;
};


// new password 
const resetPassword = async (token, newPassword) => {

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error("Invalid or expired reset token");
    }

    // DO NOT bcrypt.hash here
    // pre("save") will hash it automatically
    user.password = newPassword;

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return true;
};
// LOGIN




const refreshAccessToken = async (refreshToken) => {

    if (!refreshToken) {
        throw new Error("Refresh token is required");

    }

    let payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET

    )

    const user = await User.findById(payload.userID)

    if (!user) {
        throw new Error("User not found");
    }


    let accessToken = jwt.sign({
        userID: user._id
    },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        })
    return accessToken
}

const login = async (email, password) => {

    const user = await User
        .findOne({ email })
        .select("+password");

    if (!user) {
        console.log("USER NOT FOUND");
        throw new Error("Invalid email or password");
    }

    console.log("USER FOUND:", user.email);
    console.log("PASSWORD HASH EXISTS:", !!user.password);

    const pepper = process.env.PASSWORD_PEPPER;

    const checkPassword = await bcrypt.compare(
        password + pepper,
        user.password
    );

    console.log("PASSWORD MATCH:", checkPassword);

    if (!checkPassword) {
        throw new Error("Invalid email or password");
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
// GET ALL USERS
const getAllUsers = async () => {

    const users = await User.find();

    return users;
};


// GET USER BY ID
const getUserById = async (id) => {

    const user = await User.findById(id);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};


// CREATE USER / REGISTER
const createUser = async (userData) => {

    const existingUser = await User.findOne({
        email: userData.email
    });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const user = await User.create(userData);

    return user;
};


// UPDATE USER
const updateUser = async (id, updateData) => {

    const user = await User.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};


// DELETE USER
const deleteUser = async (id) => {

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        throw new Error("User not found");
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
    resetPassword
};

