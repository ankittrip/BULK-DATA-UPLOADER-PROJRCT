# Bulk Data Uploader 

A scalable full-stack platform to handle massive dataset uploads with real-time progress tracking, background processing, and summary notifications.

## Tech Stack
- **Frontend**: React.js / Next.js
- **Backend**: Node.js, Express.js, MongoDB
- **Queue**: Redis + BullMQ
- **WebSockets**: Socket.IO
- **Deployment**: Vercel (frontend), Render (backend)

## Features
- Upload CSV/Excel files
- Real-time upload progress via WebSocket
- Duplicate handling and record-level success/failure
- Email + Browser notifications on completion
- Admin job history & retry options

## Test Data Generator
Use this:
https://dummy-data-gen-1061052074258.europe-north2.run.app/generate-stores?count=50000

## Live Demo
- 🔗 Frontend: [Vercel Link](https://your-frontend.vercel.app)
- 🔗 Backend: [Render API](https://your-backend.onrender.com)

## Demo Video
[Watch on YouTube](https://youtube.com/your-demo-link)

## Documentation
- [`/docs/architecture.md`](./docs/architecture.md)
- [`/docs/approach.md`](./docs/approach.md)

## 🧑‍💼 Author
Ankit Tripathi | ankittripathi559@gmail.com
