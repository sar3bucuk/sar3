import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Checkbox, FormControlLabel, Paper, Container, IconButton,
  useTheme, alpha, AppBar, Toolbar, Avatar, Drawer, ListItemIcon, Divider, Tooltip,
  Slider, Switch
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import GamepadIcon from '@mui/icons-material/Gamepad';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { useTheme as useThemeContext } from '@mui/material/styles';
import { ColorModeContext } from '../contexts/ColorModeContext';
import ShareIcon from '@mui/icons-material/Share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const oyunlar = ['Tombala'];
const DRAWER_WIDTH = 240;

const avatarOptions = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png',
];

const DashboardPage = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLobiId, setEditingLobiId] = useState(null);
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
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('lobbies');
  const colorMode = React.useContext(ColorModeContext);
  const [userLobi, setUserLobi] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedLobiForShare, setSelectedLobiForShare] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '/avatars/avatar1.png');
  const [volume, setVolume] = useState(50);
  const [language, setLanguage] = useState('tr');
  const [notifications, setNotifications] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [lobiSifresi, setLobiSifresi] = useState('');

  useEffect(() => {
    axios.get('http://localhost:4000/api/lobbies', { withCredentials: true })
      .then(res => setLobiler(res.data))
      .catch(err => console.error("Lobi listesi alınamadı:", err));
  }, []);

  useEffect(() => {
    if (secilenLobi) {
      setLobiAdi('');
      setTip('normal');
      setSecilenOyun('');
      setSifreliMi(false);
      setSifre('');
      setBaslangicTarihi('');
      setBitisTarihi('');
      setLobiSifresi('');
      setIsEditing(false);
      setEditingLobiId(null);
    }
  }, [secilenLobi]);

  useEffect(() => {
    // Kullanıcının lobisini kontrol et
    const checkUserLobi = async () => {
      if (!user?.username) return; 
      try {
        const response = await axios.get(`http://localhost:4000/api/lobbies/user/${user.username}`, { withCredentials: true });
        setUserLobi(response.data);
      } catch (error) {
        console.error("Kullanıcı lobisi kontrol hatası:", error);
      }
    };

    // Lobileri güncelle
    const updateLobiler = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/lobbies', { withCredentials: true });
        const filteredLobiler = response.data.filter(lobi => {
          if (lobi.tip === 'etkinlik') {
            return new Date(lobi.bitisTarihi) > new Date();
          } else {
            // Normal lobi için kurucu çıkış zamanı kontrolü
            const kurucuCikisZamani = new Date(lobi.kurucuCikisZamani || lobi.createdAt);
            const sekizSaatSonrasi = new Date(kurucuCikisZamani.getTime() + 8 * 60 * 60 * 1000);
            return new Date() < sekizSaatSonrasi;
          }
        });
        setLobiler(filteredLobiler);
      } catch (error) {
        console.error("Lobi listesi alınamadı:", error);
      }
    };

    checkUserLobi();
    updateLobiler();
    const interval = setInterval(updateLobiler, 60000); // Her dakika güncelle
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
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

  const handleShare = (lobi) => {
    setSelectedLobiForShare(lobi);
    setShareDialogOpen(true);
  };

  const shareUrl = selectedLobiForShare ? `http://localhost:5173/join/${selectedLobiForShare.id}` : '';

  const menuItems = [
    { text: 'Lobiler', icon: <GroupsIcon />, value: 'lobbies' },
    { text: 'Oyunlar', icon: <GamepadIcon />, value: 'games' },
    { text: 'Profil', icon: <PersonIcon />, value: 'profile' },
    { text: 'Ayarlar', icon: <SettingsIcon />, value: 'settings' },
  ];

  const renderGamesContent = () => (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 2,
        background: theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.paper, 0.3)
          : alpha('#7B1FA2', 0.3),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.mode === 'dark'
          ? alpha(theme.palette.divider, 0.1)
          : alpha('#7B1FA2', 0.2)}`,
        transition: 'transform 0.2s',
        color: '#fff',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GamepadIcon sx={{ mr: 1, color: '#fff' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Oyunlar</Typography>
        </Box>
        <List>
          {oyunlar.map((oyun, i) => (
            <ListItem 
              key={i} 
              button 
              onClick={() => navigate(`/oyun-detay/${encodeURIComponent(oyun)}`)} 
              sx={{
                borderRadius: 1,
                mb: 1,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.1)
                }
              }}
            >
              <Box
                component="img"
                src="/tombala.gif"
                alt={oyun}
                sx={{
                  width: '300px',
                  height: '300px',
                  objectFit: 'contain',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: alpha('#fff', 0.1)
                }}
              />
              <ListItemText 
                primary={oyun}
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: '#fff',
                  textAlign: 'center'
                }}
                secondary="Oyun detayları için tıklayın"
                secondaryTypographyProps={{
                  color: alpha('#fff', 0.7),
                  textAlign: 'center'
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderLobbiesContent = () => (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 2,
        background: theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.paper, 0.3)
          : alpha('#7B1FA2', 0.3),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.mode === 'dark'
          ? alpha(theme.palette.divider, 0.1)
          : alpha('#7B1FA2', 0.2)}`,
        transition: 'transform 0.2s',
        color: '#fff',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GroupsIcon sx={{ mr: 1, color: '#fff' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Aktif Lobiler</Typography>
        </Box>
        <TextField 
          label="Lobi veya Kurucu Ara" 
          variant="outlined" 
          fullWidth 
          value={arama} 
          onChange={(e) => setArama(e.target.value)} 
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              color: '#fff',
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#fff',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-focused': {
                color: '#fff',
              },
            },
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.7)' }} />
          }}
        />
        <List>
          {filtrelenmisLobiler.map((lobi) => (
            <ListItem 
              key={lobi.id} 
              onClick={() => setSecilenLobi(lobi)} 
              sx={{ 
                borderRadius: 1,
                mb: 1,
                cursor: 'pointer',
                color: '#fff',
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.1)
                }
              }}
            >
              <ListItemText
                primary={
                  <Box>
                    <Typography component="span" sx={{ fontWeight: 500, color: '#fff' }}>
                      {lobi.ad}
                    </Typography>
                    <Typography component="span" sx={{ color: alpha('#fff', 0.7), fontSize: '0.9em', ml: 1 }}>
                      (Kurucu: {lobi.kurucu || 'Yok'})
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
                      {`${lobi.tip === 'etkinlik' ? 'Etkinlik Lobi' : 'Normal Lobi'}${lobi.sifreli ? ' (Şifreli)' : ''}`}
                    </Typography>
                    {lobi.tip === 'etkinlik' && (
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#fff' }}>
                        {etkinlikGeriSayim(lobi)}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        {!userLobi && (
          <Button 
            variant="contained" 
            fullWidth 
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ 
              mt: 2,
              borderRadius: 2,
              textTransform: 'none',
              py: 1.5,
              backgroundColor: '#fff',
              color: '#7B1FA2',
              '&:hover': {
                backgroundColor: alpha('#fff', 0.9)
              }
            }}
          >
            Yeni Lobi Oluştur
          </Button>
        )}
        {userLobi && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2, 
              textAlign: 'center', 
              color: '#fff',
              backgroundColor: alpha('#fff', 0.1),
              padding: 2,
              borderRadius: 2
            }}
          >
            Zaten aktif bir lobiniz bulunmaktadır. Yeni lobi oluşturmak için mevcut lobinizi kapatın.
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderProfileContent = () => (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 2,
        background: theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.paper, 0.3)
          : alpha('#7B1FA2', 0.3),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.mode === 'dark'
          ? alpha(theme.palette.divider, 0.1)
          : alpha('#7B1FA2', 0.2)}`,
        transition: 'transform 0.2s',
        color: '#fff',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ mr: 1, color: '#fff' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Profil</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={selectedAvatar}
            sx={{ 
              width: 120, 
              height: 120, 
              mb: 2,
              border: '3px solid #fff'
            }}
          />
          <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
            {user?.username ? `${user.username}#${user.tag}` : 'Misafir'}
          </Typography>
        </Box>

        <Typography variant="subtitle1" sx={{ color: '#fff', mb: 2 }}>Avatar Seç</Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: 2,
          mb: 3
        }}>
          {avatarOptions.map((avatar, index) => (
            <Box
              key={index}
              onClick={() => setSelectedAvatar(avatar)}
              sx={{
                cursor: 'pointer',
                border: selectedAvatar === avatar ? '3px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                p: 0.5,
                '&:hover': {
                  border: '3px solid rgba(255,255,255,0.5)'
                }
              }}
            >
              <Avatar src={avatar} sx={{ width: '100%', height: 'auto' }} />
            </Box>
          ))}
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#fff',
            color: '#7B1FA2',
            '&:hover': {
              backgroundColor: alpha('#fff', 0.9)
            }
          }}
          onClick={() => {
            // Avatar değiştirme API'si eklenecek
            alert('Avatar güncellendi!');
          }}
        >
          Avatarı Güncelle
        </Button>
      </CardContent>
    </Card>
  );

  const renderSettingsContent = () => (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 2,
        background: theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.paper, 0.3)
          : alpha('#7B1FA2', 0.3),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.mode === 'dark'
          ? alpha(theme.palette.divider, 0.1)
          : alpha('#7B1FA2', 0.2)}`,
        transition: 'transform 0.2s',
        color: '#fff',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SettingsIcon sx={{ mr: 1, color: '#fff' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Ayarlar</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: '#fff', mb: 1 }}>Ses Seviyesi</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <VolumeDownIcon sx={{ color: '#fff' }} />
            <Slider
              value={volume}
              onChange={(e, newValue) => setVolume(newValue)}
              sx={{
                color: '#fff',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#fff',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#fff',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
              }}
            />
            <VolumeUpIcon sx={{ color: '#fff' }} />
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: '#fff', mb: 1 }}>Dil</Typography>
          <FormControl fullWidth>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fff',
                },
              }}
            >
              <MenuItem value="tr">Türkçe</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#fff',
                    '& + .MuiSwitch-track': {
                      backgroundColor: '#fff',
                    },
                  },
                }}
              />
            }
            label="Bildirimler"
            sx={{ color: '#fff' }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: '#fff', mb: 1 }}>Tema</Typography>
          <FormControl fullWidth>
            <Select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fff',
                },
              }}
            >
              <MenuItem value="light">Açık</MenuItem>
              <MenuItem value="dark">Koyu</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#fff',
            color: '#7B1FA2',
            '&:hover': {
              backgroundColor: alpha('#fff', 0.9)
            }
          }}
          onClick={() => {
            // Ayarları kaydetme API'si eklenecek
            alert('Ayarlar kaydedildi!');
          }}
        >
          Ayarları Kaydet
        </Button>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'games':
        return renderGamesContent();
      case 'lobbies':
        return renderLobbiesContent();
      case 'profile':
        return renderProfileContent();
      case 'settings':
        return renderSettingsContent();
      case 'dashboard':
      default:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {renderLobbiesContent()}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderGamesContent()}
            </Grid>
          </Grid>
        );
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundImage: 'url(/dashboard.gif)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative'
    }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.3)
            : alpha('#7B1FA2', 0.3),
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${theme.palette.mode === 'dark'
            ? alpha(theme.palette.divider, 0.1)
            : alpha('#7B1FA2', 0.2)}`,
          color: '#fff'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, color: '#fff' }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={colorMode.toggleColorMode} sx={{ color: '#fff' }}>
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <Typography variant="body1" sx={{ fontWeight: 500, color: '#fff' }}>
              {user?.username ? `${user.username}#${user.tag}` : 'Misafir'}
            </Typography>
            <Avatar sx={{ bgcolor: '#fff', color: '#7B1FA2' }}>
              {user?.username?.[0]?.toUpperCase() || 'G'}
            </Avatar>
            <Tooltip title="Çıkış Yap">
              <IconButton onClick={handleLogout} sx={{ color: '#fff' }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 65,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? DRAWER_WIDTH : 65,
            boxSizing: 'border-box',
            background: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.3)
              : alpha('#7B1FA2', 0.3),
            backdropFilter: 'blur(8px)',
            borderRight: `1px solid ${theme.palette.mode === 'dark'
              ? alpha(theme.palette.divider, 0.1)
              : alpha('#7B1FA2', 0.2)}`,
            color: '#fff',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          p: 2,
          borderBottom: `1px solid ${theme.palette.mode === 'dark'
            ? alpha(theme.palette.divider, 0.1)
            : alpha('#7B1FA2', 0.2)}`
        }}>
          <img 
            src="/logoo.png" 
            alt="Logo" 
            style={{ 
              width: drawerOpen ? '120px' : '40px',
              height: 'auto',
              transition: 'width 0.2s'
            }} 
          />
        </Box>
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.value}
                onClick={() => setActiveSection(item.value)}
                selected={activeSection === item.value}
                sx={{
                  borderRadius: '0 24px 24px 0',
                  mr: 2,
                  mb: 0.5,
                  color: '#fff',
                  minHeight: 48,
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  px: 2.5,
                  '&.Mui-selected': {
                    backgroundColor: alpha('#fff', 0.1),
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.2),
                    },
                  },
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.05),
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: '#fff',
                  minWidth: 0,
                  mr: drawerOpen ? 3 : 'auto',
                  justifyContent: 'center',
                }}>
                  {item.icon}
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: activeSection === item.value ? 600 : 400,
                      color: '#fff'
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 65}px)` },
          mt: '64px',
          color: theme.palette.text.primary,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          position: 'relative',
          zIndex: 1
        }}
      >
        <Container maxWidth="lg">
          {renderContent()}
        </Container>
      </Box>

      <Dialog open={openModal} onClose={() => {
        setOpenModal(false);
        setIsEditing(false);
        setEditingLobiId(null);
      }}>
        <DialogTitle sx={{ 
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.3)
            : alpha('#7B1FA2', 0.3),
          color: '#fff'
        }}>{isEditing ? 'Lobiyi Düzenle' : 'Yeni Lobi Oluştur'}</DialogTitle>
        <DialogContent sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2, 
          mt: 1,
          background: '#fff',
          '& .MuiInputLabel-root': {
            color: '#7B1FA2'
          },
          '& .MuiOutlinedInput-root': {
            color: '#7B1FA2',
            '& fieldset': {
              borderColor: '#7B1FA2'
            },
            '&:hover fieldset': {
              borderColor: '#7B1FA2'
            }
          },
          '& .MuiSelect-select': {
            color: '#7B1FA2'
          }
        }}>
          <TextField 
            label="Lobi Adı" 
            fullWidth 
            value={lobiAdi} 
            onChange={(e) => setLobiAdi(e.target.value)} 
          />
          <FormControl fullWidth>
            <InputLabel id="tip-label">Lobi Tipi</InputLabel>
            <Select 
              labelId="tip-label" 
              value={tip} 
              label="Lobi Tipi" 
              onChange={(e) => setTip(e.target.value)}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="etkinlik">Etkinlik</MenuItem>
            </Select>
          </FormControl>
          {tip === 'etkinlik' && (
            <>
              <TextField 
                label="Başlangıç Tarihi" 
                type="datetime-local" 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
                value={baslangicTarihi} 
                onChange={(e) => setBaslangicTarihi(e.target.value)} 
              />
              <TextField 
                label="Bitiş Tarihi" 
                type="datetime-local" 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
                value={bitisTarihi} 
                onChange={(e) => setBitisTarihi(e.target.value)} 
              />
            </>
          )}
          <FormControlLabel 
            control={<Checkbox checked={sifreliMi} onChange={(e) => setSifreliMi(e.target.checked)} />} 
            label="Şifreli Lobi" 
          />
          {sifreliMi && (
            <TextField 
              label="Lobi Şifresi" 
              fullWidth 
              value={sifre} 
              onChange={(e) => setSifre(e.target.value)} 
            />
          )}
          <FormControl fullWidth>
            <InputLabel id="oyun-label">Oyun</InputLabel>
            <Select 
              labelId="oyun-label" 
              value={secilenOyun} 
              label="Oyun" 
              onChange={(e) => setSecilenOyun(e.target.value)}
            >
              {oyunlar.map((oyun, i) => (
                <MenuItem key={i} value={oyun}>{oyun}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenModal(false);
              setIsEditing(false);
              setEditingLobiId(null);
            }}
            sx={{ color: '#7B1FA2' }}
          >
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={async () => {
              try {
                const kurucu = `${user.username}#${user.tag}`;
                if (isEditing) {
                  // Update existing lobby
                  const response = await axios.post('http://localhost:4000/api/lobbies/update', {
                    lobiId: editingLobiId,
                    kurucu,
                    lobiAdi,
                    tip,
                    sifreliMi,
                    sifre,
                    oyun: secilenOyun,
                    baslangicTarihi,
                    bitisTarihi
                  }, { withCredentials: true });
                  
                  alert("Lobi başarıyla güncellendi!");
                } else {
                  // Create new lobby
                  const response = await axios.post('http://localhost:4000/api/lobbies', {
                    lobiAdi, 
                    tip, 
                    sifreliMi, 
                    sifre, 
                    kurucu, 
                    baslangicTarihi, 
                    bitisTarihi, 
                    secilenOyun
                  }, { withCredentials: true });
                  
                  alert("Lobi başarıyla oluşturuldu!");
                }
                
                const lobilerGuncel = await axios.get('http://localhost:4000/api/lobbies', { withCredentials: true });
                setLobiler(lobilerGuncel.data);
                setUserLobi(lobilerGuncel.data.find(l => l.kurucu === kurucu));
                
                setOpenModal(false);
                setIsEditing(false);
                setEditingLobiId(null);
              } catch (error) {
                console.error("Lobi işlemi hatası:", error.response?.data || error.message);
                alert(error.response?.data?.message || "İşlem başarısız oldu.");
              }
            }}
            sx={{ 
              backgroundColor: '#7B1FA2',
              color: '#fff',
              '&:hover': {
                backgroundColor: alpha('#7B1FA2', 0.9)
              }
            }}
          >
            {isEditing ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(secilenLobi)} onClose={() => setSecilenLobi(null)}>
        <DialogTitle sx={{ 
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.3)
            : alpha('#7B1FA2', 0.3),
          color: '#fff'
        }}>Lobi Detayı</DialogTitle>
        <DialogContent dividers sx={{ 
          minWidth: 300,
          background: '#fff',
          color: '#7B1FA2'
        }}>
          <Typography><strong>Adı:</strong> {secilenLobi?.ad}</Typography>
          <Typography><strong>Kurucu:</strong> {secilenLobi?.kurucu}</Typography>
          <Typography><strong>Oyun:</strong> {secilenLobi?.oyun}</Typography>
          {secilenLobi?.tip === 'etkinlik' && (
            <>
              <Typography><strong>Başlangıç:</strong> {new Date(secilenLobi?.baslangicTarihi).toLocaleString()}</Typography>
              <Typography><strong>Bitiş:</strong> {new Date(secilenLobi?.bitisTarihi).toLocaleString()}</Typography>
            </>
          )}
          
          {secilenLobi?.katilanlar?.length > 0 && (
            <>
              <Typography sx={{ mt: 2 }}><strong>Katılanlar ({secilenLobi.katilanlar.length} kişi):</strong></Typography>
              <List dense>
                <ListItem key="kurucu">
                  <ListItemText primary={`${secilenLobi.kurucu} (Kurucu)`} primaryTypographyProps={{ fontWeight: 'bold', color: '#7B1FA2' }} />
                </ListItem>
                {secilenLobi.katilanlar.filter(kisi => kisi !== secilenLobi.kurucu).map((kisi, i) => (
                  <ListItem key={i}><ListItemText primary={kisi} primaryTypographyProps={{ color: '#7B1FA2' }} /></ListItem>
                ))}
              </List>
            </>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography><strong>Bağlantı:</strong> {shareUrl}</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyIcon />}
              sx={{ 
                mt: 1, 
                mr: 1,
                color: '#7B1FA2',
                borderColor: '#7B1FA2',
                '&:hover': {
                  borderColor: '#7B1FA2',
                  backgroundColor: alpha('#7B1FA2', 0.1)
                }
              }}
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert("Bağlantı panoya kopyalandı!");
              }}
            >
              Kopyala
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShareIcon />}
              sx={{ 
                mt: 1,
                color: '#7B1FA2',
                borderColor: '#7B1FA2',
                '&:hover': {
                  borderColor: '#7B1FA2',
                  backgroundColor: alpha('#7B1FA2', 0.1)
                }
              }}
              onClick={() => handleShare(secilenLobi)}
            >
              Paylaş
            </Button>
          </Box>

          {secilenLobi?.katilanlar?.includes(`${user?.username}#${user?.tag}`) ? (
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlayArrowIcon />}
              sx={{ 
                mt: 2,
                backgroundColor: '#7B1FA2',
                color: '#fff',
                '&:hover': {
                  backgroundColor: alpha('#7B1FA2', 0.9)
                }
              }}
              onClick={() => navigate(`/oyun/${encodeURIComponent(secilenLobi.oyun)}/${secilenLobi.id}`)}
            >
              Oyuna Katıl
            </Button>
          ) : (
            <>
              {secilenLobi?.sifreli && (
                <TextField
                  label="Lobi Şifresi"
                  type="password"
                  fullWidth
                  value={lobiSifresi}
                  onChange={(e) => setLobiSifresi(e.target.value)}
                  sx={{
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      color: '#7B1FA2',
                      '& fieldset': {
                        borderColor: '#7B1FA2',
                      },
                      '&:hover fieldset': {
                        borderColor: '#7B1FA2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#7B1FA2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#7B1FA2',
                    },
                  }}
                />
              )}
              <Button
                variant="contained"
                fullWidth
                sx={{ 
                  mt: 2,
                  backgroundColor: '#7B1FA2',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: alpha('#7B1FA2', 0.9)
                  }
                }}
                onClick={async () => {
                  try {
                    if (secilenLobi.sifreli && !lobiSifresi) {
                      alert("Lütfen lobi şifresini girin.");
                      return;
                    }

                    const kullanici = `${user.username}#${user.tag}`;
                    const response = await axios.post('http://localhost:4000/api/lobbies/join', {
                      lobiId: secilenLobi.id,
                      kullanici,
                      sifreGirilen: lobiSifresi
                    }, { withCredentials: true });

                    if (response.data.error) {
                      alert(response.data.message);
                      return;
                    }

                    alert("Lobiye başarıyla katıldınız!");
                    const lobilerGuncel = await axios.get('http://localhost:4000/api/lobbies', { withCredentials: true });
                    setLobiler(lobilerGuncel.data);
                    setSecilenLobi(null);
                    setLobiSifresi('');
                  } catch (error) {
                    alert(error.response?.data?.message || "Katılım başarısız");
                  }
                }}
              >
                Lobiye Katıl
              </Button>
            </>
          )}

          {user && secilenLobi && (
            <Button 
              variant="outlined" 
              color="error" 
              fullWidth 
              sx={{ mt: 2 }} 
              onClick={async () => {
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
            <>
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

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => {
                  setLobiAdi(secilenLobi.ad);
                  setTip(secilenLobi.tip);
                  setSecilenOyun(secilenLobi.oyun);
                  setSifreliMi(secilenLobi.sifreli);
                  setSifre(secilenLobi.sifre || '');
                  setBaslangicTarihi(secilenLobi.baslangicTarihi || '');
                  setBitisTarihi(secilenLobi.bitisTarihi || '');
                  setIsEditing(true);
                  setEditingLobiId(secilenLobi.id);
                  setOpenModal(true);
                  setSecilenLobi(null);
                }}
              >
                Lobiyi Düzenle
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSecilenLobi(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle sx={{ 
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.3)
            : alpha('#7B1FA2', 0.3),
          color: '#fff'
        }}>Lobiyi Paylaş</DialogTitle>
        <DialogContent sx={{ 
          background: '#fff',
          color: theme.palette.mode === 'dark' ? '#fff' : '#000'
        }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
            <IconButton
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
              color="primary"
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')}
              color="primary"
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank')}
              color="primary"
            >
              <WhatsAppIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPage;