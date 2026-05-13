const { validationResult } = require('express-validator');

const { isDbConnected } = require('../config/dbState');
const Provider = require('../models/Provider');
const Review = require('../models/Review');
const Service = require('../models/Service');
const { providers, reviews, services } = require('../data/mockData');

const getProviderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const provider = await Provider.findById(id).lean();

      if (!provider) {
        return res.status(404).json({ message: 'Provider not found.' });
      }

      const providerReviews = await Review.find({ provider: provider._id })
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        provider,
        reviews: providerReviews,
      });
    }

    const provider = providers.find((item) => item.id === id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }

    const providerReviews = reviews.filter((review) => review.providerId === id);

    return res.json({
      provider,
      reviews: providerReviews,
    });
  } catch (error) {
    return next(error);
  }
};

const createProviderProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const profile = {
      id: `prov-${Date.now()}`,
      ...req.body,
      rating: 0,
      reviewsCount: 0,
      completedJobs: 0,
      status: 'pending',
    };

    if (isDbConnected()) {
      const provider = await Provider.create(profile);

      await Service.create({
        provider: provider._id,
        providerName: provider.name,
        title: `${provider.category} service`,
        category: provider.category,
        city: provider.city,
        rate: provider.rate,
        description: provider.bio,
      });

      return res.status(201).json({
        message: 'Provider profile created successfully.',
        provider,
      });
    }

    providers.push(profile);
    services.push({
      id: `svc-${profile.id}`,
      title: `${profile.category} service`,
      providerId: profile.id,
      providerName: profile.name,
      category: profile.category,
      city: profile.city,
      rate: profile.rate,
      rating: 0,
      description: profile.bio,
    });

    return res.status(201).json({
      message: 'Provider profile created successfully.',
      provider: profile,
    });
  } catch (error) {
    return next(error);
  }
};

const updateProviderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isDbConnected()) {
      const provider = await Provider.findByIdAndUpdate(id, { status }, { new: true }).lean();

      if (!provider) {
        return res.status(404).json({ message: 'Provider not found.' });
      }

      return res.json({
        message: 'Provider status updated successfully.',
        provider,
      });
    }

    const provider = providers.find((item) => item.id === id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }

    provider.status = status;

    return res.json({
      message: 'Provider status updated successfully.',
      provider,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProviderById,
  createProviderProfile,
  updateProviderStatus,
};
