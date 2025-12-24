import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, isLoading, getUserRole } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userRole = getUserRole();
    if (userRole !== requiredRole) {
      return (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      );
    }
  }

  return children;
}

export default ProtectedRoute;
