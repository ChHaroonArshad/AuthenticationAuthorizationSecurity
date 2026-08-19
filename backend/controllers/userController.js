const userService = require("../services/userService");
// ======================================================
// resendVerification
// ======================================================

const resendVerification = async (req, res, next) => {

    try {

        const { email } = req.body;

        await userService.resendVerification(email);

        res.status(200).json({
            message: "Verification email sent successfully"
        });

    } catch (error) {

        next(error);

    }
};
// ======================================================
// VERIFY EMAIL
// ======================================================

const verifyEmail = async (req, res, next) => {

    try {

        const { token } = req.params;

        console.log(
            "VERIFICATION TOKEN FROM URL:",
            token
        );

        await userService.verifyEmail(token);

        res.status(200).json({
            message:
                "Email verified successfully"
        });

    } catch (error) {

        console.log(
            "VERIFICATION ERROR:",
            error.message
        );

        res.status(400).json({
            message: error.message
        });
    }
};


// ======================================================
// REGISTER
// ======================================================

const createUser = async (
    req,
    res,
    next
) => {

    try {

        console.log(
            "REGISTER CONTROLLER HIT"
        );

        console.log(
            "BODY:",
            req.body
        );

        const user =
            await userService.createUser(
                req.body
            );

        res.status(201).json({
            message:
                "User created successfully",
            data: user
        });

    } catch (error) {

        next(error);
    }
};


// ======================================================
// LOGIN
// ======================================================

const login = async (
    req,
    res,
    next
) => {

    try {

        const {
            email,
            password
        } = req.body;

        const result =
            await userService.login(
                email,
                password
            );

        res.cookie(
            "refreshToken",
            result.refreshToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "strict"
            }
        );

        res.status(200).json({
            message:
                "Login successful",

            data:
                result.accessToken
        });

    } catch (error) {

        next(error);
    }
};


// ======================================================
// FORGOT PASSWORD
// ======================================================

const forgotPassword = async (
    req,
    res,
    next
) => {

    try {

        const { email } = req.body;

        await userService.forgotPassword(
            email
        );

        res.status(200).json({
            message:
                "If the email exists, a reset link has been sent."
        });

    } catch (error) {

        next(error);
    }
};


// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (
    req,
    res,
    next
) => {

    try {

        const {
            token,
            newPassword
        } = req.body;

        await userService.resetPassword(
            token,
            newPassword
        );

        res.status(200).json({
            message:
                "Password reset successful"
        });

    } catch (error) {

        next(error);
    }
};


// ======================================================
// REFRESH TOKEN
// ======================================================

const RefreshAcessToken = async (
    req,
    res,
    next
) => {

    try {

        const refreshToken =
            req.cookies.refreshToken;

        if (!refreshToken) {

            return res.status(401).json({
                message:
                    "Refresh token required"
            });
        }

        const accessToken =
            await userService.refreshAccessToken(
                refreshToken
            );

        res.status(200).json({
            message:
                "Access token refreshed successfully",

            accessToken
        });

    } catch (error) {

        res.status(401).json({
            message:
                "Invalid or expired refresh token"
        });
    }
};


// ======================================================
// GET ALL USERS
// ======================================================

const getAllUsers = async (
    req,
    res,
    next
) => {

    try {

        const users =
            await userService.getAllUsers();

        res.status(200).json({
            message:
                "Users fetched successfully",

            data: users
        });

    } catch (error) {

        next(error);
    }
};


// ======================================================
// GET USER
// ======================================================

const getUserById = async (
    req,
    res,
    next
) => {

    try {

        const user =
            await userService.getUserById(
                req.params.id
            );

        res.status(200).json({
            message:
                "User found",

            data: user
        });

    } catch (error) {

        next(error);
    }
};


// ======================================================
// UPDATE USER
// ======================================================

const updateUser = async (
    req,
    res,
    next
) => {

    try {

        const user =
            await userService.updateUser(
                req.params.id,
                req.body
            );

        res.status(200).json({
            message:
                "User updated successfully",

            data: user
        });

    } catch (error) {

        next(error);
    }
};


// ======================================================
// DELETE USER
// ======================================================

const deleteUser = async (
    req,
    res,
    next
) => {

    try {

        await userService.deleteUser(
            req.params.id
        );

        res.status(200).json({
            message:
                "User deleted successfully"
        });

    } catch (error) {

        next(error);
    }
};


module.exports = {
    verifyEmail,
    createUser,
    login,
    forgotPassword,
    resetPassword,
    RefreshAcessToken,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    resendVerification

};