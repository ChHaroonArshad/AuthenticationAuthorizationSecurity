// PermissionMiddleware(requiredPermission)
// Checks if req.user.permissions includes the required permission.
// Always placed AFTER AuthMiddleware so req.user is set.
// Admins bypass permission checks — they can do everything.
//
// Usage:
//   AuthMiddleware, PermissionMiddleware("run:auction"), controller

const PermissionMiddleware = (requiredPermission) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        // Admins bypass all permission checks
        if (req.user.role === "admin") {
            return next();
        }

        const hasPermission = req.user.permissions.includes(requiredPermission);

        if (!hasPermission) {
            return res.status(403).json({
                message: `Missing required permission: ${requiredPermission}`
            });
        }

        next();
    };
};

module.exports = PermissionMiddleware;