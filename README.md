# Upper Room Fellowship Website and CMS

React 18 + Vite + Tailwind single-page app for Upper Room Fellowship (Columbiana, OH), with a built-in
admin area ("Content Studio") at `/admin`. Content is stored in an NCB backend reached through an AWS
Lambda proxy (`src/api.js`).

## Setup

```
npm install
cp .env.example .env   # then fill in VITE_NCB_INSTANCE
npm run dev
```

Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_NCB_INSTANCE` | NCB instance ID (required) |
| `VITE_SITE_URL` | Public site URL for canonical, Open Graph and JSON-LD tags |
| `VITE_FACEBOOK_URL`, `VITE_INSTAGRAM_URL`, `VITE_YOUTUBE_URL` | Footer social links; hidden when empty |

Church details (address, phone, email, map and giving links) live in `src/config.js`.

## Admin and authentication

`/login` signs in with email and password through the backend auth endpoints (`sign-in/email`,
`get-session`, `sign-out`). The session is a server-side cookie; the browser holds no password and no
"logged in" flag. Create the admin user in NCB. **The data endpoints must also require that session for
create, update and delete**, because hiding the admin UI does not protect the API. Restrict write access
to those tables to authenticated users in NCB, and leave public read open only for the tables the public
site reads.

## Data tables

`hero_config`, `photo_sections_church`, `home_section_order_church`, `gallery_church`
(`image_url`, `caption`, `sort_order_num`), `custom_pages_church`, `sermons`
(`title`, `speaker`, `series`, `date`, `description`, `video_url`, `audio_url`), `events_church`, `posts`,
`episodes`.

Body fields for pages and posts are plain text. HTML is not rendered.

## Deployment

The app uses client-side routing, so the host must serve `index.html` for unknown paths.
`public/_redirects` covers Netlify and Cloudflare Pages. Other hosts need an equivalent rewrite.
