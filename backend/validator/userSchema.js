const z = require("zod");

const objectId = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");


const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6)
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