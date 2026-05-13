const mongoose = require('mongoose');

const isDbConnected = () => mongoose.connection.readyState === 1;

module.exports = {
  isDbConnected,
};
