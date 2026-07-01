# 🗳️ SecureVote — Complete Setup & Deployment Guide
## Secure E-Voting System with Facial Recognition

---

## 📁 STEP 1 — WHERE TO STORE THE CODE IN VS CODE

### Folder Structure (create this exactly)

```
evoting/                          ← ROOT FOLDER (open this in VS Code)
│
├── backend/                      ← Node.js + Express Backend
│   ├── models/
│   │   ├── Voter.js
│   │   ├── Election.js
│   │   └── Vote.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── elections.js
│   │   ├── votes.js
│   │   ├── voters.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env                      ← Environment variables (NEVER commit this)
│   ├── package.json
│   └── server.js                 ← Backend entry point
│
├── frontend/                     ← React Frontend
│   ├── public/
│   │   ├── index.html
│   │   └── models/               ← face-api.js AI model files go here
│   │       ├── tiny_face_detector_model-weights_manifest.json
│   │       ├── tiny_face_detector_model-shard1
│   │       ├── face_landmark_68_model-weights_manifest.json
│   │       ├── face_landmark_68_model-shard1
│   │       ├── face_recognition_model-weights_manifest.json
│   │       ├── face_recognition_model-shard1
│   │       ├── face_recognition_model-shard2
│   │       ├── face_expression_model-weights_manifest.json
│   │       └── face_expression_model-shard1
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── FaceCamera.js
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── FaceSetupPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── VotingPage.js
│   │   │   ├── ResultsPage.js
│   │   │   ├── ProfilePage.js
│   │   │   └── AdminPage.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   ├── faceRecognition.js
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── download-models.bat           ← Run on Windows to download AI models
├── download-models.sh            ← Run on Mac/Linux to download AI models
└── createAdmin.js                ← Run once to create admin account
```

### HOW TO OPEN IN VS CODE
1. Create a folder called `evoting` anywhere on your computer (e.g., Desktop or Documents)
2. Inside `evoting`, create two folders: `backend` and `frontend`
3. Create all subfolders as shown above
4. Copy each file's code into the correct location
5. Open VS Code → File → Open Folder → select the `evoting` folder
6. You will see the entire project in the VS Code Explorer panel on the left

---

## 💻 STEP 2 — VS CODE EXTENSIONS TO INSTALL

Open VS Code, press `Ctrl+Shift+X` (Extensions panel), and install:

| Extension | Publisher | Why You Need It |
|---|---|---|
| **ES7+ React/Redux/React-Native snippets** | dsznajder | React shortcuts like `rafce` for components |
| **Prettier - Code formatter** | Prettier | Auto-formats your code on save |
| **ESLint** | Microsoft | Catches JavaScript errors in real time |
| **Thunder Client** | Thunder Client | Test your API endpoints without Postman |
| **MongoDB for VS Code** | MongoDB | View/edit your database inside VS Code |
| **GitLens** | GitKraken | Better Git history and blame |
| **Auto Rename Tag** | Jun Han | Auto-renames paired HTML/JSX tags |
| **Path Intellisense** | Christian Kohler | Autocompletes file import paths |
| **Bracket Pair Colorizer** | CoenraadS | Colorizes matching brackets |
| **Node.js Extension Pack** | Wade Anderson | Debugging tools for Node.js backend |
| **DotENV** | mikestead | Syntax highlighting for .env files |

### VS Code Settings (optional but recommended)
Press `Ctrl+,` → Settings → search and set:
- `editor.formatOnSave` → true
- `editor.defaultFormatter` → Prettier

---

## 🛠️ STEP 3 — INSTALL REQUIRED SOFTWARE

### 3.1 Install Node.js (Required)
1. Go to https://nodejs.org
2. Download **LTS version** (e.g., 20.x)
3. Install with default settings
4. Verify: open terminal → `node --version` → should show `v20.x.x`
5. Verify npm: `npm --version` → should show `10.x.x`

### 3.2 Install MongoDB (Required)
**Option A — MongoDB Community (Local)**
1. Go to https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server for your OS
3. Install with default settings
4. MongoDB runs automatically as a service on Windows
5. On Mac: run `brew install mongodb-community` then `brew services start mongodb-community`

**Option B — MongoDB Atlas (Cloud, Easier)**
1. Go to https://cloud.mongodb.com → create free account
2. Create a free cluster (M0 free tier)
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/evoting`)
5. Paste it into `backend/.env` as `MONGODB_URI`

### 3.3 Git (optional but recommended)
Download from https://git-scm.com and install with defaults.

---

## ▶️ STEP 4 — RUNNING THE PROJECT LOCALLY

### 4.1 Open Two Terminals in VS Code
In VS Code: Terminal → New Terminal (or `Ctrl+`` `)
Click the `+` button to open a second terminal.

### 4.2 Terminal 1 — Start Backend
```bash
cd backend
npm install
npm run dev
```
You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on http://localhost:5000
```

### 4.3 Terminal 2 — Download AI Models (First Time Only)
**Windows:**
```bash
download-models.bat
```
**Mac/Linux:**
```bash
chmod +x download-models.sh
./download-models.sh
```
This downloads ~30MB of face recognition model files into `frontend/public/models/`.

