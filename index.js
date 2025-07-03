const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const MemoryStore = require('memorystore')(session);
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = 4000;
const JWT_SECRET = 'sar3-secret-key';

app.use(cors({
  origin: function (origin, callback) {
    // localhost'tan gelen tüm isteklere izin ver
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({ checkPeriod: 86400000 }),
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax' 
  }
}));

const USERS_FILE = path.join(__dirname, 'users.json');
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]', 'utf-8');

const readUsers = () => JSON.parse(fs.readFileSync(USERS_FILE));
const writeUsers = (data) => fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));

const LOBBIES_FILE = path.join(__dirname, 'lobbies.json');
if (!fs.existsSync(LOBBIES_FILE)) fs.writeFileSync(LOBBIES_FILE, '[]', 'utf-8');

const readLobbies = () => JSON.parse(fs.readFileSync(LOBBIES_FILE));
const writeLobbies = (data) => fs.writeFileSync(LOBBIES_FILE, JSON.stringify(data, null, 2));

// Bildirim sistemi için dosya işlemleri
const NOTIFICATIONS_FILE = path.join(__dirname, 'notifications.json');
if (!fs.existsSync(NOTIFICATIONS_FILE)) fs.writeFileSync(NOTIFICATIONS_FILE, '[]', 'utf-8');

const readNotifications = () => JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE));
const writeNotifications = (data) => fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(data, null, 2));

// Arkadaş sistemi için dosya işlemleri
const FRIENDS_FILE = path.join(__dirname, 'friends.json');
if (!fs.existsSync(FRIENDS_FILE)) fs.writeFileSync(FRIENDS_FILE, '[]', 'utf-8');

const readFriends = () => JSON.parse(fs.readFileSync(FRIENDS_FILE));
const writeFriends = (data) => fs.writeFileSync(FRIENDS_FILE, JSON.stringify(data, null, 2));

// Bildirim oluşturma fonksiyonu
const createNotification = (username, title, message, type = 'info') => {
  const notifications = readNotifications();
  const newNotification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    username,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.push(newNotification);
  writeNotifications(notifications);
  return newNotification;
};

// Tüm kullanıcılara bildirim gönderme fonksiyonu
const sendNotificationToAllUsers = (title, message, type = 'info', excludeUsername = null) => {
  const users = readUsers();
  const notifications = readNotifications();
  
  users.forEach(user => {
    // Belirtilen kullanıcıyı hariç tut
    if (excludeUsername && user.username === excludeUsername) return;
    
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: user.username,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    notifications.push(newNotification);
  });
  
  writeNotifications(notifications);
  console.log(`📢 ${users.length - (excludeUsername ? 1 : 0)} kullanıcıya bildirim gönderildi`);
};

