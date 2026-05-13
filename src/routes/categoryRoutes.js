const express = require('express');
const { body } = require('express-validator');

const { createCategory, deleteCategory, getCategoriesAdmin } = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getCategoriesAdmin);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('name is required.')],
  createCategory
);

router.delete('/:id', deleteCategory);

module.exports = router;
