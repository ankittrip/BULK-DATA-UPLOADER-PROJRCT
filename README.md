# 📦 Bulk Data Uploader
### Scalable Full-Stack Platform for Massive Dataset Processing

A production-grade bulk data processing platform that handles massive CSV/Excel file uploads with real-time progress tracking, background queue processing, duplicate handling, and email notifications on job completion.

---

## 🌐 Live & Repository Links

| Type | Link |
|------|------|
| 🚀 Live App | [bulk-data-uploader-projrct.vercel.app](https://bulk-data-uploader-projrct.vercel.app/) |
| ⚙️ Backend API | [bulk-data-uploader-projrct.onrender.com](https://bulk-data-uploader-projrct.onrender.com/) |
| 📦 GitHub Repo | [github.com/ankittrip](https://github.com/ankittrip) |

---

## 🚀 Tech Stack

### Frontend
- React.js / Next.js
- Tailwind CSS
- Socket.IO Client
- Axios

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Redis + BullMQ (Queue Processing)
- Socket.IO (Real-time WebSocket updates)
- Nodemailer (Email notifications)

### DevOps
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)
- Redis (Upstash)

---

## ✨ Key Features

- ✅ Upload large CSV/Excel files (50,000+ records)
- ✅ Real-time upload progress via Socket.IO WebSockets
- ✅ Background job processing with BullMQ + Redis queues
- ✅ Duplicate record detection and handling
- ✅ Record-level success/failure tracking
- ✅ Email notifications on job completion
- ✅ Browser notifications for live updates
- ✅ Admin dashboard for job history and retry options
- ✅ Fault-tolerant processing with retry-with-backoff

---

## 🏗️ Architecture Highlights

- **BullMQ + Redis** — Background workers process uploaded files without blocking the main thread
- **Socket.IO** — Real-time progress updates streamed directly to the frontend
- **MongoDB** — Stores job history, record-level results, and upload summaries
- **Dead-Letter Queues** — Failed jobs are captured and retried automatically
- **Admin Panel** — View all jobs, retry failed batches, inspect errors

---

## 🧪 Test Data Generator

Generate 50,000 dummy store records for testing:

```
https://dummy-data-gen-1061052074258.europe-north2.run.app/generate-stores?count=50000
```

---

## ⚙️ Project Structure

```
bulk-data-uploader/
├── frontend/              # React/Next.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   └── package.json
│
├── backend/               # Node.js backend
│   ├── routes/
│   │   ├── upload.Routes.js
│   │   ├── job.routes.js
│   │   ├── store.routes.js
│   │   ├── email.routes.js
│   │   └── admin.routes.js
│   ├── middlewares/
│   ├── workers/
│   └── server.js
│
└── README.md
```

---

## 🛠️ Setup & Run Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/ankittrip/bulk-data-uploader.git
cd bulk-data-uploader
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:3000
```

Run backend:
```bash
npm run dev
```
➡️ Backend runs at `http://localhost:5000`

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Run frontend:
```bash
npm run dev
```
➡️ Frontend runs at `http://localhost:3000`

---

## 📊 Upload Flow

1. User uploads a CSV/Excel file via the frontend
2. Backend receives the file and creates a BullMQ job
3. Worker processes records in batches
4. Real-time progress streamed to frontend via Socket.IO
5. Duplicates detected and flagged
6. Job summary saved to MongoDB
7. Email notification sent on completion
8. Admin can view history and retry failed jobs

---

## 🗂️ Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Queue | Redis (Upstash) |

---

## 🧑‍💻 Author

**Ankit Tripathi** — Full Stack Developer (MERN + TypeScript)

📧 ankittripathi559@gmail.com
💼 [LinkedIn](https://www.linkedin.com/in/ankittripathi-dev/)
🐙 [GitHub](https://github.com/ankittrip)
🌐 [Portfolio](https://ankittripathi-dev.vercel.app/)

---

## 📝 License

This project is licensed under the ISC License. Developed for educational and portfolio demonstration purposes.
