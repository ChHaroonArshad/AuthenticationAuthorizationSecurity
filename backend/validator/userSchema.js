const z = require("zod");

const objectId = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");


const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

        // Optional — buyer or seller only from UI
        // Admin is assigned manually in DB or via secret key later
        role: z.enum(["buyer", "seller"]).optional(),

        // Optional — for future admin registration
        adminKey: z.string().optional()
    }),
    params: z.object({}),
    query: z.object({})
});

const getUserSchema = z.object({
    body: z.object({}),

    params: z.object({
        id: objectId
    }),

    query: z.object({})
});


const updateUserSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional()
    }),

    params: z.object({
        id: objectId
    }),

    query: z.object({})
});


module.exports = {
    createUserSchema,
    getUserSchema,
    updateUserSchema
};