// 🔐 Giriş işlemi
app.post('/api/auth/login', (req, res) => {
  console.log('Gelen istek body:', req.body);
  
  const { email, password } = req.body;
  console.log('Login isteği alındı:', { email, password });
  
  if (!email || !password) {
    console.log('Eksik bilgi:', { email, password });
    return res.status(400).json({ 
      message: 'Email ve şifre gereklidir',
      details: { 
        email: !email ? 'Email eksik' : null,
        password: !password ? 'Şifre eksik' : null
      }
    });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    console.log('Geçersiz veri tipi:', { 
      email: typeof email, 
      password: typeof password 
    });
    return res.status(400).json({ 
      message: 'Geçersiz veri tipi',
      details: {
        email: typeof email !== 'string' ? 'Email string olmalı' : null,
        password: typeof password !== 'string' ? 'Şifre string olmalı' : null
      }
    });
  }
  
  const users = readUsers();
  console.log('Mevcut kullanıcılar:', users.map(u => ({ 
    email: u.email,
    username: u.username, 
    tag: u.tag,
    password: u.password 
  })));
  
  // Önce kullanıcıyı email ile bul
  const user = users.find(u => u.email === email);
  console.log('Kullanıcı bulundu mu:', user ? 'Evet' : 'Hayır');
  
  if (user) {
    console.log('Şifre karşılaştırması:', {
      girilen: password,
      kayitli: user.password,
      eslesme: password === user.password
    });
  }
  
  if (user && password === user.password) {
    const token = jwt.sign(
      { 
        username: user.username,
        email: user.email,
        tag: user.tag
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token oluşturuldu');
    res.json({ 
      message: 'Giriş başarılı', 
      token,
      user: {
        username: user.username,
        email: user.email,
        tag: user.tag,
        avatar: user.avatar,
        points: user.points || 0
      }
    });
  } else {
    const userExists = users.some(u => u.email === email);
    console.log('Giriş başarısız:', { 
      userExists,
      reason: userExists ? 'Şifre hatalı' : 'Kullanıcı bulunamadı'
    });
    res.status(401).json({ 
      message: 'Geçersiz email veya şifre',
      details: {
        userExists,
        reason: userExists ? 'Şifre hatalı' : 'Kullanıcı bulunamadı'
      }
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, username } = req.body;
  const users = readUsers();
  const existingEmail = users.find(u => u.email === email);
  if (existingEmail) {
    return res.status(409).json({ message: 'Bu email zaten kayıtlı' });
  }
  let uniqueTag;
  let existingCombo;
  do {
    uniqueTag = Math.floor(1000 + Math.random() * 9000);
    existingCombo = users.find(u => u.username === username && u.tag === uniqueTag);
  } while (existingCombo);
  
  // Şifreyi hash'le (login ile aynı yöntem)
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  
  const newUser = { email, password: hashedPassword, username, tag: uniqueTag, points: 0 };
  users.push(newUser);
  writeUsers(users);
  res.json({ message: 'Kayıt başarılı', user: { email, username, tag: uniqueTag, points: 0 } });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Çıkış başarılı' });
});

// Email kontrol endpoint'i
app.post('/api/auth/check-email', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email adresi gereklidir' });
  }

  const users = readUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(404).json({ message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı' });
  }

  res.json({ 
    message: 'Email doğrulandı',
    success: true
  });
});

// Şifre sıfırlama endpoint'i
app.post('/api/auth/forgot-password', (req, res) => {
  const { email, newPassword } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email adresi gereklidir' });
  }

  if (!newPassword) {
    return res.status(400).json({ message: 'Yeni şifre gereklidir' });
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı' });
  }

  // Şifreyi hash'le (login ile aynı yöntem)
  const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
  
  // Şifreyi kullanıcının girdiği yeni şifre ile güncelle
  users[userIndex].password = hashedPassword;
  writeUsers(users);
  
  console.log(`Şifre güncellendi: ${email} -> ${hashedPassword}`);
  
  res.json({ 
    message: 'Şifreniz başarıyla güncellendi!',
    success: true
  });
});

// Yeni şifre belirleme endpoint'i
app.post('/api/auth/reset-password', (req, res) => {
  const { email, newPassword, resetToken } = req.body;
  
  if (!email || !newPassword || !resetToken) {
    return res.status(400).json({ message: 'Tüm alanlar gereklidir' });
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }

  // Gerçek uygulamada resetToken doğrulaması yapılır
  // Şimdilik basit bir doğrulama yapıyoruz
  if (resetToken !== 'valid-token') {
    return res.status(400).json({ message: 'Geçersiz sıfırlama token\'ı' });
  }

  // Şifreyi güncelle
  users[userIndex].password = newPassword;
  writeUsers(users);
  
  res.json({ 
    message: 'Şifreniz başarıyla güncellendi',
    success: true
  });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token bulunamadı' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readUsers();
    const user = users.find(u => u.username === decoded.username);
    
    if (user) {
      res.json({
        username: user.username,
        email: user.email,
        tag: user.tag,
        avatar: user.avatar
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz token' });
  }
});

app.post('/api/lobbies', (req, res) => {
  const { lobiAdi, tip, sifreliMi, sifre, kurucu, baslangicTarihi, bitisTarihi, secilenOyun } = req.body;

  // Kullanıcının zaten bir lobisi var mı kontrol et
  const existingLobi = readLobbies().find(l => l.kurucu === kurucu);
  if (existingLobi) {
    return res.status(400).json({ message: 'Zaten aktif bir lobiniz bulunmaktadır. Yeni lobi oluşturmak için mevcut lobinizi kapatın.' });
  }

  const yeniLobi = {
    id: Date.now().toString(),
    ad: lobiAdi,
    tip,
    sifreli: sifreliMi,
    sifre: sifreliMi ? sifre : null,
    kurucu,
    baslangicTarihi: tip === 'etkinlik' ? baslangicTarihi : null,
    bitisTarihi: tip === 'etkinlik' ? bitisTarihi : null,
    oyun: secilenOyun,
    katilanlar: [kurucu],
    createdAt: new Date().toISOString(),
    kurucuCikisZamani: null
  };

  const lobies = readLobbies();
  lobies.push(yeniLobi);
  writeLobbies(lobies);
  
  // Kurucunun username'ini çıkar
  const [kurucuUsername] = kurucu.split('#');
  
  // Tüm kullanıcılara bildirim gönder (kurucu hariç)
  const notificationTitle = `🎮 Yeni Lobi Oluşturuldu!`;
  const notificationMessage = `${kurucu} "${lobiAdi}" adında yeni bir ${tip === 'etkinlik' ? 'etkinlik' : 'normal'} lobi oluşturdu. ${secilenOyun} oyunu oynanacak!`;
  
  sendNotificationToAllUsers(
    notificationTitle,
    notificationMessage,
    'info',
    kurucuUsername
  );
  
  console.log(`📢 ${kurucu} yeni lobi oluşturdu: ${lobiAdi}`);
  res.json(yeniLobi);
});

app.get('/api/lobbies', (req, res) => {
  let lobies = readLobbies();

  const now = new Date();
  console.log(`🔍 Lobi kontrolü - Şu anki zaman: ${now.toISOString()}`);
  console.log(`📊 Toplam lobi sayısı: ${lobies.length}`);
  
  const updatedLobies = lobies.filter(lobi => {
    if (lobi.tip === 'normal') {
      // Kurucu çıkış zamanı varsa, 8 saat geçti mi kontrol et
      if (lobi.kurucuCikisZamani) {
        const cikisZamani = new Date(lobi.kurucuCikisZamani);
        const farkSaat = (now - cikisZamani) / (1000 * 60 * 60);
        // Eğer kurucu çıkış yaptıysa ve 8 saat geçtiyse lobi silinsin
        return farkSaat < 8;
      }
      // Kurucu çıkış zamanı yoksa, kurucu hala lobide demektir, lobi silinmemeli
      return true;
    }
    // Etkinlik lobileri için bitiş tarihi kontrolü
    if (lobi.tip === 'etkinlik' && lobi.bitisTarihi) {
      const bitisZamani = new Date(lobi.bitisTarihi);
      const aktif = bitisZamani > now;
      console.log(`🔍 Etkinlik Lobi ${lobi.ad} (${lobi.id}): Bitiş zamanı ${bitisZamani.toISOString()}, aktif: ${aktif}`);
      return aktif;
    }
    return true;
  });

  console.log(`✅ Filtrelenmiş lobi sayısı: ${updatedLobies.length}`);
  
  if (updatedLobies.length !== lobies.length) {
    console.log(`🗑️ ${lobies.length - updatedLobies.length} lobi silindi`);
    writeLobbies(updatedLobies);
  }
  res.json(updatedLobies);
});

app.post('/api/lobbies/join', (req, res) => {
  const { lobiId, kullanici, sifreGirilen } = req.body;
  if (!lobiId || !kullanici) return res.status(400).json({ message: 'Lobi ID veya kullanıcı eksik' });
  const lobies = readLobbies();
  const lobiIndex = lobies.findIndex(l => l.id === lobiId);
  if (lobiIndex === -1) return res.status(404).json({ message: 'Lobi bulunamadı' });
  const lobi = lobies[lobiIndex];
  if (lobi.sifreli && sifreGirilen !== lobi.sifre) return res.status(403).json({ message: 'Şifre hatalı' });
  if (!lobi.katilanlar) lobi.katilanlar = [];
  if (lobi.katilanlar.includes(kullanici)) return res.status(400).json({ message: 'Zaten bu lobide bulunuyorsunuz' });
  lobi.katilanlar.push(kullanici);
  lobies[lobiIndex] = lobi;
  writeLobbies(lobies);
  
  // Kurucuya bildirim gönder
  const [kurucuUsername] = lobi.kurucu.split('#');
  const [kullaniciUsername] = kullanici.split('#');
  
  if (kurucuUsername !== kullaniciUsername) {
    createNotification(
      kurucuUsername,
      `👥 Yeni Katılımcı!`,
      `${kullanici} lobinize katıldı!`,
      'success'
    );
  }
  
  res.json({ message: 'Lobiye başarıyla katıldınız', lobi });
});

app.post('/api/lobbies/leave', (req, res) => {
  const { lobiId, kullanici } = req.body;
  const lobies = readLobbies();
  const index = lobies.findIndex(lobi => lobi.id === lobiId);

  if (index === -1) {
    return res.status(404).json({ message: 'Lobi bulunamadı' });
  }

  const lobi = lobies[index];
  console.log(`👤 Kullanıcı ${kullanici} lobiden ayrılıyor: ${lobi.ad} (${lobi.id})`);

  if (!lobi.katilanlar || !lobi.katilanlar.includes(kullanici)) {
    return res.status(400).json({ message: 'Kullanıcı zaten lobide değil' });
  }

  if (lobi.kurucu === kullanici && lobi.tip === 'normal') {
    lobi.kurucuCikisZamani = new Date().toISOString();
    console.log(`⏰ Kurucu çıkış zamanı ayarlandı: ${lobi.kurucuCikisZamani}`);
  }
  
  lobi.katilanlar = lobi.katilanlar.filter(k => k !== kullanici);
  lobies[index] = lobi;
  writeLobbies(lobies);

  console.log(`✅ Kullanıcı ${kullanici} lobiden ayrıldı`);
  res.json({ message: 'Lobiden çıkıldı', lobi });
});

app.post('/api/lobbies/delete', (req, res) => {
  const { lobiId, kurucu } = req.body;
  console.log(`🗑️ Lobi silme isteği: lobiId=${lobiId}, kurucu=${kurucu}`);
  
  if (!lobiId || !kurucu) {
    console.log(`❌ Eksik bilgi: lobiId=${lobiId}, kurucu=${kurucu}`);
    return res.status(400).json({ message: 'Eksik bilgi' });
  }
  
  const lobies = readLobbies();
  console.log(`📊 Toplam lobi sayısı: ${lobies.length}`);
  
  const lobiIndex = lobies.findIndex(lobi => lobi.id === lobiId);
  console.log(`🔍 Lobi index: ${lobiIndex}`);
  
  if (lobiIndex === -1) {
    console.log(`❌ Lobi bulunamadı: ${lobiId}`);
    return res.status(404).json({ message: 'Lobi bulunamadı' });
  }
  
  const lobi = lobies[lobiIndex];
  console.log(`📋 Bulunan lobi: ${lobi.ad} (${lobi.id}), kurucu: ${lobi.kurucu}`);
  console.log(`🔍 Kurucu karşılaştırması: "${lobi.kurucu}" === "${kurucu}" = ${lobi.kurucu === kurucu}`);
  
  if (lobi.kurucu !== kurucu) {
    console.log(`❌ Yetki hatası: Lobi kurucusu ${lobi.kurucu}, istek yapan ${kurucu}`);
    return res.status(403).json({ message: 'Sadece kurucu lobiyi silebilir' });
  }
  
  lobies.splice(lobiIndex, 1);
  writeLobbies(lobies);
  console.log(`✅ Lobi başarıyla silindi: ${lobi.ad} (${lobi.id})`);
  res.json({ message: 'Lobi silindi' });
});

app.post('/api/lobbies/update', (req, res) => {
  const { lobiId, kurucu, lobiAdi, tip, sifreliMi, sifre, oyun, baslangicTarihi, bitisTarihi } = req.body;
  if (!lobiId || !kurucu) return res.status(400).json({ message: 'Eksik bilgi' });
  const lobies = readLobbies();
  const index = lobies.findIndex(lobi => lobi.id === lobiId);
  if (index === -1) return res.status(404).json({ message: 'Lobi bulunamadı' });
  if (lobies[index].kurucu !== kurucu) return res.status(403).json({ message: 'Sadece kurucu lobiyi güncelleyebilir' });
  lobies[index] = {
    ...lobies[index],
    ad: lobiAdi,
    tip,
    oyun,
    sifreli: sifreliMi,
    sifre: sifreliMi ? sifre : null,
    baslangicTarihi: tip === 'etkinlik' ? baslangicTarihi : null,
    bitisTarihi: tip === 'etkinlik' ? bitisTarihi : null,
    kurucuCikisZamani: lobies[index].kurucuCikisZamani
  };
  writeLobbies(lobies);
  res.json({ message: 'Lobi güncellendi', lobi: lobies[index] });
});

// Kullanıcının kurucu olduğu lobiyi döndür (username#tag ile tam eşleşme)
app.get('/api/lobbies/user/:username', (req, res) => {
  const { username } = req.params;
  const lobies = readLobbies();
  // username#tag formatında arama yap
  const userLobi = lobies.find(lobi => lobi.kurucu && lobi.kurucu.startsWith(username + '#'));
  if (!userLobi) {
    return res.status(404).json({ message: 'Kullanıcının lobisi yok' });
  }
  res.json(userLobi);
});

// Lobi ID'sine göre lobi getir
app.get('/api/lobbies/:lobiId', (req, res) => {
  const { lobiId } = req.params;
  const lobies = readLobbies();
  const lobi = lobies.find(l => l.id === lobiId);
  
  if (!lobi) {
    return res.status(404).json({ message: 'Lobi bulunamadı' });
  }
  
  res.json(lobi);
});

// Kullanıcı avatarı güncelleme endpointi
app.post('/api/users/update-avatar', (req, res) => {
  const { username, tag, avatar } = req.body;
  if (!username || !tag || !avatar) {
    return res.status(400).json({ message: 'Eksik bilgi' });
  }
  const users = readUsers();
  const userIndex = users.findIndex(u => u.username === username && String(u.tag) === String(tag));
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }
  users[userIndex].avatar = avatar;
  writeUsers(users);
  res.json({ message: 'Avatar güncellendi', user: users[userIndex] });
});

// Tüm kullanıcıları (username, tag, avatar) döndüren endpoint
app.get('/api/users', (req, res) => {
  const users = readUsers();
  const publicUsers = users.map(u => ({
    username: u.username,
    tag: u.tag,
    avatar: u.avatar || null,
    points: u.points || 0
  }));
  res.json(publicUsers);
});

// Puan sistemi endpoint'leri
app.post('/api/users/add-points', (req, res) => {
  const { username, tag, points } = req.body;
  
  if (!username || !tag || !points) {
    return res.status(400).json({ message: 'Eksik bilgi' });
  }
  
  const users = readUsers();
  const userIndex = users.findIndex(u => 
    u.username === username && String(u.tag) === String(tag)
  );
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }
  
  // Kullanıcının mevcut puanını al (varsayılan 0)
  const currentPoints = users[userIndex].points || 0;
  users[userIndex].points = currentPoints + points;
  
  writeUsers(users);
  
  console.log(`🏆 Puan eklendi: ${username}#${tag} +${points} puan (Toplam: ${users[userIndex].points})`);
  
  res.json({ 
    message: 'Puan eklendi', 
    user: {
      username: users[userIndex].username,
      tag: users[userIndex].tag,
      points: users[userIndex].points
    }
  });
});

// Kullanıcının puanını getir
app.get('/api/users/:username/:tag/points', (req, res) => {
  const { username, tag } = req.params;
  
  const users = readUsers();
  const user = users.find(u => 
    u.username === username && String(u.tag) === String(tag)
  );
  
  if (!user) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }
  
  res.json({ 
    username: user.username,
    tag: user.tag,
    points: user.points || 0
  });
});

// Sıralama listesi endpoint'i
app.get('/api/leaderboard', (req, res) => {
  const users = readUsers();
  
  // Kullanıcıları puana göre sırala (yüksekten düşüğe)
  const sortedUsers = users
    .map(u => ({
      username: u.username,
      tag: u.tag,
      avatar: u.avatar || null,
      points: u.points || 0
    }))
    .sort((a, b) => b.points - a.points);
  
  res.json(sortedUsers);
});

// Oyun sonuçları için puan dağıtımı
app.post('/api/game/end', (req, res) => {
  const { lobiId, winners } = req.body;
  
  if (!lobiId || !winners || !Array.isArray(winners)) {
    return res.status(400).json({ message: 'Geçersiz oyun sonucu' });
  }
  
  const users = readUsers();
  const updatedUsers = [];
  
  // Kazananlara puan dağıt
  winners.forEach((winner, index) => {
    const { username, tag } = winner;
    const userIndex = users.findIndex(u => 
      u.username === username && String(u.tag) === String(tag)
    );
    
    if (userIndex !== -1) {
      let pointsToAdd = 0;
      
      // Sıralamaya göre puan ver
      if (index === 0) { // 1. olan
        pointsToAdd = 100;
      } else if (index === 1) { // 2. olan
        pointsToAdd = 50;
      } else if (index === 2) { // 3. olan
        pointsToAdd = 25;
      }
      
      if (pointsToAdd > 0) {
        const currentPoints = users[userIndex].points || 0;
        users[userIndex].points = currentPoints + pointsToAdd;
        
        updatedUsers.push({
          username: users[userIndex].username,
          tag: users[userIndex].tag,
          pointsAdded: pointsToAdd,
          totalPoints: users[userIndex].points
        });
        
        console.log(`🏆 ${username}#${tag} +${pointsToAdd} puan (${index + 1}. sıra)`);
        
        // Kazanan kullanıcıya bildirim gönder
        createNotification(
          username,
          `🏆 Tebrikler! ${index + 1}. Oldunuz!`,
          `Oyunu ${index + 1}. sırada bitirdiniz ve ${pointsToAdd} puan kazandınız!`,
          'success'
        );
      }
    }
  });
  
  writeUsers(users);
  
  res.json({ 
    message: 'Oyun sonucu kaydedildi', 
    updatedUsers,
    lobiId 
  });
});

// 📢 Bildirim API endpoint'leri

// Kullanıcının bildirimlerini getir
app.get('/api/notifications/:username', (req, res) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ message: 'Kullanıcı adı gereklidir' });
  }
  
  const notifications = readNotifications();
  const userNotifications = notifications
    .filter(notif => notif.username === username)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // En yeni önce
  
  res.json(userNotifications);
});