### 4.4 Terminal 2 — Start Frontend
```bash
cd frontend
npm install
npm start
```
Browser will auto-open at http://localhost:3000

### 4.5 Create Admin Account (First Time Only)
In a new terminal (from the `evoting` root folder):
```bash
node createAdmin.js
```
This creates:
- **Email:** admin@evoting.com
- **Password:** Admin@12345

---

## 🔑 STEP 5 — HOW TO USE THE SYSTEM

### As a Voter
1. Open http://localhost:3000
2. Click "Register to Vote" → fill in your details
3. After registration, you'll be redirected to Face Enrollment
4. Allow camera access → click "Capture Sample" 5 times
5. Go to Dashboard → find active elections → click "Vote Now"
6. Complete face verification → select a candidate → confirm
7. Save your receipt token from the confirmation screen

### As an Admin
1. Login with `admin@evoting.com` / `Admin@12345`
2. Go to Dashboard → click "+ Seed Demo Election" to create a test election
3. Access Admin panel from the navbar
4. Manage voters, view elections and live results

### Testing the API (Thunder Client in VS Code)
- Health check: `GET http://localhost:5000/api/health`
- Register: `POST http://localhost:5000/api/auth/register`
- Login: `POST http://localhost:5000/api/auth/login`
- Elections: `GET http://localhost:5000/api/elections` (add Bearer token)

---

## 🌐 STEP 6 — DEPLOYMENT (PRODUCTION)

### Option A — Deploy to Render (FREE, Recommended for Students)

**Backend on Render:**
1. Push your code to GitHub
2. Go to https://render.com → Create account
3. New → Web Service → Connect your GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add Environment Variables (same as `.env` file):
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = any long random string
   - `NODE_ENV` = production
   - `FRONTEND_URL` = your frontend URL (added after)
6. Click Deploy → copy the URL (e.g., `https://evoting-backend.onrender.com`)

**Frontend on Render/Vercel:**
1. Create a `.env` file in `frontend/` with:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```
2. Run `npm run build` → this creates a `build/` folder
3. On Render: New → Static Site → set Root Directory to `frontend`, Build Command to `npm run build`, Publish Directory to `build`
   OR
3. On Vercel (easier): Go to https://vercel.com → Import GitHub repo → set Root Directory to `frontend` → Deploy

**Important:** Also copy your `frontend/public/models/` folder into the project before pushing to GitHub, as the AI models need to be served publicly.

### Option B — Deploy on VPS (e.g., DigitalOcean, AWS EC2)

```bash
# On your VPS (Ubuntu)
sudo apt update
sudo apt install nodejs npm nginx

# Clone your repo
git clone https://github.com/yourname/evoting.git
cd evoting

# Backend setup
cd backend
npm install
# Set up .env file with production values

# Install PM2 to keep backend running
npm install -g pm2
pm2 start server.js --name evoting-backend
pm2 save
pm2 startup

# Frontend build
cd ../frontend
npm install
REACT_APP_API_URL=http://your-server-ip:5000/api npm run build

# Serve frontend with Nginx
sudo cp -r build/* /var/www/html/
```

---

## ❗ STEP 7 — COMMON ERRORS & FIXES

| Error | Cause | Fix |
|---|---|---|
| `Cannot connect to MongoDB` | MongoDB not running | Start MongoDB service or check Atlas connection string |
| `face-api.js model not found` | Models not downloaded | Run `download-models.bat` or `download-models.sh` |
| `Camera permission denied` | Browser blocked camera | Click lock icon in browser → allow camera |
| `CORS error` | Wrong frontend URL in backend | Update `FRONTEND_URL` in `backend/.env` |
| `JWT malformed` | Logged in on old token | Clear localStorage in browser DevTools |
| `npm install` fails | Node version too old | Update Node.js to v18+ |
| `Port 5000 in use` | Another process using it | Change `PORT` in `.env` to `5001` |
| `No face detected` | Poor lighting | Use a well-lit room, face the camera directly |

---

## 🔒 SECURITY FEATURES IMPLEMENTED

1. **Facial Recognition** — face-api.js with 128-dimension face descriptor comparison
2. **JWT Authentication** — tokens expire in 24 hours
3. **Face Verification Token** — short-lived 5-minute token for voting authorization
4. **Password Hashing** — bcryptjs with salt rounds of 12
5. **Rate Limiting** — 100 req/15min general, 3 vote attempts/hour
6. **Vote Anonymity** — votes stored without voter ID linkage
7. **Blockchain-style Chaining** — SHA-256 hash chain for tamper detection
8. **Duplicate Vote Prevention** — checked at database level
9. **Helmet.js** — HTTP security headers
10. **Input Validation** — Aadhar format, email, age verification

---

## 📌 QUICK REFERENCE

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| API Health | http://localhost:5000/api/health |
| MongoDB (local) | mongodb://localhost:27017/evoting |

| Default Accounts | Credentials |
|---|---|
| Admin | admin@evoting.com / Admin@12345 |
| Test Voter | Register a new account |
