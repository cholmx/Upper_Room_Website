// Team logins for the admin: invite people, change who is an admin or an editor, remove people, and send a password reset.
//
// The browser cannot create or delete logins, so this runs on the server with the project's service key.
// - Invite, change role, remove and resend: only signed-in admins (checked against staff_roles_church).
// - Forgot password: anyone may ask, but a link is only made for an address that belongs to the team, and the answer is
//   always the same so the form cannot be used to find out who is on the team.
// Emails are put in the email outbox and sent through Resend like every other email from this site.

const VERSION = '2026-11-13';
const SITE = Deno.env.get('SITE_URL') || 'https://www.urfellowship.com';
const URL_ = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const service = (path: string, init: RequestInit = {}) =>
  fetch(`${URL_}${path}`, {
    ...init,
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });

async function callerRole(req: Request): Promise<{ id: string; email: string; role: string } | null> {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token || token === ANON) return null;
  const who = await fetch(`${URL_}/auth/v1/user`, { headers: { apikey: ANON, Authorization: `Bearer ${token}` } });
  if (!who.ok) return null;
  const u = await who.json();
  const r = await service(`/rest/v1/staff_roles_church?user_id=eq.${u.id}&select=role`);
  const rows = r.ok ? await r.json() : [];
  return rows[0] ? { id: u.id, email: u.email, role: rows[0].role } : null;
}

// A one-time link that signs the person in so they can choose a password. It points at this site, not at the auth server.
async function makeLink(type: 'invite' | 'recovery', email: string): Promise<{ id: string; link: string } | null> {
  const res = await service('/auth/v1/admin/generate_link', { method: 'POST', body: JSON.stringify({ type, email }) });
  if (!res.ok) return null;
  const j = await res.json();
  const hashed = j.hashed_token || j.properties?.hashed_token;
  const id = j.id || j.user?.id;
  if (!hashed || !id) return null;
  return { id, link: `${SITE}/admin/set-password?type=${type}&token_hash=${encodeURIComponent(hashed)}` };
}

async function queueEmail(kind: string, to: string, subject: string, intro: string, button: string, link: string) {
  const html =
    '<div style="font-family:Aleo,Georgia,Cambria,Times New Roman,serif;font-size:16px;line-height:1.55;color:#1e2522;max-width:560px">'
    + `<p style="margin:0 0 16px">${intro}</p>`
    + `<p style="margin:0 0 20px"><a href="${esc(link)}" style="display:inline-block;background:#c74f2f;color:#ffffff;text-decoration:none;font-weight:bold;font-family:Inter Tight,Arial,Helvetica,sans-serif;padding:12px 20px;border-radius:8px">${esc(button)}</a></p>`
    + '<p style="margin:0 0 16px;font-size:14px;color:#555">This link works once and expires after a day. If it does not work, ask an admin to send you a new one.</p>'
    + '<hr style="border:0;border-top:1px solid #ddd;margin:24px 0 12px"><p style="font-size:12px;color:#666;margin:0">Upper Room Fellowship, 500 Sponseller Road, Columbiana, Ohio 44408</p></div>';
  await service('/rest/v1/email_outbox_church', { method: 'POST', body: JSON.stringify({ kind, to_email: to, subject, html }), headers: { Prefer: 'return=minimal' } });
}

const inviteIntro = (name: string, who: string) =>
  `Hi${name ? ' ' + esc(name.split(' ')[0]) : ''}, ${esc(who)} added you to the team for the Upper Room Fellowship website. Choose a password to finish setting up your login.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  if (!URL_ || !SERVICE) return json({ error: 'The function is not set up: the project keys are missing.' }, 500);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: 'That request was not valid.' }, 400); }
  const action = String(body.action || '');
  const email = String(body.email || '').trim().toLowerCase();

  // Anyone may ask for a reset link. Only team members get one.
  if (action === 'forgot') {
    if (EMAIL_RE.test(email)) {
      const since = new Date(Date.now() - 3600_000).toISOString();
      const recent = await service(`/rest/v1/email_outbox_church?kind=eq.staff_reset&to_email=eq.${encodeURIComponent(email)}&created_at=gte.${since}&select=id`);
      const n = recent.ok ? (await recent.json()).length : 99;
      const mem = await service(`/rest/v1/staff_roles_church?email=eq.${encodeURIComponent(email)}&select=user_id`);
      const isMember = mem.ok && (await mem.json()).length > 0;
      if (isMember && n < 3) {
        const made = await makeLink('recovery', email);
        if (made) await queueEmail('staff_reset', email, 'Reset your password for the Upper Room Fellowship admin', 'Someone asked to reset the password for your login on the Upper Room Fellowship website. If that was you, use the button below to choose a new password. If it was not, you can ignore this email.', 'Choose a new password', made.link);
      }
    }
    return json({ ok: true });
  }

  const me = await callerRole(req);
  if (!me || me.role !== 'admin') return json({ error: 'Only admins can do that.' }, 403);

  if (action === 'invite' || action === 'resend') {
    if (!EMAIL_RE.test(email)) return json({ error: 'That does not look like an email address.' }, 400);
    const name = String(body.name || '').trim().slice(0, 200);
    const role = body.role === 'admin' ? 'admin' : 'editor';

    const found = await service(`/rest/v1/staff_roles_church?email=eq.${encodeURIComponent(email)}&select=user_id,role,name`);
    const existing = found.ok ? (await found.json())[0] : null;

    // A person who has signed in before gets a reset link. A new person gets an invitation.
    let made = existing ? await makeLink('recovery', email) : await makeLink('invite', email);
    if (!made && !existing) made = await makeLink('recovery', email); // the login exists but has no role yet
    if (!made) return json({ error: 'The login could not be created. Check the email address and try again.' }, 502);

    const save = await service('/rest/v1/staff_roles_church?on_conflict=user_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        user_id: made.id, email, name: name || existing?.name || '',
        role: existing && action === 'resend' ? existing.role : role,
        invited_by: me.email, last_invite_at: new Date().toISOString(),
      }),
    });
    if (!save.ok) return json({ error: 'The person was created but their role could not be saved.' }, 500);
    await queueEmail('staff_invite', email, 'You are invited to the Upper Room Fellowship website admin', inviteIntro(name || existing?.name || '', me.email), 'Set my password', made.link);
    return json({ ok: true, link: made.link });
  }

  if (action === 'set_role') {
    const id = String(body.user_id || '');
    const role = body.role === 'admin' ? 'admin' : 'editor';
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'That person was not found.' }, 400);
    if (id === me.id && role !== 'admin') return json({ error: 'You cannot take admin away from yourself. Ask another admin.' }, 400);
    const res = await service(`/rest/v1/staff_roles_church?user_id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ role }), headers: { Prefer: 'return=minimal' } });
    return res.ok ? json({ ok: true }) : json({ error: 'That did not save.' }, 500);
  }

  if (action === 'remove') {
    const id = String(body.user_id || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'That person was not found.' }, 400);
    if (id === me.id) return json({ error: 'You cannot remove yourself.' }, 400);
    const admins = await service('/rest/v1/staff_roles_church?role=eq.admin&select=user_id');
    const list = admins.ok ? await admins.json() : [];
    if (list.length <= 1 && list[0]?.user_id === id) return json({ error: 'There must be at least one admin.' }, 400);
    await service(`/rest/v1/staff_roles_church?user_id=eq.${id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
    await service(`/auth/v1/admin/users/${id}`, { method: 'DELETE' });
    return json({ ok: true });
  }

  return json({ error: `Unknown action. (${VERSION})` }, 400);
});
