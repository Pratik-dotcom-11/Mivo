# Mivo — Google OAuth & Supabase Authentication Setup Guide

This guide details the exact manual configuration steps required to connect Google OAuth with Supabase Authentication for **Mivo** (`Your voice. Your ideas.`).

---

## Architecture Overview

```
[ User clicks "Continue with Google" ]
                 │
                 ▼
[ Supabase Auth (Client) ] ──▶ supabase.auth.signInWithOAuth({ provider: 'google' })
                 │
                 ▼
[ Google Cloud Consent Screen ] ── (User authenticates & approves scopes: openid, email, profile)
                 │
                 ▼
[ Supabase Auth Server Callback ] ── https://<project-ref>.supabase.co/auth/v1/callback
                 │
                 ▼
[ Mivo Application Redirect ] ── http://localhost:5173/#app
                 │
                 ▼
[ Session Restored & User Profile Populated (Name, Email, Google Avatar) ]
```

---

## Step 1: Find Your Supabase Callback URL

1. Go to your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your Mivo project.
3. In the left navigation, click on **Authentication** -> **Providers**.
4. Click on **Google** to expand its configuration.
5. Note the value shown under **Callback URL (for OAuth)**:
   ```text
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   *(Keep this tab open; you will paste this URL into Google Cloud Console in Step 3).*

---

## Step 2: Configure Google Cloud OAuth Consent Screen

1. Open the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Select an existing project or create a new one named **`Mivo`**.
3. In the navigation menu (top-left hamburger), go to **APIs & Services** -> **OAuth consent screen**.
4. Choose **User Type**:
   - Select **External** (allows any Google account to sign in).
   - Click **Create**.
5. Fill in the **App Information**:
   - **App name**: `Mivo`
   - **User support email**: Select your email address.
   - **App logo** *(optional)*: Upload Mivo’s logo if desired.
   - **Application home page**: `http://localhost:5173` (or your production domain).
   - **Application privacy policy link**: `http://localhost:5173` (or your domain).
   - **Application terms of service link**: `http://localhost:5173` (or your domain).
   - **Developer contact email**: Enter your email address.
   - Click **Save and Continue**.
6. **Scopes**:
   - Click **Add or Remove Scopes**.
   - Select the following 3 standard OpenID scopes:
     - `.../auth/userinfo.email` (`email`)
     - `.../auth/userinfo.profile` (`profile`)
     - `openid`
   - Click **Update** -> **Save and Continue**.
7. **Test Users** *(While in "Testing" mode)*:
   - Add your Google account email as a test user so you can log in during development.
   - Click **Save and Continue** -> **Back to Dashboard**.

---

## Step 3: Create Google OAuth 2.0 Client Credentials

1. In the Google Cloud Console, navigate to **APIs & Services** -> **Credentials**.
2. Click **+ Create Credentials** at the top -> select **OAuth client ID**.
3. Set **Application type** to: **Web application**.
4. **Name**: `Mivo Web Client`
5. **Authorized JavaScript origins**:
   Add the following origins:
   ```text
   https://<your-project-ref>.supabase.co
   http://localhost:5173
   http://127.0.0.1:5173
   ```
   *(Also add your custom production domain if deployed on Vercel/Netlify).*
6. **Authorized redirect URIs**:
   Add your exact Supabase callback URL from Step 1:
   ```text
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   *(Important: Do NOT put `http://localhost:5173` here; Google redirects to Supabase's callback handler first).*
7. Click **Create**.
8. A modal will appear showing:
   - **Client ID** (e.g., `1234567890-abcdefg.apps.googleusercontent.com`)
   - **Client Secret** (e.g., `GOCSPX-abc123xyz...`)
   - Copy both values.

---

## Step 4: Configure Google Provider in Supabase

1. Return to your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Navigate to **Authentication** -> **Providers** -> **Google**.
3. Toggle **Enable Sign in with Google** to **ON**.
4. Paste your credentials:
   - **Client ID (for OAuth)**: Paste the Google Client ID.
   - **Client Secret (for OAuth)**: Paste the Google Client Secret.
5. Click **Save**.

---

## Step 5: Configure Supabase Redirect URLs

Supabase needs to know which URLs are allowed to receive users back after authentication.

1. In Supabase Dashboard, navigate to **Authentication** -> **URL Configuration**.
2. **Site URL**:
   Set this to your application URL:
   ```text
   http://localhost:5173
   ```
3. **Redirect URLs**:
   Click **Add URL** and add:
   ```text
   http://localhost:5173/**
   http://localhost:5173/#app
   http://127.0.0.1:5173/**
   ```
   *(When deploying to production, add `https://your-domain.vercel.app/**` here).*
4. Click **Save**.

---

## Step 6: Connect Mivo Frontend Environment

In your Mivo project directory, create a `.env` file (if you have not already):

```bash
# .env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-publishable-key>
```

> **Security Note:** Never put the `SUPABASE_SERVICE_ROLE_KEY` into frontend `.env` files. Mivo only requires the publishable Anon key for browser authentication.

---

## Step 7: Verification & Testing Checklist

Once the manual configuration is in place, verify the end-to-end flow:

1. **Sign-In Flow**:
   - Open `http://localhost:5173`.
   - Click **Start for Free** or **Sign In**.
   - On the Mivo authentication screen, click **Continue with Google**.
   - Verify that Google's account selection modal appears.
2. **Redirect & Session Restoration**:
   - Select your test Google account.
   - Google redirects to Supabase, which redirects to `http://localhost:5173/#app`.
   - Confirm you land on the Mivo Notes Studio.
3. **User Profile Display**:
   - Look at the top-right header and bottom-left sidebar.
   - Verify your **Google profile picture** is displayed.
   - Verify your **Google account name** and **Google email** are shown.
   - Notice the subtle Google badge in the sidebar profile card.
4. **Page Refresh Test**:
   - Refresh the page while on `#app`.
   - Confirm that Mivo does not flicker or log you out; the session is restored instantly from `localStorage`.
5. **Protected Route Test**:
   - Click the **Sign Out** button (door icon).
   - Manually type `http://localhost:5173/#app` in your browser URL bar.
   - Verify that Mivo automatically intercepts the unauthenticated request and presents the Sign-in page.
