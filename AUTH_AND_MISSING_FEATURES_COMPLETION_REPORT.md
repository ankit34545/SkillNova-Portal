# SkillNova — Registration, Google OAuth & Missing Features Audit Completion Report

**Date:** November 2026  
**Status:** Completed & Empirically Verified  
**Branch:** `main`

---

## 1. Executive Summary & Root Causes Identified

During the audit of the SkillNova platform, the following critical user-facing issues were identified and addressed:
1. **Google OAuth Button Omission on `/login`**: While `/signup` contained Google SSO elements, `/login` had no Google Sign-In button, preventing returning users who signed up via Google from logging in directly through the sign-in page.
2. **Missing Self-Registration Discovery on Landing Page**: In `src/components/landing/Navbar.tsx`, only a "Sign In" button was displayed. Unauthenticated visitors had no visible "Sign Up" or "Create Account" CTA on the homepage header.
3. **Google Sign-In UX Fallback**: Added explicit manual fallback button logic with clear messaging when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is not yet configured, preventing silent failures.
4. **Registration Validation & Privacy Hardening**: Re-verified that `/api/auth/signup` strictly enforces:
   - Client-provided roles are ignored; users are strictly assigned the `STUDENT` role.
   - Passwords hashed using `bcrypt` cost factor 12.
   - Duplicates rejected with HTTP 409 and lowercase-normalized email lookup.
   - Google ID tokens verified against Google's public JWKS endpoints.

---

## 2. Key Files Modified & Created

| File | Change Description |
| :--- | :--- |
| `MISSING_FEATURES_AUDIT.md` | Comprehensive status audit of existing vs missing features across the platform. |
| `src/app/login/page.tsx` | Added visible "Continue with Google" button, Google Identity Services script integration, OAuth callback handling, and clear link to `/signup`. |
| `src/components/landing/Navbar.tsx` | Added prominent "Sign Up" button in desktop navbar and mobile drawer alongside "Sign In". |
| `scripts/unit-verify-auth.js` | Direct unit test suite validating `bcrypt` cost 12 hashing and `jose` Google JWKS signature enforcement. |
| `scripts/test-registration-oauth-journey.js` | Automated end-to-end regression test suite for registration, duplicate rejection, and role escalation prevention. |

---

## 3. Verification & Test Results

### 3.1 Next.js Production Build
- Command: `npx next build`
- Result: **Compiled successfully**
- Generated 23/23 routes without TypeScript or syntax errors, including:
  - `○ /login` (3.81 kB)
  - `○ /signup` (4.06 kB)
  - `○ /admin` (7.39 kB)
  - `○ /codinglab` (43.8 kB)
  - `ƒ /api/auth/signup`
  - `ƒ /api/auth/google`

### 3.2 Cryptographic & Security Verification
- Command: `node scripts/unit-verify-auth.js`
- Results:
  - `Bcrypt cost 12 check`: **PASSED** (salt version `$2b$12$`)
  - `Bcrypt comparison match`: **PASSED**
  - `Forged Google token rejection`: **PASSED** (Error: `JWS Protected Header is invalid`)
  - `Empty Google token rejection`: **PASSED** (Error: `Missing Google ID token`)

---

## 4. Production Configuration Checklist (Vercel & Google Cloud)

To enable live Google OAuth sign-ins in production:
1. **Google Cloud Console**:
   - Go to **APIs & Services > Credentials**.
   - Configure **Authorized JavaScript origins**:
     - `https://skillnova-platform.vercel.app` (or your custom domain)
   - Configure **Authorized redirect URIs**:
     - `https://skillnova-platform.vercel.app/login`
     - `https://skillnova-platform.vercel.app/signup`
2. **Vercel Project Environment Variables**:
   - `GOOGLE_CLIENT_ID`: Google OAuth 2.0 Web Client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth 2.0 Client Secret
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Same Client ID (accessible client-side for GIS button)
   - `SESSION_SECRET`: 64+ char random hex string for signing JWT session cookies
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: Transactional mailer configuration
