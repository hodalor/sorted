const { bookings, categories, providers, services } = require('../data/mockData');

const getDashboardOverview = (req, res) => {
  const totalRevenue = bookings.length * 32;
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length;

  res.json({
    platform: 'sorted',
    totals: {
      categories: categories.length,
      providers: providers.length,
      services: services.length,
      bookings: bookings.length,
      revenueEstimate: totalRevenue,
      pendingBookings,
    },
    channels: ['admin', 'mobile', 'web'],
  });
};

module.exports = {
  getDashboardOverview,
};
