// RoleMiddleware(allowedRoles)
// Usage: RoleMiddleware("admin")
//        RoleMiddleware("admin", "seller")
//
// Always place AFTER AuthMiddleware.
// AuthMiddleware runs first — it finds the user and attaches
// req.user to the request. RoleMiddleware then checks req.user.role.

const RoleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {

        // AuthMiddleware must run before this
        // If req.user is missing, something is wired wrong
        if (!req.user) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `Access denied. Required role: ${allowedRoles.join(" or ")}`
            });
        }

        // Role is valid — let the request through
        next();
    };
};

module.exports = RoleMiddleware;