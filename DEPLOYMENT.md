# Deployment Guide for PharmaVerify

This project consists of two frontend applications (`manufacturer-portal` and `consumer-portal`) that share a common crypto library (`shared/crypto`). Because of this structure, deployment requires a specific setup to ensure the shared library is built before the applications.

We recommend using **Vercel** or **Netlify** as they are free, easy to use, and support this kind of workflow.

## Option 1: Vercel (Recommended)

You will need to create **two separate projects** in Vercel, one for each portal, but both connected to the same GitHub repository.

### 1. Deploy Manufacturer Portal

1.  **Push your code** to GitHub.
2.  Log in to [Vercel](https://vercel.com) and click **"Add New..."** -> **"Project"**.
3.  Import your `pharma-verify-v3` repository.
4.  **Configure Project:**
    *   **Project Name:** `pharma-verify-manufacturer` (or similar)
    *   **Framework Preset:** Vite
    *   **Root Directory:** Leave as `.` (root of the repo) - *Do NOT change this to the subdirectory yet.*
5.  **Build & Output Settings:**
    *   Expand the "Build and Output Settings" section.
    *   **Build Command:**
        ```bash
        cd frontend/shared/crypto && npm install --include=dev && npm run build && cd ../../manufacturer-portal && npm install --include=dev && npm run build
        ```
    *   **Output Directory:**
        ```bash
        frontend/manufacturer-portal/dist
        ```
    *   **Install Command:**
        ```bash
        echo "Skipping root install"
        ```
6.  **Environment Variables:**
    *   Add the following variables (copy values from your local `.env`):
        *   `VITE_BLOCKFROST_PROJECT_ID`: Your Blockfrost Project ID
        *   `VITE_CARDANO_NETWORK`: `testnet` (or `mainnet`)
7.  Click **Deploy**.

### 2. Deploy Consumer Portal

1.  Go back to the Vercel Dashboard and click **"Add New..."** -> **"Project"**.
2.  Import the **same** `pharma-verify-v3` repository again.
3.  **Configure Project:**
    *   **Project Name:** `pharma-verify-consumer`
    *   **Framework Preset:** Vite
    *   **Root Directory:** Leave as `.`
4.  **Build & Output Settings:**
    *   **Build Command:**
        ```bash
        cd frontend/shared/crypto && npm install --include=dev && npm run build && cd ../../consumer-portal && npm install --include=dev && npm run build
        ```
    *   **Output Directory:**
        ```bash
        frontend/consumer-portal/dist
        ```
    *   **Install Command:**
        ```bash
        echo "Skipping root install"
        ```
5.  **Environment Variables:**
    *   Add the same variables as above:
        *   `VITE_BLOCKFROST_PROJECT_ID`
        *   `VITE_CARDANO_NETWORK`
6.  Click **Deploy**.

---

## Option 2: Netlify

The process is similar to Vercel. You will create two sites from the same repository.

### 1. Deploy Manufacturer Portal

1.  Log in to [Netlify](https://netlify.com) and click **"Add new site"** -> **"Import an existing project"**.
2.  Connect to GitHub and select your repository.
3.  **Build Settings:**
    *   **Base directory:** (Leave empty or `.`)
    *   **Build command:**
        ```bash
        cd frontend/shared/crypto && npm install --include=dev && npm run build && cd ../../manufacturer-portal && npm install --include=dev && npm run build
        ```
    *   **Publish directory:** `frontend/manufacturer-portal/dist`
4.  **Environment Variables:**
    *   Click "Show advanced" or go to "Site settings" -> "Environment variables" after creation.
    *   Add `VITE_BLOCKFROST_PROJECT_ID` and `VITE_CARDANO_NETWORK`.
5.  Click **Deploy site**.

### 2. Deploy Consumer Portal

1.  Repeat the process for the second site.
2.  **Build Settings:**
    *   **Build command:**
        ```bash
        cd frontend/shared/crypto && npm install --include=dev && npm run build && cd ../../consumer-portal && npm install --include=dev && npm run build
        ```
    *   **Publish directory:** `frontend/consumer-portal/dist`
3.  Add Environment Variables.
4.  Deploy.

## Troubleshooting

*   **"Module not found" errors:** This usually means the `cd frontend/shared/crypto && npm install && npm run build` part of the command failed or didn't run. Ensure the path is correct relative to the root of your repo.
*   **Environment Variables:** If the app loads but can't connect to Cardano, double-check that your Blockfrost Project ID is set correctly in the deployment platform's settings.
