const mongoose = require('mongoose');

const donorProfileSchema = new mongoose.Schema(
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
    businessType: {
      type: String,
      enum: ['Restaurant', 'Grocery Store', 'Hotel', 'Caterer', 'Cafeteria', 'Bakery', 'Other'],
      default: 'Restaurant'
    },
    address: {
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
    contactPerson: {
      type: String,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Verified'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonorProfile', donorProfileSchema);
