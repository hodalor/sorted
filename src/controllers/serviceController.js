const { isDbConnected } = require('../config/dbState');
const { categories, providers, services } = require('../data/mockData');
const Provider = require('../models/Provider');
const Service = require('../models/Service');

const getCategories = async (_req, res, next) => {
  try {
    if (isDbConnected()) {
      const providerDocs = await Provider.find({ status: 'approved' }).lean();
      const categoryItems = categories.map((category) => ({
        ...category,
        available: providerDocs.filter((provider) => provider.category === category.name).length,
      }));

      return res.json({
        total: categoryItems.length,
        items: categoryItems,
      });
    }

    return res.json({
      total: categories.length,
      items: categories,
    });
  } catch (error) {
    return next(error);
  }
};

const getServices = async (req, res, next) => {
  try {
    const { category, city } = req.query;

    if (isDbConnected()) {
      const query = {};

      if (category) {
        query.category = new RegExp(`^${category}$`, 'i');
      }

      if (city) {
        query.city = new RegExp(`^${city}$`, 'i');
      }

      const items = await Service.find(query).sort({ rating: -1, createdAt: -1 }).lean();

      return res.json({
        total: items.length,
        items,
      });
    }

    const filteredServices = services.filter((service) => {
      const categoryMatch = category ? service.category.toLowerCase() === category.toLowerCase() : true;
      const cityMatch = city ? service.city.toLowerCase() === city.toLowerCase() : true;
      return categoryMatch && cityMatch;
    });

    return res.json({
      total: filteredServices.length,
      items: filteredServices,
    });
  } catch (error) {
    return next(error);
  }
};

const getProviders = async (req, res, next) => {
  try {
    const { category, city, status } = req.query;

    if (isDbConnected()) {
      const query = {};

      if (category) {
        query.category = new RegExp(`^${category}$`, 'i');
      }

      if (city) {
        query.city = new RegExp(`^${city}$`, 'i');
      }

      if (status) {
        query.status = status;
      }

      const items = await Provider.find(query).sort({ rating: -1, createdAt: -1 }).lean();

      return res.json({
        total: items.length,
        items,
      });
    }

    const filteredProviders = providers.filter((provider) => {
      const categoryMatch = category ? provider.category.toLowerCase() === category.toLowerCase() : true;
      const cityMatch = city ? provider.city.toLowerCase() === city.toLowerCase() : true;
      const statusMatch = status ? provider.status === status : true;
      return categoryMatch && cityMatch && statusMatch;
    });

    return res.json({
      total: filteredProviders.length,
      items: filteredProviders,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCategories,
  getServices,
  getProviders,
};
