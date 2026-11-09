# FolioCraft — The Editorial Portfolio Builder Platform

FolioCraft is a production-oriented, multi-tenant SaaS platform that empowers creatives, software developers, architects, and independent practitioners to design and publish bespoke personal portfolio websites without writing code.

---

## 1. Architectural Highlights

- **Decoupled Content & Presentation**: A unified data model (`PortfolioData`) is completely independent of visual themes. Users can switch between any of the 6 archetypes at any time without losing or retyping their projects, experience, or biography.
- **True Multi-Tenant Edge Architecture**: A single deployed Next.js application dynamically serves all user portfolios. Requests to `username.yourdomain.com` (or local `/portfolio/[username]` / `/p/[username]`) are intercepted and resolved at the edge via Next.js Middleware.
- **Split-Screen Real-Time Visual Studio**: An in-memory draft engine updates the live preview canvas synchronously (60 FPS) with multi-device viewport simulation (Desktop, Tablet, Mobile), undo/redo history, and debounced auto-saving.
- **Atomic Slug Reservation**: Username slugs are reserved via a dedicated `/usernames/{slug}` collection ensuring zero race conditions or collisions.
- **SEO & Performance First**: Server-side rendered public portfolios with automatic OpenGraph tags, Twitter Cards, canonical links, and Schema.org `Person` JSON-LD structured data.

---

## 2. The 6 Bespoke Theme Archetypes

1. **Minimal & Editorial**: Serif typography, generous whitespace, Kinfolk/Cereal aesthetic, minimal project cards.
2. **Creative & Experimental**: Unconventional brutalist cues, asymmetric grid, high-impact contrasting borders, kinetic interactions.
3. **Modern Developer**: Dark terminal polish, commit-style career history, interactive tech stack tags, syntax prompts.
4. **Elegant & Luxury**: Haute couture warmth, champagne tones, arched imagery, refined editorial poise.
5. **Playful & Colorful**: Pastel geometry, soft pillowy cards, cheerful badges, upbeat creative energy.
6. **Corporate & Professional**: Executive business grid, structured resume timeline, institutional trust signals.

---

## 3. Technology Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5+ (Strict mode)
- **Styling**: Tailwind CSS (with bespoke editorial color variables)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Database & Auth**: Cloud Firestore, Firebase Authentication, Firebase Storage
- **Hosting & Edge**: Vercel

---

## 4. Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 10+

### Installation

1. Clone or navigate into the repository:
   ```bash
   cd "website maker"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Base domain for wildcard resolution
   NEXT_PUBLIC_APP_DOMAIN=localhost:3000
   ```

   > **Note on Offline / Development Mode**: If Firebase credentials are not yet configured, FolioCraft automatically runs with a robust in-memory & local storage state with pre-populated demo data, allowing you to test the complete wizard, split-screen editor, 6 themes, and publishing flows immediately!

4. Start the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Multi-Tenant Subdomain Configuration

### Local Testing
- **Direct Path**: `http://localhost:3000/portfolio/alex-morgan` or `http://localhost:3000/p/alex-morgan`
- **Subdomain Simulation**: Add to your local `hosts` file (`C:\Windows\System32\drivers\etc\hosts` on Windows):
  ```
  127.0.0.1 alex-morgan.localhost
  ```
  Then browse to `http://alex-morgan.localhost:3000` to experience the exact production subdomain routing.

### Production Wildcard Routing on Vercel
1. In your domain registrar (e.g., Namecheap, Cloudflare, Google Domains), add a wildcard DNS record:
   - **Type**: `CNAME`
   - **Name**: `*`
   - **Value**: `cname.vercel-dns.com`
2. In your Vercel Project Dashboard:
   - Go to **Settings** $\to$ **Domains**.
   - Add your root domain: `yourdomain.com`.
   - Add the wildcard domain: `*.yourdomain.com`.
3. Set `NEXT_PUBLIC_APP_DOMAIN=yourdomain.com` in Vercel Environment Variables.

---

## 6. Firestore & Storage Security Rules

Deploy the included security rules:
```bash
firebase deploy --only firestore:rules,storage:rules
```

- **Firestore**:
  - `users/{userId}`: Strictly private to authenticated owner.
  - `usernames/{slug}`: Globally readable for availability checks; atomic write to owner.
  - `portfolios/{portfolioId}`: Publicly readable when `isPublished == true`; strictly writable only by owner.
- **Storage**:
  - Direct upload restricted to `/users/{userId}/*` with 5MB image limit and 10MB PDF resume limit.

---

## 7. Project Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login, Signup, Password Reset
│   │   ├── (dashboard)/        # Dashboard, Onboarding 10-step wizard, Settings
│   │   ├── (editor)/           # Real-Time Split-Screen Live Visual Studio
│   │   ├── portfolio/[slug]/   # Dynamic public multi-tenant portfolio renderer
│   │   ├── p/[slug]/           # Canonical path alias
│   │   └── page.tsx            # Editorial Marketing Landing Page
│   ├── components/
│   │   └── shared/             # Navbar, Footer, Branding
│   ├── lib/
│   │   ├── firebase/           # Auth provider, Firebase client & demo fallback
│   │   ├── db/                 # Portfolio CRUD, slug reservation, storage
│   │   └── utils/              # Palette defaults, theme metadata, slugifier
│   ├── themes/
│   │   ├── types.ts            # Core PortfolioData interface contract
│   │   ├── ThemeRenderer.tsx   # Dynamic CSS variable injector & dispatcher
│   │   └── components/         # The 6 concrete theme implementations
│   └── middleware.ts           # Edge subdomain routing & slug rewriting
├── firestore.rules             # Production database security rules
├── storage.rules               # Production storage security rules
└── package.json
```
