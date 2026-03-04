// frontend/src/context/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axiosInstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // Called after login
  const login = (userData) => {
    setUser(userData);
    setToken(userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
  };

  // Called during logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Called on initial load to validate the stored token
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      API.get("/users/me")
        .then((res) => {
          const fullUser = { ...res.data, token: storedToken };
          setUser(fullUser);
          setToken(storedToken);
          localStorage.setItem("user", JSON.stringify(fullUser));
        })
        .catch((err) => {
          console.error("Error fetching user data:", err);
          logout(); // Invalid or expired token
        });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
