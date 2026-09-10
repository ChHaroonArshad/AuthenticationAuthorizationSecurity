const express      = require("express");
const cors         = require("cors");
const path         = require("path");
const cookieParser = require("cookie-parser");
const compression  = require("compression");
require("dotenv").config();

const connectDB      = require("./config/db.js");
const redisClient    = require("./config/redisClient");
const userRoutes     = require("./routes/userRoutes");
const postRoute      = require("./routes/postRoute");
const authRoutes     = require("./routes/authRoutes");
const artworkRoutes  = require("./routes/artworkRoutes");
const dropsRoute     = require("./routes/dropsRoute");
const chatRoutes     = require("./routes/Chatroutes");       // ← new
const errorHandler   = require("./middleware/errorHandler");
const rateLimit      = require("./middleware/rateLimitMiddleware");

const app = express();

app.use(compression());

app.use(cors({
    origin:      "http://localhost:5173",
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

// Rate limits
app.use("/user/login",    rateLimit({ windowSec: 900,  max: 5,  message: "Too many login attempts. Try again in 15 minutes." }));
app.use("/user/register", rateLimit({ windowSec: 3600, max: 10, message: "Too many registrations from this IP." }));

// Routes
app.use("/user",    userRoutes);
app.use("/post",    postRoute);
app.use("/auth",    authRoutes);
app.use("/artwork", artworkRoutes);
app.use("/drops",   dropsRoute);
app.use("/chat",    chatRoutes);    // ← new

app.get("/", (req, res) => res.status(200).json({ status: "OK" }));

app.use(errorHandler);

module.exports = app;