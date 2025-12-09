import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./header.module.css";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h2>CollabFlow</h2>
        </div>
        
        {user && (
          <div className={styles.userSection}>
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
