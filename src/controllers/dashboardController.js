const { isDbConnected } = require('../config/dbState');
const { bookings, categories, providers, services } = require('../data/mockData');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Service = require('../models/Service');

const getDashboardOverview = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const [providerDocs, serviceDocs, bookingDocs] = await Promise.all([
        Provider.find().lean(),
        Service.find().lean(),
        Booking.find().lean(),
      ]);

      const pendingProviders = providerDocs.filter((provider) => provider.status === 'pending').length;
      const pendingBookings = bookingDocs.filter((booking) => booking.status === 'pending').length;
      const revenueEstimate = bookingDocs.reduce((sum, booking) => sum + Number(booking.price || 0), 0);

      return res.json({
        platform: 'sorted',
        totals: {
          categories: categories.length,
          providers: providerDocs.length,
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

    return res.json({
      platform: 'sorted',
      totals: {
        categories: categories.length,
        providers: providers.length,
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
