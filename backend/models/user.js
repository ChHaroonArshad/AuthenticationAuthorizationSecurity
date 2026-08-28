const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: false,      // Google users have no password
            select: false
        },
        googleId: {
            type: String,
            default: null
        },
        role: {
            type: String,
            enum: ["buyer", "seller", "admin"],
            default: "buyer"
        },
        permissions: {
            type: [String],
            default: []
        },
        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        },
        emailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: {
            type: String,
            default: null
        },
        emailVerificationExpires: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const pepper = process.env.PASSWORD_PEPPER;
    this.password = await bcrypt.hash(
        this.password + pepper,
        12
    );
});

const User = mongoose.model("User", userSchema);
module.exports = User;