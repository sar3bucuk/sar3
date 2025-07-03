import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Checkbox, FormControlLabel, Paper, Container, IconButton,
  useTheme, alpha, AppBar, Toolbar, Avatar, Drawer, ListItemIcon, Divider, Tooltip,
  Slider, Switch, Snackbar, Alert, Chip, Badge
} from '@mui/material';

import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningIcon from '@mui/icons-material/Warning';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { getRandomQuizQuestions } from "./quizQuestions";

const oyunlar = ['Tombala'];
const DRAWER_WIDTH = 240;

const avatarOptions = [
  '/avatars/anais.png',
  '/avatars/blossom.png',
  '/avatars/bubbles.jpg',
  '/avatars/buttercup.jpg',
  '/avatars/Daphne.png',
  '/avatars/Darwin.webp',
  '/avatars/finn.jpg',
  '/avatars/fred.png',
  '/avatars/gumball.png',
  '/avatars/kopekJake.jpg',
  '/avatars/marceline.png',
  '/avatars/Mordecai.jpg',
  '/avatars/princessCiklet.png',
  '/avatars/rigby.jpg',
  '/avatars/scoobyDoo.jpg',
  '/avatars/shaggy.webp',
  '/avatars/velma.png',
];

const DashboardPage = () => {
  const theme = useTheme();
  const { user, logout, setUser } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [volume, setVolume] = useState(50);
  const [notifications, setNotifications] = useState(true);
  const [lobiSifresi, setLobiSifresi] = useState('');
  const [usersList, setUsersList] = useState([]);
  
  // Bildirim sistemi için state'ler
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'warning', 'info'
    title: ''
  });

  // Kullanıcı bildirimleri için state'ler
  const [userNotifications, setUserNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Arkadaş sistemi için state'ler
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  const [friendTag, setFriendTag] = useState('');
  const [pendingFriendRequests, setPendingFriendRequests] = useState(0);

  // Lobi silme onay dialogu için state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lobiToDelete, setLobiToDelete] = useState(null);

  // Form validasyonu için state'ler
  const [formErrors, setFormErrors] = useState({
    lobiAdi: '',
    secilenOyun: '',
    sifre: '',
    baslangicTarihi: '',
    bitisTarihi: ''
  });

  const [isFirstPlace, setIsFirstPlace] = useState(false);

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
    
    // Sadece lobi ve oyun sayfalarında interval çalıştır
    if (activeSection === 'lobbies' || activeSection === 'games') {
      const interval = setInterval(updateLobiler, 60000); // Her dakika güncelle
      return () => clearInterval(interval);
    }
  }, [user, activeSection]);

  useEffect(() => {
    axios.get('http://localhost:4000/api/users', { withCredentials: true })
      .then(res => setUsersList(res.data))
      .catch(err => console.error('Kullanıcı listesi alınamadı:', err));
  }, []);

  // Birinci sırada olup olmadığını kontrol et
  useEffect(() => {
    if (usersList.length > 0 && user?.username && user?.tag) {
      const sortedUsers = [...usersList].sort((a, b) => (b.points || 0) - (a.points || 0));
      const currentUserRank = sortedUsers.findIndex(u => 
        u.username === user.username && u.tag === user.tag
      ) + 1;
      
      const wasFirstPlace = isFirstPlace;
      const nowFirstPlace = currentUserRank === 1;
      
      // Eğer birinci sıraya yeni geçtiyse
      if (!wasFirstPlace && nowFirstPlace) {
        setIsFirstPlace(true);
      } else if (nowFirstPlace) {
        setIsFirstPlace(true);
      } else {
        setIsFirstPlace(false);
      }
    }
  }, [usersList, user, activeSection, isFirstPlace]);



  useEffect(() => {
    if (user?.avatar) {
      setSelectedAvatar(user.avatar);
    } else {
      // Kullanıcının avatarı yoksa varsayılan avatarı seç
      setSelectedAvatar('/avatars/anais.png');
    }
  }, [user]);

  // Ayarları localStorage'dan yükle
  useEffect(() => {
    const savedVolume = localStorage.getItem('volume');
    const savedNotifications = localStorage.getItem('notifications');
    
    if (savedVolume) setVolume(parseInt(savedVolume));
    if (savedNotifications) setNotifications(savedNotifications === 'true');
  }, []);

  useEffect(() => {
    // URL parametresini kontrol et
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams.get('section');
    if (section === 'games') {
      setActiveSection('games');
    }
  }, [location.search]);

  // Bildirimleri yükle
  useEffect(() => {
    loadNotifications();
    
    // Sadece quiz sayfasında değilken bildirimleri güncelle
    if (activeSection !== 'quiz') {
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, activeSection]);

  // Arkadaş verilerini yükle
  useEffect(() => {
    if (user?.username) {
      loadFriendsData();
      
      // Sadece quiz sayfasında değilken arkadaş verilerini güncelle
      if (activeSection !== 'quiz') {
        const interval = setInterval(loadFriendsData, 30000);
        return () => clearInterval(interval);
      }
    }
  }, [user, activeSection]);

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
      return `${t('lobby.eventStart')} ${start.toLocaleString()}`;
    } else if (diffHrs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${t('lobby.eventCountdown')} ${hours} ${t('common.hours')} ${minutes} ${t('common.minutes')}`;
    } else {
      return t('lobby.eventStarted');
    }
  };

  const handleShare = (lobi) => {
    setSelectedLobiForShare(lobi);
    setShareDialogOpen(true);
  };

  const shareUrl = selectedLobiForShare ? `http://localhost:5173/join/${selectedLobiForShare.id}` : '';

  // Bildirim sistemi fonksiyonları
  const showNotification = (title, message, severity = 'success') => {
    setNotification({
      open: true,
      title,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Bildirimleri yükle
  const loadNotifications = async () => {
    if (!user?.username) return;
    
    try {
      const response = await axios.get(`http://localhost:4000/api/notifications/${user.username}`, { 
        withCredentials: true 
      });
      setUserNotifications(response.data);
      
      // Okunmamış bildirim sayısını hesapla
      const unreadCount = response.data.filter(notif => !notif.read).length;
      setUnreadNotifications(unreadCount);
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
    }
  };

  // Bildirimi okundu olarak işaretle
  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.post(`http://localhost:4000/api/notifications/${notificationId}/read`, {}, { 
        withCredentials: true 
      });
      
      // Bildirimleri yeniden yükle
      loadNotifications();
    } catch (error) {
      console.error('Bildirim işaretlenirken hata:', error);
    }
  };

  // Tüm bildirimleri okundu olarak işaretle
  const markAllNotificationsAsRead = async () => {
    try {
      await axios.post(`http://localhost:4000/api/notifications/${user.username}/read-all`, {}, { 
        withCredentials: true 
      });
      
      // Bildirimleri yeniden yükle
      loadNotifications();
    } catch (error) {
      console.error('Bildirimler işaretlenirken hata:', error);
    }
  };

  // Arkadaş verilerini yükle
  const loadFriendsData = async () => {
    if (!user?.username) return;
    
    try {
      // Arkadaş isteklerini getir
      const requestsResponse = await axios.get(`http://localhost:4000/api/friends/requests/${user.username}`, { 
        withCredentials: true 
      });
      setFriendRequests(requestsResponse.data);
      setPendingFriendRequests(requestsResponse.data.length);
      
      // Arkadaş listesini getir
      const friendsResponse = await axios.get(`http://localhost:4000/api/friends/${user.username}`, { 
        withCredentials: true 
      });
      setFriendsList(friendsResponse.data);
    } catch (error) {
      console.error('Arkadaş verileri yüklenirken hata:', error);
    }
  };

  // Arkadaş isteği gönder
  const sendFriendRequest = async () => {
    if (!friendUsername.trim() || !friendTag.trim()) {
      showNotification('Uyarı!', 'Kullanıcı adı ve tag gereklidir', 'warning');
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/friends/request', {
        fromUsername: user.username,
        fromTag: user.tag,
        toUsername: friendUsername.trim(),
        toTag: parseInt(friendTag.trim())
      }, { withCredentials: true });

      showNotification('Başarılı!', 'Arkadaş isteği gönderildi', 'success');
      setFriendUsername('');
      setFriendTag('');
      setAddFriendDialogOpen(false);
    } catch (error) {
      showNotification('Hata!', error.response?.data?.message || 'Arkadaş isteği gönderilemedi', 'error');
    }
  };

  // Arkadaş isteğini kabul et
  const acceptFriendRequest = async (requestId) => {
    try {
      await axios.post('http://localhost:4000/api/friends/accept', {
        requestId,
        username: user.username,
        tag: user.tag
      }, { withCredentials: true });

      showNotification('Başarılı!', 'Arkadaş isteği kabul edildi', 'success');
      loadFriendsData();
    } catch (error) {
      showNotification('Hata!', error.response?.data?.message || 'İstek kabul edilemedi', 'error');
    }
  };

  // Arkadaş isteğini reddet
  const rejectFriendRequest = async (requestId) => {
    try {
      await axios.post('http://localhost:4000/api/friends/reject', {
        requestId,
        username: user.username,
        tag: user.tag
      }, { withCredentials: true });

      showNotification('Başarılı!', 'Arkadaş isteği reddedildi', 'info');
      loadFriendsData();
    } catch (error) {
      showNotification('Hata!', error.response?.data?.message || 'İstek reddedilemedi', 'error');
    }
  };

  // Arkadaşlıktan çık
  const removeFriend = async (friendshipId) => {
    try {
      await axios.post('http://localhost:4000/api/friends/remove', {
        friendshipId,
        username: user.username,
        tag: user.tag
      }, { withCredentials: true });

      showNotification('Başarılı!', 'Arkadaşlıktan çıkıldı', 'info');
      loadFriendsData();
    } catch (error) {
      showNotification('Hata!', error.response?.data?.message || 'Arkadaşlıktan çıkılamadı', 'error');
    }
  };

  // Form validasyonu
  const validateForm = () => {
    const errors = {
      lobiAdi: '',
      secilenOyun: '',
      sifre: '',
      baslangicTarihi: '',
      bitisTarihi: ''
    };

    // Lobi adı kontrolü
    if (!lobiAdi.trim()) {
      errors.lobiAdi = 'Lobi adı gereklidir';
    } else if (lobiAdi.trim().length < 3) {
      errors.lobiAdi = 'Lobi adı en az 3 karakter olmalıdır';
    } else if (lobiAdi.trim().length > 50) {
      errors.lobiAdi = 'Lobi adı en fazla 50 karakter olabilir';
    }

    // Oyun seçimi kontrolü
    if (!secilenOyun) {
      errors.secilenOyun = 'Lütfen bir oyun seçin';
    }

    // Şifre kontrolü (şifreli lobi ise)
    if (sifreliMi && !sifre.trim()) {
      errors.sifre = 'Şifreli lobi için şifre gereklidir';
    } else if (sifreliMi && sifre.trim().length < 4) {
      errors.sifre = 'Şifre en az 4 karakter olmalıdır';
    }

    // Etkinlik lobi tarih kontrolü
    if (tip === 'etkinlik') {
      if (!baslangicTarihi) {
        errors.baslangicTarihi = 'Başlangıç tarihi gereklidir';
      } else if (!bitisTarihi) {
        errors.bitisTarihi = 'Bitiş tarihi gereklidir';
      } else if (new Date(baslangicTarihi) <= new Date()) {
        errors.baslangicTarihi = 'Başlangıç tarihi gelecekte olmalıdır';
      } else if (new Date(bitisTarihi) <= new Date(baslangicTarihi)) {
        errors.bitisTarihi = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
      }
    }

    setFormErrors(errors);
    
    // Hata var mı kontrol et
    return !Object.values(errors).some(error => error !== '');
  };

  // Lobi silme işlemi
  const handleDeleteLobi = async () => {
    if (!lobiToDelete) return;
    
    console.log('🗑️ Lobi silme işlemi başlatılıyor...');
    console.log('📋 Silinecek lobi:', lobiToDelete);
    console.log('👤 Kullanıcı:', user);
    
    try {
      const kurucu = `${user.username}#${user.tag}`;
      console.log('🔍 Gönderilecek veriler:', { lobiId: lobiToDelete.id, kurucu });
      
      const response = await axios.post('http://localhost:4000/api/lobbies/delete', {
        lobiId: lobiToDelete.id,
        kurucu: kurucu
      }, { withCredentials: true });

      console.log('✅ Silme başarılı:', response.data);
      showNotification(t('notifications.success'), t('notifications.lobbyDeleted'), 'success');
      
      // Lobileri güncelle
      const lobilerGuncel = await axios.get('http://localhost:4000/api/lobbies', { withCredentials: true });
      setLobiler(lobilerGuncel.data);
      
      // Kullanıcının lobi durumunu kontrol et
      try {
        const userLobiResponse = await axios.get(`http://localhost:4000/api/lobbies/user/${user.username}`, { withCredentials: true });
        setUserLobi(userLobiResponse.data);
        console.log('✅ Kullanıcı lobi durumu güncellendi:', userLobiResponse.data);
      } catch (userLobiError) {
        // Kullanıcının lobisi yoksa null olarak ayarla
        console.log('✅ Kullanıcının lobisi yok, durum temizlendi');
        setUserLobi(null);
      }
      
      setSecilenLobi(null);
      
      // Dialog'ları kapat
      setDeleteConfirmOpen(false);
      setLobiToDelete(null);
    } catch (error) {
      console.error('❌ Silme hatası:', error);
      console.error('❌ Hata detayı:', error.response?.data);
      showNotification('Hata!', error.response?.data?.message || "Silme başarısız", 'error');
      
      // Dialog'u kapat
      setDeleteConfirmOpen(false);
      setLobiToDelete(null);
    }
  };

  const menuItems = [
    { text: t('dashboard.lobbies'), icon: <GroupsIcon />, value: 'lobbies' },
    { text: t('dashboard.games'), icon: <GamepadIcon />, value: 'games' },
    { text: 'Bilgi Yarışması', icon: <HelpOutlineIcon />, value: 'quiz' },
    { text: t('dashboard.leaderboard'), icon: <LeaderboardIcon />, value: 'leaderboard' },
    { text: t('dashboard.profile'), icon: <PersonIcon />, value: 'profile' },
    { text: t('dashboard.settings'), icon: <SettingsIcon />, value: 'settings' },
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('dashboard.gamesList')}</Typography>
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
                secondary={t('dashboard.gameDetails')}
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('dashboard.activeLobbies')}</Typography>
        </Box>
        <TextField 
          label={t('dashboard.searchLobby')} 
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
                  <Typography component="div" sx={{ color: '#fff' }}>
                    <Typography component="span" sx={{ fontWeight: 500, color: '#fff' }}>
                      {lobi.ad}
                    </Typography>
                    <Typography component="span" sx={{ color: alpha('#fff', 0.7), fontSize: '0.9em', ml: 1 }}>
                      (Kurucu: {lobi.kurucu || 'Yok'})
                    </Typography>
                  </Typography>
                }
                secondary={
                  <Typography component="div" sx={{ mt: 0.5, color: alpha('#fff', 0.7) }}>
                    <Typography variant="body2" component="div" sx={{ color: alpha('#fff', 0.7) }}>
                      {`${lobi.tip === 'etkinlik' ? t('lobby.event') : t('lobby.normal')}${lobi.sifreli ? ` (${t('lobby.passworded')})` : ''}`}
                    </Typography>
                    {lobi.tip === 'etkinlik' && (
                      <Typography variant="body2" component="div" sx={{ fontStyle: 'italic', color: '#fff' }}>
                        {etkinlikGeriSayim(lobi)}
                      </Typography>
                    )}
                  </Typography>
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
            {t('dashboard.createLobby')}
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
            {t('dashboard.alreadyHaveLobby')}
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('profile.title')}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <img
            src={user?.avatar || selectedAvatar || '/avatars/anais.png'}
            alt="avatar"
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              marginBottom: 16
            }}
          />
          <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
            {user?.username ? `${user.username}#${user.tag}` : t('auth.guest')}
          </Typography>
        </Box>

        <Typography variant="subtitle1" sx={{ color: '#fff', mb: 2 }}>{t('profile.selectAvatar')}</Typography>
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
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  border: '3px solid rgba(255,255,255,0.5)'
                }
              }}
            >
              <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
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
          onClick={async () => {
            try {
              const response = await axios.post('http://localhost:4000/api/users/update-avatar', {
                username: user.username,
                tag: user.tag,
                avatar: selectedAvatar
              }, { withCredentials: true });
              console.log('Avatar güncelleme response:', response);
              setUser({ ...user, avatar: selectedAvatar });
              showNotification('Başarılı!', 'Avatarınız güncellendi.', 'success');
            } catch (error) {
              console.error('Avatar güncelleme hatası:', error);
              showNotification('Hata!', 'Avatar güncellenemedi.', 'error');
            }
          }}
        >
          {t('profile.updateAvatar')}
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('settings.title')}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: '#fff', mb: 1 }}>{t('settings.volume')}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <VolumeDownIcon sx={{ color: '#fff' }} />
            <Slider
              value={volume}
              onChange={(e, newValue) => {
                setVolume(newValue);
                localStorage.setItem('volume', newValue);
              }}
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
          <Typography variant="subtitle1" sx={{ color: '#fff', mb: 1 }}>{t('settings.language')}</Typography>
          <FormControl fullWidth>
            <Select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
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
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>
        </Box>



        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: '#fff', mb: 1 }}>{t('settings.theme')}</Typography>
          <FormControl fullWidth>
            <Select
              value={colorMode.mode}
              onChange={(e) => colorMode.setColorMode(e.target.value)}
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
              <MenuItem value="light">{t('settings.light')}</MenuItem>
              <MenuItem value="dark">{t('settings.dark')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Typography 
          variant="body2" 
          sx={{ 
            color: alpha('#fff', 0.7),
            fontStyle: 'italic',
            textAlign: 'center',
            mt: 2,
            p: 1,
            backgroundColor: alpha('#fff', 0.1),
            borderRadius: 1
          }}
        >
          {t('settings.autoSave')}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderLeaderboardContent = () => {
    // Kullanıcıları puana göre sırala
    const sortedUsers = [...usersList].sort((a, b) => (b.points || 0) - (a.points || 0));
    
    // Mevcut kullanıcının sıralamasını bul
    const currentUserRank = sortedUsers.findIndex(u => 
      u.username === user?.username && u.tag === user?.tag
    ) + 1;

    // Birinci sırada olup olmadığını kontrol et ve konfeti göster
    const isUserFirstPlace = currentUserRank === 1;

    return (
      <Box sx={{ position: 'relative' }}>

        
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
            <LeaderboardIcon sx={{ mr: 1, color: '#fff' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('dashboard.leaderboard')}</Typography>
          </Box>

          {/* Mevcut kullanıcının durumu */}
          {user && (
            <Box sx={{ 
              backgroundColor: isUserFirstPlace ? alpha('#FFD700', 0.2) : alpha('#fff', 0.1), 
              borderRadius: 2, 
              p: 2, 
              mb: 3,
              border: isUserFirstPlace ? '3px solid #FFD700' : '2px solid rgba(255,255,255,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {isUserFirstPlace && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,215,0,0.1) 50%, transparent 70%)',
                  animation: 'shimmer 2s infinite',
                  '@keyframes shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                  }
                }} />
              )}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#fff' }}>
                {isUserFirstPlace ? '🏆 LİDERLİK TABLOSU LİDERİ! 🏆' : t('dashboard.yourStatus')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={isUserFirstPlace ? '🥇 1. SIRA!' : `#${currentUserRank}`}
                  sx={{ 
                    backgroundColor: isUserFirstPlace ? '#FFD700' : '#FFD700',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: isUserFirstPlace ? '1.2rem' : '1.1rem',
                    animation: isUserFirstPlace ? 'pulse 1.5s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }}
                />
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    border: '2px solid rgba(255,255,255,0.5)'
                  }}
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="avatar" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        borderRadius: '50%' 
                      }} 
                    />
                  ) : (
                    <span style={{ color: '#7B1FA2', fontWeight: 'bold' }}>
                      {user?.username?.[0]?.toUpperCase() || 'G'}
                    </span>
                  )}
                </Avatar>
                <Box>
                  <Typography variant="body1" component="div" sx={{ fontWeight: 500, color: '#fff' }}>
                    {user?.username ? `${user.username}#${user.tag}` : 'Misafir'}
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ color: alpha('#fff', 0.8) }}>
                    {(() => {
                      const found = sortedUsers.find(u => u.username === user?.username && u.tag === user?.tag);
                      return (found ? found.points : user?.points || 0) + ' puan';
                    })()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Sıralama listesi */}
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#fff' }}>
            {t('dashboard.topPlayers')}
          </Typography>
          <List>
            {sortedUsers.slice(0, 10).map((userItem, index) => {
              const isCurrentUser = userItem.username === user?.username && userItem.tag === user?.tag;
              const rank = index + 1;
              
              return (
                <ListItem 
                  key={`${userItem.username}-${userItem.tag}`}
                  sx={{ 
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: isCurrentUser ? alpha('#fff', 0.15) : 'transparent',
                    border: isCurrentUser ? '2px solid rgba(255,255,255,0.5)' : 'none',
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.1)
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                    {/* Sıralama */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: rank === 1 ? '#FFD700' : 
                                   rank === 2 ? '#C0C0C0' : 
                                   rank === 3 ? '#CD7F32' : 
                                   alpha('#fff', 0.2),
                      color: rank <= 3 ? '#000' : '#fff',
                      fontWeight: 'bold',
                      fontSize: rank <= 3 ? '1.2rem' : '1rem'
                    }}>
                      {rank === 1 && <EmojiEventsIcon sx={{ fontSize: 20 }} />}
                      {rank === 2 && <StarIcon sx={{ fontSize: 18 }} />}
                      {rank === 3 && <StarBorderIcon sx={{ fontSize: 18 }} />}
                      {rank > 3 && rank}
                    </Box>

                    {/* Avatar */}
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36,
                        border: '2px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      {userItem.avatar ? (
                        <img 
                          src={userItem.avatar} 
                          alt="avatar" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover', 
                            borderRadius: '50%' 
                          }} 
                        />
                      ) : (
                        <span style={{ color: '#7B1FA2', fontWeight: 'bold' }}>
                          {userItem.username?.[0]?.toUpperCase() || 'G'}
                        </span>
                      )}
                    </Avatar>

                    {/* Kullanıcı bilgileri */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" component="div" sx={{ 
                        fontWeight: isCurrentUser ? 'bold' : 500, 
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <span>{`${userItem.username}#${userItem.tag}`}</span>
                        {isCurrentUser && (
                          <Chip 
                            label={t('dashboard.you')} 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#FFD700',
                              color: '#000',
                              fontSize: '0.7rem'
                            }} 
                          />
                        )}
                      </Typography>
                    </Box>

                    {/* Puan */}
                    <Chip 
                      label={`${userItem.points || 0} ${t('dashboard.points')}`}
                      sx={{ 
                        backgroundColor: alpha('#fff', 0.2),
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>
      </Box>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'lobbies':
        return renderLobbiesContent();
      case 'games':
        return renderGamesContent();
      case 'quiz':
        return <QuizSection />;
      case 'leaderboard':
        return renderLeaderboardContent();
      case 'profile':
        return renderProfileContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderLobbiesContent();
    }
  };

  const getUserAvatar = (name) => {
    if (!name) return undefined;
    const [username, tag] = name.split('#');
    if (!username || !tag) return undefined;
    const user = usersList.find(
      u => u.username === username && String(u.tag) === String(tag)
    );
    // Konsola yazdır
    console.log('player.name:', name, 'avatar:', user?.avatar);
    return user?.avatar || undefined;
  };

  function QuizSection() {
    const { user } = useAuth();
    const [questions, setQuestions] = React.useState(() => getRandomQuizQuestions(10));
    const [current, setCurrent] = React.useState(0);
    const [selected, setSelected] = React.useState(null);
    const [showAnswer, setShowAnswer] = React.useState(false);
    const [correctCount, setCorrectCount] = React.useState(0);
    const [finished, setFinished] = React.useState(false);
    const [bonus, setBonus] = React.useState(false);
    const [bonusMsg, setBonusMsg] = React.useState("");
    const [pointsGiven, setPointsGiven] = React.useState(false);
    const [timeLeft, setTimeLeft] = React.useState(60); // 60 saniye süre
    const [timerActive, setTimerActive] = React.useState(true);

    // Timer efekti
    React.useEffect(() => {
      if (timerActive && timeLeft > 0 && !finished) {
        const timer = setTimeout(() => {
          setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (timeLeft === 0 && !finished) {
        // Süre doldu ama quiz devam edebilir
        setTimerActive(false);
        // Quiz'i otomatik bitirme - kullanıcı manuel olarak bitirebilir
      }
    }, [timeLeft, timerActive, finished]);

    React.useEffect(() => {
      if (finished && !pointsGiven && correctCount === questions.length && user?.username && user?.tag) {
        setPointsGiven(true);
        axios.post('http://localhost:4000/api/users/add-points', {
          username: user.username,
          tag: user.tag,
          points: 25
        }, { withCredentials: true })
          .then(() => {
            setBonus(true);
            setBonusMsg('Tebrikler! 25 puan kazandınız.');
          })
          .catch(() => {
            setBonus(true);
            setBonusMsg('Puan eklenemedi!');
          });
      }
    }, [finished, correctCount, user, questions.length, pointsGiven]);

    const handleSelect = (idx) => {
      if (showAnswer) return;
      setSelected(idx);
      setShowAnswer(true);
      if (idx === questions[current].answer) {
        setCorrectCount((c) => c + 1);
      }
    };

    const handleNext = () => {
      if (current === questions.length - 1) {
        setFinished(true);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setShowAnswer(false);
      }
    };

    const handleRestart = () => {
      setQuestions(getRandomQuizQuestions(10));
      setCurrent(0);
      setSelected(null);
      setShowAnswer(false);
      setCorrectCount(0);
      setFinished(false);
      setBonus(false);
      setBonusMsg("");
      setPointsGiven(false);
      setTimeLeft(60);
      setTimerActive(true);
    };

    if (finished) {
      const allCorrect = correctCount === questions.length;
      const timeUp = timeLeft === 0;
      const accuracy = Math.round((correctCount / questions.length) * 100);
      
      return (
        <Box sx={{ 
          maxWidth: 600, 
          mx: 'auto', 
          mt: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(123,31,162,0.05) 100%)',
          borderRadius: 4,
          p: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '2px solid rgba(123,31,162,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Başlık */}
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 4, 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #7B1FA2, #E1BEE7)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            🎯 Quiz Tamamlandı!
          </Typography>

          {/* Durum Mesajları */}
          {timeUp && (
            <Box sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
              color: '#E65100',
              fontWeight: 700, 
              fontSize: { xs: 16, sm: 18 },
              boxShadow: '0 8px 32px rgba(245,124,0,0.2)',
              border: '2px solid #FFB74D',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,183,77,0.1) 50%, transparent 70%)',
                animation: 'shimmer 2s infinite',
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }} />
              <span style={{ fontSize: 32, display: 'block', mb: 1 }}>⏰</span>
              Süre doldu ama quiz başarıyla tamamlandı!
            </Box>
          )}
          
          {allCorrect && !timeUp && (
            <Box sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 100%)',
              color: '#F57F17',
              fontWeight: 700, 
              fontSize: { xs: 18, sm: 22 },
              boxShadow: '0 8px 32px rgba(251,192,45,0.3)',
              border: '2px solid #FFD54F',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,213,79,0.1) 50%, transparent 70%)',
                animation: 'shimmer 2s infinite',
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }} />
              <span style={{ fontSize: 40, display: 'block', mb: 1 }}>🎉</span>
              Mükemmel! Tüm soruları doğru cevapladınız!
            </Box>
          )}

          {/* İstatistikler Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 3, 
            mb: 4 
          }}>
            {/* Doğru Cevap Kartı */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
              color: '#2E7D32',
              boxShadow: '0 8px 32px rgba(76,175,80,0.2)',
              border: '2px solid #81C784',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(76,175,80,0.3)'
              }
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent 30%, rgba(129,199,132,0.1) 50%, transparent 70%)',
                animation: 'shimmer 3s infinite',
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }} />
              <span style={{ fontSize: 48, zIndex: 1, position: 'relative' }}>✅</span>
              <Typography variant="h4" component="div" sx={{ 
                fontWeight: 800, 
                fontSize: { xs: '2rem', sm: '2.5rem' },
                zIndex: 1,
                position: 'relative'
              }}>
                {correctCount}
              </Typography>
              <Typography variant="h6" component="div" sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                zIndex: 1,
                position: 'relative'
              }}>
                Doğru Cevap
              </Typography>
            </Box>

            {/* Yanlış Cevap Kartı */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
              color: '#C62828',
              boxShadow: '0 8px 32px rgba(244,67,54,0.2)',
              border: '2px solid #E57373',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(244,67,54,0.3)'
              }
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent 30%, rgba(229,115,115,0.1) 50%, transparent 70%)',
                animation: 'shimmer 3s infinite',
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }} />
              <span style={{ fontSize: 48, zIndex: 1, position: 'relative' }}>❌</span>
              <Typography variant="h4" component="div" sx={{ 
                fontWeight: 800, 
                fontSize: { xs: '2rem', sm: '2.5rem' },
                zIndex: 1,
                position: 'relative'
              }}>
                {questions.length - correctCount}
              </Typography>
              <Typography variant="h6" component="div" sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                zIndex: 1,
                position: 'relative'
              }}>
                Yanlış Cevap
              </Typography>
            </Box>

            {/* Toplam Puan Kartı */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
              color: '#1565C0',
              boxShadow: '0 8px 32px rgba(33,150,243,0.2)',
              border: '2px solid #64B5F6',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(33,150,243,0.3)'
              }
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent 30%, rgba(100,181,246,0.1) 50%, transparent 70%)',
                animation: 'shimmer 3s infinite',
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }} />
              <span style={{ fontSize: 48, zIndex: 1, position: 'relative' }}>⭐</span>
              <Typography variant="h4" component="div" sx={{ 
                fontWeight: 800, 
                fontSize: { xs: '2rem', sm: '2.5rem' },
                zIndex: 1,
                position: 'relative'
              }}>
                {correctCount * 10}
              </Typography>
              <Typography variant="h6" component="div" sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                zIndex: 1,
                position: 'relative'
              }}>
                Toplam Puan
              </Typography>
            </Box>
          </Box>

          {/* Başarı Oranı */}
          <Box sx={{ 
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
            border: '2px solid #CE93D8',
            boxShadow: '0 8px 32px rgba(156,39,176,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(206,147,216,0.1) 50%, transparent 70%)',
              animation: 'shimmer 4s infinite',
              '@keyframes shimmer': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' }
              }
            }} />
            <Typography variant="h5" component="div" sx={{ 
              fontWeight: 700,
              color: '#7B1FA2',
              mb: 1,
              zIndex: 1,
              position: 'relative'
            }}>
              🎯 Başarı Oranınız
            </Typography>
            <Typography variant="h3" component="div" sx={{ 
              fontWeight: 800,
              color: '#7B1FA2',
              fontSize: { xs: '2.5rem', sm: '3rem' },
              zIndex: 1,
              position: 'relative'
            }}>
              %{accuracy}
            </Typography>
          </Box>

          {/* Bonus Mesaj */}
          {bonus && (
            <Box sx={{ 
              mb: 4,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
              border: '2px solid #81C784',
              boxShadow: '0 8px 32px rgba(76,175,80,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent 30%, rgba(129,199,132,0.1) 50%, transparent 70%)',
                animation: 'shimmer 2s infinite',
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }} />
              <Typography variant="h6" sx={{ 
                color: '#2E7D32',
                fontWeight: 700,
                zIndex: 1,
                position: 'relative'
              }}>
                🎁 {bonusMsg}
              </Typography>
            </Box>
          )}

          {/* Yeniden Başlat Butonu */}
          <Button 
            variant="contained" 
            onClick={handleRestart}
            sx={{ 
              mt: 2,
              px: 6,
              py: 2,
              fontWeight: 'bold',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              background: 'linear-gradient(45deg, #7B1FA2 30%, #E1BEE7 90%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(123,31,162,0.3)',
              border: '2px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(45deg, #6A1B9A 30%, #CE93D8 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(123,31,162,0.4)'
              },
              '&:active': {
                transform: 'translateY(0)'
              }
            }}
          >
            🔄 Yeni 10 Soru
          </Button>
        </Box>
      );
    }

    const q = questions[current];

    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        {/* Timer gösterimi */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          p: 2,
          borderRadius: 2,
          background: timeLeft === 0 ? 'rgba(255, 193, 7, 0.9)' : timeLeft <= 10 ? 'rgba(244, 67, 54, 0.9)' : 'rgba(255,255,255,0.9)',
          color: timeLeft === 0 ? '#333' : timeLeft <= 10 ? '#fff' : '#222',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: 'inherit' }}>
            Soru {current + 1} / {questions.length}
          </Typography>
          <Typography variant="h5" component="div" sx={{ 
            fontWeight: 700, 
            color: 'inherit',
            animation: timeLeft <= 10 && timeLeft > 0 ? 'pulse 1s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 }
            }
          }}>
            {timeLeft === 0 ? '⏰ Süre Doldu - Devam Edebilirsiniz!' : `⏰ ${timeLeft}s`}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.92)', color: '#222', boxShadow: '0 2px 12px 0 rgba(123,31,162,0.10)' }}>
          <Typography variant="h6" component="div" sx={{ mb: 2, color: '#222' }}>{q.question}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {q.options.map((opt, oidx) => {
              let buttonStyle = {
                justifyContent: 'flex-start',
                fontWeight: 500,
                fontSize: '1rem',
                textTransform: 'none',
                pointerEvents: showAnswer || timeLeft === 0 ? 'none' : 'auto',
                opacity: showAnswer || timeLeft === 0 ? 0.7 : 1
              };

              if (showAnswer) {
                if (oidx === q.answer) {
                  // Doğru cevap - yeşil
                  buttonStyle = {
                    ...buttonStyle,
                    backgroundColor: '#4caf50',
                    color: '#fff',
                    border: '2px solid #4caf50',
                    '&:hover': {
                      backgroundColor: '#45a049',
                      borderColor: '#45a049'
                    }
                  };
                } else if (selected === oidx) {
                  // Yanlış seçilen cevap - kırmızı
                  buttonStyle = {
                    ...buttonStyle,
                    backgroundColor: '#f44336',
                    color: '#fff',
                    border: '2px solid #f44336',
                    '&:hover': {
                      backgroundColor: '#da190b',
                      borderColor: '#da190b'
                    }
                  };
                } else {
                  // Diğer cevaplar - gri
                  buttonStyle = {
                    ...buttonStyle,
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    border: '2px solid #ddd',
                    '&:hover': {
                      backgroundColor: '#e0e0e0',
                      borderColor: '#ccc'
                    }
                  };
                }
              } else if (selected === oidx) {
                // Seçilen cevap (henüz doğru/yanlış belli değil) - mavi
                buttonStyle = {
                  ...buttonStyle,
                  backgroundColor: '#2196f3',
                  color: '#fff',
                  border: '2px solid #2196f3',
                  '&:hover': {
                    backgroundColor: '#1976d2',
                    borderColor: '#1976d2'
                  }
                };
              } else {
                // Normal cevap - beyaz
                buttonStyle = {
                  ...buttonStyle,
                  backgroundColor: '#fff',
                  color: '#222',
                  border: '2px solid #ddd',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#2196f3'
                  }
                };
              }

              return (
                <Button
                  key={oidx}
                  variant="outlined"
                  onClick={() => handleSelect(oidx)}
                  disabled={showAnswer}
                  sx={buttonStyle}
                >
                  {String.fromCharCode(65 + oidx)}) {opt}
                </Button>
              );
            })}
          </Box>
        </Box>
        {showAnswer && (
          <Button 
            variant="contained" 
            onClick={handleNext}
            sx={{ 
              mt: 2, 
              px: 4, 
              fontWeight: 'bold',
              backgroundColor: '#7B1FA2',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#6a1b9a'
              }
            }}
          >
            {current === questions.length - 1 ? 'Bitir' : 'Sonraki'}
          </Button>
        )}
      </Box>
    );
  }

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
            <Tooltip title={colorMode.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={colorMode.toggleColorMode} sx={{ color: '#fff' }}>
                {colorMode.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            
            {/* Bildirim Simgesi */}
            <Tooltip title="Bildirimler">
              <IconButton 
                onClick={() => setNotificationsOpen(true)}
                sx={{ 
                  color: '#fff',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {unreadNotifications > 0 ? (
                  <Badge badgeContent={unreadNotifications} color="error">
                    <NotificationsActiveIcon />
                  </Badge>
                ) : (
                  <NotificationsIcon />
                )}
              </IconButton>
            </Tooltip>

            {/* Arkadaş Simgesi */}
            <Tooltip title="Arkadaşlar">
              <IconButton 
                onClick={() => setFriendsOpen(true)}
                sx={{ 
                  color: '#fff',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {pendingFriendRequests > 0 ? (
                  <Badge badgeContent={pendingFriendRequests} color="warning">
                    <PeopleIcon />
                  </Badge>
                ) : (
                  <PeopleIcon />
                )}
              </IconButton>
            </Tooltip>
            
            <Typography variant="body1" sx={{ fontWeight: 500, color: '#fff' }}>
              {user?.username ? `${user.username}#${user.tag}` : 'Misafir'}
            </Typography>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="avatar" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    borderRadius: '50%' 
                  }} 
                />
              ) : (
                <span style={{ color: '#7B1FA2', fontWeight: 'bold' }}>
                  {user?.username?.[0]?.toUpperCase() || 'G'}
                </span>
              )}
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

      <Dialog 
        open={openModal} 
        onClose={() => {
          setOpenModal(false);
          setIsEditing(false);
          setEditingLobiId(null);
          // Form hatalarını temizle
          setFormErrors({
            lobiAdi: '',
            secilenOyun: '',
            sifre: '',
            baslangicTarihi: '',
            bitisTarihi: ''
          });
        }}
        PaperProps={{ sx: { overflow: 'visible' } }}
      >
        <DialogTitle
          sx={{
            background: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.3)
              : alpha('#7B1FA2', 0.3),
            color: '#fff',
            mb: 2
          }}
        >
          {isEditing ? t('lobby.edit') : t('lobby.create')}
        </DialogTitle>
        <DialogContent sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2, 
          mt: 1,
          pt: 7,
          px: 3,
          pb: 3,
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
            label={t('lobby.name')} 
            fullWidth 
            value={lobiAdi} 
            onChange={(e) => setLobiAdi(e.target.value)} 
            error={!!formErrors.lobiAdi}
            helperText={formErrors.lobiAdi}
          />
          <FormControl fullWidth>
            <InputLabel id="tip-label">{t('lobby.type')}</InputLabel>
            <Select 
              labelId="tip-label" 
              value={tip} 
              label={t('lobby.type')} 
              onChange={(e) => setTip(e.target.value)}
            >
              <MenuItem value="normal">{t('lobby.normal')}</MenuItem>
              <MenuItem value="etkinlik">{t('lobby.event')}</MenuItem>
            </Select>
          </FormControl>
          {tip === 'etkinlik' && (
            <>
              <TextField 
                label={t('lobby.startDate')} 
                type="datetime-local" 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
                value={baslangicTarihi} 
                onChange={(e) => setBaslangicTarihi(e.target.value)} 
                error={!!formErrors.baslangicTarihi}
                helperText={formErrors.baslangicTarihi}
              />
              <TextField 
                label={t('lobby.endDate')} 
                type="datetime-local" 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
                value={bitisTarihi} 
                onChange={(e) => setBitisTarihi(e.target.value)} 
                error={!!formErrors.bitisTarihi}
                helperText={formErrors.bitisTarihi}
              />
            </>
          )}
          <FormControlLabel 
            control={<Checkbox checked={sifreliMi} onChange={(e) => setSifreliMi(e.target.checked)} />} 
            label={t('lobby.passworded')} 
          />
          {sifreliMi && (
            <TextField 
              label={t('lobby.password')} 
              fullWidth 
              value={sifre} 
              onChange={(e) => setSifre(e.target.value)} 
              error={!!formErrors.sifre}
              helperText={formErrors.sifre}
            />
          )}
          <FormControl fullWidth error={!!formErrors.secilenOyun}>
            <InputLabel id="oyun-label">{t('lobby.game')}</InputLabel>
            <Select 
              labelId="oyun-label" 
              value={secilenOyun} 
              label={t('lobby.game')} 
              onChange={(e) => setSecilenOyun(e.target.value)}
            >
              {oyunlar.map((oyun, i) => (
                <MenuItem key={i} value={oyun}>{oyun}</MenuItem>
              ))}
            </Select>
            {formErrors.secilenOyun && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {formErrors.secilenOyun}
              </Typography>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenModal(false);
              setIsEditing(false);
              setEditingLobiId(null);
              // Form hatalarını temizle
              setFormErrors({
                lobiAdi: '',
                secilenOyun: '',
                sifre: '',
                baslangicTarihi: '',
                bitisTarihi: ''
              });
            }}
            sx={{ color: '#7B1FA2' }}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={async () => {
              // Form validasyonu
              if (!validateForm()) {
                showNotification(t('notifications.warning'), t('notifications.fillRequiredFields'), 'warning');
                return;
              }

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
                  
                  showNotification(t('notifications.success'), t('notifications.lobbyUpdated'), 'success');
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
                  
                  showNotification(t('notifications.success'), t('notifications.lobbyCreated'), 'success');
                }
                
                const lobilerGuncel = await axios.get('http://localhost:4000/api/lobbies', { withCredentials: true });
                setLobiler(lobilerGuncel.data);
                setUserLobi(lobilerGuncel.data.find(l => l.kurucu === kurucu));
                
                setOpenModal(false);
                setIsEditing(false);
                setEditingLobiId(null);
                
                // Form alanlarını temizle
                setLobiAdi('');
                setTip('normal');
                setSifreliMi(false);
                setSifre('');
                setBaslangicTarihi('');
                setBitisTarihi('');
                setSecilenOyun('');
                setFormErrors({
                  lobiAdi: '',
                  secilenOyun: '',
                  sifre: '',
                  baslangicTarihi: '',
                  bitisTarihi: ''
                });
              } catch (error) {
                console.error("Lobi işlemi hatası:", error.response?.data || error.message);
                showNotification(t('notifications.error'), error.response?.data?.message || t('notifications.operationFailed'), 'error');
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
            {isEditing ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={Boolean(secilenLobi)} 
        onClose={() => setSecilenLobi(null)}
        maxWidth="sm"
        fullWidth={false}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.3)
            : alpha('#7B1FA2', 0.3),
          color: '#fff',
          textAlign: 'center',
          pb: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {t('lobby.details')}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ 
          background: '#fff',
          color: '#7B1FA2',
          p: 3
        }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#7B1FA2' }}>
              {secilenLobi?.ad}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
              <strong>{t('lobby.creator')}:</strong> {secilenLobi?.kurucu}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
              <strong>{t('lobby.game')}:</strong> {secilenLobi?.oyun}
            </Typography>
            {secilenLobi?.tip === 'etkinlik' && (
              <>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                  <strong>{t('lobby.startDate')}:</strong> {new Date(secilenLobi?.baslangicTarihi).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                  <strong>{t('lobby.endDate')}:</strong> {new Date(secilenLobi?.bitisTarihi).toLocaleString()}
                </Typography>
              </>
            )}
          </Box>
          
          {secilenLobi?.katilanlar?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#7B1FA2' }}>
                {t('lobby.participants')} ({secilenLobi.katilanlar.length} {t('common.person')})
              </Typography>
              <Box sx={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 1, 
                p: 1.5,
                maxHeight: 120,
                overflowY: 'auto'
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#7B1FA2', mb: 0.5 }}>
                  {secilenLobi.kurucu} (Kurucu)
                </Typography>
                {secilenLobi.katilanlar.filter(kisi => kisi !== secilenLobi.kurucu).map((kisi, i) => (
                  <Typography key={i} variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    {kisi}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyIcon />}
              sx={{ 
                color: '#7B1FA2',
                borderColor: '#7B1FA2',
                fontSize: '0.75rem',
                '&:hover': {
                  borderColor: '#7B1FA2',
                  backgroundColor: alpha('#7B1FA2', 0.1)
                }
              }}
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                showNotification(t('lobby.copied'), t('lobby.linkCopied'), 'info');
              }}
            >
              {t('lobby.copy')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShareIcon />}
              sx={{ 
                color: '#7B1FA2',
                borderColor: '#7B1FA2',
                fontSize: '0.75rem',
                '&:hover': {
                  borderColor: '#7B1FA2',
                  backgroundColor: alpha('#7B1FA2', 0.1)
                }
              }}
              onClick={() => handleShare(secilenLobi)}
            >
              {t('lobby.share')}
            </Button>
          </Box>

          {secilenLobi?.katilanlar?.includes(`${user?.username}#${user?.tag}`) ? (
            <>
              {/* Etkinlik lobisi için başlama zamanı kontrolü */}
              {secilenLobi?.tip === 'etkinlik' ? (
                (() => {
                  const now = new Date();
                  const start = new Date(secilenLobi.baslangicTarihi);
                  const etkinlikBasladi = now >= start;
                  return (
                    <>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<PlayArrowIcon />}
                        sx={{ 
                          mt: 2,
                          backgroundColor: '#7B1FA2',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: '#7B1FA2',
                          }
                        }}
                        disabled={!etkinlikBasladi}
                        onClick={() => etkinlikBasladi && navigate(`/oyun/${encodeURIComponent(secilenLobi.oyun)}/${secilenLobi.id}`)}
                      >
                        {etkinlikBasladi ? t('lobby.joinGame') : 'Etkinlik Başlamadı'}
                      </Button>
                      {!etkinlikBasladi && (
                        <Typography variant="body2" sx={{ mt: 1, color: '#7B1FA2', textAlign: 'center', fontWeight: 'bold' }}>
                          Etkinlik başlama saati: {start.toLocaleString('tr-TR')}
                        </Typography>
                      )}
                    </>
                  );
                })()
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  sx={{ 
                    mt: 2,
                    backgroundColor: '#7B1FA2',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#7B1FA2',
                    }
                  }}
                  onClick={() => navigate(`/oyun/${encodeURIComponent(secilenLobi.oyun)}/${secilenLobi.id}`)}
                >
                  {t('lobby.joinGame')}
                </Button>
              )}
            </>
          ) : (
            <>
              {secilenLobi?.sifreli && (
                <TextField
                  label={t('lobby.lobbyPassword')}
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
                      showNotification(t('notifications.warning'), t('lobby.enterPassword'), 'warning');
                      return;
                    }

                    const kullanici = `${user.username}#${user.tag}`;
                    const response = await axios.post('http://localhost:4000/api/lobbies/join', {
                      lobiId: secilenLobi.id,
                      kullanici,
                      sifreGirilen: lobiSifresi
                    }, { withCredentials: true });

                    if (response.data.error) {
                      showNotification(t('notifications.error'), response.data.message, 'error');
                      return;
                    }

                    showNotification(t('notifications.success'), t('lobby.joinSuccess'), 'success');
                    const lobilerGuncel = await axios.get('http://localhost:4000/api/lobbies', { withCredentials: true });
                    setLobiler(lobilerGuncel.data);
                    setSecilenLobi(null);
                    setLobiSifresi('');
                  } catch (error) {
                    showNotification(t('notifications.error'), error.response?.data?.message || t('notifications.lobbyJoinError'), 'error');
                  }
                }}
              >
                {t('lobby.join')}
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
                  showNotification(t('notifications.success'), t('lobby.leaveSuccess'), 'success');
                  const lobilerGuncel = await axios.get('http://localhost:4000/api/lobbies', { withCredentials: true });
                  setLobiler(lobilerGuncel.data);
                  setSecilenLobi(null);
                } catch (error) {
                  showNotification(t('notifications.error'), error.response?.data?.message || t('notifications.lobbyLeaveError'), 'error');
                }
              }}
            >
              {t('lobby.leave')}
            </Button>
          )}

          {user && `${user.username}#${user.tag}` === secilenLobi?.kurucu && (
            <>
              {console.log('🔍 Kurucu kontrolü:', {
                userKurucu: `${user.username}#${user.tag}`,
                lobiKurucu: secilenLobi?.kurucu,
                esitMi: `${user.username}#${user.tag}` === secilenLobi?.kurucu
              })}
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => {
                  setLobiToDelete(secilenLobi);
                  setDeleteConfirmOpen(true);
                }}
              >
                {t('lobby.delete')}
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
                {t('lobby.edit')}
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
        }}>{t('lobby.share')}</DialogTitle>
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
          <Button onClick={() => setShareDialogOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Modern Lobi Silme Onay Dialogu */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setLobiToDelete(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
            color: 'white',
            boxShadow: '0 12px 40px rgba(211, 47, 47, 0.4)'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          pb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <WarningIcon sx={{ fontSize: 32, color: '#fff', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {t('lobby.deleteConfirm')}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            "{lobiToDelete?.ad}" {t('lobby.deleteConfirmMessage')}
          </Typography>
          
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.8)',
            fontStyle: 'italic',
            fontSize: '0.85rem'
          }}>
            ⚠️ {t('lobby.deleteWarning')}
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ 
          justifyContent: 'center', 
          pb: 2, 
          px: 2,
          gap: 1
        }}>
          <Button
            variant="outlined"
            onClick={() => {
              setDeleteConfirmOpen(false);
              setLobiToDelete(null);
            }}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              },
              px: 3,
              py: 1,
              borderRadius: 1.5,
              fontSize: '0.9rem'
            }}
          >
            {t('common.cancel')}
          </Button>
          
          <Button
            variant="contained"
            onClick={handleDeleteLobi}
            startIcon={<DeleteForeverIcon />}
            sx={{
              backgroundColor: 'white',
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)'
              },
              px: 3,
              py: 1,
              borderRadius: 1.5,
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modern Bildirim Sistemi */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 300
          }
        }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            },
            '& .MuiAlert-message': {
              fontSize: '0.95rem'
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
              {notification.title}
            </Typography>
            <Typography variant="body2">
              {notification.message}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

      {/* Bildirimler Dialog */}
      <Dialog
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(15px)',
            border: '2px solid rgba(123, 31, 162, 0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: '70vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#7B1FA2',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.5rem',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>🔔 Bildirimler</span>
          {unreadNotifications > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={markAllNotificationsAsRead}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                fontSize: '0.8rem',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Tümünü Okundu İşaretle
            </Button>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {userNotifications.length === 0 ? (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center',
              color: '#666'
            }}>
              <NotificationsIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                Henüz bildiriminiz yok
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                Yeni bildirimler geldiğinde burada görünecek
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {userNotifications.map((notif, index) => (
                <ListItem
                  key={notif.id || index}
                  sx={{
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    backgroundColor: notif.read ? 'transparent' : 'rgba(123, 31, 162, 0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(123, 31, 162, 0.1)'
                    },
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => markNotificationAsRead(notif.id)}
                >
                  <ListItemText
                    primary={
                      <Typography 
                        component="div" 
                        variant="body1" 
                        sx={{ 
                          fontWeight: notif.read ? 'normal' : 'bold',
                          color: '#333',
                          mb: 0.5
                        }}
                      >
                        {notif.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography 
                          component="div" 
                          variant="body2" 
                          sx={{ 
                            color: '#666',
                            mb: 1
                          }}
                        >
                          {notif.message}
                        </Typography>
                        <Typography 
                          component="div" 
                          variant="caption" 
                          sx={{ 
                            color: '#999',
                            fontStyle: 'italic'
                          }}
                        >
                          {new Date(notif.createdAt).toLocaleString('tr-TR')}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notif.read && (
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#7B1FA2',
                      ml: 1
                    }} />
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(0,0,0,0.1)',
          justifyContent: 'center'
        }}>
          <Button
            onClick={() => setNotificationsOpen(false)}
            sx={{
              color: '#7B1FA2',
              fontWeight: 'bold'
            }}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Arkadaşlar Dialog */}
      <Dialog
        open={friendsOpen}
        onClose={() => setFriendsOpen(false)}
        maxWidth="sm"
        fullWidth={false}
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(123, 31, 162, 0.2)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            minWidth: 400,
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#7B1FA2',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>👥 Arkadaşlar</span>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={() => setAddFriendDialogOpen(true)}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              fontSize: '0.75rem',
              py: 0.5,
              px: 1,
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Ekle
          </Button>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, maxHeight: 400 }}>
          {/* Arkadaş İstekleri */}
          {friendRequests.length > 0 && (
            <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <Typography variant="subtitle2" sx={{ color: '#7B1FA2', mb: 1, fontWeight: 'bold', fontSize: '0.9rem' }}>
                📨 İstekler ({friendRequests.length})
              </Typography>
              <List sx={{ p: 0 }}>
                {friendRequests.map((request, index) => (
                  <ListItem
                    key={request.id || index}
                    sx={{
                      border: '1px solid rgba(123, 31, 162, 0.2)',
                      borderRadius: 1,
                      mb: 0.5,
                      backgroundColor: 'rgba(123, 31, 162, 0.05)',
                      py: 0.5,
                      '&:hover': {
                        backgroundColor: 'rgba(123, 31, 162, 0.1)'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>
                          {request.fromUsername}#{request.fromTag}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.75rem' }}>
                          {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => acceptFriendRequest(request.id)}
                        sx={{
                          color: 'white',
                          backgroundColor: '#4caf50',
                          width: 28,
                          height: 28,
                          '&:hover': {
                            backgroundColor: '#45a049'
                          }
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => rejectFriendRequest(request.id)}
                        sx={{
                          color: 'white',
                          backgroundColor: '#f44336',
                          width: 28,
                          height: 28,
                          '&:hover': {
                            backgroundColor: '#da190b'
                          }
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Arkadaş Listesi */}
          <Box sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: '#7B1FA2', mb: 1, fontWeight: 'bold', fontSize: '0.9rem' }}>
              👥 Arkadaşlar ({friendsList.length})
            </Typography>
            {friendsList.length === 0 ? (
              <Box sx={{ 
                p: 2, 
                textAlign: 'center',
                color: '#666'
              }}>
                <PeopleIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#999', mb: 1, fontSize: '0.9rem' }}>
                  Henüz arkadaşınız yok
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setAddFriendDialogOpen(true)}
                  sx={{
                    backgroundColor: '#7B1FA2',
                    fontSize: '0.8rem',
                    py: 0.5,
                    '&:hover': {
                      backgroundColor: '#6a1b9a'
                    }
                  }}
                >
                  Arkadaş Ekle
                </Button>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {friendsList.map((friend, index) => (
                  <ListItem
                    key={friend.friendshipId || index}
                    sx={{
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 1,
                      mb: 0.5,
                      backgroundColor: 'white',
                      py: 0.5,
                      '&:hover': {
                        backgroundColor: 'rgba(123, 31, 162, 0.05)'
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        mr: 1.5,
                        border: '1px solid rgba(123, 31, 162, 0.3)'
                      }}
                    >
                      {friend.avatar ? (
                        <img 
                          src={friend.avatar} 
                          alt="avatar" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover', 
                            borderRadius: '50%' 
                          }} 
                        />
                      ) : (
                        <span style={{ color: '#7B1FA2', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {friend.username?.[0]?.toUpperCase() || 'F'}
                        </span>
                      )}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>
                          {friend.username}#{friend.tag}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                          {friend.points} puan • {new Date(friend.since).toLocaleDateString('tr-TR')}
                        </Typography>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeFriend(friend.friendshipId)}
                      sx={{
                        color: '#f44336',
                        width: 24,
                        height: 24,
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.1)'
                        }
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 1.5, 
          borderTop: '1px solid rgba(0,0,0,0.1)',
          justifyContent: 'center'
        }}>
          <Button
            size="small"
            onClick={() => setFriendsOpen(false)}
            sx={{
              color: '#7B1FA2',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Arkadaş Ekleme Dialog */}
      <Dialog
        open={addFriendDialogOpen}
        onClose={() => {
          setAddFriendDialogOpen(false);
          setFriendUsername('');
          setFriendTag('');
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(123, 31, 162, 0.15)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
            minWidth: 320,
            maxWidth: 350
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#7B1FA2',
          color: 'white',
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '1.05rem',
          py: 1.2
        }}>
          Arkadaş Ekle
        </DialogTitle>
        
        <DialogContent sx={{ p: 2, pt: 2 }}>
          <Typography variant="caption" sx={{ color: '#666', mb: 1.5, textAlign: 'center', display: 'block', fontSize: '0.85rem' }}>
            Kullanıcı adı ve tag girin
          </Typography>
          
          <TextField
            label="Kullanıcı Adı"
            fullWidth
            size="small"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            sx={{ mb: 1.2 }}
            inputProps={{ style: { fontSize: '0.95rem', padding: '8px 10px' } }}
          />
          
          <TextField
            label="Tag Numarası"
            fullWidth
            size="small"
            value={friendTag}
            onChange={(e) => setFriendTag(e.target.value)}
            type="number"
            sx={{ mb: 1 }}
            inputProps={{ style: { fontSize: '0.95rem', padding: '8px 10px' } }}
          />
          
          <Typography variant="caption" sx={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.75rem', display: 'block', mt: 0.5 }}>
            Örn: "john" ve "1234" → john#1234
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 1.5, pt: 0, justifyContent: 'flex-end', gap: 1 }}>
          <Button
            size="small"
            onClick={() => {
              setAddFriendDialogOpen(false);
              setFriendUsername('');
              setFriendTag('');
            }}
            sx={{
              color: '#666',
              fontSize: '0.9rem',
              px: 1.5,
              py: 0.5,
              minWidth: 0,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={sendFriendRequest}
            sx={{
              backgroundColor: '#7B1FA2',
              fontSize: '0.9rem',
              px: 2,
              py: 0.5,
              minWidth: 0,
              '&:hover': {
                backgroundColor: '#6a1b9a'
              }
            }}
          >
            Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPage;