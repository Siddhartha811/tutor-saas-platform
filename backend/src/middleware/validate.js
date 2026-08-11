// Usage: router.post('/', validate(createStudentSchema), createStudent)
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const error = new Error(
      result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    );
    error.statusCode = 400;
    return next(error);
  }
  req.body = result.data; // parsed/sanitized
  next();
};

module.exports = validate;