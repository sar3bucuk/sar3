+## Repository layout
+
+```
+/ (repo root)
+├─ index.js                   – Express backend server
+├─ users.json                 – Stored user data (JSON)
+├─ lobbies.json               – Stored lobby data (JSON)
+├─ packages/
+│  ├─ oyun-merkezi/           – React front‑end (Vite)
+│  └─ oyunlar/                – Game components (e.g. Tombala)
+```
+
+### Backend (Node.js / Express)
+
+The server defined in `index.js` listens on **port 4000**.  It provides endpoints for:
+
+- `POST /api/auth/login` – authenticate a user
+- `POST /api/auth/register` – create a new account
+- `POST /api/auth/logout` – end the current session
+- `GET  /api/auth/user` – return the logged‑in user
+- `POST /api/lobbies` – create a new lobby
+- `GET  /api/lobbies` – list available lobbies
+- `POST /api/lobbies/join` – join an existing lobby
+- `POST /api/lobbies/leave` – leave a lobby
+- `POST /api/lobbies/delete` – delete a lobby (creator only)
+- `POST /api/lobbies/update` – update lobby details (creator only)
+
+Data is persisted inside `users.json` and `lobbies.json` in the project root.
+
+Start the backend with:
+
+```bash
+node index.js
+```
+
+### Front‑end (packages/oyun-merkezi)
+
+The front‑end is a Vite + React application located under `packages/oyun-merkezi`.  It uses Material UI for styling and communicates with the backend on port 4000.
+
+Useful scripts from this package:
+
+```bash
+# start the development server
+npm run dev
+
+# create a production build in ./dist
+npm run build
+```
+
+### Games package (packages/oyunlar)
+
+`packages/oyunlar` contains placeholder components for games (such as `Tombala`).  These components can be imported by the front‑end when implementing actual game logic.
+
+## Oyun Merkezi sayfaları
+
+React tabanlı ön yüz `packages/oyun-merkezi/src` klasöründe yer alır. Başlıca sayfalar ve görevleri:
+
+1. **DashboardPage.jsx** (`packages/oyun-merkezi/src/pages/DashboardPage.jsx`)
+   - Oyun ve lobi listelerini görüntüler.
+   - Yeni lobi oluşturma, var olanlara katılma veya ayrılma işlemlerini yapar.
+   - Lobi sahibi kullanıcılar için güncelleme ve silme seçenekleri sunar.
+   - Kullanıcı hesabı ile oturumu kapatma butonu içerir.
+
+2. **LoginPage.jsx** (`packages/oyun-merkezi/src/pages/LoginPage.jsx`)
+   - Giriş formunu barındırır ve "Beni Hatırla" özelliğini destekler.
+   - Başarılı oturum açma sonrasında kullanıcıyı panoya yönlendirir.
+
+3. **RegisterPage.jsx** (`packages/oyun-merkezi/src/pages/RegisterPage.jsx`)
+   - Yeni kullanıcı kayıt formunu içerir.
+   - Şifreyi istemci tarafında hashleyerek gönderir.
+
+4. **OyunDetay.jsx** (`packages/oyun-merkezi/src/pages/OyunDetay.jsx`)
+   - Seçilen oyuna ait detaylar için şablon bir sayfadır.
+
+Ek olarak `packages/oyunlar` paketinde, örnek olarak `src/pages/TombalaOyunEkrani.jsx` dosyası oyun ekranı bileşenini temsil eder.
+
+## Getting started
+
+1. Install dependencies for the entire monorepo:
+   ```bash
+   npm install
+   ```
+2. Start the backend:
+   ```bash
+   node index.js
+   ```
+3. In another terminal, start the front‑end:
+   ```bash
+   cd packages/oyun-merkezi
+   npm run dev
+   ```
+   The application will be available at <http://localhost:5173>.
+
+The front‑end expects the backend to be running locally on port 4000 (see the API calls in the source code).
+
+## License
+
+This project is published without an explicit license file.
 
EOF
)
