const db = require('../../db/db');

const baseUnionSql = `
  SELECT
    CONCAT('project_create_', p.id) AS id,
    p.created_by AS user_id,
    COALESCE(u.name, 'Unknown') AS user_name,
    COALESCE(u.email, 'unknown') AS user_email,
    'CREATE' AS action,
    'project' AS entity_type,
    p.id AS entity_id,
    JSON_OBJECT(
      'name', p.name,
      'description', p.description,
      'status', p.status
    ) AS details,
    NULL AS ip_address,
    p.created_at AS created_at
  FROM projects p
  LEFT JOIN users u ON u.id = p.created_by

  UNION ALL

  SELECT
    CONCAT('task_create_', t.id) AS id,
    t.created_by AS user_id,
    COALESCE(u.name, 'Unknown') AS user_name,
    COALESCE(u.email, 'unknown') AS user_email,
    'CREATE' AS action,
    'task' AS entity_type,
    t.id AS entity_id,
    JSON_OBJECT(
      'title', t.title,
      'description', t.description,
      'priority', t.priority
    ) AS details,
    NULL AS ip_address,
    t.created_at AS created_at
  FROM tasks t
  LEFT JOIN users u ON u.id = t.created_by

  UNION ALL

  SELECT
    CONCAT('appointment_create_', a.id) AS id,
    a.created_by AS user_id,
    COALESCE(u.name, 'Unknown') AS user_name,
    COALESCE(u.email, 'unknown') AS user_email,
    'CREATE' AS action,
    'appointment' AS entity_type,
    a.id AS entity_id,
    JSON_OBJECT('title', a.title) AS details,
    NULL AS ip_address,
    a.created_at AS created_at
  FROM appointments a
  LEFT JOIN users u ON u.id = a.created_by
`;

async function getAuditLogs(filters = {}) {
  try {
    let sql = `SELECT * FROM (${baseUnionSql}) AS audit_logs WHERE 1=1`;
    const params = [];
    
    if (filters.userId) {
      sql += ` AND user_id = ?`;
      params.push(filters.userId);
    }
    if (filters.action) {
      sql += ` AND action = ?`;
      params.push(filters.action);
    }
    if (filters.entityType) {
      sql += ` AND entity_type = ?`;
      params.push(filters.entityType);
    }
    if (filters.startDate) {
      sql += ` AND created_at >= ?`;
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      sql += ` AND created_at <= ?`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(filters.limit || 50), Number(filters.offset || 0));

    console.log("🔍 SQL:", sql);
    console.log("🔍 PARAMS:", params);

    const result = await db.raw(sql, params);
    return result[0];
  } catch (error) {
    console.error('AUDIT LOGS SQL ERROR:', error.message);
    throw error;
  }
}

async function getAuditLogById(id) {
  try {
    const result = await db.raw(
      `SELECT * FROM (${baseUnionSql}) AS audit_logs WHERE id = ? LIMIT 1`,
      [id]
    );
    return result[0][0] || null;
  } catch (error) {
    console.error('AUDIT LOG BY ID ERROR:', error.message);
    throw error;
  }
}

module.exports = {
  getAuditLogs,
  getAuditLogById,
};