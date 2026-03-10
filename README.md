# 💬 ChatApp — MERN Stack Real-Time Chat Application

A full-stack real-time chat application built with MongoDB, Express.js, React.js, and Node.js, as described in the JNAO Vol. 16 paper.

---

## 🗂️ Project Structure

```
chat-app/
├── client/                    # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   │   ├── Login.js
│       │   │   └── Register.js
│       │   ├── chat/
│       │   │   ├── ChatBox.js         # Real-time messaging with Socket.io
│       │   │   ├── GroupChatModal.js  # Create group chats
│       │   │   └── ProfileModal.js    # User profile & logout
│       │   └── layout/
│       │       ├── Avatar.js          # Reusable avatar component
│       │       └── Sidebar.js         # Chat list + user search
│       ├── context/
│       │   ├── AuthContext.js         # Authentication state
│       │   └── ChatContext.js         # Chat/message state
│       ├── pages/
│       │   ├── AuthPage.js            # Login/Register page
│       │   └── ChatPage.js            # Main chat layout
│       ├── utils/
│       │   └── api.js                 # Axios API helpers
│       ├── App.js
│       ├── index.js
│       └── index.css
├── server/                    # Node.js + Express backend
│   ├── config/
│   │   └── db.js                      # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js          # Register, login, search, update
│   │   ├── chatController.js          # One-on-one & group chats
│   │   └── messageController.js       # Send & fetch messages
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT auth guard
│   ├── models/
│   │   ├── User.js                    # User schema
│   │   ├── Chat.js                    # Chat schema
│   │   └── Message.js                 # Message schema
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── chatRoutes.js
│   │   └── messageRoutes.js
│   ├── server.js                      # Express + Socket.io entry
│   ├── .env.example
│   └── package.json
├── package.json               # Root scripts (run both together)
└── README.md
```

---

## ✅ Prerequisites

Before running, make sure you have:

- **Node.js** v18+ → https://nodejs.org
- **MongoDB** (choose one):
  - **Local**: Install MongoDB Community → https://www.mongodb.com/try/download/community
  - **Cloud (easier)**: Create free cluster at https://www.mongodb.com/atlas
- **VS Code** → https://code.visualstudio.com
- **Git** (optional)

---

## 🚀 Setup Instructions (VS Code)

### Step 1 — Open the project

1. Open VS Code
2. Go to **File → Open Folder** and select the `chat-app` folder
3. Open the integrated terminal: **Terminal → New Terminal** (or `` Ctrl+` ``)

### Step 2 — Configure environment variables

```bash
cd server
cp .env.example .env
```

Now open `server/.env` and set your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=mySecretKey123
NODE_ENV=development
```

> **Using MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string:
> `MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/chatapp`

### Step 3 — Install all dependencies

From the **root** `chat-app/` folder in the terminal:

```bash
npm run install-all
```

This installs packages for root, server, and client automatically.

> If that doesn't work, install manually:
> ```bash
> npm install
> cd server && npm install
> cd ../client && npm install
> ```

### Step 4 — Run the application

**Option A — Run both together (recommended):**

From the root folder:

```bash
npm run dev
```

**Option B — Run separately (in two terminals):**

Terminal 1 (backend):
```bash
cd server
npm run dev
```

Terminal 2 (frontend):
```bash
cd client
npm start
```

### Step 5 — Open in browser

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 🎯 Features

| Feature | Status |
|---|---|
| User Registration & Login | ✅ |
| JWT Authentication | ✅ |
| One-on-One Messaging | ✅ |
| Group Chat | ✅ |
| Real-Time Messaging (Socket.io) | ✅ |
| Typing Indicators | ✅ |
| Message Notifications | ✅ |
| User Search | ✅ |
| Profile Update | ✅ |
| Chat History (MongoDB) | ✅ |

---

## 🛠️ API Endpoints

### Users
| Method | Route | Description |
|---|---|---|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login user |
| GET | `/api/users?search=` | Search users |
| PUT | `/api/users/profile` | Update profile |

### Chats
| Method | Route | Description |
|---|---|---|
| POST | `/api/chats` | Access/create 1-on-1 chat |
| GET | `/api/chats` | Get all chats |
| POST | `/api/chats/group` | Create group chat |
| PUT | `/api/chats/group/rename` | Rename group |
| PUT | `/api/chats/group/add` | Add user to group |
| PUT | `/api/chats/group/remove` | Remove user from group |

### Messages
| Method | Route | Description |
|---|---|---|
| POST | `/api/messages` | Send message |
| GET | `/api/messages/:chatId` | Get messages |

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `setup` | Client → Server | Join user's personal room |
| `join chat` | Client → Server | Join a chat room |
| `new message` | Client → Server | Broadcast new message |
| `message received` | Server → Client | Receive message |
| `typing` | Client → Server | Typing started |
| `stop typing` | Client → Server | Typing stopped |

---

## 🔮 Future Enhancements (from paper)

- [ ] Email verification for new users
- [ ] Forgot password functionality
- [ ] Read receipts
- [ ] Delete and edit messages
- [ ] File/image/video sharing
- [ ] Profile picture upload
- [ ] Video & voice calls
- [ ] Conference calls
- [ ] Mobile app (React Native)

---

## 🧰 Recommended VS Code Extensions

- **ES7+ React Snippets** — `dsznajder.es7-react-js-snippets`
- **Prettier** — `esbenp.prettier-vscode`
- **MongoDB for VS Code** — `mongodb.mongodb-vscode`
- **Thunder Client** (REST client) — `rangav.vscode-thunder-client`
- **GitLens** — `eamodio.gitlens`

---

## 📚 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-Time | Socket.io |
| Auth | JWT, bcryptjs |
| HTTP Client | Axios |

---

## ⚠️ Troubleshooting

**Port already in use:**
```bash
# Kill process on port 5000
npx kill-port 5000
```

**MongoDB connection error:**
- Make sure MongoDB service is running: `mongod`
- Or check your Atlas URI is correct

**Module not found errors:**
```bash
# Reinstall dependencies
cd server && rm -rf node_modules && npm install
cd ../client && rm -rf node_modules && npm install
```
