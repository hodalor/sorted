const { isDbConnected } = require('../config/dbState');
const { appUsers, bookings, categories, providers, services } = require('../data/mockData');
const Category = require('../models/Category');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const User = require('../models/User');

const getDashboardOverview = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const [providerDocs, serviceDocs, bookingDocs, categoryDocs, userDocs] = await Promise.all([
        Provider.find().lean(),
        Service.find().lean(),
        Booking.find().lean(),
        Category.find().lean(),
        User.find().lean(),
      ]);

      const pendingProviders = providerDocs.filter((provider) => provider.status === 'pending').length;
      const approvedProviders = providerDocs.filter((provider) => provider.status === 'approved').length;
      const pendingBookings = bookingDocs.filter((booking) => booking.status === 'pending').length;
      const revenueEstimate = bookingDocs.reduce((sum, booking) => sum + Number(booking.price || 0), 0);

      return res.json({
        platform: 'sorted',
        totals: {
          categories: categoryDocs.length,
          providers: providerDocs.length,
          approvedProviders,
          users: userDocs.length,
          services: serviceDocs.length,
          bookings: bookingDocs.length,
          revenueEstimate,
          pendingBookings,
          pendingProviders,
        },
        channels: ['admin', 'mobile', 'web'],
        recentProviders: providerDocs.slice(0, 4),
        recentBookings: bookingDocs.slice(0, 4),
      });
    }

    const revenueEstimate = bookings.reduce((sum, booking) => sum + Number(booking.price || 0), 0);
    const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length;
    const pendingProviders = providers.filter((provider) => provider.status === 'pending').length;
    const approvedProviders = providers.filter((provider) => provider.status === 'approved').length;

    return res.json({
      platform: 'sorted',
      totals: {
        categories: categories.length,
        providers: providers.length,
        approvedProviders,
        users: appUsers.length,
        services: services.length,
        bookings: bookings.length,
        revenueEstimate,
        pendingBookings,
        pendingProviders,
      },
      channels: ['admin', 'mobile', 'web'],
      recentProviders: providers.slice(0, 4),
      recentBookings: bookings.slice(0, 4),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardOverview,
};
