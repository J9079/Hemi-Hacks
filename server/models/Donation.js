const mongoose = require('mongoose');
const { DONATION_STATUS } = require('../config/constants');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(DONATION_STATUS),
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { _id: false }
);

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Cooked Food', 'Packaged Food', 'Produce / Raw', 'Bakery / Dairy', 'Beverages', 'Other'],
      default: 'Cooked Food'
    },
    description: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than zero']
    },
    unit: {
      type: String,
      enum: ['kg', 'meals', 'packets', 'trays', 'liters'],
      default: 'kg'
    },
    preparedAt: {
      type: Date,
      required: [true, 'Preparation time is required'],
      default: Date.now
    },
    usableUntil: {
      type: Date,
      required: [true, 'Usable until / expiry time is required']
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required']
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    foodSafetyInfo: {
      type: String,
      default: 'Maintained under hygienic conditions, temperature compliant.'
    },
    photo: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(DONATION_STATUS),
      default: DONATION_STATUS.POSTED
    },
    matchingMode: {
      type: String,
      enum: ['AUTOMATIC', 'MANUAL'],
      default: 'AUTOMATIC'
    },
    matchedNgoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    statusHistory: [statusHistorySchema]
  },
  { timestamps: true }
);

// Add initial status to statusHistory upon creation
donationSchema.pre('save', function (next) {
  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory = [
      {
        status: this.status,
        timestamp: new Date(),
        note: 'Donation created and posted for rescue matching',
        updatedBy: this.donorId
      }
    ];
  }
  next();
});

module.exports = mongoose.model('Donation', donationSchema);
