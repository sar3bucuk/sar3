import React, { useState } from 'react';
import axios from 'axios';
import SHA256 from 'crypto-js/sha256';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';

const Register = () => {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const hashedPassword = SHA256(sifre).toString();

    try {
      const response = await axios.post('http://localhost:4000/api/auth/register', {
        email,
        password: hashedPassword,
        username
      });

      alert("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
      navigate('/');

    } catch (error) {
      alert("Kayıt başarısız: " + (error.response?.data?.message || "Bilinmeyen hata"));
    }
  };

  return (
    <Box component="form" onSubmit={handleRegister} sx={{ width: 320, padding: 3, boxShadow: 3, borderRadius: 2, backgroundColor: '#fff' }}>
      <Typography variant="h5" align="center" gutterBottom>Kayıt Ol</Typography>
      <TextField fullWidth label="Kullanıcı Adı" margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField fullWidth label="Şifre" type="password" margin="normal" value={sifre} onChange={(e) => setSifre(e.target.value)} />
      <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>Kayıt Ol</Button>
    </Box>
  );
};

export default Register;