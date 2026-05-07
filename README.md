# Finora Frontend

> Enterprise Financial Intelligence — React SPA for AI-powered annual report analysis.

Built with **React 19** · **Vite 7** · **TanStack Router** · **Tailwind CSS v4** · **shadcn/ui**.

---

## Features

- **Cinematic Landing Page** — Animated gradient orbs, light streaks, typewriter hero heading, stat counters
- **Auth** — Split-panel login/register with animated typewriter branding and JWT-based sessions
- **Upload** — Drag-and-drop PDF staging (up to 3 files, 25MB each) with animated entrance effects and live stat counters
- **AI Dashboard** — Financial health gauge, key metrics with trend-based color gradients, auto-generated charts, revenue breakdown, executive summary, strategic focus, and risk analysis
- **Comparison View** — Side-by-side multi-company metric analysis with AI-generated comparative insights
- **AI Chat** — Streaming SSE chat with RAG context from uploaded PDFs and full dashboard context
- **History** — Browse and reload past report sessions with delete support
- **Dark / Light Theme** — System-aware theme toggle with full light-mode support

---

## Local Development

### Prerequisites

- Node.js 20+
- The [Finora backend](https://github.com/technosrijan/finora-backend) running on `localhost:8000`

### Setup

```bash
git clone https://github.com/technosrijan/finora-frontend
cd finora-frontend

npm install

# No .env needed for local dev
npm run dev
```

Open `http://localhost:5173`.

API calls to `/api/*` are automatically proxied to `http://localhost:8000` via the Vite dev server — no CORS issues, no `.env` required for local development.

---

## Environment Variables

Only required for **production builds**. Leave unset (or omit the `.env` file entirely) for local dev.

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Production only | Backend URL, e.g. `https://api.your-domain.com` |
| `VITE_API_PROXY_TARGET` | Never (optional) | Override the local dev proxy target (default: `http://localhost:8000`) |

> **Note:** `VITE_API_BASE_URL` is **baked into the static bundle at build time**, not read at runtime. It must be set in your environment before running `npm run build`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR and API proxy |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint check |

---

## Production Build

```bash
# Set your backend URL, then build
VITE_API_BASE_URL=https://api.your-domain.com npm run build

# The output is a static site in dist/
# Serve it with any static host: nginx, Caddy, Vercel, Netlify, S3+CloudFront, etc.
npx serve -s dist -l 8080
```

The `dist/` folder is a fully self-contained static site. Deploy it anywhere that can serve static files.

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── AuthPage.tsx           # Split-panel login/register with JWT sessions
│   │   ├── ChatSection.tsx        # SSE streaming chat with markdown rendering
│   │   ├── ComparisonView.tsx     # Side-by-side company comparison + AI insights
│   │   ├── HealthGauge.tsx        # Animated financial health score gauge
│   │   ├── HistoryMenu.tsx        # Past report sets dropdown with reload/delete
│   │   ├── KeyRatiosStrip.tsx     # Horizontal ratio cards with assessment colors
│   │   ├── Overview.tsx           # Main dashboard layout (scorecards, charts, risks)
│   │   ├── ProgressIndicator.tsx  # Animated pipeline progress bar
│   │   ├── Scorecards.tsx         # Key metric scorecards with trend gradients
│   │   ├── Sidebar.tsx            # Desktop + mobile navigation sidebar
│   │   ├── TacticalUI.tsx         # Summary + strategic focus + risk analysis panels
│   │   └── UploadSection.tsx      # Drag-and-drop PDF staging area
│   │
│   ├── landing/
│   │   └── LandingPage.tsx        # Cinematic hero with orbs, streaks, typewriter
│   │
│   ├── theme/
│   │   ├── ThemeProvider.tsx      # Dark/light mode context provider
│   │   └── ThemeToggle.tsx        # Theme switcher button
│   │
│   └── ui/
│       ├── BackgroundGraphics.tsx # Animated gradient orbs and light streaks
│       ├── TypewriterText.tsx     # Typewriter effect component
│       ├── button.tsx             # shadcn/ui Button
│       ├── card.tsx               # shadcn/ui Card
│       ├── dropdown-menu.tsx      # shadcn/ui DropdownMenu
│       ├── sheet.tsx              # shadcn/ui Sheet (mobile sidebar)
│       ├── sonner.tsx             # shadcn/ui Toaster
│       ├── textarea.tsx           # shadcn/ui Textarea
│       └── tooltip.tsx            # shadcn/ui Tooltip
│
├── lib/
│   ├── api.ts                     # All backend API calls (auth, reports, chat)
│   ├── types.ts                   # Shared TypeScript types (mirrors backend schemas)
│   └── utils.ts                   # cn() helper for Tailwind class merging
│
├── routes/
│   ├── __root.tsx                 # Root layout (meta tags, Toaster)
│   └── index.tsx                  # Main app page with auth gate, sidebar, sections
│
├── router.tsx                     # TanStack Router config with error boundary
├── main.tsx                       # App entry point (React 19 + StrictMode)
└── styles.css                     # Global Tailwind CSS, theme tokens, animations
```

---

## Design System

- **Dark-first** with full light-mode support via `.light` CSS class
- **Glassmorphism** — translucent cards with `backdrop-blur` throughout
- **Animated backgrounds** — Drifting gradient orbs, light streaks, soft grid, vignette
- **Color-coded metrics** — Scorecards and ratio strips use emerald/rose/blue gradients based on trend and assessment
- **Hover micro-interactions** — Lift, shimmer sweep, border glow, and icon scale on all interactive cards
- **Typography** — Inter font family with gradient text utilities (`text-gradient-hero`, `text-gradient-primary`)

---

## Tech Stack

- **React 19** — UI framework
- **Vite 7** — Build tool and dev server
- **TanStack Router** — Type-safe file-based routing
- **Tailwind CSS v4** — Utility-first styling with CSS-first config
- **shadcn/ui** — Component library (Radix UI + Tailwind)
- **Recharts** — Chart components (bar, line, pie, area)
- **react-markdown + remark-gfm** — Chat message rendering
- **lucide-react** — Icon library
- **sonner** — Toast notifications

---

## License

MIT
