🎮 Oyun Merkezi (Game Hub) Projesi

Bu proje, çok oyunculu oyunların oynanabildiği bir web tabanlı oyun merkezi platformudur. Kullanıcılar bu merkezde oturum açabilir, çeşitli oyunlara ait lobiler oluşturabilir, lobilerde bir araya gelip oyunlar oynayabilirler. Platform, Lerna tabanlı monorepo yapısı kullanarak oyun merkezini ve oyunları ayrı paketlerde yönetir.

⚙️ Teknolojiler

React 18 (frontend)

Express.js (backend)

Lerna v8 (monorepo yönetimi)

Material UI v6 (görünüm)

Vite (frontend derleyici)

SHA-256 (şifreleme)

MemoryStore (session yönetimi)

users.json, lobbies.json (veri dosyaları)

📂 Ana Modüller

1. Kullanıcı Girişi & Kayıt

SHA-256 şifreleme ile kullanıcı kaydı ve oturum açma

Session tabanlı oturum yönetimi (express-session)

"Beni Hatırla" ve "Şifremi Unuttum" alanları

2. Dashboard

Lobilerin listelenmesi

Lobiler için filtreleme (arama, şifreli vs.)

Yeni lobi oluşturma (normal/etkinlik)

Lobi bilgileri: oyun, başlangıç-bitiş, kurucu, şifre durumu

Lobiye katılma / ayrılma işlemleri

Kurucu için: lobiyi güncelleme/silme

Lobiye katılanları listeleme

Lobinin bağlantı linkini kopyalama

3. Lobilerde Otomatik Davranışlar

Kurucu lobiden çıkarsa 8 saat içinde lobi kapanır

Etkinlik lobileri her zaman öncelikli listelenir

Etkinliğe 24 saatten az kaldıysa geri sayım görünür

4. Oyun Sayfaları

TombalaOyunEkrani sayfası oyunlar/tombala altında

Frontend tarafından /tombala rotasından ulaşılır

React bileşenleri: OyunAlani, OyuncuListesi, CekilenSayilar vb.

🌟 Kurulum ve Başlatma

# 1. Ana dizinde bağlılıkları yükle
npm install

# 2. Frontend'i başlat
cd packages/oyun-merkezi
npm run dev

# 3. Backend'i başlat
node index.js
