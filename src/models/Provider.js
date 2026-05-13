const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    isRegisteredBusiness: {
      type: Boolean,
      default: false,
    },
    registrationNumber: {
      type: String,
      default: '',
      trim: true,
    },
    serviceTitle: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    bio: {
      type: String,
      default: '',
    },
    profilePictureUrl: {
      type: String,
      default: '',
    },
    workPhotos: {
      type: [String],
      default: [],
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
    responseTime: {
      type: String,
      default: '',
    },
    availability: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Provider || mongoose.model('Provider', providerSchema);
