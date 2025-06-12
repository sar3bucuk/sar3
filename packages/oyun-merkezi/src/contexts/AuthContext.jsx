import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

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
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:4000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });

      if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Kullanıcı oturumu bulunamadı:', error);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Login isteği hazırlanıyor:', { email, password });
      
      if (!email || !password) {
        console.error('Eksik bilgi:', { email: !email, password: !password });
        throw new Error('Email ve şifre gereklidir');
      }

      console.log('Login isteği gönderiliyor...');
      const response = await axios.post('http://localhost:4000/api/auth/login', {
        email,
        password
      }, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login yanıtı alındı:', response.data);

      if (response.data.token) {
        console.log('Token alındı, kullanıcı bilgileri kaydediliyor');
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return true;
      }
      console.log('Token alınamadı');
      return false;
    } catch (error) {
      console.error('Giriş hatası detayları:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        request: error.request,
        config: error.config
      });
      
      if (error.response?.data?.details) {
        throw new Error(error.response.data.details.reason);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Giriş başarısız');
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:4000/api/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Çıkış hatası:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
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