# Frontend Nuxt 3 Starter

This is the new frontend for Yemen Tourism.

## Stack
- Nuxt 3 (SSR)
- Tailwind CSS
- Pinia

## Local setup
1. Copy `.env.example` to `.env`.
2. Install dependencies.
3. Run `npm run dev`.

API base URL is read from `NUXT_PUBLIC_API_BASE`.

If PowerShell execution policy blocks `npm`, use:

```bash
cmd /c npm install
cmd /c npm run dev
```

## Legacy Exact UI Mode

This frontend is currently configured to preserve the old website look 1:1.
Nuxt routes (for example `/cities`, `/admin/login`) redirect to the copied legacy pages in `public/*.html`.
Legacy assets are served from:

- `public/css`
- `public/js`
- `public/images`

Admin pages in legacy mode now authenticate and manage content through Laravel API endpoints:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/stats/overview`
- CRUD on `/api/v1/cities` and `/api/v1/landmarks`
