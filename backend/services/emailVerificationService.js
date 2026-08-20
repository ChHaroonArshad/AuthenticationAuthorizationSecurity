const crypto = require("crypto");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/email");

const generateVerificationToken = async (userId) => {

    const token = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
const user = await User.findByIdAndUpdate(
    userId,
    {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: Date.now() + 1 * 60 * 1000
    },
    { new: true }
);

await sendVerificationEmail(user.email, token);
// await sendVerificationEmail(user.email, verificationToken);


    return token;
};


const verifyEmail = async (token) => {

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: {
            $gt: Date.now()
        }
    });

    if (!user) {
        throw new Error("Invalid or expired verification token");
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return user;
};


module.exports = {
    generateVerificationToken,
    verifyEmail
};