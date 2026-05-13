const express = require('express');
const { body } = require('express-validator');

const {
  createProviderProfile,
  getProviderById,
  updateProviderStatus,
} = require('../controllers/providerController');

const router = express.Router();

router.get('/:id', getProviderById);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('name is required.'),
    body('category').trim().notEmpty().withMessage('category is required.'),
    body('city').trim().notEmpty().withMessage('city is required.'),
    body('rate').isNumeric().withMessage('rate must be numeric.'),
    body('bio').trim().notEmpty().withMessage('bio is required.'),
  ],
  createProviderProfile
);

router.patch(
  '/:id/status',
  [body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status value.')],
  updateProviderStatus
);

module.exports = router;
