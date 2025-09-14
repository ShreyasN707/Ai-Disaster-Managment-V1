const logger = require('../utils/logger');

/**
 * Send notification via email/SMS/push
 * @param {Object} params - Notification parameters
 * @param {string} params.to - Recipient address/phone
 * @param {string} params.type - Notification type (email/sms/push)
 * @param {string} params.message - Notification content
 */
async function sendNotification({ to, type, message }) {
  // Stub: integrate with email/SMS/push provider later.
  logger.info('Sending %s notification to %s: %s', type, to, message);
}

module.exports = { sendNotification };
