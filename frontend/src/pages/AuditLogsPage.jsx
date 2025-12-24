import React, { useState, useEffect } from "react";
import { getAuditLogs } from "../services/auditLogApi";
import styles from "./auditLogsPage.module.css";

function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    limit: 100,
    offset: 0,
  });

  /**
   * Load audit logs from backend
   */
  const loadLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const logsData = await getAuditLogs(filters);
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(
        err.message || "Failed to load audit logs. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filters]);

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  /**
   * Format details object for display
   */
  const formatDetails = (details) => {
    if (!details || typeof details !== "object") return "N/A";
    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return String(details);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Audit Logs</h1>
        <p className={styles.subtitle}>View system activity and user actions</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className={styles.loading}>
          <p>Loading audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No audit logs found.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className={styles.timestampCell}>
                    {formatDate(log.createdAt)}
                  </td>
                  <td className={styles.userCell}>
                    <div>
                      <div className={styles.userName}>
                        {log.userName || "Unknown"}
                      </div>
                      {log.userEmail && (
                        <div className={styles.userEmail}>{log.userEmail}</div>
                      )}
                    </div>
                  </td>
                  <td className={styles.actionCell}>
                    <span className={styles.actionBadge}>{log.action}</span>
                  </td>
                  <td className={styles.entityTypeCell}>
                    {log.entityType || "N/A"}
                  </td>
                  <td className={styles.entityIdCell}>
                    {log.entityId || "N/A"}
                  </td>
                  <td className={styles.ipCell}>{log.ipAddress || "N/A"}</td>
                  <td className={styles.detailsCell}>
                    <details className={styles.details}>
                      <summary className={styles.detailsSummary}>View</summary>
                      <pre className={styles.detailsContent}>
                        {formatDetails(log.details)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AuditLogsPage;
