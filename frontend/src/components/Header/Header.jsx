import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./header.module.css";

function Header() {
  const { user, logout, getUserRole } = useAuth();
  const navigate = useNavigate();
  const isAdmin = getUserRole() === "Admin";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAuditLogsClick = () => {
    navigate("/admin/audit-logs");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h2>CollabFlow</h2>
        </div>

        {user && (
          <div className={styles.userSection}>
            {isAdmin && (
              <button
                onClick={handleAuditLogsClick}
                className={styles.adminButton}
                title="View Audit Logs"
              >
                Audit Logs
              </button>
            )}
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              {user.role && (
                <span className={styles.userRole}>({user.role})</span>
              )}
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
