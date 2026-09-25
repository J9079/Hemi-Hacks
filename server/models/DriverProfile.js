const mongoose = require('mongoose');

const driverProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    vehicleType: {
      type: String,
      enum: ['Two-Wheeler (Bike/Scooter)', 'Three-Wheeler (Auto/Van)', 'Four-Wheeler (Car/Truck)', 'Bicycle'],
      default: 'Two-Wheeler (Bike/Scooter)'
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      trim: true
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'On Delivery', 'Offline'],
      default: 'Available'
    },
    currentLocation: {
      latitude: { type: Number, default: 26.4499 },
      longitude: { type: Number, default: 74.6399 },
      updatedAt: { type: Date, default: Date.now }
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Verified'
    },
    totalDeliveriesCompleted: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DriverProfile', driverProfileSchema);
