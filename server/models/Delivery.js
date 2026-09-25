const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pickupLocation: {
      address: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    deliveryLocation: {
      address: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    distance: {
      type: Number,
      required: true // in kilometers
    },
    estimatedTime: {
      type: Number,
      required: true // in minutes
    },
    status: {
      type: String,
      enum: ['ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
      default: 'ASSIGNED'
    },
    pickupTime: {
      type: Date,
      default: null
    },
    deliveryTime: {
      type: Date,
      default: null
    },
    routeCoordinates: {
      type: [[Number]], // Array of [lat, lng] coordinates
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);
