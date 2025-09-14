const Joi = require('joi');

const createAlert = {
  body: Joi.object({
    area: Joi.string().required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    medium: Joi.string().valid('sms', 'email', 'push', 'broadcast').default('broadcast'),
    message: Joi.string().required(),
    active: Joi.boolean().default(true),
    source: Joi.string().valid('admin', 'ml').default('admin'),
  }),
};

const updateAlert = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    area: Joi.string(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical'),
    medium: Joi.string().valid('sms', 'email', 'push', 'broadcast'),
    message: Joi.string(),
    active: Joi.boolean(),
  }).min(1),
};

const exportReports = {
  query: Joi.object({ format: Joi.string().valid('pdf', 'excel').default('pdf') }),
};

module.exports = { createAlert, updateAlert, exportReports };
