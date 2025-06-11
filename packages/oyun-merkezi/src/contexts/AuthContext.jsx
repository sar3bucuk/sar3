import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// users.json dosyasını oku
const readUsers = async () => {
  try {
    const response = await axios.get('/users.json');
    return response.data;
  } catch (error) {
    console.error('users.json okuma hatası:', error);
    return [];
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  // users.json dosyasını yükle
  useEffect(() => {
    const loadUsers = async () => {
      const usersData = await readUsers();
      setUsers(usersData);
    };
    loadUsers();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/auth/me', { withCredentials: true });
      console.log('Backend response:', JSON.stringify(response.data, null, 2));
      
      // Kullanıcı bilgilerini kontrol et
      const userData = response.data;
      if (!userData || typeof userData !== 'object') {
        console.error('Geçersiz kullanıcı verisi:', userData);
        setError('Geçersiz kullanıcı verisi');
        setUser(null);
        return;
      }

      // users.json'dan kullanıcı bilgilerini bul
      const userInfo = users.find(u => u.email === userData.email);
      if (userInfo) {
        setUser({
          ...userData,
          username: userInfo.username,
          tag: userInfo.tag
        });
      } else {
        setUser(userData);
      }

      setError(null);
    } catch (err) {
      console.error('Auth check error:', err);
      setUser(null);
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [users]); // users değiştiğinde checkAuth'u tekrar çalıştır

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', 
        { email, password },
        { withCredentials: true }
      );
      console.log('Login response:', JSON.stringify(response.data, null, 2));
      
      // Kullanıcı bilgilerini kontrol et
      const userData = response.data.user || response.data;
      if (!userData || typeof userData !== 'object') {
        console.error('Geçersiz kullanıcı verisi:', userData);
        setError('Geçersiz kullanıcı verisi');
        throw new Error('Geçersiz kullanıcı verisi');
      }

      // users.json'dan kullanıcı bilgilerini bul
      const userInfo = users.find(u => u.email === userData.email);
      if (userInfo) {
        const fullUserData = {
          ...userData,
          username: userInfo.username,
          tag: userInfo.tag
        };
        setUser(fullUserData);
        return fullUserData;
      }

      setUser(userData);
      setError(null);
      return userData;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:4000/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.response?.data?.message || 'Logout failed');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 