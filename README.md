# NexusDRM — Enterprise Digital Rights Management System

NexusDRM is an enterprise-grade, production-ready Digital Rights Management System (DRMS) for secure video, audio, document, and text delivery. Built as a highly scalable **NestJS** backend modular monolith coupled with a stunning **Vite + React + Tailwind CSS v3** dashboard console using a premium emerald green glassmorphism design system.

---

## 🚀 Technology Stack

### Backend Monolith
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL 16
- **ORM**: TypeORM
- **Cache & Queue**: PgBoss (Postgres-native transactional job queue)
- **Object Storage**: Cloudinary (Media Vault, transcoders, and page image conversions)
- **Authentication**: Passport JWT + Rotate Refresh Token flow
- **API Documentation**: Swagger / OpenAPI

### Frontend Console
- **Framework**: Vite + React (TypeScript) + React Router v6
- **Styling**: Tailwind CSS v3 + CSS custom glassmorphism layers
- **Icons**: Lucide React
- **HTTP Client**: Axios with automatic JWT attach and token auto-refresh interceptors

---

## 🔒 Key Security & Anti-Piracy Features

1. **Secure Document Page Transforms**: Documents are uploaded under the isolated `docs/` folder prefix as `image` resource types on Cloudinary. When previewed, the backend generates a 10-page array of temporal, cryptographically pre-signed authenticated image URLs, preventing client-side PDF downloads or direct URL sniffing.
2. **Secure Video/Audio Previews**: Embedded players load signed temporal streams natively. Viewports automatically blur and pause if the window loses focus (such as opening DevTools, switching tabs, or triggering screenshot utilities).
3. **Adaptive Bitrate Multi-DRM (Production)**: Supports Google Widevine, Apple FairPlay, and Microsoft PlayReady integrations. Decryption keys are verified inside the browser's hardware CDM (Content Decryption Module), forcing OS-level capture engines (e.g. OBS, Snipping Tool, Zoom screen share) to display only a solid black box.
4. **Dynamic Identity Watermarking**: Displays a semi-transparent, slanted watermark showing the logged-in user's email address and IP address across documents, videos, and audio layouts to trace physical camera leaks.
5. **Session Leasing Limits**: Enforces session limits, token rotation, and lease tracking (TTL and IP locking) to prevent account sharing.
6. **Administrator Bypass**: Content creators and administrators with bypass privileges (`admin:access` or `content:write`) can preview media assets without requiring manual license key registry entries.

---

## 📂 Project Structure

```
DRMS/
├── src/                         # NestJS Backend Code
│   ├── common/                  # Shared filters, interceptors, queues, and utilities
│   ├── database/                # Migrations, seed scripts, and configuration
│   ├── modules/                 # Modular Domain Monolith
│   │   ├── auth/                # JWT auth, refresh token rotation, login
│   │   ├── user/                # Profile management and CRUD
│   │   ├── rbac/                # Permissions, roles, and hierarchy controls
│   │   ├── organization/        # Multi-tenant organization layouts
│   │   ├── content/             # Asset uploads, processors, and versions
│   │   ├── drm/                 # AES-256 encryptions, signed URL generators
│   │   ├── license/             # License issuers, constraints, device count locks
│   │   ├── streaming/           # Video, audio, document, and text stream gateways
│   │   └── admin/               # System metrics, user activation/suspension
│   └── main.ts                  # Bootstrap NestJS gateway
│
├── dashboard/                   # React Frontend Dashboard
│   ├── src/
│   │   ├── api/client.ts        # Axios client with JWT refresh interceptors
│   │   ├── context/AuthContext.ts# Authenticated user session state manager
│   │   ├── components/          # Reusable glassmorphic UI components
│   │   └── pages/               # Screen page layouts (Dashboard, Landing, Vault, etc.)
│   ├── tailwind.config.js       # Emerald/green custom dark theme configuration
│   └── vercel.json              # Vercel SPA rewrite routing rules
│
├── test_new_document.js         # E2E document upload and signed page conversion test
├── Dockerfile                   # Multi-stage Docker production configuration
├── docker-compose.yml           # Database and infrastructure setup
└── README.md                    # Main documentation file
```

---

## 🛠️ Getting Started

### 1. Host Setup & Infrastructure
Start the PostgreSQL database service in the background:
```bash
docker-compose up postgres -d
```

### 2. Backend Installation & Start
From the project root:

```bash
# Install NPM dependencies
npm install

# Run database seeds (admin users, roles, and permissions)
npm run seed

# Build the application
npm run build

# Start the NestJS backend in development watch mode
npm run start:dev
```
- **Backend API Gateway**: `http://localhost:3000`
- **Swagger Documentation API docs**: `http://localhost:3000/api/docs`
- **Health Verification Probe**: `http://localhost:3000/api/v1/health`

### 3. Frontend Installation & Start
Navigate to the `dashboard` directory:

```bash
cd dashboard

# Install frontend dependencies
npm install

# Start the Vite React development server
npm run dev
```
- **Frontend Dashboard Console**: `http://localhost:5173`

---

## 🧪 E2E Verification Testing

A verification script [`test_new_document.js`](file:///c:/Users/jamil/Desktop/DRMS/test_new_document.js) is provided in the root directory to upload a valid minimal PDF buffer, generate signed page URLs, and verify Cloudinary access statuses:

```bash
node test_new_document.js
```

**Expected Success Output:**
```
Logging in as super admin...
Login successful.
Uploading new PDF document...
Uploaded document successfully. ID: bfc71410-eebd-4730-b0d3-f0c3c53c3528
Waiting for background processing (thumbnail generation)...
Fetching secure document preview config...
Verifying Cloudinary URL request status...
Cloudinary request status: 200 (SUCCESS)
SUCCESS: Document pages load perfectly!
```

---

## 🔑 Default Credentials
Use these pre-seeded credentials to log in during local development:
- **Email**: `admin@drms.com`
- **Password**: `Admin@123456`
- **Role**: `super_admin`

---

## 🚀 Production Deployment Guide

### Frontend (Deploying to Vercel)
1. Push the repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com/), select **"Add New Project"** and import the repository.
3. Configure settings:
   - **Root Directory**: `dashboard` (Vite preset is auto-detected)
   - **Environment Variables**: Add `VITE_API_BASE_URL` pointing to the public address of your deployed NestJS backend API gateway (e.g. `https://api.nexusdrm.com/api/v1`).
4. Click **Deploy**. Vercel uses [`vercel.json`](file:///c:/Users/jamil/Desktop/DRMS/dashboard/vercel.json) rewrite configurations to manage routing.

### Backend (Deploying to Railway/Render/VPS)
1. Provision a production PostgreSQL instance.
2. Host the NestJS project root directory on a persistent Node.js deployment host (like Railway or Render).
3. Bind your database connection URL to `.env` variables (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`).
4. Add environment variables for Cloudinary configuration (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
5. Set start command to `node dist/main.js` after compilation.