// Bildirimi okundu olarak işaretle
app.post('/api/notifications/:notificationId/read', (req, res) => {
  const { notificationId } = req.params;
  
  if (!notificationId) {
    return res.status(400).json({ message: 'Bildirim ID gereklidir' });
  }
  
  const notifications = readNotifications();
  const notificationIndex = notifications.findIndex(notif => notif.id === notificationId);
  
  if (notificationIndex === -1) {
    return res.status(404).json({ message: 'Bildirim bulunamadı' });
  }
  
  notifications[notificationIndex].read = true;
  writeNotifications(notifications);
  
  res.json({ 
    message: 'Bildirim okundu olarak işaretlendi',
    notification: notifications[notificationIndex]
  });
});

// Kullanıcının tüm bildirimlerini okundu olarak işaretle
app.post('/api/notifications/:username/read-all', (req, res) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ message: 'Kullanıcı adı gereklidir' });
  }
  
  const notifications = readNotifications();
  let updatedCount = 0;
  
  notifications.forEach(notif => {
    if (notif.username === username && !notif.read) {
      notif.read = true;
      updatedCount++;
    }
  });
  
  writeNotifications(notifications);
  
  res.json({ 
    message: `${updatedCount} bildirim okundu olarak işaretlendi`,
    updatedCount
  });
});

