const { validationResult } = require('express-validator');

const { isDbConnected } = require('../config/dbState');
const { bookings, providers, services } = require('../data/mockData');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Service = require('../models/Service');

const getBookings = async (req, res, next) => {
  try {
    const { seekerEmail, providerId, status } = req.query;

    if (isDbConnected()) {
      const query = {};

      if (seekerEmail) {
        query.seekerEmail = seekerEmail.toLowerCase();
      }

      if (providerId) {
        query.provider = providerId;
      }

      if (status) {
        query.status = status;
      }

      const items = await Booking.find(query).sort({ createdAt: -1 }).lean();

      return res.json({
        total: items.length,
        items,
      });
    }

    const items = bookings.filter((booking) => {
      const emailMatch = seekerEmail ? booking.seekerEmail === seekerEmail.toLowerCase() : true;
      const providerMatch = providerId ? booking.providerId === providerId : true;
      const statusMatch = status ? booking.status === status : true;
      return emailMatch && providerMatch && statusMatch;
    });

    return res.json({
      total: items.length,
      items,
    });
  } catch (error) {
    return next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const payload = {
      ...req.body,
      seekerEmail: req.body.seekerEmail.toLowerCase(),
      status: 'pending',
    };

    if (isDbConnected()) {
      const service = await Service.findById(payload.serviceId).lean();
      const provider = await Provider.findById(payload.providerId).lean();

      if (!service || !provider) {
        return res.status(404).json({ message: 'Provider or service not found.' });
      }

      const booking = await Booking.create({
        service: service._id,
        provider: provider._id,
        serviceTitle: service.title,
        providerName: provider.name,
        seekerName: payload.seekerName,
        seekerEmail: payload.seekerEmail,
        date: payload.date,
        time: payload.time,
        price: service.rate,
        status: 'pending',
      });

      return res.status(201).json({
        message: 'Booking created successfully.',
        booking,
      });
    }

    const service = services.find((item) => item.id === payload.serviceId);
    const provider = providers.find((item) => item.id === payload.providerId);

    if (!service || !provider) {
      return res.status(404).json({ message: 'Provider or service not found.' });
    }

    const booking = {
      id: `book-${Date.now()}`,
      serviceId: payload.serviceId,
      providerId: payload.providerId,
      serviceTitle: service.title,
      providerName: provider.name,
      seekerName: payload.seekerName,
      seekerEmail: payload.seekerEmail,
      date: payload.date,
      time: payload.time,
      price: service.rate,
      status: 'pending',
    };

    bookings.unshift(booking);

    return res.status(201).json({
      message: 'Booking created successfully.',
      booking,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getBookings,
  createBooking,
};
