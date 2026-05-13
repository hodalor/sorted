const express = require('express');
const { body } = require('express-validator');

const { createCountry, deleteCountry, getCountries } = require('../controllers/countryController');

const router = express.Router();

router.get('/', getCountries);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Country name is required.'),
    body('code').trim().isLength({ min: 2, max: 3 }).withMessage('Country code must be 2 to 3 letters.'),
    body('dialingCode').trim().notEmpty().withMessage('Dialing code is required.'),
    body('currencySymbol').trim().notEmpty().withMessage('Currency symbol is required.'),
  ],
  createCountry
);

router.delete('/:id', deleteCountry);

module.exports = router;
