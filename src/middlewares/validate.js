const ApiError = require('../utils/ApiError');

function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.params) {
        const { value, error } = schemas.params.validate(req.params);
        if (error) throw new ApiError(400, error.details[0].message);
        req.params = value;
      }
      if (schemas.query) {
        const { value, error } = schemas.query.validate(req.query);
        if (error) throw new ApiError(400, error.details[0].message);
        req.query = value;
      }
      if (schemas.body) {
        const { value, error } = schemas.body.validate(req.body);
        if (error) throw new ApiError(400, error.details[0].message);
        req.body = value;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = validate;
