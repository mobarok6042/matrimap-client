# MatriMap Client

The MatriMap client is the web application for discovering matrimonial profiles
and wedding services, managing bookings, and administering the marketplace. It
is a Next.js App Router application that works with the sibling
[Express API](../matrimap-server/README.md).

## Features

- Customer, vendor, and admin experiences with role-aware dashboards.
- Public service and matrimonial profile discovery.
- Vendor service listings, booking requests, and Free, Basic, and Max plans.
- Hosted Stripe Checkout and payment success/cancellation pages.
- Responsive navigation, accessible controls, and light/dark themes.

The server remains authoritative for authentication, role permissions, blocked
accounts, service limits, and payment status.

## Technology

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Better Auth React client
- HeroUI, Radix UI primitives, and Motion
- `next-themes` for persistent light/dark mode

## Requirements

- Node.js 20 or newer and npm
- A running MatriMap API and a reachable MongoDB instance

## Run locally

Start and configure the API first; see the
[server setup guide](../matrimap-server/README.md).

From this directory:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

On macOS or Linux, use `cp .env.example .env` instead of `Copy-Item`.

The development app is available at [http://localhost:3000](http://localhost:3000).
The defaults expect the Express API at `http://localhost:4000`.

## Environment

Copy `.env.example` to `.env` and adjust values for your environment:

| Variable | Local default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3000` | Browser-facing Better Auth origin; keep it aligned with the server's `BETTER_AUTH_URL`. |
| `AUTH_UPSTREAM_URL` | `http://localhost:4000` | Express API origin used by Next.js API proxies and rewrites. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Fallback API origin for server-side `apiFetch` calls. Browser requests normally use same-origin `/api` paths. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Empty | Not needed for the current hosted Checkout flow; reserved for a future browser-side Stripe.js integration. |

Do not put Stripe secret keys, database credentials, Better Auth secrets, or
other private credentials in client environment variables. Configure those in
the server's `.env` file.

## Authentication and API requests

The browser uses the Next.js origin for Better Auth. The route handler at
`src/app/api/auth/[...all]/route.ts` forwards authentication requests to
`AUTH_UPSTREAM_URL` while preserving session cookies. Application API calls
use `apiFetch` from `src/lib/api.ts`; Next.js routes and rewrites forward them
to Express.

For Google sign-in, configure the OAuth client on the server and register
`http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
New Google accounts select a Customer or Vendor role on `/complete-profile`.

Client-side route checks improve the user experience, but they are not a
security boundary. Express validates sessions, roles, ownership, and blocked
account status on protected API requests.

## Main pages

| Route | Purpose |
| --- | --- |
| `/` | Marketplace landing page and featured services |
| `/auth` | Sign-up and sign-in |
| `/complete-profile` | Role selection for new OAuth accounts |
| `/customer` and `/vendor` | Role-specific landing pages |
| `/dashboard` | Customer, vendor, or admin dashboard based on the signed-in role |
| `/services` | Public service catalog |
| `/services/add` | Vendor service creation |
| `/services/[id]` | Service details and customer booking |
| `/services/[id]/edit` | Vendor service editing |
| `/profiles` and `/profile` | Public profile discovery and personal profile management |
| `/checkout/success` and `/checkout/cancel` | Stripe return pages |

## Vendor plans and payments

Plan limits and prices are defined by the server:

| Plan | Service limit | One-time price |
| --- | ---: | ---: |
| Free | 3 | Free |
| Basic | 10 | USD 11.11 |
| Max | 25 | USD 19.99 |

Checkout redirects to Stripe-hosted Checkout. The success page verifies the
session with the server before displaying payment details. Canceling a paid
plan changes the vendor to Free and removes the stored plan transactions; it
does not refund the one-time Stripe payment.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check without emitting files |

## Project layout

```text
src/
├── app/           App Router pages, API proxy routes, layout, and global styles
├── components/    Shared UI, navigation, dashboards, and feature components
└── lib/           Auth client, API helpers, proxy utilities, and shared types
```

## Troubleshooting

- **API unavailable or requests return 502:** confirm the server is running and
  `AUTH_UPSTREAM_URL` points to it.
- **Auth origin or cookie errors:** ensure the client origin in
  `NEXT_PUBLIC_SERVER_URL`, server `BETTER_AUTH_URL`, and `CLIENT_URL` agree.
- **Images do not load:** check that their host is allowed by `next.config.ts`;
  uploaded images are served by ImgBB.
- **Checkout is unavailable:** configure a Stripe test secret key on the server.
  Stripe secrets are not read from the client.
