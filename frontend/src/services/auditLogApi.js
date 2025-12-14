/**
 * Audit Log API Service
 * Handles all HTTP requests to the backend API for audit logs
 * Uses routes: /api/audit-logs
 */

import { getAuthHeaders } from "./authApi";

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Map backend audit log data to frontend format
 * Expected backend format: { id, user_id, action, entity_type, entity_id, details, ip_address, created_at }
 * Frontend format: { id, userId, action, entityType, entityId, details, ipAddress, createdAt }
 */
const mapBackendToFrontend = (backendLog) => {
  return {
    id: String(backendLog.id),
    userId: String(backendLog.user_id || backendLog.userId || ""),
    userName: backendLog.user_name || backendLog.userName || "Unknown",
    userEmail: backendLog.user_email || backendLog.userEmail || "",
    action: backendLog.action || "",
    entityType: backendLog.entity_type || backendLog.entityType || "",
    entityId: String(backendLog.entity_id || backendLog.entityId || ""),
    details: backendLog.details || {},
    ipAddress: backendLog.ip_address || backendLog.ipAddress || "",
    createdAt:
      backendLog.created_at || backendLog.createdAt || new Date().toISOString(),
  };
};

/**
 * Parse error response from backend
 */
const parseErrorResponse = async (response) => {
  try {
    const errorData = await response.json();
    return {
      message: errorData.message || errorData.error || "An error occurred",
      errors: errorData.errors || null,
      statusCode: response.status,
    };
  } catch {
    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
      errors: null,
      statusCode: response.status,
    };
  }
};

/**
 * Get all audit logs
 * @param {object} filters - Optional filters: { limit, offset, userId, entityType, action, startDate, endDate }
 * @returns {Promise<Array>} Array of audit logs
 */
export const getAuditLogs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.limit) queryParams.append("limit", filters.limit);
    if (filters.offset) queryParams.append("offset", filters.offset);
    if (filters.userId) queryParams.append("userId", filters.userId);
    if (filters.entityType)
      queryParams.append("entityType", filters.entityType);
    if (filters.action) queryParams.append("action", filters.action);
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);

    const url = `${API_BASE_URL}/audit-logs${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
        throw new Error("Unauthorized. Please log in.");
      }

      if (response.status === 403) {
        throw new Error(
          "You don't have permission to view audit logs. Admin access required."
        );
      }

      const errorData = await parseErrorResponse(response);
      throw new Error(
        errorData.message ||
          `Failed to fetch audit logs: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Handle both array and object with logs array
    const logsArray = Array.isArray(data) ? data : data.logs || data.data || [];

    return logsArray.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
};

/**
 * Get audit log by ID
 * @param {string|number} logId - Audit log ID
 * @returns {Promise<object>} Audit log object
 */
export const getAuditLogById = async (logId) => {
  try {
    if (!logId) {
      throw new Error("Audit log ID is required");
    }

    const url = `${API_BASE_URL}/audit-logs/${logId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
        throw new Error("Unauthorized. Please log in.");
      }

      if (response.status === 403) {
        throw new Error(
          "You don't have permission to view audit logs. Admin access required."
        );
      }

      if (response.status === 404) {
        throw new Error("Audit log not found");
      }

      const errorData = await parseErrorResponse(response);
      throw new Error(
        errorData.message || `Failed to fetch audit log: ${response.statusText}`
      );
    }

    const data = await response.json();
    return mapBackendToFrontend(data);
  } catch (error) {
    console.error("Error fetching audit log:", error);
    throw error;
  }
};
