const userService = require("../services/userService");

const jwt = require("jsonwebtoken");
// reset password controller 

const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        await userService.resetPassword(
            token,
            newPassword
        );

        res.status(200).json({
            message: "Password reset successful"
        });

    } catch (error) {
        next(error);
    }
};
// forgot password controller 
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        await userService.forgotPassword(email);

        res.status(200).json({
            message: "If the email exists, a reset link has been sent."
        });

    } catch (error) {
        next(error);
    }
};
const RefreshAcessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token required",
      });
    }

    const accessToken =
      await userService.refreshAccessToken(refreshToken);

    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
    });

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};
// const RefreshAcessToken = async (req, res, next) => {
//     try {
// let {refreshToken} = req.body

//         const accessToken = await userService.refreshAccessToken(refreshToken);

//         res.status(200).json({
//             message: "Successfully got the Access token",
//             accessToken
//         });

//     } catch (error) {
//         next(error);
//     }
// };

// Get all users
const getAllUsers = async (req, res, next) => {
    try {

        const users = await userService.getAllUsers();

        res.status(200).json({
            message: "Users fetched successfully",
            data: users,
        });

    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        const result = await userService.login(
            email,
            password
        );
     res.cookie('refreshToken',result.refreshToken,{
            httpOnly : true,
            secure : false,
            sameSite : "strict"
        })

        res.status(200).json({
            message: "Login successful",

            data: result.accessToken
        });
   
    } catch (error) {

        next(error);

    }
};
// Get one user
const getUserById = async (req, res, next) => {
    try {

        const user = await userService.getUserById(req.params.id);

        res.status(200).json({
            message: "User found",
            data: user,
        });

    } catch (error) {
        next(error);
    }
};


// Create user
const createUser = async (req, res, next) => {
    try {

        const user = await userService.createUser(req.body);


        res.status(201).json({
            message: "User created successfully",
            data: user,
        });

    } catch (error) {
        next(error);
    }
};


// Update user
const updateUser = async (req, res, next) => {
    try {

        const user = await userService.updateUser(
            req.params.id,
            req.body
        );

        res.status(200).json({
            message: "User updated successfully",
            data: user,
        });

    } catch (error) {
        next(error);
    }
};


// Delete user
const deleteUser = async (req, res, next) => {
    try {

        await userService.deleteUser(req.params.id);

        res.status(200).json({
            message: "User deleted successfully",
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    login,
    RefreshAcessToken,
    forgotPassword,
    resetPassword
};