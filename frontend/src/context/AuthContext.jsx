import { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../services/authApi";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      // Backend response format: { token, user: { id, name, email, role } }
      const { token: newToken, user: userData } = response;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.message || "Login failed. Please check your credentials." 
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await authApi.signup(name, email, password);
      // Backend response format: { token, user: { id, name, email, role } }
      const { token: newToken, user: userData } = response;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { 
        success: false, 
        error: error.message || "Signup failed. Please try again." 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Navigation will be handled by components using useNavigate
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const getUserRole = () => {
    return user?.role || null;
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: isAuthenticated(),
    getUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
