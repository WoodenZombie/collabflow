// common/middleware/requireAdmin.js
const db = require("../../db/db");

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const admin = await db("admins")
      .where({ email: req.user.email })
      .first();

    if (!admin) {
      return res
        .status(403)
        .json({ message: "You don't have permission to view audit logs. Admin access required." });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("requireAdmin error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = requireAdmin;