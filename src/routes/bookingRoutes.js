const express = require('express');
const { body } = require('express-validator');

const { createBooking, getBookings, updateBookingStatus } = require('../controllers/bookingController');

const router = express.Router();

router.get('/', getBookings);

router.post(
  '/',
  [
    body('serviceId').notEmpty().withMessage('serviceId is required.'),
    body('providerId').notEmpty().withMessage('providerId is required.'),
    body('seekerName').trim().notEmpty().withMessage('seekerName is required.'),
    body('seekerPhone').trim().notEmpty().withMessage('seekerPhone is required.'),
    body('seekerEmail').optional({ values: 'falsy' }).isEmail().withMessage('seekerEmail must be valid.'),
    body('date').notEmpty().withMessage('date is required.'),
    body('time').notEmpty().withMessage('time is required.'),
  ],
  createBooking
);

router.patch(
  '/:id/status',
  [body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status value.')],
  updateBookingStatus
);

module.exports = router;
