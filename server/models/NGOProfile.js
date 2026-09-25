const mongoose = require('mongoose');

const ngoProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Shelter address is required']
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    capacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: 0,
      default: 100
    },
    availableCapacity: {
      type: Number,
      required: [true, 'Available capacity is required'],
      min: 0,
      default: 100
    },
    foodPreferences: {
      type: [String],
      default: ['Cooked Food', 'Packaged Food', 'Produce / Raw', 'Bakery / Dairy']
    },
    currentNeeds: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'High'
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Verified'
    },
    contactPerson: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('NGOProfile', ngoProfileSchema);
