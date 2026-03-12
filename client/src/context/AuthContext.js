import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // prevent flash of login page

  useEffect(() => {
    const stored = localStorage.getItem("chatapp-user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("chatapp-user");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem("chatapp-user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("chatapp-user");
    setUser(null);
  };

  if (loading) return null; // don't render until we know auth state

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);