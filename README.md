# 🛡️ NexusNode AI: Privacy-First RAG Intelligence

NexusNode AI is a privacy-first Retrieval-Augmented Generation platform designed for secure document intelligence in production-style environments. The project focuses on trust boundaries, redaction-first data handling, and a defense-ready architecture for final year presentation and deployment scenarios.

## 🏗️ Architecture

NexusNode AI runs on a 100% JavaScript stack:

- Frontend: Next.js 16 with React App Router workflows.
- Backend: Node.js with Express APIs for authentication and RAG pipelines.
- Database: MongoDB Atlas for user, session, and document metadata.

The interface follows the Symmetry Protocol design approach, tuned for high-density dashboard viewing with a 1240x464 optimization target. This gives the project a predictable visual rhythm for live demonstrations and high-focus operator tasks.

## 🔐 Core Feature: Privacy Guardian

Privacy Guardian is the primary system differentiator.

- Every sensitive document flow is designed to pass through a PII-awareness layer before vectorization.
- Redaction-first processing prevents direct leakage of personally identifiable information into embedding workflows.
- The architecture intentionally treats privacy controls as a mandatory pipeline stage, not an optional add-on.

## 🛡️ Security Model

NexusNode AI uses layered protections across authentication and transport:

- HttpOnly Cookies for JWT session tokens, reducing browser-side token exposure.
- Bcrypt hashing for password storage.
- Nodemailer OTP verification for email-based identity validation.

Additional hardening includes CORS boundary controls and production-oriented backend behavior for cloud runtime stability.

## ⚙️ Setup Instructions

### 1) Backend Setup

Move into the backend service and run:

```bash
cd backend
npm install
npm run dev
```

### 2) Frontend Setup

In a separate terminal, move into the frontend service and run:

```bash
cd nexusfrontend
npm install
npm run dev
```

Expected local endpoints:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🧭 Repository Structure

```text
backend/        Express API, auth, and RAG services
nexusfrontend/  Next.js frontend and dashboard UI
README_AGENT.md Internal engineering protocol and sprint memory
```

## 📌 Final Note

This public README intentionally excludes sensitive values. Do not place real credentials, secrets, or production URIs in repository markdown files.