// Bildirim sayısını getir
app.get('/api/notifications/:username/count', (req, res) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ message: 'Kullanıcı adı gereklidir' });
  }
  
  const notifications = readNotifications();
  const unreadCount = notifications.filter(notif => 
    notif.username === username && !notif.read
  ).length;
  
  res.json({ 
    username,
    unreadCount,
    totalCount: notifications.filter(notif => notif.username === username).length
  });
});

// 👥 Arkadaş sistemi API endpoint'leri

// Arkadaş isteği gönder
app.post('/api/friends/request', (req, res) => {
  const { fromUsername, fromTag, toUsername, toTag } = req.body;
  
  if (!fromUsername || !fromTag || !toUsername || !toTag) {
    return res.status(400).json({ message: 'Eksik bilgi' });
  }
  
  // Kendine arkadaş isteği gönderemez
  if (fromUsername === toUsername && fromTag === toTag) {
    return res.status(400).json({ message: 'Kendinize arkadaş isteği gönderemezsiniz' });
  }
  
  const friends = readFriends();
  
  // Zaten arkadaş isteği var mı kontrol et
  const existingRequest = friends.find(f => 
    f.fromUsername === fromUsername && f.fromTag === fromTag && 
    f.toUsername === toUsername && f.toTag === toTag && 
    f.status === 'pending'
  );
  
  if (existingRequest) {
    return res.status(400).json({ message: 'Zaten arkadaş isteği gönderilmiş' });
  }
  
  // Zaten arkadaş mı kontrol et
  const existingFriendship = friends.find(f => 
    ((f.fromUsername === fromUsername && f.fromTag === fromTag && 
      f.toUsername === toUsername && f.toTag === toTag) ||
     (f.fromUsername === toUsername && f.fromTag === toTag && 
      f.toUsername === fromUsername && f.toTag === fromTag)) &&
    f.status === 'accepted'
  );
  
  if (existingFriendship) {
    return res.status(400).json({ message: 'Zaten arkadaşsınız' });
  }
  
  const newRequest = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    fromUsername,
    fromTag,
    toUsername,
    toTag,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  friends.push(newRequest);
  writeFriends(friends);
  
  // Alıcıya bildirim gönder
  createNotification(
    toUsername,
    '👥 Yeni Arkadaş İsteği!',
    `${fromUsername}#${fromTag} size arkadaş isteği gönderdi.`,
    'info'
  );
  
  console.log(`👥 Arkadaş isteği gönderildi: ${fromUsername}#${fromTag} -> ${toUsername}#${toTag}`);
  
  res.json({ 
    message: 'Arkadaş isteği gönderildi',
    request: newRequest
  });
});

