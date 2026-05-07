# CVMatch — AI-Powered CV Analyzer

Upload your CV. Paste the job posting. Get a compatibility score in seconds.

**Live demo → [cvanalizer-vert.vercel.app](https://cvanalizer-vert.vercel.app)**

---

## What it does

CVMatch compares your CV against a job description using Gemini 2.0 Flash and returns:

- **Score 0–100** — overall compatibility
- **Matched skills** — what you already have
- **Skill gaps** — what the job asks for that you're missing
- **3 concrete suggestions** — specific actions to improve your score
- **Analysis history** — every past analysis saved to your account
- **Personal dashboard** — score evolution chart + top missing skills across all your applications

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| AI | Google Gemini 2.0 Flash |
| Auth | NextAuth v5 — Google OAuth + Magic Link (Resend) |
| Database | PostgreSQL via Prisma |
| File storage | Vercel Blob |
| PDF parsing | pdf-parse |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Deploy | Vercel |

## How it works

1. Sign in with Google or magic link
2. Upload your CV as PDF
3. Paste the job title, company, and job description
4. Gemini 2.0 Flash analyzes the match
5. Results are saved to your history and reflected in the dashboard

## Data model

```
User
  └── Analysis[]
        ├── score (0–100)
        ├── cvUrl (Vercel Blob)
        ├── jobTitle / company
        ├── matchSkills (JSON)
        ├── missingSkills (JSON)
        ├── suggestions (JSON)
        └── summary
```

## Run locally

```bash
git clone https://github.com/elfic-ticio/cvanalizer
cd cvanalizer
npm install
```

Create `.env.local`:

```env
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
GEMINI_API_KEY=
BLOB_READ_WRITE_TOKEN=
```

```bash
npx prisma migrate dev
npm run dev
```

## License

MIT
