const Joi = require('joi');

const acknowledge = {
  body: Joi.object({
    alertId: Joi.string().hex().length(24).required(),
    notes: Joi.string().allow(''),
  }),
};

const createSensor = {
  body: Joi.object({
    sensorId: Joi.string().required(),
    type: Joi.string().required(),
    location: Joi.object({ lat: Joi.number(), lng: Joi.number(), address: Joi.string() }).optional(),
    status: Joi.string().valid('online', 'offline', 'maintenance').optional(),
    battery: Joi.number().min(0).max(100).optional(),
    health: Joi.string().valid('good', 'warning', 'critical').optional(),
  }),
};

const updateSensor = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    type: Joi.string(),
    location: Joi.object({ lat: Joi.number(), lng: Joi.number(), address: Joi.string() }),
    status: Joi.string().valid('online', 'offline', 'maintenance'),
    battery: Joi.number().min(0).max(100),
    health: Joi.string().valid('good', 'warning', 'critical'),
  }).min(1),
};

const createIncident = {
  body: Joi.object({
    sensorId: Joi.string().hex().length(24).optional(),
    notes: Joi.string().allow('').optional(),
  }),
};

module.exports = { acknowledge, createSensor, updateSensor, createIncident };
