# MatriMap client

Next.js 16 (App Router) + TypeScript frontend. Uses **both** ShadCN and HeroUI,
plus Motion for animation and the Better Auth React client.

## Run locally

```bash
cp .env.example .env        # Windows: Copy-Item .env.example .env
npm install
npm run dev                 # http://localhost:3000
```

The Express API must be running on `http://localhost:4000` (or set
`NEXT_PUBLIC_SERVER_URL`).

| Variable | Default | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:4000` | Express API base URL, no trailing slash |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | empty | Only needed if you switch to embedded Stripe.js checkout |

## What's included

| Route | Purpose |
| --- | --- |
| `/` | Animated landing page (Motion + HeroUI `Button`/`Chip`) |
| `/auth` | Better Auth email sign-in / sign-up (ShadCN form primitives) |
| `/profiles` | Public profile list from the API |
| `/dashboard` | Session, profile editor, ImgBB upload, Stripe Checkout button |
| `/checkout/success`, `/checkout/cancel` | Stripe return pages |

## UI setup

- **ShadCN** primitives live in `src/components/ui/` and are wired through
  `components.json`. Add more with:
  ```bash
  npx shadcn@latest add dialog toast
  ```
  The generated CSS variables and Tailwind v4 `@theme inline` mapping are in
  `src/app/globals.css`.
- **HeroUI v3** is installed as `@heroui/react` + `@heroui/styles`. Styles are
  imported in `globals.css` after `tailwindcss`. v3 needs no provider.
- **Motion** is used via `motion/react` (e.g. `import { motion } from "motion/react"`).
- **Theme** switching uses `next-themes` with the `class` strategy.

## Shared code

- `src/lib/auth-client.ts` — Better Auth client pointed at `NEXT_PUBLIC_SERVER_URL`,
  always sending credentials.
- `src/lib/api.ts` — small `apiFetch<T>()` helper for Express endpoints
  (handles JSON vs `FormData` headers and throws `ApiError`).
- `src/lib/types.ts` — shared `Profile` shape.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (flat config in `eslint.config.mjs`) |
