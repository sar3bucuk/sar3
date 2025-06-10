import React from 'react';
import Login from '../components/Login';

const LoginPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f0f0'
    }}>
      <Login />
    </div>
  );
};

export default LoginPage;