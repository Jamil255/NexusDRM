# Enterprise Digital Rights Management System (DRMS)

An enterprise-grade, production-ready Digital Rights Management System (DRMS) for videos, audio, documents, and text content. Designed as a highly scalable, microservice-ready Modular Monolith in **NestJS**.

---

## 🚀 Technology Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL 16
- **ORM**: TypeORM
- **Cache & Queue**: PgBoss (Postgres-native transactional queue)
- **Object Storage**: AWS S3 / MinIO
- **Authentication**: Passport JWT + Rotation Refresh Tokens
- **API Documentation**: Swagger / OpenAPI
- **Frontend Dashboard**: Vanilla HTML5, CSS3 (Glassmorphism), JavaScript (Chart.js integrations)

---

## 🔒 Key Security & DRM Features

1. **Envelope Content Encryption**: AES-256-GCM symmetric encryption for files at rest. Dynamic keys are wrapped/encrypted using a Master Encryption Key before being stored in the database.
2. **Access Control Policies**: Strict device caps, concurrent stream bounds, geolocation/IP white-listing, and validity schedules.
3. **Signed Streaming Cookies & URLs**: HMAC-SHA256 URL signatures with time-to-live restrictions.
4. **Dynamic Watermarking**: Overlaying timestamp & user identification (email hashes) onto streaming payloads (video drawing filters, canvas wrappers, and zero-width character steganography in text files).
5. **Auditing**: Full audit trials of content accesses and administrator modifications.
6. **Concurrent Session Control**: Session limits enforced dynamically on authentication tokens.

---

## 📂 Project Structure

```
src/
├── common/             # Shared entities, enums, DTOs, guards, interceptors, middleware, utils, and queue module
├── database/           # Seeds (admin-user, roles, permissions) and migrations
├── health/             # Readiness and liveness checks (Terminus)
├── modules/            # Bounded domains
│   ├── admin/          # Admin telemetries and user activation/suspension APIs
│   ├── audit/          # Operations and file access audit trails
│   ├── auth/           # Login, registration, token rotation, forgot passwords
│   ├── content/        # Metadata catalog, versioning, upload processing
│   ├── drm/            # File encryption and signed URL generators
│   ├── license/        # Key issuance, device activations, policy checks
│   ├── notification/   # Template compilers and email queue dispatchers
│   ├── organization/   # Multi-tenant tenant setups
│   ├── rbac/           # Role permission hierarchy mappings
│   ├── streaming/      # Route controllers for video, audio, document, and text
│   └── subscription/   # Quota monitoring & plan billing
├── main.ts             # Bootstrap entrypoint
dashboard/              # Vanilla dark-mode glassmorphism admin dashboard
k8s/                    # Kubernetes manifests (deployments, ingress, hpa, statefulset)
Dockerfile              # Multi-stage production container build
docker-compose.yml      # Local Postgres, MinIO, and app configuration
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v20+)
- Docker and Docker Compose

### 2. Quickstart with Docker Compose (Recommended)
You can run the entire environment (NestJS app, PostgreSQL, and MinIO storage) in containers:

```bash
# Start all containers
docker-compose up --build
```
This automatically boots:
- **NestJS DRMS Server** on `http://localhost:3000`
- **PostgreSQL Database** on port `5432`
- **MinIO Storage Console** on `http://localhost:9001` (login: `minioadmin` / `minioadmin`)

---

### 3. Local Development Mode

If you prefer running the NestJS server on your host machine:

#### Step A: Run Infrastructure Services
Start Postgres and MinIO in the background:
```bash
docker-compose up postgres minio minio-init -d
```

#### Step B: Install Dependencies
```bash
npm install
```

#### Step C: Seed Database
Populate permissions, hierarchy roles, and default Super Admin profile:
```bash
npm run seed
```

#### Step D: Start Server
```bash
npm run start:dev
```

- **Swagger Documentation**: `http://localhost:3000/api/docs`
- **Health Probes**: `http://localhost:3000/api/v1/health`

---

## 📊 Admin Dashboard UI

A complete, beautiful SaaS admin dashboard is available. 

Simply open the file in your browser:
📂 [dashboard/index.html](file:///c:/Users/jamil/Desktop/DRMS/dashboard/index.html)

### Included Screens:
1. **Analytics Dashboard**: User growth line graphs, content distributions, recent logs feed.
2. **User Management**: Suspensions, role filters, search.
3. **Content Catalog**: Resource previews, metadata view, catalog grid/list.
4. **License Manager**: Device binding counts, key revocations.
5. **Audit Trail**: Security events and access timestamps.
6. **Revenue Overview**: MRR trend line graphs and plan aggregations.
7. **System Health**: Circular gauges monitoring Node memory, CPU load, database pool limits.

---

## 🧪 Testing

```bash
# Run Unit Tests
npm run test

# Run End-to-End API Tests
npm run test:e2e
```

---

## 🔑 Default Seed Account

After running the database seeding script, use these credentials to log in:
- **Email**: `admin@drms.com`
- **Password**: `Admin@123456`
- **Assigned Role**: `super_admin`
