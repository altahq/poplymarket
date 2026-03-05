# 🎯 Poplymarket — Alta's March 2026 Prediction Market

## Deploy in ~15 minutes

---

### Step 1 — Create Supabase Database (free)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `poplymarket`, choose a region close to your team
3. Once created, go to **SQL Editor** → paste the contents of `supabase-schema.sql` → **Run**
4. Go to **Settings → API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `anon public` key → this is your `SUPABASE_ANON_KEY`

---

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "🎯 Poplymarket launch"
git remote add origin https://github.com/YOUR_ORG/poplymarket.git
git push -u origin main
```

---

### Step 3 — Deploy on Vercel (free)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
2. In **Environment Variables**, add:
   ```
   REACT_APP_SUPABASE_URL = https://YOUR_PROJECT.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = YOUR_ANON_KEY
   ```
3. Click **Deploy** — Vercel builds and hosts automatically

---

### Step 4 — Connect poplymarket.altahq.com (Cloudflare)

1. In Vercel → your project → **Settings → Domains** → Add `poplymarket.altahq.com`
2. Vercel will show you a CNAME record to add
3. In **Cloudflare** → altahq.com → **DNS** → Add record:
   - Type: `CNAME`
   - Name: `poplymarket`
   - Target: `cname.vercel-dns.com`
   - Proxy: **DNS only** (grey cloud, not orange) ← important for Vercel SSL
4. Wait 1-2 minutes → done ✅

---

### How it works
- Every employee enters their name → gets **1,000 Alta tokens**
- 26 markets across 8 departments from March 2026 goals
- One bet per market (YES or NO)
- Odds update live as more people bet
- Review at every weekly All-Hands

### Future ideas
- End-of-March resolution (correct bets pay out multiplied tokens)
- Department-specific views for All-Hands slides
- Admin panel to mark markets as resolved ✅ / ❌
