const Notification = require('../models/Notification');

/**
 * Creates an in-app notification and broadcasts real-time Socket event
 * @param {object} io Socket.IO instance
 * @param {object} data Notification payload
 */
const sendNotification = async (io, { userId, type, title, message, relatedDonationId = null, role = null }) => {
  try {
    let savedNotification = null;

    if (userId) {
      savedNotification = await Notification.create({
        userId,
        type,
        title,
        message,
        relatedDonationId
      });
    }

    if (io) {
      const payload = {
        notification: savedNotification,
        type,
        title,
        message,
        relatedDonationId,
        timestamp: new Date()
      };

      // Broadcast to specific user if targeted
      if (userId) {
        io.to(`user:${userId.toString()}`).emit('notification', payload);
      }

      // Broadcast to role-based rooms (e.g., all available drivers or all NGOs)
      if (role) {
        io.to(`role:${role}`).emit('role_notification', payload);
      }

      // Also broadcast general event so dashboards update in real time
      io.emit(type, payload);
    }

    return savedNotification;
  } catch (err) {
    console.error('[NotificationService Error]', err.message);
  }
};

module.exports = { sendNotification };
