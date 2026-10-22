# SkillNova Phase 15: Notification Center & Learning Analytics Report

**Repository:** `ankit34545/SkillNova-Portal`  
**Base Commit:** `94f89e2`  
**Milestone:** Phase 15 (Notification Center & Learning Analytics)  
**Verification Date:** October 22, 2026  
**Status:** **PASSED & VERIFIED** (All 8 verification suites passing, production build green)

---

## 1. Executive Summary

Phase 15 extends SkillNova's production infrastructure with a persistent, database-backed **Notification Center** and genuine **Learning Analytics** across Student, Teacher, and Administrator roles.

Key achievements:
1. **Persistent Database-Backed Notifications:** Added the `Notification` model and `NotificationType` enum to PostgreSQL via Prisma, featuring unique deduplication keys (`dedupeKey`), unread badge tracking, mark-as-read/mark-all-as-read capabilities, and ownership isolation.
2. **Lifecycle Event Hooks:**
   - Emits `ASSIGNMENT_PUBLISHED` notifications to enrolled cohort students when an instructor publishes a new assignment.
   - Emits `SUBMISSION_GRADED` notifications to students when feedback and marks are released.
   - Emits `RESUBMISSION_REQUESTED` and `CLASS_SCHEDULE_CHANGE` notification types for classroom workflow events.
   - Scheduled deadline runner (`/api/notifications/reminders`) dispatches `DEADLINE_APPROACHING` alerts within 24 hours of due date idempotently.
3. **Genuine, Isolated Learning Analytics (`/api/analytics`):**
   - **Student:** Real enrolled course count, submitted vs pending assignments, attendance session count, upcoming deadlines, and actual average grade percentage (returned as `null` / `"Pending Grade"` when no graded deliverables exist—no fabricated 0% metrics).
   - **Teacher:** Scoped to instructor's assigned courses and cohorts, displaying actual distinct student counts, submission totals, graded counts, and real pending grading queues. Peer course data is strictly inaccessible.
   - **Admin:** System user totals by role, meeting counts, submission volumes, and database health metrics.
