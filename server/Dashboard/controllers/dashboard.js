// server/Dashboard/controllers/dashboard.js

const asyncErrorHandler = require('../../common/middleware/asyncErrorHandler');
const dashboardModel = require('../model/dashboard');

exports.getDashboardSummary = asyncErrorHandler(async (req, res, next) => {
  
  const userId = req.user?.id || 1; 

  const filters = req.filtered || {};

  const result = await dashboardModel.getProjectsSummaryForUser(userId, filters);

  res.status(200).json({
    success: true,
    data: result
  });
});