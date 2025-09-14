const Joi = require('joi');

const subscribe = {
  body: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9+\-() ]+$/).optional(),
    notificationType: Joi.string().valid('sms', 'email', 'push').required(),
  }).custom((value, helpers) => {
    if (!value.email && !value.phone) return helpers.error('any.custom', 'Either email or phone is required');
    return value;
  }),
};

module.exports = { subscribe };
