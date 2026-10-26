# Upper Room Fellowship Website and CMS

React 18 + Vite + Tailwind single-page app for Upper Room Fellowship (Columbiana, OH), with a built-in
admin area ("Content Studio") at `/admin`. Content is stored in an NCB backend reached through an AWS
Lambda proxy (`src/api.js`, proxy address in `src/ncbConfig.js`).

## Setup

```
npm install
cp .env.example .env   # then fill in VITE_NCB_INSTANCE
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
| `VITE_NCB_INSTANCE` | NCB instance ID (required) |
| `VITE_SITE_URL` | Public site URL for canonical, Open Graph, JSON-LD, and the sitemap |
| `VITE_FACEBOOK_URL`, `VITE_INSTAGRAM_URL`, `VITE_YOUTUBE_URL` | Default footer social links (the admin Settings tab overrides them) |
| `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` | Enables the Upload button on image fields. Use an **unsigned** upload preset |
| `VITE_PLAUSIBLE_DOMAIN` | Turns on Plausible analytics |
| `VITE_SENTRY_DSN` | Turns on Sentry error reporting through its CDN loader script (enable "Loader Script" on the Sentry project key) |

## Backend setup (NCB)

### Authentication and permissions

`/login` signs in with email and password through the backend auth endpoints (`sign-in/email`,
`get-session`, `sign-out`). The session is a server-side cookie, and the browser stores no password or
"logged in" flag. Add staff accounts in NCB. A user whose `role` is `editor` sees the content tabs but not
Settings or the Activity Log; any other role sees everything. The Users and role screens live in NCB, not
in this app.

**The API must enforce permissions itself.** Hiding the admin UI protects nothing on its own. In NCB:
- Create, update, and delete on every table require a signed-in user.
- Public read is allowed only on the tables the public site reads.
- `contact_messages_church` allows public **create** only (no public read).
- `activity_log_church` and `contact_messages_church` are readable by signed-in users only.

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

`published` and `handled` are stored as 1 or 0. Rows saved before `published` existed count as published.
Bodies for pages, posts, sermons, and events are Markdown and are sanitized before display.

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
showing an error are skipped, so the build never publishes a broken snapshot. It needs `VITE_NCB_INSTANCE`
set so the sermon, post, and event pages can be discovered. Re-run it (or rebuild) after publishing new content.
The app still renders client-side after load, so the snapshot is for search engines and link previews.

## Uptime monitoring

Point a free monitor (UptimeRobot, Better Stack) at the site URL. That is configured outside this repo.
