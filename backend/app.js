const express = require("express");

const app = express();
const cors = require("cors");
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}));
const cookieParser = require('cookie-parser');

app.use(cookieParser()); 
app.use(express.json());
require('dotenv').config(); 
const connectDB = require("./config/db.js");

const userRoutes = require("./routes/userRoutes");
const postRoute = require("./routes/postRoute");

const errorHandler = require("./middleware/errorHandler");




connectDB();


// Routes
app.use("/user", userRoutes);
app.use("/post", postRoute);


// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        status: "OK"
    });
});


// Central error handler
app.use(errorHandler);


module.exports = app;