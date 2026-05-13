const express = require('express');

const { getPlatformSettings, updatePlatformSettings } = require('../controllers/settingController');

const router = express.Router();

router.get('/:platform', getPlatformSettings);
router.patch('/:platform', updatePlatformSettings);

module.exports = router;
