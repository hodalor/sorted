const express = require('express');
const { body } = require('express-validator');

const {
  createProviderProfile,
  getProviderAccountByUser,
  getProviderById,
  updateProviderSettings,
  updateProviderStatus,
} = require('../controllers/providerController');

const router = express.Router();

router.get('/account/:userId', getProviderAccountByUser);
router.get('/:id', getProviderById);

router.post(
  '/',
  [
    body('userId').trim().notEmpty().withMessage('userId is required.'),
    body('name').trim().notEmpty().withMessage('name is required.'),
    body('businessName').trim().notEmpty().withMessage('businessName is required.'),
    body('isRegisteredBusiness').isBoolean().withMessage('isRegisteredBusiness must be boolean.'),
    body('registrationNumber')
      .optional({ values: 'falsy' })
      .trim()
      .isLength({ min: 3 })
      .withMessage('registrationNumber is too short.'),
    body('serviceTitle').trim().notEmpty().withMessage('serviceTitle is required.'),
    body('category').trim().notEmpty().withMessage('category is required.'),
    body('city').trim().notEmpty().withMessage('city is required.'),
    body('rate').isNumeric().withMessage('rate must be numeric.'),
    body('bio').trim().notEmpty().withMessage('bio is required.'),
    body('profilePictureUrl').trim().notEmpty().withMessage('profilePictureUrl is required.'),
    body('workPhotos').isArray({ min: 3 }).withMessage('At least 3 work photos are required.'),
  ],
  createProviderProfile
);

router.patch('/:id/settings', updateProviderSettings);

router.patch(
  '/:id/status',
  [body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status value.')],
  updateProviderStatus
);

module.exports = router;
