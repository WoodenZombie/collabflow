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
      // Backend returns: { accessToken }
      const { accessToken } = response;
      
      if (!accessToken) {
        throw new Error("No access token received from server");
      }

      // Decode token to get user info (basic info from JWT payload)
      try {
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log("Decoded token payload:", tokenPayload);
        
        const userData = {
          id: tokenPayload.UserInfo?.id,
          email: tokenPayload.UserInfo?.email || email,
          name: tokenPayload.UserInfo?.name || email.split('@')[0], // Fallback
          role: tokenPayload.UserInfo?.role || 'user', // Default role
        };
        
        console.log("User data from token:", userData);
        
        setToken(accessToken);
        setUser(userData);
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
        // Still save token even if decode fails
        setToken(accessToken);
        localStorage.setItem("token", accessToken);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.message || "Login failed. Please check your credentials." 
      };
    }
  };

  const signup = async (name, email, password, confirmPassword) => {
    try {
      // First register the user
      await authApi.signup(name, email, password, confirmPassword);
      
      // After successful registration, automatically log in
      const loginResult = await login(email, password);
      
      if (!loginResult.success) {
        return {
          success: false,
          error: loginResult.error || "Registration successful, but automatic login failed. Please try logging in manually.",
        };
      }
      
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
