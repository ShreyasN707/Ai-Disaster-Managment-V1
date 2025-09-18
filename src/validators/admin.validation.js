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

// User validation schemas
const createUser = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    role: Joi.string().valid('ADMIN', 'OPERATOR').required(),
  }),
};

const updateUser = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    email: Joi.string().email(),
    name: Joi.string(),
    role: Joi.string().valid('ADMIN', 'OPERATOR'),
    isActive: Joi.boolean(),
  }).min(1),
};

// Sensor validation schemas
const createSensor = {
  body: Joi.object({
    sensorId: Joi.string().required(),
    type: Joi.string().required(),
    location: Joi.alternatives().try(
      Joi.string(),
      Joi.object({
        lat: Joi.number().optional(),
        lng: Joi.number().optional(),
        address: Joi.string().optional(),
      })
    ).required(),
    assignedTo: Joi.string().hex().length(24).optional(),
  }),
};

const updateSensor = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    sensorId: Joi.string(),
    type: Joi.string(),
    location: Joi.alternatives().try(
      Joi.string(),
      Joi.object({
        lat: Joi.number().optional(),
        lng: Joi.number().optional(),
        address: Joi.string().optional(),
      })
    ),
    assignedTo: Joi.string().hex().length(24).allow(null),
    status: Joi.string().valid('online', 'offline', 'warning'),
    battery: Joi.number().min(0).max(100),
    health: Joi.string().valid('good', 'warning', 'critical'),
  }).min(1),
};

module.exports = { 
  createAlert, 
  updateAlert, 
  exportReports,
  createUser,
  updateUser,
  createSensor,
  updateSensor
};
