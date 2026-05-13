const { validationResult } = require('express-validator');

const { isDbConnected } = require('../config/dbState');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Review = require('../models/Review');
const Service = require('../models/Service');
const User = require('../models/User');
const { appUsers, bookings, providers, reviews, services } = require('../data/mockData');

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

const getProviderAccountByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (isDbConnected()) {
      const provider = await Provider.findOne({ user: userId }).lean();

      if (!provider) {
        return res.status(404).json({ message: 'Provider profile not found.' });
      }

      const providerBookings = await Booking.find({ provider: provider._id }).sort({ createdAt: -1 }).lean();

      return res.json({
        provider,
        bookings: providerBookings,
      });
    }

    const provider = providers.find((item) => item.userId === userId);

    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found.' });
    }

    const providerBookings = bookings.filter((item) => item.providerId === provider.id);

    return res.json({
      provider,
      bookings: providerBookings,
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

    const {
      userId,
      name,
      businessName,
      isRegisteredBusiness,
      registrationNumber,
      category,
      city,
      rate,
      bio,
      profilePictureUrl,
      workPhotos,
      availability,
      serviceTitle,
    } = req.body;

    if (!Array.isArray(workPhotos) || workPhotos.length < 3) {
      return res.status(400).json({ message: 'At least 3 work photos are required.' });
    }

    const profile = {
      id: `prov-${Date.now()}`,
      userId,
      name,
      businessName,
      isRegisteredBusiness,
      registrationNumber: isRegisteredBusiness ? registrationNumber : '',
      category,
      city,
      rate: Number(rate),
      bio,
      profilePictureUrl,
      workPhotos,
      availability: Array.isArray(availability) ? availability : [],
      serviceTitle,
      rating: 0,
      reviewsCount: 0,
      completedJobs: 0,
      status: 'pending',
      responseTime: 'Pending review',
    };

    if (isDbConnected()) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const existingProvider = await Provider.findOne({ user: userId }).lean();

      if (existingProvider) {
        return res.status(409).json({ message: 'Provider profile already exists for this account.' });
      }

      const provider = await Provider.create(profile);

      await Service.create({
        provider: provider._id,
        providerName: provider.name,
        title: provider.serviceTitle,
        category: provider.category,
        city: provider.city,
        rate: provider.rate,
        availability: provider.availability,
        description: provider.bio,
      });

      return res.status(201).json({
        message: 'Provider profile created successfully.',
        provider,
      });
    }

    const existingProvider = providers.find((item) => item.userId === userId);

    if (existingProvider) {
      return res.status(409).json({ message: 'Provider profile already exists for this account.' });
    }

    providers.push(profile);
    services.push({
      id: `svc-${profile.id}`,
      title: profile.serviceTitle,
      providerId: profile.id,
      providerName: profile.name,
      serviceTitle: profile.serviceTitle,
      category: profile.category,
      city: profile.city,
      rate: profile.rate,
      rating: 0,
      availability: profile.availability,
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

const updateProviderSettings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rate, availability, bio, serviceTitle } = req.body;

    if (isDbConnected()) {
      const provider = await Provider.findById(id);

      if (!provider) {
        return res.status(404).json({ message: 'Provider not found.' });
      }

      provider.rate = Number(rate ?? provider.rate);
      provider.bio = bio ?? provider.bio;
      provider.serviceTitle = serviceTitle ?? provider.serviceTitle;
      provider.availability = Array.isArray(availability) ? availability : provider.availability;
      await provider.save();

      await Service.findOneAndUpdate(
        { provider: provider._id },
        {
          rate: provider.rate,
          description: provider.bio,
          title: provider.serviceTitle,
          availability: provider.availability,
        }
      );

      return res.json({
        message: 'Provider settings updated successfully.',
        provider: provider.toObject(),
      });
    }

    const provider = providers.find((item) => item.id === id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }

    provider.rate = Number(rate ?? provider.rate);
    provider.bio = bio ?? provider.bio;
    provider.serviceTitle = serviceTitle ?? provider.serviceTitle;
    provider.availability = Array.isArray(availability) ? availability : provider.availability;

    const service = services.find((item) => item.providerId === id);
    if (service) {
      service.rate = provider.rate;
      service.description = provider.bio;
      service.title = provider.serviceTitle;
      service.availability = provider.availability;
    }

    return res.json({
      message: 'Provider settings updated successfully.',
      provider,
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
  getProviderAccountByUser,
  createProviderProfile,
  updateProviderSettings,
  updateProviderStatus,
};
