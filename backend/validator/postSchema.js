const z = require("zod");

const createPostSchema = z.object({
    body: z.object({
        title: z.string().min(2),
        content: z.string().min(1)
        // owner is NOT here — server sets it from req.user._id
        // client never decides who owns a post
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
        content: z.string().min(1).optional()
        // owner cannot be changed via update either
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