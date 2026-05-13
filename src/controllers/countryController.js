const { validationResult } = require('express-validator');

const { isDbConnected } = require('../config/dbState');
const { countries } = require('../data/mockData');
const Country = require('../models/Country');

const sortCountries = (items) =>
  [...items].sort((left, right) => {
    if (Number(right.enabled) !== Number(left.enabled)) {
      return Number(right.enabled) - Number(left.enabled);
    }

    return left.name.localeCompare(right.name);
  });

const getCountries = async (_req, res, next) => {
  try {
    if (isDbConnected()) {
      const items = await Country.find().sort({ enabled: -1, name: 1 }).lean();
      return res.json({ items });
    }

    return res.json({ items: sortCountries(countries) });
  } catch (error) {
    return next(error);
  }
};

const createCountry = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const payload = {
      name: req.body.name.trim(),
      code: req.body.code.trim().toUpperCase(),
      dialingCode: req.body.dialingCode.trim(),
      currencySymbol: req.body.currencySymbol.trim(),
      enabled: req.body.enabled !== false,
    };

    if (isDbConnected()) {
      const country = await Country.create(payload);
      return res.status(201).json({
        message: 'Country created successfully.',
        country,
      });
    }

    const existing = countries.find(
      (item) => item.code === payload.code || item.name.toLowerCase() === payload.name.toLowerCase()
    );

    if (existing) {
      return res.status(409).json({ message: 'Country already exists.' });
    }

    const country = {
      id: `country-${Date.now()}`,
      ...payload,
    };

    countries.push(country);

    return res.status(201).json({
      message: 'Country created successfully.',
      country,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Country already exists.' });
    }

    return next(error);
  }
};

const deleteCountry = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const deletedCountry = await Country.findByIdAndDelete(id).lean();

      if (!deletedCountry) {
        return res.status(404).json({ message: 'Country not found.' });
      }

      return res.json({
        message: 'Country removed successfully.',
        country: deletedCountry,
      });
    }

    const countryIndex = countries.findIndex((item) => item.id === id);

    if (countryIndex === -1) {
      return res.status(404).json({ message: 'Country not found.' });
    }

    const [country] = countries.splice(countryIndex, 1);

    return res.json({
      message: 'Country removed successfully.',
      country,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCountries,
  createCountry,
  deleteCountry,
};
