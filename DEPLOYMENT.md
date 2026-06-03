# Deploying the Hostel Complaint System (free, permanent link)

The app is now packaged so Express serves the built React app — **one service, one
URL**. You'll host the code on Render and the database on TiDB Cloud (both free).

You need three free accounts: **GitHub**, **TiDB Cloud**, **Render**.

---

## 1. Put the code on GitHub

The repo is already committed locally. Create an empty repo on GitHub
(https://github.com/new — call it `hostel-complaint-system`, don't add a README),
then run these from the project folder:

```powershell
git remote add origin https://github.com/<your-username>/hostel-complaint-system.git
git branch -M main
git push -u origin main
```

---

## 2. Create the database (TiDB Cloud Serverless)

1. Sign up at https://tidbcloud.com and create a **Serverless** cluster (free).
2. Open the cluster → **Connect**. Choose connection type **General** / driver
   **Node.js**. You'll see: **Host**, **Port** (usually `4000`), **User**
   (looks like `xxxxxxxx.root`), and a **Password** (generate/copy it).
3. In the SQL editor (or the connect panel) create the database once:
   ```sql
   CREATE DATABASE hostel_complaints;
   ```
   (You can skip this — the app will try to create it on boot — but TiDB
   sometimes restricts that, so doing it here is safest.)

Keep the Host / Port / User / Password handy for the next step.

---

## 3. Deploy on Render

1. Sign up at https://render.com and connect your GitHub account.
2. **New → Blueprint**, pick your `hostel-complaint-system` repo. Render reads
   `render.yaml` and sets up the build automatically.
3. When prompted, fill in the environment variables (from TiDB):
   - `DB_HOST` → your TiDB host
   - `DB_PORT` → `4000`
   - `DB_USER` → your TiDB user (e.g. `xxxxxxxx.root`)
   - `DB_PASSWORD` → your TiDB password
   - `DB_NAME` → `hostel_complaints`
   - (`JWT_SECRET`, `DB_SSL`, `INIT_DB_ON_BOOT`, `NODE_ENV` are set for you.)
4. Click **Apply / Deploy**. First build takes a few minutes (it installs deps,
   builds the React app, then starts the server, which creates the tables and
   seeds the demo accounts).

When it finishes, Render gives you a URL like
`https://hostel-complaint-system.onrender.com` — **that's your shareable link.**

---

## Demo logins (seeded automatically)

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Admin   | admin@hostel.com     | admin123    |
| Staff   | staff1@hostel.com    | staff123    |
| Student | student@hostel.com   | student123  |

> **Change these passwords** (or remove the seed accounts) before sharing widely —
> they're public in this repo.

---

## Notes

- **Free tier sleeps:** Render's free service spins down after ~15 min idle, so the
  first visit after a pause takes ~30–50s to wake. It's free and permanent otherwise.
- **Updating the app:** push to `main` and Render redeploys automatically.
- **Local dev is unchanged:** `npm run dev` (frontend) + `npm start` (backend) with
  your local MySQL still works exactly as before.
