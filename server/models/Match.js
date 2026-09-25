const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    distance: {
      type: Number,
      required: true,
      description: 'Haversine distance in kilometers'
    },
    capacityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    needScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    foodCompatibilityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    expirySafetyScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    finalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);
