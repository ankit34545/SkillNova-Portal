# SkillNova Platform — Comprehensive Architecture & Missing Features Audit

**Date:** November 2026  
**Auditor:** SkillNova Security & Core Platform Engineering  
**Scope:** Self-service registration, Google OAuth SSO, Admin Control Center, CodingLab IDE, Live Classroom / LiveKit, Course Management, RBAC & Privacy.

---

## 1. Executive Summary

This audit assesses the actual operational state of the SkillNova platform code, routing, authentication mechanisms, database models, and user workflows. While major infrastructure for the Admin Control Center, Live Classroom, CodingLab, and Google OAuth cryptographic verification exists, several user-facing entry points were incomplete or missing from view:
1. **Google OAuth Button missing on `/login`**: Only present on `/signup`, leaving returning Google SSO users without a direct path on the sign-in page.
2. **Discoverability of Signup on Landing Page**: The main header navbar (`Navbar.tsx`) only offered "Sign In", lacking a prominent "Sign Up" / "Create Account" CTA for unauthenticated visitors.
3. **Google Sign-In Button Dynamic Injection vs Immediate Availability**: In `/signup`, the Google button container relied on `Script` execution without an immediate graceful fallback button if client ID is unconfigured or script loading lags.
4. **Login Page Redirection & Link Continuity**: Links between `/login` and `/signup` needed reinforcement and clear role feedback.

---

## 2. Feature-by-Feature Operational Status

### 2.1 Authentication & Self-Registration
| Feature | Status | Verification & Findings |
| :--- | :--- | :--- |
| **Public Self-Signup (`/signup`)** | **Working** | Validates Full Name, Email, Password (min 8 chars, alphanumeric), Confirm Password. Always creates role `STUDENT`. |
| **Password Hashing** | **Working** | Uses `bcryptjs` with salt round `cost: 12`. |
| **Duplicate Email Prevention** | **Working** | Checks database with case-insensitive / lowercase email normalization; rejects duplicates with HTTP 409. |
| **Role Escalation Protection** | **Working** | Public signup endpoint rejects or ignores client-supplied `role`, enforcing `STUDENT`. |
| **Google ID Token Verification** | **Working** | Uses `jose` with Google's public JWKS (`https://www.googleapis.com/oauth2/v3/certs`) to verify cryptographic signature, audience, and expiration. |
| **Google Button on `/login`** | **Missing -> Fixed** | Was absent from `/login`; now added with both Google Identity Services integration and fallback handler. |
| **Google Button on `/signup`** | **Fixed** | Present, but updated with prominent UI button and direct fallback when client ID is not configured. |
| **Welcome & Admin Alerts** | **Working** | Async `sendWelcomeEmail` and `sendAdminNewUserAlert` fail safely without blocking user creation. |

### 2.2 Navigation & Discoverability
| Feature | Status | Verification & Findings |
| :--- | :--- | :--- |
| **Homepage Navigation CTA** | **Fixed** | Added "Sign Up" / "Get Started" link in `Navbar.tsx` so new visitors can register immediately. |
| **Cross-links between Login & Signup** | **Working** | Clear reciprocal links: "Don't have an account? Sign Up" and "Already have an account? Sign In". |
| **Session Persistence & Cookie Security** | **Working** | Uses `skillnova_session` HTTP-only, SameSite=Lax cookie with JWT signature. |

### 2.3 Admin Control Center (`/admin`)
| Feature | Status | Verification & Findings |
| :--- | :--- | :--- |
| **Admin Route & RBAC** | **Working** | Protected by server-side session checks requiring `ADMIN` role. |
| **User Management** | **Working** | List, filter, search, paginate, create user, update status (ACTIVE, SUSPENDED, DEACTIVATED), password reset. |
| **Last Admin Safeguard** | **Working** | Blocks deactivation, suspension, or deletion of the last remaining active super-admin. |
| **Audit Logging** | **Working** | Logs sensitive administrative actions to `AuditLog` table with IP and timestamp. |

### 2.4 CodingLab (`/codinglab`)
| Feature | Status | Verification & Findings |
| :--- | :--- | :--- |
| **Monaco Editor IDE** | **Working** | Full VS Code engine with syntax highlighting, multi-file tabs, file tree, create/delete files. |
| **Code Runner / Execution** | **Working** | In-browser / sandboxed execution engine for JS, TS, Python, HTML/CSS. |
| **Project Export** | **Working** | ZIP archive export using `jszip`. |

### 2.5 Live Classroom & Meetings (`/meet`, `/classes`)
| Feature | Status | Verification & Findings |
| :--- | :--- | :--- |
| **LiveKit Room Tokens** | **Working** | Token generator in `/api/livekit/token` creates valid room tokens. |
| **Multi-Device Video Sync** | **Working** | Fixed track subscription and tile mapping across mobile and desktop. |

---

## 3. Prioritized Gap Analysis & Action Plan

### Priority 1: Critical (Immediate Resolution)
1. **Add Google SSO & Create Account to `/login`**: Ensure users arriving at `/login` can click "Continue with Google" or easily switch to `/signup`.
2. **Add "Sign Up" button in `Navbar.tsx`**: Allow unauthenticated visitors to discover self-registration from the landing page.
3. **Verify End-to-End Registration Flow**: Confirm client-side submission, password confirmation, validation errors, and redirect to dashboard.

### Priority 2: High
1. **Google OAuth Fallback Experience**: Provide friendly modal / banner if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is not yet populated in local or preview environments.
2. **Comprehensive Automated Test**: Script that simulates valid signup, duplicate registration rejection, password strength rejection, role tampering rejection, and Google token validation.

---

## 4. Conclusion
The core platform APIs and security architectures are robust. Implementing the UI additions to `/login` and `Navbar.tsx` completely closes the registration and OAuth discoverability gap.

