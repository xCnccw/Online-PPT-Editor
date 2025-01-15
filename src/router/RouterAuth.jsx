import React from 'react';
import { Navigate } from 'react-router-dom';

const RouterAuth = ({ children }) => {
  const token = localStorage.getItem('token');

  // if no token redirect to lgoin
  return token ? children : <Navigate to="/loginPage" />;
};

export default RouterAuth;