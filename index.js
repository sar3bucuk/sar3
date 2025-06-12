const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const MemoryStore = require('memorystore')(session);
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 4000;
const JWT_SECRET = 'sar3-secret-key';

app.use(cors({
  origin: 'http://localhost:5173',
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
        tag: user.tag
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
  const newUser = { email, password, username, tag: uniqueTag };
  users.push(newUser);
  writeUsers(users);
  res.json({ message: 'Kayıt başarılı', user: { email, username, tag: uniqueTag } });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Çıkış başarılı' });
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
        tag: user.tag
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
    createdAt: new Date().toISOString()
  };

  const lobbies = readLobbies();
  lobbies.push(yeniLobi);
  writeLobbies(lobbies);
  res.json(yeniLobi);
});

app.get('/api/lobbies', (req, res) => {
  let lobbies = readLobbies();

  const now = new Date();
  const updatedLobbies = lobbies.filter(lobi => {
    if (lobi.tip === 'normal' && !lobi.kurucu && lobi.kurucuCikmaZamani) {
      const cikisZamani = new Date(lobi.kurucuCikmaZamani);
      const farkSaat = (now - cikisZamani) / (1000 * 60 * 60);
      return farkSaat < 8; 
    }
    return true;
  });
  if (updatedLobbies.length !== lobbies.length) {
    writeLobbies(updatedLobbies);
  }
  res.json(updatedLobbies);
});

app.post('/api/lobbies/join', (req, res) => {
  const { lobiId, kullanici, sifreGirilen } = req.body;
  if (!lobiId || !kullanici) return res.status(400).json({ message: 'Lobi ID veya kullanıcı eksik' });
  const lobbies = readLobbies();
  const lobiIndex = lobbies.findIndex(l => l.id === lobiId);
  if (lobiIndex === -1) return res.status(404).json({ message: 'Lobi bulunamadı' });
  const lobi = lobbies[lobiIndex];
  if (lobi.sifreli && sifreGirilen !== lobi.sifre) return res.status(403).json({ message: 'Şifre hatalı' });
  if (!lobi.katilanlar) lobi.katilanlar = [];
  if (lobi.katilanlar.includes(kullanici)) return res.status(400).json({ message: 'Zaten bu lobide bulunuyorsunuz' });
  lobi.katilanlar.push(kullanici);
  lobbies[lobiIndex] = lobi;
  writeLobbies(lobbies);
  res.json({ message: 'Lobiye başarıyla katıldınız', lobi });
});

app.post('/api/lobbies/leave', (req, res) => {
  const { lobiId, kullanici } = req.body;
  const lobbies = readLobbies();
  const index = lobbies.findIndex(lobi => lobi.id === lobiId);

  if (index === -1) {
    return res.status(404).json({ message: 'Lobi bulunamadı' });
  }

  const lobi = lobbies[index];

  if (!lobi.katilanlar || !lobi.katilanlar.includes(kullanici)) {
    return res.status(400).json({ message: 'Kullanıcı zaten lobide değil' });
  }
  if (lobi.kurucu === kullanici) {
    lobi.kurucu = null;
    lobi.kurucuCikmaZamani = new Date().toISOString();  
  }
  lobi.katilanlar = lobi.katilanlar.filter(k => k !== kullanici);
  lobbies[index] = lobi;
  writeLobbies(lobbies);

  res.json({ message: 'Lobiden çıkıldı', lobi });
});

app.post('/api/lobbies/delete', (req, res) => {
  const { lobiId, kurucu } = req.body;
  if (!lobiId || !kurucu) return res.status(400).json({ message: 'Eksik bilgi' });
  const lobbies = readLobbies();
  const lobiIndex = lobbies.findIndex(lobi => lobi.id === lobiId);
  if (lobiIndex === -1) return res.status(404).json({ message: 'Lobi bulunamadı' });
  if (lobbies[lobiIndex].kurucu !== kurucu) return res.status(403).json({ message: 'Sadece kurucu lobiyi silebilir' });
  lobbies.splice(lobiIndex, 1);
  writeLobbies(lobbies);
  res.json({ message: 'Lobi silindi' });
});

app.post('/api/lobbies/update', (req, res) => {
  const { lobiId, kurucu, lobiAdi, tip, sifreliMi, sifre, oyun, baslangicTarihi, bitisTarihi } = req.body;
  if (!lobiId || !kurucu) return res.status(400).json({ message: 'Eksik bilgi' });
  const lobbies = readLobbies();
  const index = lobbies.findIndex(lobi => lobi.id === lobiId);
  if (index === -1) return res.status(404).json({ message: 'Lobi bulunamadı' });
  if (lobbies[index].kurucu !== kurucu) return res.status(403).json({ message: 'Sadece kurucu lobiyi güncelleyebilir' });
  lobbies[index] = {
    ...lobbies[index],
    ad: lobiAdi,
    tip,
    oyun,
    sifreli: sifreliMi,
    sifre: sifreliMi ? sifre : null,
    baslangicTarihi: tip === 'etkinlik' ? baslangicTarihi : null,
    bitisTarihi: tip === 'etkinlik' ? bitisTarihi : null
  };
  writeLobbies(lobbies);
  res.json({ message: 'Lobi güncellendi', lobi: lobbies[index] });
});

// 🚀 Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Backend http://localhost:${PORT} adresinde çalışıyor`);
});
