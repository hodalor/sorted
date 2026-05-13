const mongoose = require('mongoose');

const appSettingSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      unique: true,
      enum: ['general', 'mobile', 'web'],
    },
    values: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.AppSetting || mongoose.model('AppSetting', appSettingSchema);
