# DilDaily
**growwithkma.com** · Built with Astro + Vercel

## Local dev
```bash
npm install
npm run dev   # → http://localhost:4321
```

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "KMA site"
gh repo create kma-site --private --push
```

### 2. Import in Vercel
vercel.com → New Project → Import repo → Framework: Astro → Deploy

### 3. Environment variables (Vercel → Settings → Env Vars)
| Variable      | Value                          |
|---------------|-------------------------------|
| SMTP_HOST     | smtp.resend.com                |
| SMTP_PORT     | 465                            |
| SMTP_USER     | resend                         |
| SMTP_PASS     | re_xxxx (your Resend API key) |
| CONTACT_EMAIL | partnerships@growwithkma.com   |
| FROM_EMAIL    | noreply@growwithkma.com (must be verified in Resend; use onboarding@resend.dev for testing) |

Getting Resend API key: resend.com → sign up free → Domains → add growwithkma.com → API Keys → Create

### 4. Custom domain
Vercel → Settings → Domains → add growwithkma.com
DNS at registrar:
  A record:     @   → 76.76.21.21
  CNAME record: www → cname.vercel-dns.com

## Updating content
- Numbers/stats   → src/pages/index.astro + work.astro
- Services list   → src/pages/services.astro (services array)
- CEO bio         → src/pages/about.astro
- Social links    → src/pages/contact.astro
- DilDaily posts  → src/data/posts.ts (add new blog links at the top)
- WhatsApp number → search 2348064797494 to update everywhere
