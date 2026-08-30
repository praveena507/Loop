# LOOP - Enterprise Landing & Gateway Portal

The **LOOP Landing Portal** is the centralized, single-entry-point gateway for the entire LOOP Complaint Resolution Platform. Built specifically for project evaluation and production access, it directs users and administrators to their respective isolated production deployments.

---

## 🎯 Architecture & Purpose

The hackathon/project evaluation submission requires **ONE single deployed URL**. This landing portal serves as that unified entry point:

```
                          ┌──────────────────────────┐
                          │    LOOP Landing Portal   │
                          │   (Single Gateway URL)   │
                          └─────────────┬────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
  ┌─────────────────────────────┐               ┌─────────────────────────────┐
  │         USER PORTAL         │               │   ADMIN & ANALYST PORTAL    │
  │     (Grievance Filers)      │               │   (Operations / Handlers)   │
  │  - Submit complaints        │               │  - Workload assignment      │
  │  - Verify OTP via email     │               │  - In-depth investigation   │
  │  - Live status tracking     │               │  - Department coordination  │
  │  - Feedback & satisfaction  │               │  - Resolution sign-off      │
  └─────────────────────────────┘               └─────────────────────────────┘
```

---

## ⚙️ Environment Configuration

The gateway uses environment variables to redirect to your deployed applications without hardcoded URLs.

### `.env` or `.env.production`

```env
# User Portal Deployment URL
VITE_USER_PORTAL_URL=https://your-user-portal.vercel.app

# Admin & Analyst Portal Deployment URL
VITE_ADMIN_ANALYST_PORTAL_URL=https://your-admin-portal.vercel.app
```

> **Local Development Fallback:**
> If testing locally on your machine, set:
> ```env
> VITE_USER_PORTAL_URL=http://localhost:3000
> VITE_ADMIN_ANALYST_PORTAL_URL=http://localhost:3002
> ```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd landing-portal
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```
The gateway will start on **`http://localhost:3005`**.

### 4. Build for Production
```bash
npm run build
```

---

## ☁️ Deployment to Vercel

1. **Push your repository** to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com) → **Add New Project**.
3. Select your repository (`Loop`).
4. Set **Root Directory** to `landing-portal`.
5. Under **Environment Variables**, add:
   - `VITE_USER_PORTAL_URL` = `https://<your-user-portal-deployment-url>`
   - `VITE_ADMIN_ANALYST_PORTAL_URL` = `https://<your-admin-portal-deployment-url>`
6. Click **Deploy**.

---

## 🔒 Security & Isolation Guarantee

- ❌ No direct Supabase connection or database credentials.
- ❌ No Gemini or EmailJS API keys.
- ❌ No backend secrets exposed.
- ❌ Zero modification or duplication of existing portals.
- ✅ Pure lightweight gateway with graceful validation for missing URLs.
