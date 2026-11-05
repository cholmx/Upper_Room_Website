# Upper Room Fellowship website

A mobile-first website and content studio for Upper Room Fellowship in Columbiana, Ohio.
React 18, Vite, and Tailwind on the front end. Content, forms, and staff logins live in Bolt Database
(Supabase). The app talks to it through `src/lib/backend.js`, a small client built on `fetch` with no
extra packages.

## Setup

```
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build, then writes `dist/sitemap.xml` and `dist/robots.txt` |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (writing rules, page titles, forms, checklist, helpers) |
| `npm run prerender` | Optional. Saves rendered HTML for each public page (see below) |

## The pages

| Address | Page |
| --- | --- |
| `/` | Home: hero, welcome, quick links, where and when, vision, contact form |
| `/plan-your-visit` | New Here: what to expect on Sundays, your first visit, next steps |
| `/about`, `/core-values`, `/leadership` | Our story and beliefs, six core values, pastors |
| `/ministries` | Kids, Youth, Table Groups, Worship, and Outreach & Missions |
| `/sozo` | Sozo ministry |
| `/messages`, `/messages/series/:series`, `/messages/:id-title` | Sermon library, series, and message pages |
| `/give` | Giving, with a testimony form |
| `/contact`, `/connect` | Contact form and the Connect Card |
| `/accessibility`, `/privacy` | Policies, linked from the footer |

The pages and wording follow urfellowship.com. Old addresses such as `/new-here`, `/about-us`, `/beliefs`, `/kids`, `/youth`, `/table-groups`, `/events`, `/careportal`, and `/transforming-together` redirect to the page that now covers them.

Old addresses (`/visit`, `/sermons`, `/team`, `/podcasts`) redirect to the new ones. The blog and custom pages
(`/blog`, `/p/your-slug`) still work but are not in the menu.

## Content to confirm

Anything the church still has to supply shows on the live page as a yellow bracketed note, for example
`[PARKING DETAILS: ...]`, and in a photo slot as `[PHOTO: ...]`. All of them are listed in the admin under
**Content to Confirm**, where each one can be checked off. `src/content/checklist.js` holds the list, and
`npm test` fails if a bracketed note is added to a page without a matching checklist entry.

Long pages are set up to take existing text: paste each topic into `src/content/beliefs.js` (`full`), and
the Sozo and CarePortal text into `src/pages/Sozo.jsx` and `src/pages/CarePortal.jsx`.

## Photos, logos, and icons

Every image slot is listed in `src/content/photos.js`. In the admin, **Site Photos** lets staff upload or link an
image for each slot, with a description for screen readers. Until one is set, the page shows the slot's label.

Core value icons also load from `public/images/core-values/core-value-1.png` through `core-value-6.png` when no
photo is set in the admin. The numbered gold circle shows if neither exists. Icon numbers follow the order on the
Core Values page: 1 Pursuing Healthy Relationships, 2 Accessing Abundant Wholeness, 3 Knowing Our Greatness,
4 Owning a Supernatural Lifestyle, 5 Treasuring His Presence, 6 Living the Gospel.

## Forms

All forms (Connect Card, contact, prayer, Sozo, Table Group requests, serve, baptism, Growth Track, worship
interest, stories) post to `form_submissions_church` and appear in the admin under **Form Submissions**, where
staff can mark them handled, reply by email, export a CSV, or delete them. Each form has a honeypot field and a
short timing check against bots.

**Submissions are stored, but not emailed.** Sending a copy to info@urfellowship.com needs a server-side step
(a Supabase database webhook or edge function with an email service). Until that is added, someone has to check the
Form Submissions tab.

## Database and permissions

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Bolt Database project URL and anon (public) key. Required |
| `VITE_SITE_URL` | Public site URL for canonical links, Open Graph, and the sitemap |
| `VITE_FACEBOOK_URL`, `VITE_INSTAGRAM_URL`, `VITE_YOUTUBE_URL` | Override the social links in `src/config.js` |
| `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` | Turns on the Upload button on image fields. Use an unsigned upload preset |
| `VITE_PLAUSIBLE_DOMAIN` | Turns on Plausible analytics |
| `VITE_SENTRY_DSN` | Turns on Sentry error reporting through its CDN loader script |

The anon key is meant to be public. What a visitor or an admin can do is decided by row level security, so never put
the service role key in this app.

### Migrations

`supabase/migrations/` holds every database change, applied in file order. The newest,
`20261029120000_site_redesign_tables.sql`, adds the tables and columns the redesigned site needs. Until it is applied,
forms cannot save, Table Groups, Stories, and Site Photos stay empty, and the Settings tab cannot save (it has two new
fields). Public pages still load.

| Table | Used for |
| --- | --- |
| `form_submissions_church` | Every public form: `form_type`, `name`, `email`, `phone`, `data`, `handled` |
| `site_photos_church` | Photo slots: `slot_key`, `image_url`, `alt_text` |
| `table_groups_church` | Group finder: `name`, `day`, `time_of_day`, `area`, `life_stage`, `status`, `description`, `published` |
| `stories_church` | shown on `/about`: `name`, `quote`, `body`, `photo_url`, `published` |
| `launch_checklist_church` | Which Content to Confirm items are done |
| `staff_church` | Leadership page |
| `sermons` | Messages. New columns: `scripture`, `topic`, `notes_url`, `series_image_url` |
| `events_church` | Events. New columns: `ministry`, `image_url`, `featured` |
| `site_settings_church` | Service time, contact details, links. New columns: `announcement_text`, `announcement_url` |
| `posts`, `custom_pages_church`, `activity_log_church`, `contact_messages_church`, `hero_config`, and others | Older tables, still present |

Security rules in short: anonymous visitors can read published content, and can only insert into
`form_submissions_church` (on five columns). Everything else, including every write, needs a signed-in user.
Drafts and scheduled items are hidden from visitors by the database. A user whose `app_metadata.role` is `editor`
cannot change Settings or read the Activity Log.

### Authentication

`/login` signs in with email and password through Bolt Database auth. The session is kept in the browser and
refreshed automatically. Add staff in Bolt, and set `role` in `app_metadata`, not `user_metadata`.

## Writing and design rules

Tests enforce the written rules: no em dashes or en dashes anywhere in the code, no "click here" links, every page
title under 60 characters and description under 155, and one placeholder checklist entry per bracketed note.
`src/components/ui` holds the shared pieces (buttons, sections, cards, accordion, steps, photo slots).

Body text is 17px or larger. Colors are the warm off-white and charcoal base with a gold accent. Every page has one
H1, a visible keyboard focus ring, a skip link, labeled forms, and respects reduced motion.

## SEO

Every page sets its own title, description, canonical link, and Open Graph and Twitter tags (`src/content/seo.js`).
Structured data: `Church` on every page (`index.html`), `FAQPage` on `/faq`, `Event` on event pages, `VideoObject`
on message pages. `npm run build` writes `sitemap.xml` (including messages, series, and events) and `robots.txt`.
`public/og-default.png` is a plain placeholder sharing image. Replace it, or set the sharing image in Site Photos
and the logos for the Church structured data.

### Prerendering (optional)

Titles and descriptions are set in the browser, so crawlers that do not run JavaScript see an empty shell. After a
build, `npm run prerender` loads each public route in headless Chromium and saves the HTML to
`dist/<route>/index.html`. Run `npx playwright install chromium` once first. Pages that are still loading or showing
an error are skipped.

## Deployment

The app uses client-side routing, so the host must serve `index.html` for unknown paths. `public/_redirects` covers
Netlify and Cloudflare Pages. Other hosts need an equivalent rewrite.


Old addresses `/worship-team`, `/outreach`, `/prayer`, `/stories` and `/connect` redirect to the pages that now hold that content. Unfinished placeholders show only to signed-in staff.


## Colors

The palette is five colors: `#1E2522` ink, `#EAA235` amber, `#C74F2F` terracotta, `#FFFFFF` white and `#FCF9ED` cream. Text on cream and white uses ink, because amber and terracotta do not have enough contrast for small text on light backgrounds. Neighboring panels should differ in color, and the footer is ink. Check it with `node scripts/check-adjacent-colors.mjs` while a preview is running.

## Photo uploads

Photo fields in the admin have an **Upload a photo** button. Photos go to a public Supabase Storage bucket named `site-images`, and large photos are shrunk in the browser first. Run `supabase/migrations/20261104120000_photo_storage.sql` once (the Bolt prompt for it is in the pull request notes) to create the bucket and its policies. Pasting a link still works under each field.

## Color bands

`Band` and `Panel` (in `src/components/ui/index.jsx`) make a full-width section of two colored panels side by side. The panels are the section, with no space around them, and the text lines up with the page's content column. Use one or two per page. `scripts/check-adjacent-colors.mjs` counts a band as two colors.

## Keeping it fast

The site avoids heavy effects on purpose: no animation library, no WebGL, no scroll-linked motion, no parallax or tilt. Pages are lazy-loaded, photos load lazily, and the only external font is Merriweather (regular, bold, and italic). Keep it that way unless there is a clear reason.

## Front page area

The area below the hero is managed in the admin under Site, Front Page Area. Each row is a saved layout (centered text, photo left or right, or a slim banner). The switch in the list turns a layout on or off, Copy saves a variation, and a layout can have optional start and end days. Every layout that is on shows in order. Requires `supabase/migrations/20261105120000_home_spotlights.sql`.
