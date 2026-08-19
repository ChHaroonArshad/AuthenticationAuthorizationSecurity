const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/Userposts");

        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database failed to connect", error);
    }
}

module.exports = connectDB;