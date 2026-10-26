# Upper Room Fellowship Website and CMS

React 18 + Vite + Tailwind single-page app for Upper Room Fellowship (Columbiana, OH), with a built-in
admin area ("Content Studio") at `/admin`. Content and logins live in Bolt Database (Supabase). The app talks
to it directly through `src/lib/backend.js`, a small client built on `fetch` with no extra packages.

## Setup

```
npm install
cp .env.example .env   # then fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build, then writes `dist/sitemap.xml` and `dist/robots.txt` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run prerender` | Optional. Saves rendered HTML for each public page (see below) |

CI (`.github/workflows/ci.yml`) runs lint, tests, build, and a production dependency audit on every pull
request. Dependabot opens weekly update PRs.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Bolt Database project URL and anon (public) key. Required. Bolt keeps these in its own `.env` |
| `VITE_SITE_URL` | Public site URL for canonical, Open Graph, JSON-LD tags, and the sitemap |
| `VITE_FACEBOOK_URL`, `VITE_INSTAGRAM_URL`, `VITE_YOUTUBE_URL` | Default footer social links (the admin Settings tab overrides them) |
| `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` | Enables the Upload button on image fields. Use an **unsigned** upload preset |
| `VITE_PLAUSIBLE_DOMAIN` | Turns on Plausible analytics |
| `VITE_SENTRY_DSN` | Turns on Sentry error reporting through its CDN loader script (enable "Loader Script" on the Sentry project key) |

The anon key is meant to be public. It only identifies the project. What a visitor or an admin can do is
decided by the database's row level security policies, so never put the service role key in this app.

## Database and permissions

### Authentication

`/login` signs in with email and password against Bolt Database auth. The session (access and refresh
tokens) is kept in the browser's `localStorage` and refreshed automatically, and the server confirms it on
every page load. Add staff accounts in Bolt. A user whose `app_metadata.role` is `editor` sees the content
tabs but not Settings or the Activity Log; any other role sees everything. Set the role in `app_metadata`
(not `user_metadata`) because users cannot edit it themselves.

The Settings and Activity Log tabs are hidden from editors in the interface only. If editors must also be
blocked at the database level, add a row level security rule that checks `auth.jwt() -> 'app_metadata' ->> 'role'`.

### Row level security

Every table has RLS enabled:
- Create, update, and delete require a signed-in user on every table.
- Public read: `hero_config`, `home_section_order_church`, `photo_sections_church`, `gallery_church`,
  `custom_pages_church`, `sermons`, `events_church`, `posts`, `episodes`, `site_settings_church`.
- `contact_messages_church`: anonymous users can insert only. Reads, updates, and deletes need a signed-in user.
- `activity_log_church`: signed-in users only.

Drafts and scheduled items are hidden by the app, not by the database. They are still readable through the
public API by anyone who asks for them directly. If a draft must stay secret, add a policy that limits public
reads to `published = 1`.

### Tables

| Table | Columns used |
| --- | --- |
| `hero_config` | `heading`, `subtext`, `image_url` |
| `home_section_order_church` | `section_key_name`, `sort_order_num_val` |
| `photo_sections_church` | `heading`, `subtext`, `image_url`, `button_text`, `button_page_slug`, `sort_order_num` |
| `gallery_church` | `image_url`, `caption`, `sort_order_num` |
| `custom_pages_church` | `title_text`, `slug_key`, `nav_label_text`, `body_content_text` |
| `sermons` | `title`, `speaker`, `series`, `date`, `description`, `notes`, `video_url`, `audio_url`, `published`, `publish_date` |
| `events_church` | `title`, `date`, `recurrence` (`none`/`weekly`/`biweekly`/`monthly`), `time`, `location`, `desc_text`, `registration_url`, `published`, `publish_date` |
| `posts` | `title`, `author`, `date`, `category`, `image_url`, `body`, `published`, `publish_date` |
| `episodes` | `title`, `date`, `audio`, `feed` |
| `site_settings_church` | `service_time`, `phone`, `email`, `street`, `city`, `region`, `postal_code`, `give_url`, `facebook_url`, `instagram_url`, `youtube_url` |
| `contact_messages_church` | `name`, `email`, `kind`, `message`, `handled` |
| `activity_log_church` | `actor`, `action`, `area`, `item_label` |

Every table also has an `id` and a `created_at` column. The app never writes those two. `published` and
`handled` are stored as 1 or 0. Rows saved before `published` existed count as published.
Bodies for pages, posts, sermons, and events are Markdown and are sanitized before display.

### Copying content from the old NCB backend

`scripts/migrate-from-ncb.mjs` copies the existing sermons, posts, events, pages, hero, and so on into the
new tables. It signs in as your admin user so the same security rules apply, keeps original creation times,
renames old fields (`yt` to `video_url`, event `description` to `desc_text`), and skips any table that
already has rows so it cannot duplicate content.

```
# 1. Preview. Writes nothing.
NCB_INSTANCE=<old instance id> node scripts/migrate-from-ncb.mjs --dry-run

# 2. Copy for real
NCB_INSTANCE=<old instance id> MIGRATE_EMAIL=you@example.com MIGRATE_PASSWORD='your password' \
  node scripts/migrate-from-ncb.mjs
```

The old instance id is the value `VITE_NCB_INSTANCE` had before. Image links are copied as they are, so
images hosted elsewhere keep working.

## Content features

- **Draft and schedule:** posts, sermons, and events have a Published checkbox and an optional Publish On date.
- **Recurring events:** choose weekly, every 2 weeks, or monthly. The Events page shows the next 120 days of occurrences, and every event has an Add to Calendar (.ics) button.
- **Detail pages:** `/sermons/:id`, `/blog/:id`, `/events/:id`, with `VideoObject`, `BlogPosting`, and `Event` structured data.
- **Series pages:** `/sermons?series=Name` filters the sermon list.
- **Reordering:** photo sections, gallery photos, and the Home page layout can be dragged or moved with arrow buttons.

## Deployment

The app uses client-side routing, so the host must serve `index.html` for unknown paths.
`public/_redirects` covers Netlify and Cloudflare Pages. Other hosts need an equivalent rewrite.

### Prerendering (optional)

Titles and descriptions are set in the browser, so crawlers that do not run JavaScript see an empty shell.
After a build, `npm run prerender` loads each public route in headless Chromium and saves the HTML to
`dist/<route>/index.html`. Run `npx playwright install chromium` once first. Pages that are still loading or
showing an error are skipped, so the build never publishes a broken snapshot. It needs the Supabase variables
set so the sermon, post, and event pages can be discovered. Re-run it (or rebuild) after publishing new content.
The app still renders client-side after load, so the snapshot is for search engines and link previews.

## Uptime monitoring

Point a free monitor (UptimeRobot, Better Stack) at the site URL. That is configured outside this repo.