// Arkadaş isteklerini getir
app.get('/api/friends/requests/:username', (req, res) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ message: 'Kullanıcı adı gereklidir' });
  }
  
  const friends = readFriends();
  const requests = friends.filter(f => 
    f.toUsername === username && f.status === 'pending'
  );
  
  res.json(requests);
});

// Arkadaş isteğini kabul et
app.post('/api/friends/accept', (req, res) => {
  const { requestId, username, tag } = req.body;
  
  if (!requestId || !username || !tag) {
    return res.status(400).json({ message: 'Eksik bilgi' });
  }
  
  const friends = readFriends();
  const requestIndex = friends.findIndex(f => f.id === requestId);
  
  if (requestIndex === -1) {
    return res.status(404).json({ message: 'Arkadaş isteği bulunamadı' });
  }
  
  const request = friends[requestIndex];
  
  // İsteği sadece alıcı kabul edebilir
  if (request.toUsername !== username || request.toTag !== tag) {
    return res.status(403).json({ message: 'Bu isteği kabul etme yetkiniz yok' });
  }
  
  request.status = 'accepted';
  request.acceptedAt = new Date().toISOString();
  friends[requestIndex] = request;
  writeFriends(friends);
  
  // İsteği gönderen kişiye bildirim gönder
  createNotification(
    request.fromUsername,
    '✅ Arkadaş İsteği Kabul Edildi!',
    `${username}#${tag} arkadaş isteğinizi kabul etti!`,
    'success'
  );
  
  console.log(`✅ Arkadaş isteği kabul edildi: ${request.fromUsername}#${request.fromTag} <-> ${username}#${tag}`);
  
  res.json({ 
    message: 'Arkadaş isteği kabul edildi',
    friendship: request
  });
});

