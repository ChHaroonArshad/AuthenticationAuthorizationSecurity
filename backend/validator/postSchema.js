const z = require("zod");

const createPostSchema = z.object({
    body: z.object({
        title: z.string().min(2),
        content: z.string().min(1),
        user: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID")
    }),

    params: z.object({}),

    query: z.object({})
});


const getPostSchema = z.object({
    body: z.object({}),

    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID")
    }),

    query: z.object({})
});


const updatePostSchema = z.object({
    body: z.object({
        title: z.string().min(2).optional(),
        content: z.string().min(1).optional(),
        user: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID").optional()
    }),

    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID")
    }),

    query: z.object({})
});


module.exports = {
    createPostSchema,
    getPostSchema,
    updatePostSchema
};