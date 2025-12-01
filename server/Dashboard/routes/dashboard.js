// server/Dashboard/routes/dashboard.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const { validateDashboardQuery } = require('../validation/dashboard');

router.get(
  '/',
  validateDashboardQuery,
  dashboardController.getDashboardSummary
);

module.exports = router;