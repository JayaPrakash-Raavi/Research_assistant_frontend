# Deployment Guide: ResearchesAI

Follow these steps to deploy your split RAG application online for free or at zero initial cost.

---

## 1. Gather Configuration Parameters
Before starting, make sure you have these variables ready:
1.  **Qdrant Endpoint**: `https://0ba45383-f525-46fc-956b-b591c0ee064f.us-west-1-0.aws.cloud.qdrant.io`
2.  **Qdrant API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6MGE1NTcyM2QtOTUxZC00ZjNjLWI2ZGYtZDkyMGI3ZTUwZDkyIn0.EXA0tBqu5T8cTbESmMDATboK5qkDlK5FIBTPb_BWvjk`
3.  **Gemini API Key**: Your Google AI Studio API Key.
4.  **Backend Access Key**: A secure password/key you define (e.g., `testkey` or a custom string) to protect your indexing and list endpoints.

---

## 2. Step-by-Step: Deploy the Backend (on Render)
[Render](https://render.com/) offers a free tier for hosting containerized (Docker) applications.

1.  **Sign Up / Log In**: Go to [Render](https://render.com/) and sign up with your GitHub account.
2.  **Create a Web Service**:
    *   Click **New +** in the dashboard and select **Web Service**.
    *   Select **Build and deploy from a Git repository**.
    *   Connect your backend repository: `https://github.com/JayaPrakash-Raavi/Research_assistant_backend`.
3.  **Configure Service Settings**:
    *   **Name**: `research-assistant-backend` (or similar).
    *   **Region**: Select the region closest to you.
    *   **Branch**: `main`.
    *   **Runtime**: Select **Docker** (Render automatically detects your `Dockerfile`).
    *   **Instance Type**: Select **Free**.
4.  **Add Environment Variables**:
    *   Click on **Advanced** to expand settings, then click **Add Environment Variable** for each of these:
        *   `GEMINI_API_KEY` = `[Your Google Gemini Key]`
        *   `QDRANT_URL` = `https://0ba45383-f525-46fc-956b-b591c0ee064f.us-west-1-0.aws.cloud.qdrant.io`
        *   `QDRANT_API_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6MGE1NTcyM2QtOTUxZC00ZjNjLWI2ZGYtZDkyMGI3ZTUwZDkyIn0.EXA0tBqu5T8cTbESmMDATboK5qkDlK5FIBTPb_BWvjk`
        *   `JWT_SECRET_KEY` = `[A secure random string for JWT signature]`
        *   `DATABASE_URL` = `[Your Internal PostgreSQL Database URL]`
        *   *(Optional)* `FIREBASE_STORAGE_BUCKET` = `[your-project-id].appspot.com`
        *   *(Optional)* `FIREBASE_SERVICE_ACCOUNT_JSON` = `[Raw content of service account JSON file]`
        *   *(Optional)* `CELERY_BROKER_URL` = `[Your Redis Broker URL, e.g. redis://...]`
5.  **Deploy**: Click **Create Web Service**.
    *   Render will build the Docker container and start your FastAPI service.
    *   Once complete, note your public backend URL (e.g., `https://research-assistant-backend.onrender.com`).

---

## 3. Step-by-Step: Deploy the Frontend (on Vercel)
[Vercel](https://vercel.com/) is perfect for hosting Vite+React applications for free.

1.  **Sign Up / Log In**: Go to [Vercel](https://vercel.com/) and sign in using your GitHub account.
2.  **Import Project**:
    *   Click **Add New...** and select **Project**.
    *   Import your frontend repository: `https://github.com/JayaPrakash-Raavi/Research_assistant_frontend`.
3.  **Configure Build Options**:
    *   Vercel automatically detects a Vite application.
    *   **Framework Preset**: Select `Vite`.
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
    *   **Environment Variables** (Optional, for Zero-Config load):
        *   Add `VITE_API_URL` = `https://research-assistant-backend-ogdd.onrender.com` (your Render backend URL).
        *   Add `VITE_ACCESS_KEY` = `[your access key value, e.g., testkey]`.
4.  **Deploy**: Click **Deploy**.
    *   Vercel will compile the React bundle injecting these default environment variables and deploy the app statically.
    *   Once complete, your site will load and connect automatically to your Render backend without needing any manual configuration!

---

## 4. Dynamic Connection Overrides
Even if you configured your backend URL during the build stage, you can still manually configure or override settings in the browser at any time:
1.  Open your Vercel website URL.
2.  Expand **Security Settings** in the left panel.
3.  Enter a different Backend API URL or Access Key.
4.  Click the **Save Settings** (floppy disk) icon to override and save to your browser's local storage.
