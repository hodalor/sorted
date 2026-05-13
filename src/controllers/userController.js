const { isDbConnected } = require('../config/dbState');
const { appUsers } = require('../data/mockData');
const User = require('../models/User');

const getUsers = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const items = await User.find().sort({ createdAt: -1 }).lean();

      return res.json({
        total: items.length,
        items,
      });
    }

    return res.json({
      total: appUsers.length,
      items: appUsers,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUsers,
};
