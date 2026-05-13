const bcrypt = require('bcryptjs');

const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Review = require('../models/Review');
const Service = require('../models/Service');
const User = require('../models/User');
const { appUsers, bookings, providers, reviews, services } = require('../data/mockData');

const seedDatabase = async () => {
  const existingUsers = await User.countDocuments();

  if (existingUsers > 0) {
    return;
  }

  const userMap = new Map();

  for (const user of appUsers) {
    const passwordHash = user.seedPassword
      ? await bcrypt.hash(user.seedPassword, 10)
      : user.passwordHash;

    const createdUser = await User.create({
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role,
    });

    userMap.set(user.id, createdUser);
  }

  const providerMap = new Map();
  const providerUsers = [...userMap.values()].filter((user) => user.role === 'provider');

  for (const [index, provider] of providers.entries()) {
    const createdProvider = await Provider.create({
      ...provider,
      user: providerUsers[index]?._id,
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
