# ShohojHub BD

Next.js web application backed by Supabase. The current database migrations target the designated ShohojHub test project, `zziayimtyjbwldpghrzc`. Customer release and Android release artifacts are pending.

## Local setup and QA

Use Node.js 22 and run `npm ci`. Copy `.env.example` to `.env.local` and supply the test project's publishable key. Use `npm run dev` for local development. For hosted authentication, set `SHOHOJHUB_SITE_URL` to the HTTPS origin and allow its `/auth/callback` URL in Supabase. Email delivery needs a verified sender and SMTP configuration.

```sh
npm audit
npm test
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:browser
```

Apply `supabase/migrations/*.sql` in version order to the designated environment. The corresponding `supabase/tests/*.sql` scripts exercise database permissions and constraints. Run the SQL test scripts on the test database. Scripts that insert fixtures use transactions and roll back their rows. Modules default to disabled. No synthetic customer records are seeded. Production requires its own approved environment.

## Development tracker

Use Git history for implementation commits and the [Foundation QA workflow](https://github.com/mehedialimayon-del/shohojhub/actions/workflows/foundation-qa.yml) for per-commit CI results. Browser results currently cover Chromium with compact mobile, portrait tablet and desktop viewports. The production URL and physical Android devices have not been verified.

| # | Task | Implementation and QA | Live status |
| --- | --- | --- | --- |
| 01 | Loading Screen | Existing loading component, source tested | Production pending |
| 02 | Error Screen | Existing error component, source tested | Production pending |
| 03 | 404 Page | Home navigation tested in Chromium | Production pending |
| 04 | Supabase Browser Client | Publishable-key client, source tested | Production config pending |
| 05 | Supabase Server Client | Server cookie client tested via login, reload, profile save and logout | Test environment verified |
| 06 | TypeScript Configuration | Typecheck passes | N/A |
| 07 | Tailwind Configuration | Builds with responsive browser coverage | Production pending |
| 08 | Root Layout | Bengali document and responsive home render | Production pending |
| 09 | Global CSS | Black, deep orange and white components render on all three QA viewports | Production pending |
| 10 | Production Build | Next.js production-mode build passes | Hosting pending |
| 11 | Package Configuration | Next.js upgraded, lockfile committed, npm audit reports no advisories | N/A |
| 12 | Original Brand Logo | Repository's temporary SVG in use | Approved asset pending |
| 13 | Next.js Configuration | App Router and session proxy build and run | Production pending |
| 14 | Environment Configuration | Example and test connection verified | Production origin, Auth redirects and SMTP pending |
| 15 | Database Schema & Security | Applied identity, catalog, inventory, memo, messaging, Storage and search migrations with SQL and service tests | Test environment only, remaining tables and policies pending |
| 16 | Homepage & Navigation | Responsive home, clock, account and enabled-module navigation tested | Full navigation and production pending |
| 17 | Live Website Deployment | Production deployment unverified | Pending |
| 18 | Bangladesh Live Clock | Formatter and browser timer tested | Production pending |
| 19 | Global Smart Search | University, shop and product search with aliases, visibility and pagination tested | Other categories and production pending |
| 20 | Authentication | Login, reload, profile save, logout and guard smoke-tested | Email delivery, recovery lifecycle, account deletion and production pending |
| 21 | User Account & Dashboard | Basic account and profile form | Full dashboard and onboarding pending |
| 22 | Bangladesh Universities | Directory metadata and bookmark policies tested | Verified national dataset and profile pages pending |
| 23 | ChaaiKini | Public shop metadata available in database | Location, quotes and UI pending |
| 24 | Digital Storefront | Shop, product, stock and owner permissions tested | Merchant stock screen available in test build, catalogue management pending |
| 25 | Cash Memo & Business Tools | Database pricing, rollback, stock, discount and retry tested | Memo screen and browser printing available in test build, Excel pending |
| 26 | Porai | Private tutor-document upload/download and access verified | Tutor profiles, tuition and UI pending |
| 27 | HaatBazar | Pending | Pending |
| 28 | ExamArena BD | Pending | Pending |
| 29 | A&N Overseas Education | Pending | Pending |
| 30 | Messaging & Notifications | Database access, blocking, read status, retries and publication membership tested | Realtime delivery and UI pending |
| 31 | DSE Market Watch | Approved data source pending | Pending |
| 32 | Themes & Success Stories | Pending | Pending |
| 33 | Advertising & Subscriptions | Pending | Inactive |
| 34 | Founder Command Center | Audit controls and founder visibility tested | Dashboard pending |
| 35 | Financial Management | Pending | Pending |
| 36 | 60-Day Founder Roadmap | Pending | Pending |
| 37 | PWA & Android APK | Installable build, signing and device QA pending | Pending |
| 38 | Full Website QA | Foundation checks pass | Full live acceptance pending |
| 39 | Final Production Release | Pending | Pending |
