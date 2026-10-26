// One-time copy of the site's content from the old NCB backend into Bolt Database.
//
//   NCB_INSTANCE=<old instance id> MIGRATE_EMAIL=you@example.com MIGRATE_PASSWORD=... \
//     node scripts/migrate-from-ncb.mjs [--dry-run] [--append]
//
// Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env. It signs in as your admin user
// (so row level security applies as normal) and never stores the password. A table that already
// has rows is skipped unless you pass --append, so running it twice cannot duplicate content.
import { loadEnv } from 'vite';
import { TABLES, mapRow, orderRows } from './migrate-map.mjs';

const DEFAULT_PROXY = 'https://rmvzorxcl35mttidiexhtp5g2m0hpsqo.lambda-url.us-east-2.on.aws';
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const append = args.has('--append');

const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
const base = (env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const anon = env.VITE_SUPABASE_ANON_KEY;
const instance = env.NCB_INSTANCE;
const OLD_PROXY = env.NCB_PROXY || DEFAULT_PROXY;
if (!base || !anon) throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
if (!instance) throw new Error('Set NCB_INSTANCE to the old backend instance id');

async function readOld(table) {
  const url = new URL(`/public-data/read/${table}`, OLD_PROXY);
  url.searchParams.set('Instance', instance);
  url.searchParams.set('limit', '1000');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return Array.isArray(body) ? body : body.data ?? [];
}

async function signIn() {
  if (!env.MIGRATE_EMAIL || !env.MIGRATE_PASSWORD) throw new Error('Set MIGRATE_EMAIL and MIGRATE_PASSWORD (your admin login)');
  const res = await fetch(`${base}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.MIGRATE_EMAIL, password: env.MIGRATE_PASSWORD }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Sign in failed: ${json.error_description || json.msg || res.status}`);
  return json.access_token;
}

const token = dryRun ? anon : await signIn();
const headers = { apikey: anon, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

let total = 0;
for (const table of Object.keys(TABLES)) {
  let oldRows;
  try {
    oldRows = await readOld(table);
  } catch (err) {
    console.log(`${table.padEnd(28)} skipped (could not read old table: ${err.message})`);
    continue;
  }
  if (oldRows.length === 0) {
    console.log(`${table.padEnd(28)} nothing to copy`);
    continue;
  }

  if (!dryRun && !append) {
    const existing = await fetch(`${base}/rest/v1/${table}?select=id&limit=1`, { headers });
    const rows = existing.ok ? await existing.json() : [];
    if (rows.length > 0) {
      console.log(`${table.padEnd(28)} skipped (already has data; use --append to add anyway)`);
      continue;
    }
  }

  const mapped = orderRows(oldRows).map(r => mapRow(table, r));
  if (dryRun) {
    console.log(`${table.padEnd(28)} would copy ${mapped.length} rows. First row:`, JSON.stringify(mapped[0]).slice(0, 160));
    continue;
  }

  for (let i = 0; i < mapped.length; i += 100) {
    const res = await fetch(`${base}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify(mapped.slice(i, i + 100)),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`${table}: insert failed (${res.status}) ${detail}`);
    }
  }
  total += mapped.length;
  console.log(`${table.padEnd(28)} copied ${mapped.length} rows`);
}

console.log(dryRun ? '\nDry run only. Nothing was written.' : `\nDone. Copied ${total} rows.`);
