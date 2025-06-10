const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const MemoryStore = require('memorystore')(session);
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 4000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'sar3-secret-key',
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
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    req.session.user = { email: user.email };
    res.json({ message: 'Giriş başarılı', user: req.session.user });
  } else {
    res.status(401).json({ message: 'Geçersiz email veya şifre' });
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
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Çıkış sırasında hata oluştu' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Çıkış başarılı' });
  });
});

app.get('/api/auth/user', (req, res) => {
  if (req.session.user) {
    const users = readUsers();
    const fullUser = users.find(u => u.email === req.session.user.email);
    res.json({ user: fullUser });
  } else {
    res.status(401).json({ message: 'Giriş yapılmamış' });
  }
});

app.post('/api/lobbies', (req, res) => {
  const { lobiAdi, tip, sifreliMi, sifre, kurucu, baslangicTarihi, bitisTarihi, secilenOyun } = req.body;
  if (!lobiAdi || !tip || !kurucu || !secilenOyun) {
    return res.status(400).json({
      message: `Eksik bilgi: ${[
        !lobiAdi && 'lobiAdi',
        !tip && 'tip',
        !kurucu && 'kurucu',
        !secilenOyun && 'secilenOyun'
      ].filter(Boolean).join(', ')}`
    });
  }
  const lobbies = readLobbies();
  const yeniLobi = {
    id: Date.now(),
    ad: lobiAdi,
    tip,
    sifreli: sifreliMi,
    sifre: sifreliMi ? sifre : null,
    kurucu,
    oyun: secilenOyun,
    baslangicTarihi: tip === 'etkinlik' ? baslangicTarihi : null,
    bitisTarihi: tip === 'etkinlik' ? bitisTarihi : null,
    createdAt: new Date().toISOString(),
    katilanlar: [kurucu]  // ← kurucuyu otomatik ekle
  };
  lobbies.push(yeniLobi);
  writeLobbies(lobbies);
  res.json({ message: 'Lobi oluşturuldu', lobi: yeniLobi });
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
