import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from "./ProtectedRoute";
import OyunDetay from './pages/OyunDetay';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/oyun/:oyunAdi" element={<OyunDetay />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;