# gravity-ui

Next.js admin portal for the [Gravity](https://github.com/pprike/gravity-docs) multi-tenant fitness platform.

## Related repositories

| Repository | Description |
|------------|-------------|
| [gravity-service](https://github.com/pprike/gravity-service) | Spring Boot REST API |
| [gravity-mobile](https://github.com/pprike/gravity-mobile) | Flutter member app |
| [gravity-docs](https://github.com/pprike/gravity-docs) | Product, architecture, API, and UX documentation |

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Local development

### Prerequisites

- Node.js 20+
- [gravity-service](https://github.com/pprike/gravity-service) running locally (or a deployed API)

### Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

### Dev login (with gravity-service on `local` profile)

| Organization | Email | Password |
|--------------|-------|----------|
| `tenant-a` | `admin@tenant-a.com` | `Password123!` |

Other seeded roles: `owner@tenant-a.com`, `coach@tenant-a.com`, `receptionist@tenant-a.com` (same password). Use **Preview without API** on the login page to explore the UI without the backend.

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Base URL for the Gravity API |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Documentation

UX flows, information architecture, and feature specs live in [gravity-docs](https://github.com/pprike/gravity-docs).

## CI

GitHub Actions runs lint and production build on push/PR.
