# Oyun Merkezi Projesi

Bu proje, çoklu oyun lobisi oluşturma ve yönetme imkanı sunan bir web uygulamasıdır.

## 🎮 Özellikler

- Kullanıcı kaydı ve girişi
- Oyun lobisi oluşturma ve yönetme
- Normal ve etkinlik tipi lobiler
- Şifreli lobi desteği
- Gerçek zamanlı lobi durumu takibi
- Etkinlik geri sayımı
- Kullanıcı dostu arayüz

## 🚀 Kurulum

1. Gerekli paketleri yükleyin:
```bash
npm install
```

2. Backend sunucusunu başlatın:
```bash
node index.js
```

3. Frontend uygulamasını başlatın:
```bash
cd packages/oyun-merkezi
npm run dev
```

## 🔧 Teknolojiler

- Frontend:
  - React
  - Material-UI
  - Axios
  - React Router

- Backend:
  - Node.js
  - Express
  - JSON dosya sistemi

## 👥 Kullanıcı Bilgileri

Test için kullanabileceğiniz örnek hesaplar:

```
Email: test@example.com
Password: 1234
Username: sar3
Tag: 3991

Email: test1@example.com
Password: 1234
Username: sare
Tag: 7423
```

## 🔐 Güvenlik

- Şifreler SHA-256 ile hashlenerek saklanır
- Oturum yönetimi için HTTP-only çerezler kullanılır
- API istekleri için CORS koruması

## 🎯 Geliştirme

1. Yeni bir özellik eklemek için:
   - İlgili bileşeni `components/` altında oluşturun
   - Gerekli state yönetimi için `contexts/` altında context ekleyin
   - Sayfa bileşenini `pages/` altında oluşturun

2. Yeni bir oyun eklemek için:
   - `packages/oyunlar/` altında yeni bir modül oluşturun
   - Oyun mantığını ve arayüzünü ekleyin
   - Ana uygulamaya entegre edin

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
