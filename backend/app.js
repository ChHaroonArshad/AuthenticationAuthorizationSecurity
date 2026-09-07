const express      = require("express");
const cors         = require("cors");
const path         = require("path");
const cookieParser = require("cookie-parser");
const compression  = require("compression");
require("dotenv").config();

const connectDB      = require("./config/db.js");
const redisClient    = require("./config/redisClient");  // connects on import
const userRoutes     = require("./routes/userRoutes");
const postRoute      = require("./routes/postRoute");
const authRoutes     = require("./routes/authRoutes");
const artworkRoutes  = require("./routes/artworkRoutes");
const dropsRoute     = require("./routes/dropsRoute");
const errorHandler   = require("./middleware/errorHandler");
const rateLimit      = require("./middleware/rateLimitMiddleware");

const app = express();

// ── COMPRESSION ──────────────────────────────────────────
// Compresses all responses (gzip/deflate)
// Reduces response size by 60-80% for JSON and text
app.use(compression());

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// ── BODY + COOKIES ───────────────────────────────────────
app.use(cookieParser());
app.use(express.json());

// ── STATIC FILES ─────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── DATABASE ─────────────────────────────────────────────
connectDB();

// ── ROUTES ───────────────────────────────────────────────

// Auth routes — rate limited (brute force protection)
app.use("/user/login",    rateLimit({ windowSec: 900, max: 5,   message: "Too many login attempts. Try again in 15 minutes." }));
app.use("/user/register", rateLimit({ windowSec: 3600, max: 10, message: "Too many registrations from this IP." }));

app.use("/user",    userRoutes);
app.use("/post",    postRoute);
app.use("/auth",    authRoutes);
app.use("/artwork", artworkRoutes);
app.use("/drops",   dropsRoute);

// ── HEALTH CHECK ─────────────────────────────────────────
app.get("/", (req, res) => {
    res.status(200).json({ status: "OK" });
});

// ── ERROR HANDLER ────────────────────────────────────────
app.use(errorHandler);

module.exports = app;