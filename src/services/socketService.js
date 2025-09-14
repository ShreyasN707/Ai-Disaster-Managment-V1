const { Server } = require('socket.io');
const config = require('../config');
const logger = require('../utils/logger');

let ioInstance = null;

/**
 * Initialize Socket.IO with the HTTP server
 * @param {Object} server - HTTP server instance
 */
function initSocket(server) {
  // Create a new Socket.IO instance with the given server and CORS configuration
  ioInstance = new Server(server, {
    cors: {
      origin: config.origin,
      methods: ['GET', 'POST']
    }
  });

  // Set up event listener for new socket connections
  ioInstance.on('connection', (socket) => {
    // Log connection event with socket ID
    logger.info('Socket connected: %s', socket.id);

    // Set up event listener for socket disconnections
    socket.on('disconnect', () => {
      // Log disconnection event with socket ID
      logger.info('Socket disconnected: %s', socket.id);
    });
  });

  // Log successful initialization of Socket.IO
  logger.info('Socket.IO initialized');
  return ioInstance;
}

/**
 * Get the current Socket.IO instance
 * @throws {Error} If Socket.IO has not been initialized
 */
function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized');
  }
  return ioInstance;
}

/**
 * Emit a new alert to all connected clients
 * @param {Object} alert - Alert details to broadcast
 */
function emitAlert(alert) {
  if (!ioInstance) return;
  ioInstance.emit('alert:new', alert);
}

/**
 * Emit alert acknowledgement to all clients
 * @param {Object} params - Acknowledgement details
 * @param {string} params.alertId - ID of the acknowledged alert
 * @param {string} params.operatorId - ID of the acknowledging operator
 * @param {string} [params.notes] - Optional notes about the acknowledgement
 */
function emitAcknowledgement({ alertId, operatorId, notes = '' }) {
  if (!ioInstance) return;
  ioInstance.emit('alert:acknowledged', { alertId, operatorId, notes });
}

module.exports = { initSocket, getIO, emitAlert, emitAcknowledgement };
