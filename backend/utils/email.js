const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


// ======================================================
// RESET PASSWORD EMAIL
// ======================================================

const sendResetEmail = async (
    email,
    resetToken
) => {

    const resetLink =
        `http://localhost:5173/reset-password/${resetToken}`;

    console.log(
        "RESET LINK:",
        resetLink
    );

    await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: email,

        subject: "Reset your password",

        html: `
            <h2>Password Reset</h2>

            <p>
                You requested a password reset.
            </p>

            <a href="${resetLink}">
                Reset Password
            </a>

            <p>
                This link expires in 15 minutes.
            </p>
        `
    });
};


// ======================================================
// EMAIL VERIFICATION
// ======================================================

const sendVerificationEmail = async (
    email,
    verificationToken
) => {

    const verificationLink =
        `http://localhost:5173/verify-email/${verificationToken}`;

    console.log(
        "VERIFICATION LINK:",
        verificationLink
    );

    await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: email,

        subject: "Verify your email",

        html: `
            <h2>Verify your email</h2>

            <p>
                Thank you for registering.
            </p>

            <p>
                Click the button below to verify your email.
            </p>

            <a href="${verificationLink}">
                Verify Email
            </a>

            <p>
                This link expires in 15 minutes.
            </p>
        `
    });
};


module.exports = {
    sendResetEmail,
    sendVerificationEmail
};