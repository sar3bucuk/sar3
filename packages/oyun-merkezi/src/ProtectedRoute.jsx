import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";


const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (user === null) return null; // yükleniyor
  if (!user) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;