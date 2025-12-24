const express = require("express");
const router = express.Router();
const { getAuditLogs, getAuditLogById } = require("../Services/auditLogService");

router.get("/audit-logs", async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      userId,
      entityType,
      action,
      startDate,
      endDate,
    } = req.query;

    const logs = await getAuditLogs({ 
      limit, 
      offset, 
      userId, 
      entityType, 
      action, 
      startDate, 
      endDate 
    });

    res.json(logs);
  } catch (err) {
    console.error("GET /api/audit-logs error:", err);
    res.status(500).json({ message: "Failed to fetch audit logs", error: err.message });
  }
});

router.get("/audit-logs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const log = await getAuditLogById(id);

    if (!log) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    res.json(log);
  } catch (err) {
    console.error("GET /api/audit-logs/:id error:", err);
    res.status(500).json({ message: "Failed to fetch audit log" });
  }
});

module.exports = router;
