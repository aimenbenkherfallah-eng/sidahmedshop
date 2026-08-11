const { ZodError } = require('zod');

const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    const first = details[0];
    const err = new Error(first ? `${first.field}: ${first.message}` : 'Validation failed');
    err.statusCode = 422;
    err.details = details;
    return next(err);
  }
  req[source] = result.data;
  next();
};

const isZodError = (err) => err instanceof ZodError;

module.exports = { validate, isZodError };
