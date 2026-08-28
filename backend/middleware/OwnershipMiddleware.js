// OwnershipMiddleware(Model)
// Checks if the logged-in user owns the resource.
// Always used AFTER AuthMiddleware.
// Admins bypass ownership — they can modify anything.
// Attaches req.resource so the controller doesn't refetch.

const OwnershipMiddleware = (Model) => {
    return async (req, res, next) => {
        try {
            const resource = await Model.findById(req.params.id);

            if (!resource) {
                return res.status(404).json({
                    message: "Resource not found"
                });
            }

            // Admins bypass ownership check
            if (req.user.role === "admin") {
                req.resource = resource;
                return next();
            }

            const isOwner =
                resource.owner.toString() === req.user._id.toString();

            if (!isOwner) {
                return res.status(403).json({
                    message: "You do not have permission to modify this resource"
                });
            }

            req.resource = resource;
            next();

        } catch (error) {
            next(error);
        }
    };
};

module.exports = OwnershipMiddleware;