// Arkadaş isteğini reddet
app.post('/api/friends/reject', (req, res) => {
  const { requestId, username, tag } = req.body;
  
  if (!requestId || !username || !tag) {
    return res.status(400).json({ message: 'Eksik bilgi' });
  }
  
  const friends = readFriends();
  const requestIndex = friends.findIndex(f => f.id === requestId);
  
  if (requestIndex === -1) {
    return res.status(404).json({ message: 'Arkadaş isteği bulunamadı' });
  }
  
  const request = friends[requestIndex];
  
  // İsteği sadece alıcı reddedebilir
  if (request.toUsername !== username || request.toTag !== tag) {
    return res.status(403).json({ message: 'Bu isteği reddetme yetkiniz yok' });
  }
  
  request.status = 'rejected';
  request.rejectedAt = new Date().toISOString();
  friends[requestIndex] = request;
  writeFriends(friends);
  
  console.log(`❌ Arkadaş isteği reddedildi: ${request.fromUsername}#${request.fromTag} -> ${username}#${tag}`);
  
  res.json({ 
    message: 'Arkadaş isteği reddedildi',
    request: request
  });
});

// Kullanıcının arkadaş listesini getir
app.get('/api/friends/:username', (req, res) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ message: 'Kullanıcı adı gereklidir' });
  }
  
  const friends = readFriends();
  const userFriends = friends.filter(f => 
    ((f.fromUsername === username && f.status === 'accepted') ||
     (f.toUsername === username && f.status === 'accepted'))
  );
  
  // Arkadaş bilgilerini al
  const users = readUsers();
  const friendsList = userFriends.map(f => {
    const friendUsername = f.fromUsername === username ? f.toUsername : f.fromUsername;
    const friendTag = f.fromUsername === username ? f.toTag : f.fromTag;
    const friendUser = users.find(u => u.username === friendUsername && u.tag === friendTag);
    
    return {
      username: friendUsername,
      tag: friendTag,
      avatar: friendUser?.avatar || null,
      points: friendUser?.points || 0,
      friendshipId: f.id,
      since: f.acceptedAt
    };
  });
  
  res.json(friendsList);
});

