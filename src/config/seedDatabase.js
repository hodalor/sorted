const bcrypt = require('bcryptjs');

const AppSetting = require('../models/AppSetting');
const Category = require('../models/Category');
const Country = require('../models/Country');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Review = require('../models/Review');
const Service = require('../models/Service');
const User = require('../models/User');
const { appSettings, appUsers, bookings, categories, countries, providers, reviews, services } = require('../data/mockData');

const seedDatabase = async () => {
  const existingUsers = await User.countDocuments();

  if (existingUsers > 0) {
    return;
  }

  for (const category of categories) {
    await Category.create({
      name: category.name,
      icon: category.icon,
    });
  }

  for (const country of countries) {
    await Country.create(country);
  }

  await AppSetting.create([
    { platform: 'mobile', values: appSettings.mobile },
    { platform: 'web', values: appSettings.web },
  ]);

  const userMap = new Map();

  for (const user of appUsers) {
    const pinHash = user.seedPin ? await bcrypt.hash(user.seedPin, 10) : user.pinHash;

    const createdUser = await User.create({
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email,
      address: user.address,
      pinHash,
      isPhoneVerified: user.isPhoneVerified,
      profileCompleted: user.profileCompleted,
      role: user.role,
    });

    userMap.set(user.id, createdUser);
  }

  const providerMap = new Map();
  for (const provider of providers) {
    const createdProvider = await Provider.create({
      ...provider,
      user: provider.userId ? userMap.get(provider.userId)?._id : undefined,
    });

    providerMap.set(provider.id, createdProvider);
  }

  const serviceMap = new Map();

  for (const service of services) {
    const provider = providerMap.get(service.providerId);
    const createdService = await Service.create({
      provider: provider._id,
      providerName: service.providerName,
      title: service.title,
      category: service.category,
      city: service.city,
      rate: service.rate,
      availability: service.availability,
      rating: service.rating,
      description: service.description,
    });

    serviceMap.set(service.id, createdService);
  }

  for (const booking of bookings) {
    await Booking.create({
      service: serviceMap.get(booking.serviceId)?._id,
      provider: providerMap.get(booking.providerId)?._id,
      serviceTitle: booking.serviceTitle,
      providerName: booking.providerName,
      seekerName: booking.seekerName,
      seekerPhone: booking.seekerPhone,
      seekerEmail: booking.seekerEmail,
      date: booking.date,
      time: booking.time,
      price: booking.price,
      status: booking.status,
    });
  }

  for (const review of reviews) {
    const provider = providerMap.get(review.providerId);

    await Review.create({
      provider: provider._id,
      authorName: review.authorName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.createdAt,
    });
  }

  console.log('Seeded starter data into MongoDB.');
};

module.exports = seedDatabase;
