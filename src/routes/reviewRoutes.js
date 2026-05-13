const express = require('express');
const { body } = require('express-validator');

const { createReview, getReviews } = require('../controllers/reviewController');

const router = express.Router();

router.get('/', getReviews);

router.post(
  '/',
  [
    body('providerId').notEmpty().withMessage('providerId is required.'),
    body('authorName').trim().notEmpty().withMessage('authorName is required.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5.'),
    body('comment').trim().notEmpty().withMessage('comment is required.'),
  ],
  createReview
);

module.exports = router;