// Arkadaşlıktan çık
app.post('/api/friends/remove', (req, res) => {
  const { friendshipId, username, tag } = req.body;
  
  if (!friendshipId || !username || !tag) {
    return res.status(400).json({ message: 'Eksik bilgi' });
  }
  
  const friends = readFriends();
  const friendshipIndex = friends.findIndex(f => f.id === friendshipId);
  
  if (friendshipIndex === -1) {
    return res.status(404).json({ message: 'Arkadaşlık bulunamadı' });
  }
  
  const friendship = friends[friendshipIndex];
  
  // Sadece arkadaşlığın bir parçası olan kişi çıkabilir
  if ((friendship.fromUsername !== username || friendship.fromTag !== tag) &&
      (friendship.toUsername !== username || friendship.toTag !== tag)) {
    return res.status(403).json({ message: 'Bu arkadaşlıktan çıkma yetkiniz yok' });
  }
  
  const otherUsername = friendship.fromUsername === username ? friendship.toUsername : friendship.fromUsername;
  const otherTag = friendship.fromUsername === username ? friendship.toTag : friendship.fromTag;
  
  friends.splice(friendshipIndex, 1);
  writeFriends(friends);
  
  // Diğer kişiye bildirim gönder
  createNotification(
    otherUsername,
    '👋 Arkadaşlıktan Çıkıldı',
    `${username}#${tag} arkadaşlıktan çıktı.`,
    'warning'
  );
  
  console.log(`👋 Arkadaşlıktan çıkıldı: ${username}#${tag} <-> ${otherUsername}#${otherTag}`);
  
  res.json({ 
    message: 'Arkadaşlıktan çıkıldı'
  });
});

// 🚀 Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Backend http://localhost:${PORT} adresinde çalışıyor`);
});
