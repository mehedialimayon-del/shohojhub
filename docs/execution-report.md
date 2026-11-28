# ShohojHub BD execution report

Updated: 2026-11-28 (Asia/Kuala_Lumpur)

## Chapter status

| Chapter | Status | Verified scope / outstanding acceptance |
| --- | --- | --- |
| 01 — Home and navigation | Implemented; visual acceptance pending | Native React home, approved separate pin and wordmark assets, responsive fixed-screen shell, independently scrolling feed, directory links and search/filter controls. Screenshot comparison on Samsung A07/S23 Ultra is still required. |
| 02 — Posts and feed | Partial | Authenticated post flow, review/scheduling/media and public-feed foundation already exist. This change adds optional, consent-based public map pins, validates Bangladesh coordinate bounds, and filters/paginates Nearby results. Real account flows for edit/close/reports/moderation and every feed filter still need browser acceptance. |
| 03 — Dashboard and Connect | Partial | Dashboard, district consent, Nearby, messaging, blocking, notification and push foundations exist. Two-account delivery, private-location and push acceptance remain outstanding. |
| 04 — Credits and advertising | Pending | No approved payment provider, Founder price schedule, refunds or advertising controls are implemented. |
| 05 — Commerce and business tools | Partial | Inventory/cash memo data layer and business route exist; buyer-to-merchant, PDF/print, Excel, storefront and reconciliation acceptance remain outstanding. |
| 06 — Education, exams and jobs | Partial | University search/bookmarks and basic Jobs/Tuition result screens exist; verified datasets, tutor, exam entitlements, applications and scheduling remain outstanding. |
| 07 — Local services | Pending | Module catalogue exists; service-specific availability, appointments, quotations and provider workflows are not complete. |
| 08 — Tools and community | Pending | Module catalogue exists; production outputs, sources, moderation, privacy and consent are not complete. |
| 09 — Founder Command Center | Pending | Founder rollout, scheduling, visibility, rollback, finance and audit controls are not complete. |
| 10 — Production launch | Pending | No verified public deployment or custom-domain URL. Signed APK and device/live acceptance have not been completed. |

The 40 module cards remain a catalogue. A catalogue entry is not counted as a completed end-to-end workflow. Chapters 01–03 and all module roles still require the acceptance checks in `release-chapters.md`.

## This integration

- Merged the fixed-screen React pages and map-pin work with the newer home design and explicit mobile module links.
- Added coverage for fixed viewport bounds, independent feed scrolling, home card counts, and the dedicated Jobs/Tuition destinations.
- Supabase project `shohojhub-test` (`zziayimtyjbwldpghrzc`) was inspected before the database check. Migration `20261128072604_public_post_map_pins` was already present; it was not applied a second time.
- Ran the public map-pin policy/constraint check against the test project inside a rolled-back transaction. Draft coordinates stayed private, approved public coordinates were visible, and partial pins were rejected.
- `npm run typecheck`, `npm run lint`, `npm test` (12/12), `npm run build`, and `git diff --check` pass.
- Local browser acceptance is blocked because Playwright Chromium is absent and its download endpoint returns HTTP 403. GitHub Actions run #82 passed the responsive browser suite (27 passed, 6 skipped) and the isolated-Supabase signed-in tests. This verifies the exercised layouts and flows, but is not pixel-level acceptance on the user's Samsung devices.

## Still required

- Complete and accept all ten chapters; no Chapters 04–10 completion is claimed.
- Pixel-level review against the user-supplied screens on Samsung A07, S23 Ultra, tablet and desktop.
- Authenticated, multi-user workflows and all 40 module acceptance checks.
- Founder-approved payment provider/prices and production environment values.
- Verified public deployment, domain, PWA/APK, device install/upgrade and live notification acceptance.
