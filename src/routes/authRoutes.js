const express = require('express');
const { body } = require('express-validator');

const {
  completeSignup,
  login,
  requestOtp,
  verifyFirebasePhone,
  verifyOtp,
} = require('../controllers/authController');

const router = express.Router();

router.post(
  '/request-otp',
  [
    body('phoneNumber')
      .trim()
      .isLength({ min: 10 })
      .withMessage('A valid phone number is required.'),
  ],
  requestOtp
);

router.post(
  '/verify-otp',
  [
    body('phoneNumber')
      .trim()
      .isLength({ min: 10 })
      .withMessage('A valid phone number is required.'),
    body('otpToken').trim().notEmpty().withMessage('otpToken is required.'),
    body('otpCode').trim().isLength({ min: 4, max: 4 }).withMessage('otpCode must be 4 digits.'),
  ],
  verifyOtp
);

router.post(
  '/verify-firebase-phone',
  [
    body('idToken').trim().notEmpty().withMessage('idToken is required.'),
    body('phoneNumber')
      .optional({ values: 'falsy' })
      .trim()
      .isLength({ min: 10 })
      .withMessage('A valid phone number is required.'),
  ],
  verifyFirebasePhone
);

router.post(
  '/complete-signup',
  [
    body('verificationToken').trim().notEmpty().withMessage('verificationToken is required.'),
    body('phoneNumber')
      .trim()
      .isLength({ min: 10 })
      .withMessage('A valid phone number is required.'),
    body('pin').trim().isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits.'),
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('address').trim().notEmpty().withMessage('Address is required.'),
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('Email must be valid.'),
  ],
  completeSignup
);

router.post(
  '/login',
  [
    body('phoneNumber')
      .trim()
      .isLength({ min: 10 })
      .withMessage('A valid phone number is required.'),
    body('pin').trim().isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits.'),
  ],
  login
);

module.exports = router;
