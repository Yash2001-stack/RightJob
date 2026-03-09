# JobRight Setup Guide

## Step 1: Install Node.js

Node.js is required. Install it via one of these methods:

**Option A — winget (Windows, recommended):**
```
winget install OpenJS.NodeJS.LTS
```
Then restart your terminal.

**Option B — Download from nodejs.org:**
https://nodejs.org/en/download (choose LTS)

Verify: `node --version` should show v18+

---

## Step 2: Fill in environment variables

Copy the example file:
```
copy .env.local.example .env.local
```

Then open `.env.local` and fill in:

### Anthropic API Key
1. Go to https://platform.anthropic.com → API Keys → Create key
2. Set `ANTHROPIC_API_KEY=sk-ant-...`

### Firebase (free tier — no credit card needed)
1. Go to https://console.firebase.google.com
2. Create a new project
3. Click "Firestore Database" → "Create database" → Start in **test mode**
4. Go to Project Settings → Your apps → Add web app
5. Copy the config values into your `.env.local`

---

## Step 3: Install dependencies & start

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Notes

- Playwright browsers are installed automatically via `postinstall` script
- The scraper runs in headless Chromium — no browser window needed
- Sessions are stored in localStorage (no login required)
- All data is stored in Firestore under a UUID session ID
- Firestore free tier (Spark plan) supports up to 50K reads/day which is plenty

---

## Troubleshooting

**"ANTHROPIC_API_KEY not set"** → Check your `.env.local` file exists and has the key

**"Firebase permission denied"** → Make sure Firestore is in test mode (or add proper rules)

**Scraper returns 0 jobs** → Some career pages block headless browsers; this is normal for some companies. You'll still get results from the others.

**Build fails with pdf-parse error** → Run `npm install` again, sometimes native modules need a clean install
