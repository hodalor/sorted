const { validationResult } = require('express-validator');

const { bookings } = require('../data/mockData');

const getBookings = (req, res) => {
  res.json({
    total: bookings.length,
    items: bookings,
  });
};

const createBooking = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const booking = {
    id: `book-${Date.now()}`,
    ...req.body,
    status: 'pending',
  };

  bookings.push(booking);

  return res.status(201).json({
    message: 'Booking created successfully.',
    booking,
  });
};

module.exports = {
  getBookings,
  createBooking,
};
