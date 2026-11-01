# 🎓 Placement Prep Tracker

A comprehensive, responsive web application engineered for third-year B.Tech Computer Science & Engineering (CSE) students preparing for campus placements, Day 0/Day 1 company drives, product engineering rounds, and online assessments (OAs) — now powered by **Firebase Authentication** and **Cloud Firestore** on the free Firebase Spark plan.

---

## 🚀 How to Run the App

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   Add your Firebase Web App credentials to `.env`. (Or click "Explore in Demo / Preview Sandbox" on the login screen to run entirely offline without Firebase).

3. **Run Automated Test Suite:**
   ```bash
   npm test
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🔥 Firebase Setup & Architecture

The application uses the modular **Firebase Web SDK v11** and is designed to operate 100% within the **Firebase Spark (Free) plan** with zero billing requirements or Cloud Functions.

### 1. Configuration & Environment Variables

Firebase configuration is loaded through `src/firebase/config.ts`, which prioritizes client environment variables defined in `.env` (with graceful fallback to `firebase-applet-config.json`):

```bash
# Required Firebase Web Client credentials in .env
VITE_FIREBASE_PROJECT_ID="your-firebase-project-id"
VITE_FIREBASE_APP_ID="your-firebase-app-id"
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"

# Firestore Database ID: defaults to "(default)" unless you provisioned a named database
VITE_FIREBASE_DATABASE_ID="(default)"
```

### 2. Required Firebase Console Settings

Before testing with real student accounts in production, ensure these settings are configured in your [Firebase Console](https://console.firebase.google.com/):

1. **Authentication -> Sign-in method:**
   - **Google:** Enable Google provider (supports OAuth Web client).
   - **Email/Password:** Enable Email/Password provider. Ensure "Email link (passwordless sign-in)" is disabled unless requested.
2. **Authentication -> Settings -> Authorized domains:**
   - Add your development URL (`*.run.app` or custom domain) and `localhost`.
3. **Cloud Firestore:**
   - Firestore database is provisioned in Native Mode.
   - The security rules from `firestore.rules` are deployed, ensuring that each student can only read and write their own documents under `/users/{uid}`.

### 3. Student Data Isolation in Firestore

Each authenticated student's data is strictly isolated under their own UID:
- `/users/{uid}` — Candidate profile (Name, College, Degree/Branch, Graduation Year, Target CTC, Placement Drive Date, Daily Problem Goal).
- `/users/{uid}/dsaProblems/{problemId}` — Custom and tracked DSA practice problems, solved status, and revision logs.
- `/users/{uid}/tasks/{taskId}` — Personal study tasks and sprint deadlines.
- `/users/{uid}/applications/{appId}` — Personal company placement pipeline and OA dates.
- `/users/{uid}/coreCS/{subjectId}` — Completed topic IDs for Operating Systems, DBMS, Computer Networks, and OOP.
- `/users/{uid}/mocks/{mockId}` — Peer mock sessions, star ratings, and mentor feedback.
- `/users/{uid}/checklist/{itemId}` — ATS resume checklist progress.

---

## 🔒 Authentication Flow & Security States

The application enforces a strict security state machine before granting access to the placement workspace:

1. **`loading`**: Checks Firebase authentication and connection state.
2. **`signed_out`**: Displays login/registration screen supporting both Google sign-in and Email/Password. Also provides an isolated **"Explore in Demo Sandbox"** mode for testing without an account.
3. **`email_unverified`**: If registered with email/password, access to the dashboard is blocked until the student verifies their email address. Includes a **"Resend Verification Email"** action (with 60-second cooldown) and an **"I've Clicked the Link — Refresh Status"** button.
4. **`profile_incomplete`**: Google sign-in users and newly verified email users are guided to complete their student profile (Full Name, College, Branch, Graduation Year, Target CTC).
5. **`authenticated`**: Full access to the private workspace. All mutations persist in real-time to Cloud Firestore.
6. **`demo_mode`**: An isolated offline playground using mock demo records stored in `localStorage`. Never uploads sample records to Firestore or pollutes real student data.

---

## 🧪 Step-by-Step Testing Guide

### Test 1: Email/Password Registration & Verification Flow
1. Open the application. You will see the **Sign In / Create Account** screen.
2. Click **Create Account**, enter a test email (e.g. `teststudent@gmail.com`) and a 6+ character password.
3. Click **Create Student Account**.
4. You will see the **Verify Your Student Email** screen. The dashboard remains completely inaccessible.
5. In development, click **Resend Verification Email** to verify the cooldown timer and status feedback.
6. Once the email link is clicked, tap **"I've Clicked the Link — Refresh Status"**.

### Test 2: Google Sign-In & Profile Setup Flow
1. On the auth screen, tap **Continue with Google**.
2. Complete the Google authentication popup.
3. You will immediately be routed to the **Complete Your Student Profile** screen (Step 2 of 2).
4. Enter your College/University, Degree/Branch, and Target CTC. All required fields are validated.
5. Tap **Save & Open My Placement Workspace**.
6. The dashboard will load with a clean, fresh student workspace (`0` solved problems, `0` applications).

### Test 3: Real Data Persistence in Firestore
1. In the **DSA Tracker**, click **+ Add Problem** or **Load Standard SDE Sheet Template (20 Questions)**.
2. Toggle a problem to Solved or add revision notes.
3. In **Study Planner**, create a high-priority sprint task.
4. Refresh the page: your authenticated session resumes automatically and your personal records load from Firestore.

### Test 4: Demo / Preview Sandbox Mode
1. Click **Sign Out** or start signed out.
2. Click **Explore in Demo / Preview Sandbox**.
3. The UI loads with the sample candidate dataset (Aarav Sharma) with an amber **Demo Sandbox Mode** banner at the top.
4. Changes made in demo mode stay within browser `localStorage` and never touch Firestore.

---

## 📂 Project Structure

- **`firebase-blueprint.json`**: Intermediate Representation (IR) defining Firestore entities and subcollection paths.
- **`firestore.rules`**: Hardened security rules with default-deny, Attribute-Based Access Control (ABAC), and verified owner checks.
- **`src/firebase/config.ts`**: Centralized Firebase initialization module with environment variable support.
- **`src/firebase/errors.ts`**: Standardized Firestore error diagnostic handler (`FirestoreErrorInfo`).
- **`src/firebase/firestoreService.ts`**: Modular Firestore CRUD functions for user profiles, DSA sheets, planner tasks, job applications, core CS, and mocks.
- **`src/components/auth/AuthScreen.tsx`**: Sign-in and registration screen with Google OAuth and Email/Password.
- **`src/components/auth/EmailVerificationScreen.tsx`**: Blocked verification gate with status recheck and resend triggers.
- **`src/components/auth/ProfileSetupScreen.tsx`**: Candidate onboarding form validating required placement attributes.
- **`src/components/views/`**: All 8 placement prep tracker views (Dashboard, DSA SDE Sheet, Study Planner, Applications Pipeline, Core CS, Mock Interviews, ATS Resume Audit, Settings).
