# Academic ERP & Student Management Portal

A modern, serverless Academic ERP built with **Next.js (App Router)**, **NextAuth (Auth.js v5)**, and **PostgreSQL (Vercel Postgres / Neon)**, ready for 1-click deployment on **Vercel**.

---

## Key Features

* **Google OAuth 2.0 Login**: Passwordless, fast authentication using students' existing Google/Gmail accounts.
* **Strict Student Whitelist (Accepted List)**:
  * Administrators can add student Gmail accounts, student IDs, and department details.
  * When a student signs in via Google, the system checks whether their Gmail is in the database.
  * If enrolled: Access granted to the Student Portal.
  * If NOT enrolled: Access is denied and user is directed to the registration instructions page.
* **Administrator Console (`/admin`)**:
  * Enroll new student Gmail IDs individually.
  * Search, filter by department, and view enrolled students.
  * Instant status toggle (`ACTIVE` / `SUSPENDED`).
  * Remove students from the accepted list.
  * Broadcast college announcements and notices.
* **Student Portal (`/student`)**:
  * Attendance tracker with exam eligibility indicators.
  * Academic marks, credits, and grades breakdown.
  * College notice board and department updates.
* **Vercel-Optimized**: Designed for zero-config deployment on Vercel with serverless PostgreSQL. Includes automatic table creation and fallback data store for local development.

---

## Architecture Flow

```
1. Admin enters student Gmail in /admin -> Saved in `allowed_students` PostgreSQL table
2. Student clicks "Sign in with Google" -> Authenticates with Google OAuth
3. NextAuth `signIn` callback queries database:
   ├── Admin Gmail?  ──> Granted ADMIN role -> Redirect to /admin
   ├── In Whitelist? ──> Granted STUDENT role -> Redirect to /student
   └── Not in list?  ──> Denied -> Redirect to /unauthorized (Contact Admin)
```

---

## Deploying to Vercel

### Step 1: Push Code to GitHub
Push this repository to your GitHub account (`https://github.com/sureshmagnolia/academic-erp`).

### Step 2: Import Project in Vercel
1. Log in to [Vercel](https://vercel.com/).
2. Click **"Add New..."** > **Project**.
3. Select `academic-erp` from your GitHub repositories and click **Import**.

### Step 3: Add Database (Vercel Postgres / Neon)
1. In your Vercel Project dashboard, go to the **Storage** tab.
2. Click **Create Database** > Choose **Postgres** (or Neon from Marketplace).
3. Click **Connect to Project**. Vercel will automatically inject `POSTGRES_URL` into your environment variables!

### Step 4: Configure Environment Variables
In Vercel > **Settings** > **Environment Variables**, add:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `AUTH_SECRET` | 32+ character random secret | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | OAuth Client ID from Google Cloud | `xxx.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | OAuth Client Secret from Google Cloud | `GOCSPX-xxxx` |
| `ADMIN_EMAILS` | Comma-separated admin Gmails | `sureshmagnolia@gmail.com` |

*(Note: `POSTGRES_URL` is already injected when you connect Vercel Postgres).*

### Step 5: Update Google Cloud Redirect URI
In [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services** > **Credentials** > Your Web Client:
* Under **Authorized redirect URIs**, add:
  ```
  https://your-project-name.vercel.app/api/auth/callback/google
  ```
* Under **Audience**, click **Publish App** to allow any student Gmail to log in.

---

## Local Development

1. **Clone & Install**:
   ```bash
   git clone https://github.com/sureshmagnolia/academic-erp.git
   cd academic-erp
   npm install
   ```

2. **Configure Local Environment**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(The app includes a built-in local store so you can start testing immediately without needing a local PostgreSQL server).*

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build Check**:
   ```bash
   npm run build
   ```

---

## License
MIT License. Created for College Academic Management & ERP deployments.
