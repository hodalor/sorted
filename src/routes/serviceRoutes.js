const express = require('express');

const {
  getCategories,
  getProviders,
  getServices,
} = require('../controllers/serviceController');

const router = express.Router();

router.get('/categories', getCategories);
router.get('/providers', getProviders);
router.get('/', getServices);

module.exports = router;
