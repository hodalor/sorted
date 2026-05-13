const { validationResult } = require('express-validator');

const { isDbConnected } = require('../config/dbState');
const Provider = require('../models/Provider');
const Review = require('../models/Review');
const { providers, reviews } = require('../data/mockData');

const getReviews = async (req, res, next) => {
  try {
    const { providerId } = req.query;

    if (isDbConnected()) {
      const query = providerId ? { provider: providerId } : {};
      const items = await Review.find(query).sort({ createdAt: -1 }).lean();

      return res.json({
        total: items.length,
        items,
      });
    }

    const items = providerId ? reviews.filter((review) => review.providerId === providerId) : reviews;

    return res.json({
      total: items.length,
      items,
    });
  } catch (error) {
    return next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { providerId, authorName, rating, comment } = req.body;

    if (isDbConnected()) {
      const provider = await Provider.findById(providerId);

      if (!provider) {
        return res.status(404).json({ message: 'Provider not found.' });
      }

      const review = await Review.create({
        provider: providerId,
        authorName,
        rating,
        comment,
      });

      const providerReviews = await Review.find({ provider: providerId }).lean();
      const average =
        providerReviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / providerReviews.length;

      provider.rating = Number(average.toFixed(1));
      provider.reviewsCount = providerReviews.length;
      await provider.save();

      return res.status(201).json({
        message: 'Review added successfully.',
        review,
      });
    }

    const provider = providers.find((item) => item.id === providerId);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }

    const review = {
      id: `rev-${Date.now()}`,
      providerId,
      authorName,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString(),
    };

    reviews.unshift(review);

    const providerReviews = reviews.filter((item) => item.providerId === providerId);
    const average =
      providerReviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / providerReviews.length;

    provider.rating = Number(average.toFixed(1));
    provider.reviewsCount = providerReviews.length;

    return res.status(201).json({
      message: 'Review added successfully.',
      review,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getReviews,
  createReview,
};
