// server/Dashboard/validation/dashboard.js

const validateDashboardQuery = (req, res, next) => {
    const { tags, status, search } = req.query;
  
    req.filtered = {
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      status: status ? status.trim() : null,
      search: search ? search.trim() : null
    };
  
    next();
  };
  
  module.exports = { validateDashboardQuery };