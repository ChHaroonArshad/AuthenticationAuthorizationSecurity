const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendResetEmail = async (email, resetToken) => {

    const resetLink =
        `http://localhost:5173/reset-password/${resetToken}`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset your password",
        html: `
            <h2>Password Reset</h2>

            <p>You requested a password reset.</p>

            <a href="${resetLink}">
                Reset Password
            </a>

            <p>This link expires in 15 minutes.</p>
        `
    });
};

module.exports = sendResetEmail;