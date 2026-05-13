const express = require('express');
const { body } = require('express-validator');

const { createBooking, getBookings } = require('../controllers/bookingController');

const router = express.Router();

router.get('/', getBookings);

router.post(
  '/',
  [
    body('serviceId').notEmpty().withMessage('serviceId is required.'),
    body('providerId').notEmpty().withMessage('providerId is required.'),
    body('seekerName').trim().notEmpty().withMessage('seekerName is required.'),
    body('date').notEmpty().withMessage('date is required.'),
    body('time').notEmpty().withMessage('time is required.'),
  ],
  createBooking
);

module.exports = router;
