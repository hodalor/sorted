const { categories, providers, services } = require('../data/mockData');

const getCategories = (req, res) => {
  res.json({
    total: categories.length,
    items: categories,
  });
};

const getServices = (req, res) => {
  const { category, city } = req.query;

  const filteredServices = services.filter((service) => {
    const categoryMatch = category ? service.category.toLowerCase() === category.toLowerCase() : true;
    const cityMatch = city ? service.city.toLowerCase() === city.toLowerCase() : true;
    return categoryMatch && cityMatch;
  });

  res.json({
    total: filteredServices.length,
    items: filteredServices,
  });
};

const getProviders = (req, res) => {
  const { category, city } = req.query;

  const filteredProviders = providers.filter((provider) => {
    const categoryMatch = category ? provider.category.toLowerCase() === category.toLowerCase() : true;
    const cityMatch = city ? provider.city.toLowerCase() === city.toLowerCase() : true;
    return categoryMatch && cityMatch;
  });

  res.json({
    total: filteredProviders.length,
    items: filteredProviders,
  });
};

module.exports = {
  getCategories,
  getServices,
  getProviders,
};
