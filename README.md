# John Amos Mubiru — personal site + real backend

This is your site plus a small Node/Express server that protects the
"Personal" dashboard with a real login (not just a front-end check).

## How it works

- Your passcode is never stored in the HTML/JS. It's hashed (salted,
  using Node's built-in `scrypt`) and checked on the server.
- Logging in gives your browser a signed, `httpOnly` session cookie —
  JavaScript on the page can't read or fake it.
- Your personal notes live in `data/personal.json` on the server, and
  are only ever sent to the browser after the server verifies your
  session. You can edit them right on the page and hit "Save changes."

## 1. Install dependencies

You'll need [Node.js](https://nodejs.org) installed (version 18+).

```bash
npm install
```

## 2. Set your passcode

This creates a `.env` file with your hashed passcode and a random
session secret — pick any passcode you like:

```bash
npm run set-password -- YourNewPasscode
```

You can re-run this any time to change your passcode.

## 3. Run it

```bash
npm start
```

Then open **http://localhost:3000** in your browser. Your site loads
normally, and the "Personal" section now checks with the server.

## 4. Editing your content

- Public sections (About My Life, Forex Trading, gallery, social
  links): edit `public/index.html` directly, same as before.
- Personal dashboard fields: no need to edit HTML anymore — log in on
  the page, type into the fields, and click "Save changes." They're
  stored in `data/personal.json`.
- Gallery & profile photos: images are embedded directly in `public/index.html` as generated placeholders — swap them for real photos by pasting a data URI or filename as described in the comments right above `galleryImages` in the file.

## 5. Putting this online (so others can visit it)

Netlify (from earlier) only serves static files — it can't run this Express server. Use Render or Railway instead, both of which run Node servers and have free tiers.

**First: push this whole folder to a GitHub repo** (same steps you already used for the static site) — create a repo, upload everything except `node_modules` and `.env` (they're already excluded via `.gitignore`).

### Option A — Render
1. Go to **https://render.com** and sign up (free).
2. Click **New → Web Service**.
3. Connect your GitHub account and pick this repo.
4. Settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Under **Environment**, add these variables (copy the values from your local `.env` file):
   - `JWT_SECRET`
   - `ADMIN_PASSWORD_HASH`
   - `NODE_ENV` = `production`
6. Click **Create Web Service**. Render builds and gives you a live link like `https://john-amos-mubiru.onrender.com`.

### Option B — Railway
1. Go to **https://railway.app** and sign up (free).
2. Click **New Project → Deploy from GitHub repo**, pick this repo.
3. Railway auto-detects Node and runs `npm start`.
4. Go to your service's **Variables** tab and add:
   - `JWT_SECRET`
   - `ADMIN_PASSWORD_HASH`
   - `NODE_ENV` = `production`
5. Under **Settings → Networking**, click **Generate Domain** to get a public link.

Either way: whenever you push new commits to GitHub, the host automatically redeploys — no manual re-upload needed.

## Notes on security

- This is real server-side auth — much stronger than a front-end-only
  passcode — but it's still a single shared passcode, not per-user
  accounts. Fine for a personal site; don't store highly sensitive data
  (IDs, banking info) in the personal notes.
- Keep your `.env` file private. Anyone with `ADMIN_PASSWORD_HASH` and
  `JWT_SECRET` could forge access.
