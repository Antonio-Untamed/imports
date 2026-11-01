# Deploying Bandari Motors

## Why the Cloudflare "Upload and deploy" box rejects this project

That uploader is for **static sites only** (plain HTML/CSS/JS). Bandari Motors is a
fullstack Next.js application:

- 15 API routes (`/api/orders`, `/api/track`, `/api/admin/*`, `/api/media/*` …)
- Server-rendered pages that query PostgreSQL on every request
- An admin console that writes vehicles, images and callback logs to the database

It needs a **Node.js runtime** and a **PostgreSQL database**. There is no static
build to upload — `npm run build` produces a server, not a folder of HTML.

Never upload the raw source folder anywhere. Push it to a Git repository and let
the host build it. A `.gitignore` is included so `node_modules`, `.next` and `.env`
stay out of the repo.

---

## 1. Get a PostgreSQL database (2 minutes)

Any of these give you a free `DATABASE_URL`:

| Provider | Notes |
| --- | --- |
| [Neon](https://neon.tech) | Serverless Postgres, generous free tier, works everywhere |
| [Supabase](https://supabase.com) | Use the **"Transaction pooler"** connection string |
| Railway / Render | Create a Postgres service next to the app |

Copy the connection string. It looks like
`postgresql://user:pass@host/db?sslmode=require`.

## 2. Environment variables (set these on the host)

```
DATABASE_URL = postgresql://…        # from step 1
ADMIN_PIN    = a-long-secret-phrase  # unlocks /admin — change from the demo PIN
```

The database seeds itself with the demo inventory and orders on the first
request, but the tables must exist first. Run this once against your production
database:

```bash
DATABASE_URL="postgresql://…" npx drizzle-kit push
```

---

## 3. Pick a host

### Option A — Vercel (recommended, ~5 minutes)

1. Push this folder to GitHub / GitLab.
2. [vercel.com/new](https://vercel.com/new) → import the repo. Vercel detects Next.js.
3. Add `DATABASE_URL` and `ADMIN_PIN` under **Environment Variables**.
4. Deploy. Every `git push` redeploys.

### Option B — Railway or Render (one container, Postgres alongside)

1. New project → **Deploy from GitHub repo**.
2. Add a **PostgreSQL** service; copy its internal URL into `DATABASE_URL`.
3. Build command `npm run build`, start command `npm run start`.
4. Set `ADMIN_PIN`. Deploy.

### Option C — Cloudflare Workers (verified end-to-end in this repo)

#### Read your build log: this is why it failed

```
13:56:40.988  Executing user deploy command: npx wrangler deploy
13:56:48.352  npm warn exec The following package was not found and will be installed: wrangler@4.156.0
13:56:59.984  ✘ [ERROR] Could not detect a directory containing static files
```

Three facts from those lines:

1. **`Installing` took 174 ms and wrangler had to be downloaded by `npx`.** No `npm ci`
   ran, so `node_modules` never existed. There is also **no `Building` stage** in that
   run — the build command is set to *None*.
2. **Nothing was built**, so `.open-next/worker.js` did not exist.
3. Wrangler found **no Wrangler config in the checkout**, so it fell back to guessing a
   static site and failed. That error message *is* the "no config found" error.

So the fix is two settings plus making sure `wrangler.jsonc`, `open-next.config.ts` and
the `package.json` scripts are actually in the GitHub repo you connected.

#### Settings → Build, set exactly this

| Setting | Value |
| --- | --- |
| Framework preset | **None** (do not pick Next.js — Cloudflare's preset runs `next build`, which cannot deploy to Workers) |
| Build command | `npm run cf:build` |
| Deploy command | `npm run cf:deploy` |
| Root directory | `/` |

`npm run cf:build` = `opennextjs-cloudflare build` → emits `.open-next/worker.js`.
`npm run cf:deploy` = a pre-flight check, then `wrangler deploy`. If anything is
missing it now fails with the actual cause instead of the static-files message:

```
✘ Cloudflare deploy pre-flight failed:
  • Worker entry ".open-next/worker.js" is missing. The OpenNext build did not run…
```

> Do **not** set the build command to `npm run build`. `build` must stay `next build`
> because the OpenNext adapter calls it internally — pointing it back at OpenNext
> creates an infinite build loop (I hit exactly that while verifying).

#### Database — Workers cannot use raw TCP Postgres

1. Cloudflare dashboard → **Storage & databases → Hyperdrive → Create**, pointing at
   your Neon / Supabase / Railway database.
2. Worker → **Settings → Variables and secrets**, add:
   - `HYPERDRIVE_CONNECTION_STRING` — the string Hyperdrive shows (mark as secret)
   - `ADMIN_PIN` — your admin PIN, not the demo one

`src/db/index.ts` reads `DATABASE_URL`, `HYPERDRIVE_CONNECTION_STRING` or
`CLOUDFLARE_HYPERDRIVE_URL`, and connects lazily so the build never crashes when the
secret is absent (that was the second cause of the earlier 5-second failure).

Then create the tables once, from your machine:

```bash
DATABASE_URL="postgresql://…" npm run db:push
```

#### Verified in this repo

```
npm run cf:build                  → Worker saved in .open-next/worker.js 🚀
node scripts/check-cloudflare-config.mjs → ✔ pre-flight passed
npx wrangler deploy --dry-run     → 6.4 MB (1.3 MB gzip), ASSETS binding OK
```

#### Deploy from your machine instead (skips dashboard CI entirely)

```bash
npm ci
npx wrangler login
DATABASE_URL="postgresql://…" npm run db:push
npm run cf:deploy
```

#### Or let GitHub Actions do it

`.github/workflows/deploy-cloudflare.yml` is included. Add these repository secrets
(**Settings → Secrets and variables → Actions**):

| Secret | Where to get it |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | My Profile → API Tokens → *Edit Cloudflare Workers* template |
| `CLOUDFLARE_ACCOUNT_ID` | Workers dashboard, right-hand sidebar |
| `DATABASE_URL` | Your Postgres connection string |
| `ADMIN_PIN` | A secret PIN for `/admin` |

Push to `main` and it installs, creates tables, builds the Worker and deploys.

---

## 4. After the first deploy

- Open `/admin`, enter your `ADMIN_PIN`, and start uploading units. Photos are
  stored in Postgres (table `media`) so they persist across redeploys.
- Callback requests from the site open WhatsApp on **+254 799 007 101** and are
  logged under **Callback requests** in the admin console.
- Visit `/api/health` — it should return `{"ok":true}` once the database is reachable.

## Local development

```bash
cp .env.example .env     # fill in DATABASE_URL
npm install
npx drizzle-kit push
npm run dev
```
