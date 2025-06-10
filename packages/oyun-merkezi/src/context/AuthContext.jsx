import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

useEffect(() => {
  axios.get('http://localhost:4000/api/auth/user', { withCredentials: true })
    .then(res => {
      console.log("Girişli kullanıcı:", res.data.user);  // 👈 burada user gözükmeli
      setUser(res.data.user);
    })
    .catch(err => {
      console.error("Kullanıcı oturumu yok:", err.response?.data || err.message); // 👈 burası 401
      setUser(null);
    });
}, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);