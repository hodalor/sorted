const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
    },
    serviceTitle: {
      type: String,
      required: true,
    },
    providerName: {
      type: String,
      required: true,
    },
    seekerName: {
      type: String,
      required: true,
    },
    seekerEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
