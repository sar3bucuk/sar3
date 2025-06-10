import React from 'react';
import Register from '../components/Register';

const RegisterPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <Register />
    </div>
  );
};

export default RegisterPage;
