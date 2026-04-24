# Creative Innovation Index (CII) — SaaS

A professional Next.js 15 SaaS application for psychometric creative and innovation assessment, powered by Anthropic Claude AI.

---

## 🗂 Folder Structure

```
creative-innovation-index/
├── app/                    # Next.js App Router
│   ├── api/                # Server-side API routes
│   │   ├── score/          # AI scoring endpoint
│   │   ├── sessions/       # Session management
│   │   ├── organizations/  # Org CRUD
│   │   └── results/        # Results fetching
│   ├── globals.css         # Global styles + animations
│   ├── layout.tsx          # Root layout + metadata
│   └── page.tsx            # Main app entry (client router)
│
├── components/             # React components
│   ├── ui/                 # Primitives: Button, Card, LiveBackground
│   ├── landing/            # LandingScreen
│   ├── assessment/         # QuestionScreen, SectionIntro, AnalyzingScreen
│   ├── dashboard/          # IndividualResults + 5 panels
│   ├── org/                # OrgDashboard, OrgAdminScreen, OrgEmployeeJoin
│   └── forms/              # UserDetailsForm
│
├── constants/              # App-wide constants (no logic)
│   ├── theme.ts            # Design tokens (C object)
│   ├── questions.ts        # All 25 questions + illustrations
│   ├── sections.ts         # 5 assessment sections
│   ├── profiles.ts         # CII profiles + getProfile()
│   ├── dimensions.ts       # DIM object + AVG_BENCHMARK
│   └── industries.ts       # Dropdown options
│
├── hooks/                  # Custom React hooks
│   ├── useAssessment.ts    # Full assessment state machine
│   └── useOrganization.ts  # Org data fetching + computed stats
│
├── lib/                    # Business logic (server + shared)
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   ├── server.ts       # Server Supabase client (SSR)
│   │   └── raw.ts          # Raw REST API helper
│   ├── db/                 # Database helpers
│   │   ├── users.ts
│   │   ├── sessions.ts
│   │   ├── results.ts
│   │   ├── organizations.ts
│   │   └── exports.ts
│   ├── ai/
│   │   └── scorer.ts       # AI scoring with fallback
│   ├── pdf/
│   │   └── generateReport.ts  # Org PDF report (jsPDF)
│   └── utils/
│       ├── scoring.ts      # computeScore algorithm
│       ├── validation.ts   # Phone + email validators
│       └── helpers.ts      # genId, clamp, sleep
│
└── types/                  # TypeScript interfaces
    ├── assessment.ts
    ├── user.ts
    ├── organization.ts
    └── results.ts
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

Copy `.env.local` and fill in your keys:

```bash
# Already pre-filled in .env.local:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Add your Anthropic key:
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗 Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | Routing, SSR, API routes |
| Database | Supabase (PostgreSQL) | Users, sessions, results |
| AI | Anthropic Claude | Open-answer scoring |
| Styling | Inline CSS + globals.css | Design system |
| Charts | Recharts | Radar, line, bar charts |
| PDF | jsPDF (CDN) | Org report generation |
| State | React hooks | Assessment flow |

---

## 📊 Database Tables

- `cii_users` — Respondent profiles
- `cii_sessions` — Assessment sessions
- `cii_answers` — Individual question answers
- `cii_results` — Final scores + AI insights
- `cii_organizations` — Org accounts
- `cii_dashboard_exports` — PNG export records

---

## 🔑 Key Patterns

### Client vs Server
- `lib/supabase/client.ts` → use in Client Components
- `lib/supabase/server.ts` → use in API routes / Server Components
- `lib/supabase/raw.ts`   → legacy REST helper (client-side)

### State Machine
All assessment state lives in `hooks/useAssessment.ts`. The `app/page.tsx` is a thin router that reads from this hook.

### AI Scoring
`lib/ai/scorer.ts` calls `/api/score` → `app/api/score/route.ts` → Anthropic Claude.
Falls back gracefully if API is unavailable.
