import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as serviceLogin, register as serviceRegister } from '../service';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to check if token is valid (not expired)
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      // JWT tokens are in format: header.payload.signature
      const payload = token.split('.')[1];
      const decodedData = JSON.parse(atob(payload));
      
      // Check if token is expired
      return decodedData.exp * 1000 > Date.now();
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check for saved auth in localStorage
    const savedUser = localStorage.getItem('auth');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        
        // Check if token is valid
        if (user.token && isTokenValid(user.token)) {
          setCurrentUser(user);
        } else {
          // Token expired, clear localStorage
          console.log('Token expired, clearing auth data');
          localStorage.removeItem('auth');
        }
      } catch (error) {
        console.error('Error parsing saved auth:', error);
        localStorage.removeItem('auth');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await serviceLogin(email, password);
      
      // Store the user data including the token
      const user = {
        id: response.id,
        email: response.email,
        name: response.name,
        token: response.token
      };
      
      setCurrentUser(user);
      localStorage.setItem('auth', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      const response = await serviceRegister(email, password);
      
      // Store the user data including the token
      const user = {
        id: response.id,
        email: response.email,
        token: response.token
      };
      
      setCurrentUser(user);
      localStorage.setItem('auth', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('auth');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    isTokenValid
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};