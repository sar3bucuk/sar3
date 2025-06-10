import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Checkbox, FormControlLabel
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const oyunlar = ['Tombala', 'Kelime Oyunu', 'Sayı Tahmini'];

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [lobiAdi, setLobiAdi] = useState('');
  const [tip, setTip] = useState('normal');
  const [sifreliMi, setSifreliMi] = useState(false);
  const [sifre, setSifre] = useState('');
  const [lobiler, setLobiler] = useState([]);
  const [arama, setArama] = useState('');
  const [secilenLobi, setSecilenLobi] = useState(null);
  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');
  const [secilenOyun, setSecilenOyun] = useState('');

  useEffect(() => {
    axios.get('http://localhost:4000/api/lobbies', { withCredentials: true })
      .then(res => setLobiler(res.data))
      .catch(err => console.error("Lobi listesi alınamadı:", err));
  }, []);

  useEffect(() => {
  if (secilenLobi) {
    setLobiAdi(secilenLobi.ad);
    setTip(secilenLobi.tip);
    setSecilenOyun(secilenLobi.oyun);
    setSifreliMi(secilenLobi.sifreli);
    setSifre(secilenLobi.sifre || '');
    setBaslangicTarihi(secilenLobi.baslangicTarihi || '');
    setBitisTarihi(secilenLobi.bitisTarihi || '');
  }
  }, [secilenLobi]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:4000/api/auth/logout', {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error('Çıkış başarısız:', error);
    }
  };

  const filtrelenmisLobiler = lobiler
    .filter(lobi => {
      const aramaLower = arama.toLowerCase();
      return (
        lobi.ad.toLowerCase().includes(aramaLower) ||
        lobi.kurucu?.toLowerCase().includes(aramaLower)
      );
    })
    .sort((a, b) => {
      if (a.tip === 'etkinlik' && b.tip !== 'etkinlik') return -1;
      if (a.tip !== 'etkinlik' && b.tip === 'etkinlik') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const etkinlikGeriSayim = (lobi) => {
      const now = new Date();
      const start = new Date(lobi.baslangicTarihi);
      const diffMs = start - now;
      const diffHrs = diffMs / (1000 * 60 * 60);

      if (diffHrs > 24) {
        return `Başlangıç: ${start.toLocaleString()}`;
      } else if (diffHrs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `Başlamasına kalan: ${hours} saat ${minutes} dakika`;
      } else {
        return `Etkinlik başladı`;
      }
    };

    const formatEtkinlikBilgisi = (baslangicStr) => {
      const now = new Date();
      const baslangic = new Date(baslangicStr);
      const farkMs = baslangic - now;

      if (farkMs > 24 * 60 * 60 * 1000) {
        return `Başlangıç: ${baslangic.toLocaleString()}`;
      } else if (farkMs > 0) {
        const saat = Math.floor(farkMs / (1000 * 60 * 60));
        const dakika = Math.floor((farkMs % (1000 * 60 * 60)) / (1000 * 60));
        return `Başlamasına ${saat} saat ${dakika} dakika kaldı`;
      } else {
        return `Etkinlik başladı`;
      }
    };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Hoş geldin, {user?.username}#{user?.tag}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>🎮 Oyunlar</Typography>
              <List>
                {oyunlar.map((oyun, i) => (
                  <ListItem 
                    key={i} 
                    button 
                    onClick={() => navigate(`/oyun/${encodeURIComponent(oyun)}`)} 
                    disableGutters
                  >
                    <ListItemText primary={oyun} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Dialog open={openModal} onClose={() => setOpenModal(false)}>
          <DialogTitle>Yeni Lobi Oluştur</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Lobi Adı" fullWidth value={lobiAdi} onChange={(e) => setLobiAdi(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel id="tip-label">Lobi Tipi</InputLabel>
              <Select labelId="tip-label" value={tip} label="Lobi Tipi" onChange={(e) => setTip(e.target.value)}>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="etkinlik">Etkinlik</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="oyun-label">Oyun</InputLabel>
              <Select labelId="oyun-label" value={secilenOyun} label="Oyun" onChange={(e) => setSecilenOyun(e.target.value)}>
                {oyunlar.map((oyun, i) => (
                  <MenuItem key={i} value={oyun}>{oyun}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {tip === 'etkinlik' && (
              <>
                <TextField label="Başlangıç Tarihi" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={baslangicTarihi} onChange={(e) => setBaslangicTarihi(e.target.value)} />
                <TextField label="Bitiş Tarihi" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={bitisTarihi} onChange={(e) => setBitisTarihi(e.target.value)} />
              </>
            )}
            <FormControlLabel control={<Checkbox checked={sifreliMi} onChange={(e) => setSifreliMi(e.target.checked)} />} label="Şifreli Lobi" />
            {sifreliMi && <TextField label="Lobi Şifresi" fullWidth value={sifre} onChange={(e) => setSifre(e.target.value)} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>İptal</Button>
            <Button variant="contained" onClick={async () => {
              try {
                const kurucu = `${user.username}#${user.tag}`;
                await axios.post('http://localhost:4000/api/lobbies', {
                  lobiAdi, tip, sifreliMi, sifre, kurucu, baslangicTarihi, bitisTarihi, secilenOyun
                }, { withCredentials: true });
                const lobilerGuncel = await axios.get('http://localhost:4000/api/lobbies', { withCredentials: true });
                setLobiler(lobilerGuncel.data);
                alert("Lobi başarıyla oluşturuldu!");
                setOpenModal(false);
              } catch (error) {
                console.error("Lobi oluşturma hatası:", error.response?.data || error.message);
                alert("Lobi oluşturulamadı.");
              }
            }}>Oluştur</Button>
          </DialogActions>
        </Dialog>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>🧑‍🤝‍🧑 Aktif Lobiler</Typography>
              <TextField label="Lobi veya Kurucu Ara" variant="outlined" fullWidth value={arama} onChange={(e) => setArama(e.target.value)} sx={{ my: 2 }} />
              <List>
                {filtrelenmisLobiler.map((lobi) => (
                  <ListItem key={lobi.id} onClick={() => setSecilenLobi(lobi)} disableGutters sx={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                    <ListItemText
                      primary={`${lobi.ad} (Kurucu: ${lobi.kurucu || 'Yok'})`}
                      secondary={
                        <>
                          {`${lobi.tip === 'etkinlik' ? 'Etkinlik Lobi' : 'Normal Lobi'}${lobi.sifreli ? ' (Şifreli)' : ''}`}
                          {lobi.tip === 'etkinlik' && (
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              {etkinlikGeriSayim(lobi)}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setOpenModal(true)}>
                ➕ Yeni Lobi Oluştur
              </Button>
              <Button variant="outlined" fullWidth sx={{ mt: 1 }} onClick={handleLogout}>
                Çıkış Yap
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={Boolean(secilenLobi)} onClose={() => setSecilenLobi(null)}>
        <DialogTitle>Lobi Detayı</DialogTitle>
        <DialogContent dividers sx={{ minWidth: 300 }}>
          <Typography><strong>Adı:</strong> {secilenLobi?.ad}</Typography>
          <Typography><strong>Kurucu:</strong> {secilenLobi?.kurucu}</Typography>
          <Typography><strong>Tip:</strong> {secilenLobi?.tip === 'etkinlik' ? 'Etkinlik' : 'Normal'}</Typography>
          <Typography><strong>Şifreli:</strong> {secilenLobi?.sifreli ? 'Evet' : 'Hayır'}</Typography>
          <Typography><strong>Oyun:</strong> {secilenLobi?.oyun}</Typography>
          {secilenLobi?.tip === 'etkinlik' && (
            <>
              <Typography><strong>Başlangıç:</strong> {new Date(secilenLobi?.baslangicTarihi).toLocaleString()}</Typography>
              <Typography><strong>Bitiş:</strong> {new Date(secilenLobi?.bitisTarihi).toLocaleString()}</Typography>
            </>
          )}
          <Typography><strong>Oluşturulma:</strong> {new Date(secilenLobi?.createdAt).toLocaleString()}</Typography>
          {secilenLobi?.sifreli && (
            <TextField label="Lobi Şifresi" type="password" fullWidth value={sifre} onChange={(e) => setSifre(e.target.value)} sx={{ my: 1 }} />
          )}
          {secilenLobi?.katilanlar?.length > 0 && (
            <>
              <Typography sx={{ mt: 2 }}><strong>Katılanlar ({secilenLobi.katilanlar.length} kişi):</strong></Typography>
              <List dense>
                <ListItem key="kurucu">
                  <ListItemText primary={`${secilenLobi.kurucu} (Kurucu)`} primaryTypographyProps={{ fontWeight: 'bold' }} />
                </ListItem>
                {secilenLobi.katilanlar.filter(kisi => kisi !== secilenLobi.kurucu).map((kisi, i) => (
                  <ListItem key={i}><ListItemText primary={kisi} /></ListItem>
                ))}
              </List>
            </>
          )}

            <Button
              variant="contained"
              fullWidth
              onClick={async () => {
                try {
                  const kullanici = `${user.username}#${user.tag}`;
                  await axios.post('http://localhost:4000/api/lobbies/join', {
                    lobiId: secilenLobi.id,
                    kullanici,
                    sifreGirilen: sifre
                  }, { withCredentials: true });

                  alert("Lobiye başarıyla katıldınız!");

                  const lobilerGuncel = await axios.get('http://localhost:4000/api/lobbies', { withCredentials: true });
                  setLobiler(lobilerGuncel.data);
                  setSecilenLobi(null);

                } catch (error) {
                  alert(error.response?.data?.message || "Katılım başarısız");
                }
              }}
            >
              Katıl
            </Button>

          {user && secilenLobi && (
            <Button variant="outlined" color="error" fullWidth sx={{ mt: 2 }} onClick={async () => {
                try {
                  const kullanici = `${user.username}#${user.tag}`;
                  await axios.post('http://localhost:4000/api/lobbies/leave', {
                    lobiId: secilenLobi.id,
                    kullanici
                  }, { withCredentials: true });
                  alert("Lobiden ayrıldınız.");
                  const lobilerGuncel = await axios.get('http://localhost:4000/api/lobbies', { withCredentials: true });
                  setLobiler(lobilerGuncel.data);
                  setSecilenLobi(null);
                } catch (error) {
                  alert(error.response?.data?.message || "Ayrılma başarısız");
                }
              }}
            >
              Lobiden Ayrıl
            </Button>
          )}

          {user && `${user.username}#${user.tag}` === secilenLobi?.kurucu && (
          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mt: 2 }}
            onClick={async () => {
              if (!window.confirm("Bu lobiyi silmek istediğine emin misin?")) return;
              try {
                await axios.post('http://localhost:4000/api/lobbies/delete', {
                  lobiId: secilenLobi.id,
                  kurucu: `${user.username}#${user.tag}`
                }, { withCredentials: true });

                alert("Lobi silindi.");
                const lobilerGuncel = await axios.get('http://localhost:4000/api/lobbies', { withCredentials: true });
                setLobiler(lobilerGuncel.data);
                setSecilenLobi(null);
              } catch (error) {
                alert(error.response?.data?.message || "Silme başarısız");
              }
            }}
          >
            Lobiyi Sil
          </Button>
        )}

        {user && `${user.username}#${user.tag}` === secilenLobi?.kurucu && (
        <>
          <TextField
            label="Lobi Adı"
            fullWidth
            sx={{ mt: 2 }}
            value={lobiAdi}
            onChange={(e) => setLobiAdi(e.target.value)}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="tip-guncelle-label">Lobi Tipi</InputLabel>
            <Select
              labelId="tip-guncelle-label"
              value={tip}
              label="Lobi Tipi"
              onChange={(e) => setTip(e.target.value)}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="etkinlik">Etkinlik</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="oyun-guncelle-label">Oyun</InputLabel>
            <Select
              labelId="oyun-guncelle-label"
              value={secilenOyun}
              label="Oyun"
              onChange={(e) => setSecilenOyun(e.target.value)}
            >
              {oyunlar.map((oyun, i) => (
                <MenuItem key={i} value={oyun}>{oyun}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            sx={{ mt: 2 }}
            control={<Checkbox checked={sifreliMi} onChange={(e) => setSifreliMi(e.target.checked)} />}
            label="Şifreli Lobi"
          />
          {sifreliMi && (
            <TextField
              label="Şifre"
              fullWidth
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
            />
          )}
          {tip === 'etkinlik' && (
            <>
              <TextField
                label="Başlangıç Tarihi"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={baslangicTarihi}
                onChange={(e) => setBaslangicTarihi(e.target.value)}
                sx={{ mt: 2 }}
              />
              <TextField
                label="Bitiş Tarihi"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={bitisTarihi}
                onChange={(e) => setBitisTarihi(e.target.value)}
                sx={{ mt: 2 }}
              />
            </>
          )}
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={async () => {
              try {
                await axios.post('http://localhost:4000/api/lobbies/update', {
                  lobiId: secilenLobi.id,
                  kurucu: `${user.username}#${user.tag}`,
                  lobiAdi,
                  tip,
                  sifreliMi,
                  sifre,
                  oyun: secilenOyun,
                  baslangicTarihi,
                  bitisTarihi
                }, { withCredentials: true });

                alert("Lobi güncellendi!");
                const lobilerGuncel = await axios.get('http://localhost:4000/api/lobbies', { withCredentials: true });
                setLobiler(lobilerGuncel.data);
                setSecilenLobi(null);
              } catch (err) {
                alert(err.response?.data?.message || "Güncelleme başarısız");
              }
            }}
          >
            Güncelle
          </Button>
          </>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography><strong>Bağlantı:</strong> http://localhost:5173/join/{secilenLobi?.id}</Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => {
              navigator.clipboard.writeText(`http://localhost:5173/join/${secilenLobi?.id}`);
              alert("Bağlantı panoya kopyalandı!");
            }}
          >
            Kopyala
          </Button>
        </Box>     
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSecilenLobi(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPage;