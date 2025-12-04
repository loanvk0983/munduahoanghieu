const express = require('express');
const router = express.Router();
const HomeController = require('../controllers/homeController');

/**
 * GET / - Homepage
 * Render homepage with data from database
 */
router.get('/', HomeController.getHomepage);

module.exports = router;
