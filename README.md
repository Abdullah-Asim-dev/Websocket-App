# 💬 Real-Time Chat Application

A modern **full-stack real-time chat application** built with the MERN stack and **Socket.IO**.

The application provides secure authentication, real-time messaging, persistent chat history, file and image sharing, message reactions, reply functionality, online user tracking, and a responsive modern interface.

Built to demonstrate practical **full-stack development, real-time communication, REST API integration, authentication, database management, and production deployment**.

---

## 🌐 Live Demo

**Frontend:** https://gleaming-fairy-e0fcdc.netlify.app/

---

## ✨ Features

### Authentication

* 🔐 JWT-based user authentication
* 🔒 Password hashing with bcrypt
* 👤 User-based chat experience

### Real-Time Communication

* 💬 Instant real-time messaging with Socket.IO
* 🟢 Online user tracking
* ⌨️ Live typing indicators
* 👥 Chat rooms
* 🔄 Real-time message updates

### Messaging

* ↩️ Reply to messages
* ❤️ Message reactions
* 🗑️ Delete messages
* 📎 File sharing
* 🖼️ Image sharing
* 💾 Persistent chat history

### User Experience

* 🌙 Dark and light themes
* 📱 Responsive design
* ✨ Smooth animations
* 🎨 Modern interface with Tailwind CSS
* ⚡ Real-time UI updates

---

## 🛠️ Tech Stack

### Frontend

* **React.js** — User interface
* **Vite** — Development and build tooling
* **Tailwind CSS** — Styling and responsive design
* **Framer Motion** — UI animations
* **Socket.IO Client** — Real-time communication

### Backend

* **Node.js** — Server-side runtime
* **Express.js** — REST API and backend framework
* **Socket.IO** — Real-time bidirectional communication
* **MongoDB Atlas** — Database
* **Mongoose** — MongoDB object modeling
* **JWT** — Authentication
* **bcryptjs** — Password hashing

### Deployment

* **Netlify** — Frontend deployment
* **Render** — Backend deployment
* **MongoDB Atlas** — Database hosting

---

## 🏗️ Application Architecture

```text
                    ┌──────────────────┐
                    │      React       │
                    │    Frontend      │
                    └────────┬─────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
            REST API                 Socket.IO
                 │                       │
                 └───────────┬───────────┘
                             │
                    ┌────────▼─────────┐
                    │     Express      │
                    │     + Node.js    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │     MongoDB      │
                    │      Atlas       │
                    └──────────────────┘
```

The frontend communicates with the backend through REST APIs for application operations, while **Socket.IO** handles real-time events such as messages, typing indicators, and online user updates.

---

## 🔄 Real-Time Messaging Flow

```text
User sends message
        ↓
React emits Socket.IO event
        ↓
Socket.IO server receives event
        ↓
Message is processed
        ↓
Message is stored in MongoDB
        ↓
Server emits message to connected users
        ↓
React UI updates instantly
```

This architecture allows users to communicate without manually refreshing the page.

---

## 📂 Project Structure

```text
Chat-App/
│
├── Frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   ├── public/
│   └── package.json
│
├── Backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   ├── index.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Getting Started

### Clone the Repository

```bash
gh repo clone Abdullah-Asim-dev/websocket-app
```

Or:

```bash
git clone https://github.com/Abdullah-Asim-dev/websocket-app.git
```

---

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

---

### Backend Setup

Open a new terminal:

```bash
cd Backend
npm install
npm start
```

---

## 🔑 Environment Variables

### Backend

Create a `.env` file inside the `Backend` directory:

```env
PORT=7777

MONGO_URI=your_mongodb_connection_string

FRONTEND_URL=http://localhost:5173
```

### Frontend

Create a `.env` file inside the `Frontend` directory:

```env
VITE_BACKEND_URL=http://localhost:7777
```

For production, configure the frontend and backend environment variables with your deployed application URLs.

> **Security:** Never commit `.env` files, database credentials, JWT secrets, or API keys to a public repository.

---

## 🔐 Authentication Flow

```text
User Registration / Login
          ↓
      Express API
          ↓
     Credentials Check
          ↓
      JWT Generated
          ↓
     Authenticated User
          ↓
 Protected Chat Features
```

JWT is used to authenticate users and protect application functionality, while bcrypt is used to securely hash passwords.

---

## 📡 Socket.IO

Socket.IO powers the application's real-time communication layer.

The project uses real-time events for features such as:

* New messages
* Typing indicators
* Online/offline user status
* Message updates
* Real-time UI synchronization

This provides a more responsive experience compared with traditional request-and-refresh communication.

---

## 🚀 Deployment

### Frontend

The React application is deployed on **Netlify**.

**Live Demo:** https://gleaming-fairy-e0fcdc.netlify.app/

### Backend

The Node.js and Express backend is deployed on **Render**.

### Database

The application uses **MongoDB Atlas** for persistent data storage.

---

## 📌 Project Highlights

* Full-stack MERN application
* Real-time communication using Socket.IO
* JWT authentication and protected functionality
* MongoDB database integration
* Persistent chat history
* File and image sharing
* Real-time online user tracking
* Typing indicators
* Responsive modern UI
* Production deployment with separate frontend and backend services

---

## 👨‍💻 Author

**Abdullah Asim**

**MERN Stack Developer | React Developer**

* **GitHub:** https://github.com/Abdullah-Asim-dev
* **LinkedIn:** https://www.linkedin.com/in/abdullah-asim-dev/

---

## 📄 License

This project was built for learning, development, and portfolio purposes.