4. **Header & Dashboard UI Integration:** Connected live database notifications to the bell popover in [`AppHeader.tsx`](file:///c:/Users/Ankit/OneDrive/Desktop/skillnova-platform/src/components/layout/AppHeader.tsx), and updated student & teacher dashboards to display genuine database metrics without altering the dark SaaS aesthetic.
5. **Assignment Storage Durability & Security Audit:** Documented the security boundary of assignment uploads (`storage/assignments/`), confirming files are served exclusively through private authorized streaming endpoints (`/api/assignments/[id]/download`) and protected from public static exposition and path traversal attacks.

---

## 2. Database Schema Changes

Added to [`prisma/schema.prisma`](file:///c:/Users/Ankit/OneDrive/Desktop/skillnova-platform/prisma/schema.prisma):

```prisma
enum NotificationType {
  ASSIGNMENT_PUBLISHED
  DEADLINE_APPROACHING
  SUBMISSION_GRADED
  RESUBMISSION_REQUESTED
  CLASS_SCHEDULE_CHANGE
  SYSTEM_ANNOUNCEMENT
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  message   String
  link      String?
  isRead    Boolean          @default(false)
  dedupeKey String?          @unique
  metadata  Json?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  @@index([userId, isRead])
  @@index([userId, createdAt])
}
```

The database was synced to local PostgreSQL using `npx prisma db push` and `npx prisma generate`.

---

## 3. Scheduled Deadline Reminders & Time-Zone Behavior

- **Endpoint:** `POST /api/notifications/reminders`
- **Security:** Requires administrative credentials (`x-skillnova-role: admin`), teacher role, or a shared cron secret (`x-scheduler-secret: SCHEDULER_SECRET`). Direct student requests return `403 Forbidden`.
- **Timezone Calculations:**
  - Calculated in pure UTC timestamps using JavaScript standard `Date` objects (`dueAt.getTime() - now.getTime()`).
  - Idempotent deduplication keys: `deadline-reminder-${assignment.id}-${student.userId}`.
  - If a student already submitted their assignment, the reminder is skipped.
- **Scheduler Configuration Options:**
  - **Vercel Cron (`vercel.json`):**
    ```json
    {
      "crons": [
        {
          "path": "/api/notifications/reminders",
          "schedule": "0 * * * *"
        }
      ]
    }
    ```
  - **External Cron / Linux Crontab:**
    ```bash
    0 * * * * curl -X POST https://your-skillnova-domain.com/api/notifications/reminders -H "x-scheduler-secret: $SCHEDULER_SECRET"
    ```

---

## 4. Learning Analytics Architecture (`/api/analytics`)

| Role | Scope & Enforcement | Persisted Metrics Returned |
| :--- | :--- | :--- |
| **Student** | Scoped strictly to student's own `userId`. Peer inspection returns `403 Forbidden`. | Enrolled courses, total published assignments, submitted assignments, pending assignments, attendance sessions count, upcoming deadlines with submission state, average grade percentage (`null` if ungraded). |
| **Teacher** | Scoped to teacher's assigned courses and cohorts. Peer cohort queries return `403 Forbidden`. | Total distinct enrolled students, assigned course count, total submissions received, graded submissions count, pending grading queue, course-level breakdown. |
| **Admin** | Restricted to administrator session. Student access returns `403 Forbidden`. | Total user count, user distribution by role (`student`, `teacher`, `admin`), active live meetings, total assignments, total submissions, total attendances, active doubt counts. |

---

## 5. Storage Adapter & File Security Audit

- **Current Implementation:** Assignment uploads are written to local disk under `storage/assignments/` using unique SHA-256 / UUID naming keys.
- **Privacy & URL Protection:**
  - Files are strictly outside the `public/` directory and cannot be fetched via static URL.
  - Downloads are routed exclusively through `/api/assignments/[id]/download`, which inspects user credentials:
    - Instructors can download submissions for assignments they teach.
    - Students can download only their own submitted files. Peer downloads return `403 Forbidden`.
    - Path traversal attacks (`../`, `%2e%2e`) are sanitized and rejected.
- **Production Durability Recommendation:**
  - In clustered or containerized deployments (Kubernetes, AWS ECS, Vercel), local disk is ephemeral. Production deployments should transition to AWS S3, Cloudflare R2, or Google Cloud Storage using presigned URLs with short TTLs (15 minutes).

---

## 6. Verification & Test Suite Execution Results

All test suites were executed against the live PostgreSQL database and Next.js production server (`http://localhost:3000`):

| Test Suite | Script / Command | Status | Result Summary |
| :--- | :--- | :--- | :--- |
| **Prisma Schema Validation** | `npx prisma validate` | **PASS** | Valid schema, models properly linked |
| **TypeScript Static Check** | `npx tsc --noEmit` | **PASS** | 0 type errors |
| **ESLint Code Check** | `npm run lint` | **PASS** | 0 errors |
| **Next.js Production Build** | `npm run build` | **PASS** | 21 routes compiled, 0 dynamic errors |
| **Notification Center & Analytics** | `node scripts/test-notifications-analytics.js` | **PASS** | **23 passed, 0 failed** |
| **Assignment Management & Grading** | `node scripts/test-assignment-workflow.js` | **PASS** | **12 passed, 0 failed** |
| **Security & Negative Auth** | `node scripts/test-security-auth.js` | **PASS** | **18 passed, 0 failed** |
| **Live Classroom Synchronization** | `node scripts/test-classroom-sync.js` | **PASS** | **12 passed, 0 failed** |
| **Learning Workflow Regression** | `node scripts/test-learning-workflow.js` | **PASS** | **9 passed, 0 failed** |
| **Integration Suite** | `node scripts/test-integration.js` | **PASS** | **12 passed, 0 failed** |
| **PostgreSQL Backup & Restore Audit** | `node scripts/backup-restore-audit.js` | **PASS** | Dump, isolated restore, data verify clean |

**Total Automated Test Coverage:** 86 automated assertions passing across 8 test suites.

---

## 7. Current Git State & Commit Recommendation

- **Current Branch:** `main`
- **Modified Files:**
  - `prisma/schema.prisma`
  - `src/app/api/assignments/route.ts`
  - `src/app/api/assignments/[id]/grade/route.ts`
  - `src/app/dashboard/page.tsx`
  - `src/app/teacher/page.tsx`
  - `src/components/layout/AppHeader.tsx`
- **Added Files:**
  - `src/lib/notifications.ts`
  - `src/app/api/notifications/route.ts`
  - `src/app/api/notifications/reminders/route.ts`
  - `src/app/api/analytics/route.ts`
  - `scripts/test-notifications-analytics.js`
  - `phase15_notifications_analytics_report.md`
