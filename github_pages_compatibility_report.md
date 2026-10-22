# SkillNova: GitHub Pages Deployment & Server Architecture Audit Report

**Repository:** `ankit34545/SkillNova-Portal`  
**Current Branch:** `main` (commit `f3ae216`)  
**Audit Date:** October 22, 2026  
**Status:** **INCOMPATIBLE WITH FULL-STACK GITHUB PAGES — STATIC EXPORT FEASIBLE ONLY AS A SHOWCASE DECOUPLING**

---

## 1. Executive Summary

SkillNova is architected as a **full-stack, server-driven Next.js App Router application** tightly integrated with:
1. **Live PostgreSQL database (`Prisma`)**: user memberships, attendance tracking, notes, assignments, submissions, doubts, and notifications.
2. **Dynamic API Route Handlers (`/api/*`)**: authentication cookies, role verification, database transactions, file streaming, and scheduled cron jobs.
3. **LiveKit WebRTC Signaling**: server-side creation of signed JWT tokens (`livekit-server-sdk`) containing participant grants and identity hashes.
4. **Private Assignment File Storage**: disk/stream-based file uploads and RBAC-authorized streaming downloads.

**GitHub Pages is an unmanaged static file web server.** It cannot run Node.js processes, execute serverless functions, connect to PostgreSQL, process multipart uploads, or sign LiveKit tokens.

---

## 2. Server-Dependent Features vs Static Feasibility Matrix

| Route / Feature | Nature | Requires Server / DB? | Works on GitHub Pages? | Technical Reason |
| :--- | :--- | :--- | :--- | :--- |
| **Landing Page (`/`)** | Static / Client | No (Pure React/Three.js) | **YES** | Can be exported to HTML/CSS/JS with 3D Canvas assets intact. |
| **Curricula Catalog (`/courses`)** | Client Interactive | No (Static catalog data) | **YES** | Static catalog renders in browser. |
| **Class Schedule View (`/classes`)** | Client Interactive | Partial (Static metadata) | **YES (Display only)** | Static calendar/schedule displays, but live joining/RSVP requires server. |
| **Student Dashboard (`/dashboard`)** | Server-backed Client | **YES** (Prisma DB, `/api/analytics`, `/api/notifications`) | **NO** | Relies on dynamic user session cookies and live analytics queries. |
| **Teacher Workspace (`/teacher`)** | Server-backed Client | **YES** (Prisma DB, cohort management, grading API) | **NO** | Cannot submit assignments, grade submissions, or fetch cohort doubts without Node.js. |
| **Admin Console (`/admin`)** | Server-backed Client | **YES** (Prisma DB, user stats, system health) | **NO** | Requires `/api/admin/metrics` server execution. |
| **Live Classroom (`/meet`, `/meet/[roomId]`)** | Real-time WebRTC | **YES** (`/api/meet/join`, LiveKit JWT signing, Whiteboard sync) | **NO** | LiveKit client tokens cannot be signed without `LIVEKIT_API_SECRET` on a server. |
| **All API Routes (`/api/**`)** | Node.js Serverless | **YES** (PostgreSQL, JWT, File I/O) | **NO (100% Broken)** | GitHub Pages ignores API routes (returns 404). |
| **Assignment Uploads & Downloads** | File System / Stream | **YES** (Disk I/O, path validation, auth) | **NO** | No persistent storage or file handlers on GitHub Pages. |
| **Notification Center & Reminders** | PostgreSQL & Cron | **YES** (`Notification` model, scheduler runner) | **NO** | No persistent database or scheduled cron execution. |

---

## 3. Secret & Privacy Audit (Pre-Public Check)

A repository-wide inspection was performed on all tracked files:
- **`git status --ignored`**:
  - `.env` and `.env.local` are **strictly ignored** by `.gitignore` and **NOT** tracked in Git history.
  - `storage/` (containing student assignment uploads) is **strictly ignored**.
  - `skillnova_backup.sql` (database dump) is **strictly ignored**.
- **Tracked configuration (`.env.example`)**:
  - Contains only sanitized placeholder strings (`postgres:your_secure_password`, `replace_with_a_secure_random_base64_secret_key_in_production`).
- **Git Commit Logs:** No private keys or database passwords were committed into the Git tree.

---

## 4. Why Full-Stack Static Export (`output: 'export'`) Breaks the Main App

Next.js `output: 'export'` generates static HTML/CSS/JS in `out/`. If applied to the existing repository:
1. All dynamic route handlers (`/api/meet/[roomId]`, `/api/assignments`, `/api/analytics`, etc.) trigger compilation errors during `next build` because they consume dynamic headers/cookies (`NextRequest.cookies`) or database drivers.
2. Pages utilizing dynamic server parameters or database fetching will fail the build unless replaced by static mock data.
3. Replacing server calls with mock data would degrade and break the authenticated multi-user learning platform developed across Phases 10–16.

---

## 5. Architectural Recommendations & Safest Next Steps

### Option A: Standard Full-Stack Production Hosting (Recommended for SkillNova)
Because SkillNova is a complete live learning portal with PostgreSQL, WebRTC, and private file downloads, it is natively built for Node.js container or serverless hosting:
- **Vercel / Railway / Render / AWS ECS**:
  - Connects directly to the existing `main` branch.
  - Full support for Next.js App Router, dynamic API routes, and cookies.
  - Direct connection to managed PostgreSQL (Supabase, Neon, AWS RDS).
  - WebRTC LiveKit server token generation works out-of-the-box.

### Option B: Decoupled GitHub Pages Static Showcase (If GitHub Pages is strictly required)
If you specifically want a **public demo/showcase landing site on GitHub Pages** without altering the full-stack portal:
1. **Preserve `main` Branch**: Keep `main` untouched as the full-stack production application.
2. **Create a Decoupled Branch (`gh-pages` or `static-showcase`)**:
   - Contains only the static presentation layer (Landing Page, 3D Canvas, Curriculum Showcase, Interactive Demo Cards).
   - Links "Launch Portal" buttons to the hosted full-stack domain or a backend URL.
3. **Automate via GitHub Actions**:
   - Set up `.github/workflows/deploy-pages.yml` running on the `static-showcase` branch to build and deploy static assets directly to GitHub Pages.

---

## 6. Decision & Required User Authorization
Per instructions, no automated deployments or branch modifications were made without explicit approval.

**Recommended Action:**
Deploy the full-stack app to **Vercel, Railway, or a Node.js VPS** to retain database, assignments, and LiveKit classrooms. If you prefer a static showcase on GitHub Pages, we can initialize a dedicated `static-showcase` branch.
