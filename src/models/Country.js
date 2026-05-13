const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    dialingCode: {
      type: String,
      required: true,
      trim: true,
    },
    currencySymbol: {
      type: String,
      required: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Country || mongoose.model('Country', countrySchema);
