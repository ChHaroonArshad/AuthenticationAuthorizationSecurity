const { ZodError } = require("zod");

const ZodMiddleware = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    req.body = validatedData.body;
    req.params = validatedData.params;
    req.query = validatedData.query;

    next();

  } catch (error) {

    if (error instanceof ZodError) {

      const formattedErrors = {};

      error.issues.forEach((err) => {
        const field = err.path.join(".");
        formattedErrors[field] = err.message;
      });

      return res.status(400).json({
        message: "Validation failed",
        errors: formattedErrors,
      });
    }

    next(error);
  }
};

module.exports = ZodMiddleware;