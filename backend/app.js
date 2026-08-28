const express    = require("express");
const cors       = require("cors");
const path       = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB      = require("./config/db.js");
const userRoutes     = require("./routes/userRoutes");
const postRoute      = require("./routes/postRoute");
const authRoutes     = require("./routes/authRoutes");
const artworkRoutes  = require("./routes/artworkRoutes");
const dropsRoute     = require("./routes/dropsRoute");
const errorHandler   = require("./middleware/errorHandler");

const app = express();

// ── CORS ────────────────────────────────────────────────
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// ── BODY + COOKIES ──────────────────────────────────────
app.use(cookieParser());
app.use(express.json());

// ── STATIC FILES — serve uploaded images ────────────────
// No helmet — it blocks cross-origin images in development
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── DATABASE ─────────────────────────────────────────────
connectDB();

// ── ROUTES ───────────────────────────────────────────────
app.use("/user",    userRoutes);
app.use("/post",    postRoute);
app.use("/auth",    authRoutes);
app.use("/artwork", artworkRoutes);
app.use("/drops",   dropsRoute);

// ── HEALTH CHECK ─────────────────────────────────────────
app.get("/", (req, res) => {
    res.status(200).json({ status: "OK" });
});

// ── ERROR HANDLER ─────────────────────────────────────────
app.use(errorHandler);

module.exports = app;