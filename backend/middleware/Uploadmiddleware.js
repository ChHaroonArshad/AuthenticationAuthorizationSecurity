const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// ======================================================
// Configure Cloudinary using env vars
// Add these to your .env:
//   CLOUDINARY_CLOUD_NAME=your_cloud_name
//   CLOUDINARY_API_KEY=your_api_key
//   CLOUDINARY_API_SECRET=your_api_secret
// ======================================================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ======================================================
// Cloudinary storage — files go directly to the cloud
// No local disk involved at all
// ======================================================
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        return {
            // Folder in your Cloudinary account
            folder: "artspace/artworks",

            // Keep original format or convert to webp for optimization
            format: "webp",

            // Unique public_id using userId + timestamp
            public_id: `artwork-${req.user._id}-${Date.now()}`,

            // Transformations applied on upload
            transformation: [
                {
                    width: 1200,
                    height: 1200,
                    crop: "limit",      // only shrink, never enlarge
                    quality: "auto",    // cloudinary picks best quality
                    fetch_format: "auto"
                }
            ]
        };
    }
});

// Only allow image files
const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Only image files are allowed (jpg, jpeg, png, webp, gif)"),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024   // 10MB max
    }
});

// Export cloudinary instance too so controller can call destroy()
module.exports = { upload, cloudinary };

















// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Ensure uploads folder exists
// const uploadDir = path.join(__dirname, "../uploads/artworks");
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Where to store files and what to name them
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         // artworks-<userId>-<timestamp>.<ext>
//         const ext = path.extname(file.originalname).toLowerCase();
//         const name = `artwork-${req.user._id}-${Date.now()}${ext}`;
//         cb(null, name);
//     }
// });

// // Only allow image files
// const fileFilter = (req, file, cb) => {
//     const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
//     const ext = path.extname(file.originalname).toLowerCase();

//     if (allowed.includes(ext)) {
//         cb(null, true);
//     } else {
//         cb(new Error("Only image files are allowed (jpg, jpeg, png, webp, gif)"), false);
//     }
// };

// const upload = multer({
//     storage,
//     fileFilter,
//     limits: {
//         fileSize: 10 * 1024 * 1024  // 10MB max
//     }
// });

// module.exports = upload;