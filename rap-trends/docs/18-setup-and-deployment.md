# RAP TRENDS — Setup and Deployment

## Requirements

- Node.js 20 or newer (developed on 22)
- npm 10 or newer
- Docker, optional, for containerised runs

## Local development

```bash
cd rap-trends
npm install
cp .env.example .env.local     # nothing is required for the demo adapter
npm run dev                    # http://localhost:3000
```

The application runs entirely on the seeded demonstration dataset. No database, no external service,
and no credentials are needed to see every screen.

| Route | What it is |
|---|---|
| `/` | The public network |
| `/os` | RAP TRENDS OS — use the operator selector in the header to switch roles |
| `/artist-portal` | Artist workspace |
| `/affiliate-portal` | Affiliate workspace |
| `/api/index/chart` | Scored chart as JSON |
| `/api/epg?format=xmltv` | XMLTV programme guide |

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |

## Environment variables

Every variable is documented in `.env.example`. **None is required to run the demonstration build** —
the application degrades to the seeded dataset rather than failing.

### Core

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Canonical URL for metadata and Open Graph |
| `RAPTRENDS_DATA_MODE` | No | `demo` | `demo` or `live`. Drives the site-wide banner and the `dataMode` field on every API response |

### Database (Phase 1)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Public client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side key. **Never exposed to the client** |

### Object storage

| Variable | Purpose |
|---|---|
| `S3_ENDPOINT` `S3_REGION` `S3_BUCKET` | Media storage |
| `S3_ACCESS_KEY_ID` `S3_SECRET_ACCESS_KEY` | Credentials |
| `CDN_BASE_URL` | Public delivery origin |

### Google Drive ingestion

| Variable | Purpose |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account identity |
| `GOOGLE_PRIVATE_KEY` | Service account key, newlines escaped |
| `GOOGLE_DRIVE_ARTICLES_FOLDER_ID` | Watched ARTICLES folder |
| `GOOGLE_DRIVE_VIDEOS_FOLDER_ID` | Watched VIDEOS folder |
| `GOOGLE_DRIVE_SWEEP_MINUTES` | Sweep interval, default 5 |

### Index sources

Each is optional; a missing credential means the source stays `pending_agreement`, contributes
nothing, and lowers the published confidence figure rather than being estimated.

| Variable | Signal |
|---|---|
| `INDEX_STREAMING_API_KEY` | Streaming velocity, playlist adds, engagement quality |
| `INDEX_VIDEO_API_KEY` | Video views and velocity |
| `INDEX_AIRPLAY_API_KEY` | Radio airplay |
| `INDEX_SHAZAM_API_KEY` | Song identification |
| `INDEX_SOCIAL_API_KEY` | Social conversation |
| `INDEX_SHORTFORM_API_KEY` | Short-form sound usage |
| `INDEX_TICKETING_API_KEY` | Concert demand, ticket sales |

### Playout and distribution

| Variable | Purpose |
|---|---|
| `PLAYOUT_VENDOR` | `amagi` or an alternative adapter key |
| `PLAYOUT_API_URL` `PLAYOUT_API_KEY` | Vendor credentials |
| `SSAI_ENDPOINT` `SSAI_API_KEY` | Server-side ad insertion |
| `EPG_PUBLISH_URL` | Where the EPG is pushed |

### AI services

| Variable | Purpose |
|---|---|
| `AI_TRANSCRIPTION_API_KEY` | Transcription and caption drafting |
| `AI_METADATA_API_KEY` | Tagging, chapters, clip suggestions |

Every AI output is a draft requiring human review. Unreviewed captions are blocked from delivery by
the rights gate.

### Email, notifications, monitoring

| Variable | Purpose |
|---|---|
| `EMAIL_API_KEY` `EMAIL_FROM_ADDRESS` | Transactional and newsletter |
| `PUSH_VAPID_PUBLIC_KEY` `PUSH_VAPID_PRIVATE_KEY` | Web push |
| `SMS_API_KEY` `ALERT_PHONE_NUMBERS` | Critical operational alerts |
| `SENTRY_DSN` `LOG_LEVEL` | Error tracking and log verbosity |

## Docker

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

Add `output: "standalone"` to `next.config.ts` before building this image.

## Deployment

### Vercel (fastest path)

Connect the repository, set the root directory to `rap-trends`, add the environment variables, and
deploy. Dynamic routes render on demand; static routes are prerendered at build.

### Container platform

Build the image, set the environment, and run behind a load balancer with TLS. Media should be
served from a separate origin so a malicious upload cannot execute in the application's context.

### Pre-deploy checklist

```bash
npm run typecheck    # must pass
npm test             # 155 tests, must pass
npm run build        # must succeed
```

Then verify: `/api/health` returns 200 or 503 with a truthful body; `RAPTRENDS_DATA_MODE` reflects
reality; the demonstration banner appears when it should; and `/os` is not indexable (it is
`noindex` in metadata — confirm robots and access controls at the edge too).

## Going from demo to live

1. Provision Postgres and apply `docs/05-database-schema.sql`.
2. Replace the function bodies in `src/lib/repo.ts` with real queries. Signatures do not change.
3. Replace `getSessionUser()` in `src/lib/session.ts` with the identity provider. Nothing downstream
   changes.
4. Swap the in-memory limiter in `src/lib/rate-limit.ts` for Redis or the platform's edge limiter.
5. Implement the vendor adapters for playout, delivery, and ad serving.
6. Set `RAPTRENDS_DATA_MODE=live` **only once the data really is live**. This flag is the promise the
   whole product makes about honesty; setting it early breaks that promise everywhere at once.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Fonts render in a fallback | Google Fonts unreachable. The stack degrades to Arial Narrow and system faces by design |
| "Demonstration data" banner in production | `RAPTRENDS_DATA_MODE` is not `live` |
| Chart entries missing | Below the publication floor. Check `/api/index/sources` for disconnected sources |
| Schedule shows errors | Working as intended. Read the validation report — usually an unreviewed caption or a lapsed licence |
| `/api/health` returns 503 | A check is failing. The body names which |
