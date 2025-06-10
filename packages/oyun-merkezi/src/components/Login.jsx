import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, FormControlLabel, Checkbox } from '@mui/material';
import SHA256 from 'crypto-js/sha256';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [beniHatirla, setBeniHatirla] = useState(false);
  const [hataMesaji, setHataMesaji] = useState('');

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setBeniHatirla(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hashedPassword = SHA256(sifre).toString();

    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', {
        email,
        password: hashedPassword
      }, { withCredentials: true });

      console.log('Giriş başarılı:', response.data);

      if (beniHatirla) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      navigate('/dashboard');
    } catch (error) {
      const hata = error.response?.data?.message || "Bir hata oluştu";
      setHataMesaji(hata);
      console.error('Giriş başarısız:', hata);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: 320, padding: 3, boxShadow: 3, borderRadius: 2, backgroundColor: '#fff' }}>
      <Typography variant="h5" align="center" gutterBottom>Giriş Yap</Typography>

      {hataMesaji && (
        <Typography color="error" variant="body2" align="center" sx={{ mt: 1 }}>
          {hataMesaji}
        </Typography>
      )}

      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        fullWidth
        label="Şifre"
        type="password"
        margin="normal"
        value={sifre}
        onChange={(e) => setSifre(e.target.value)}
      />
      <FormControlLabel
        control={<Checkbox checked={beniHatirla} onChange={(e) => setBeniHatirla(e.target.checked)} />}
        label="Beni Hatırla"
      />
      <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>Giriş Yap</Button>
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Button size="small">Şifremi Unuttum</Button>
      </Box>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button size="small" onClick={() => navigate('/register')}>Kayıt Ol</Button>
      </Box>
    </Box>
  );
};

export default Login;