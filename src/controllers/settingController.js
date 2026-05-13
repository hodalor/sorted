const { isDbConnected } = require('../config/dbState');
const { appSettings } = require('../data/mockData');
const AppSetting = require('../models/AppSetting');

const getDefaultPlatformSettings = (platform) => appSettings[platform] || {};

const getPlatformSettings = async (req, res, next) => {
  try {
    const { platform } = req.params;

    if (isDbConnected()) {
      const setting = await AppSetting.findOne({ platform }).lean();

      return res.json({
        platform,
        values: {
          ...getDefaultPlatformSettings(platform),
          ...(setting?.values || {}),
        },
      });
    }

    return res.json({
      platform,
      values: {
        ...getDefaultPlatformSettings(platform),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updatePlatformSettings = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const values = req.body || {};

    if (isDbConnected()) {
      const existingSetting = await AppSetting.findOne({ platform }).lean();
      const setting = await AppSetting.findOneAndUpdate(
        { platform },
        {
          values: {
            ...getDefaultPlatformSettings(platform),
            ...(existingSetting?.values || {}),
            ...values,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean();

      return res.json({
        message: `${platform} settings updated successfully.`,
        setting,
      });
    }

    appSettings[platform] = {
      ...getDefaultPlatformSettings(platform),
      ...values,
    };

    return res.json({
      message: `${platform} settings updated successfully.`,
      setting: {
        platform,
        values: appSettings[platform],
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPlatformSettings,
  updatePlatformSettings,
};
