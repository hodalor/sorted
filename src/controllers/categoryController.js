const { validationResult } = require('express-validator');

const { isDbConnected } = require('../config/dbState');
const { categories } = require('../data/mockData');
const Category = require('../models/Category');

const getCategoriesAdmin = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const items = await Category.find().sort({ name: 1 }).lean();

      return res.json({
        total: items.length,
        items,
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

const createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, icon = '' } = req.body;

    if (isDbConnected()) {
      const existing = await Category.findOne({ name }).lean();
      if (existing) {
        return res.status(409).json({ message: 'Category already exists.' });
      }

      const category = await Category.create({ name, icon });
      return res.status(201).json({
        message: 'Category created successfully.',
        category,
      });
    }

    const existing = categories.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: 'Category already exists.' });
    }

    const category = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      icon,
      available: 0,
    };
    categories.push(category);

    return res.status(201).json({
      message: 'Category created successfully.',
      category,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const category = await Category.findByIdAndDelete(id).lean();

      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }

      return res.json({
        message: 'Category removed successfully.',
      });
    }

    const categoryIndex = categories.findIndex((item) => item.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    categories.splice(categoryIndex, 1);

    return res.json({
      message: 'Category removed successfully.',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCategoriesAdmin,
  createCategory,
  deleteCategory,
};
