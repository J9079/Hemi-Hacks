const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['DONATION_CREATED', 'MATCH_FOUND', 'NGO_ACCEPTED', 'DRIVER_ASSIGNED', 'PICKUP_STARTED', 'FOOD_PICKED_UP', 'DELIVERY_STARTED', 'DELIVERY_COMPLETED', 'DONATION_EXPIRING', 'GENERAL'],
      default: 'GENERAL'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    relatedDonationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
