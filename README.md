# Online PPT Collaboration Platform - Frontend

A real-time collaborative PowerPoint-style presentation editor built with React, Tailwind CSS, and WebSocket.  
🌐 Online Demo: [https://online-ppt-editor.vercel.app](https://online-ppt-editor.vercel.app)

---

## ✨ Features

- 🎨 Drag-and-drop slide editing with live preview
- 👥 Real-time multi-user collaboration (WebSocket)
- 🔄 State management with Redux Toolkit
- 💅 Modern UI with Tailwind CSS & NextUI
- 🧪 Unit & E2E testing (Vitest + Cypress)
- 🚀 CI/CD with GitHub + Vercel
- 🐳 Dockerized for production environments

---

## 🧭 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Vite
- **State**: Redux Toolkit
- **Real-time**: WebSocket via Socket.IO
- **CI/CD**: GitHub Actions + Vercel
- **Docker**: Lightweight containerized frontend

---

## 🚀 Getting Started

### 1. Development

```bash
npm install
npm run dev
```

Access at: [http://localhost:5173](http://localhost:5173)

---

### 2. Build & Preview

```bash
npm run build
npm run preview
```

---

## 🐳 Docker Support

### Build Docker Image

```bash
docker build -t ppt-frontend .
```

### Run Container

```bash
docker run -d -p 5173:80 ppt-frontend
```

### Dockerfile Example

```Dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## ⚙️ CI/CD with GitHub Actions + Vercel

- The frontend is deployed via [Vercel](https://vercel.com/).
- GitHub pushes to the `main` branch automatically trigger Vercel redeployment.
- No need to write your own workflow — Vercel handles it automatically after connecting your repo.

---

## 📂 Folder Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # Main page views
├── hooks/            # Custom React hooks
├── store/            # Redux Toolkit store & slices
└── assets/           # Static resources
```

---

## 📄 License

MIT License
