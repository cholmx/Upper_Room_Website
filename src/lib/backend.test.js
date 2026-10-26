import { describe, it, expect, vi } from 'vitest';
import { translate, createBackend } from './backend';

const memoryStorage = () => {
  const m = new Map();
  return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) };
};

const reply = (body, status = 200) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

function setup(handler, { clock = { t: 1_700_000_000_000 } } = {}) {
  const calls = [];
  const fetchImpl = vi.fn((url, init) => {
    calls.push({ url, init });
    return handler(url, init, calls);
  });
  const storage = memoryStorage();
  const backend = createBackend({ url: 'https://p.supabase.co/', anonKey: 'ANON', storage, fetchImpl, now: () => clock.t });
  return { backend, calls, storage, clock };
}

describe('translate', () => {
  it('builds a sorted, limited read', () => {
    const r = translate('read/sermons?sort=created_at:desc&limit=10');
    expect(r.method).toBe('GET');
    const q = new URLSearchParams(r.query);
    expect(q.get('order')).toBe('created_at.desc,id.asc');
    expect(q.get('limit')).toBe('10');
  });
  it('supports sort and order as separate params and defaults to id order', () => {
    expect(new URLSearchParams(translate('read/episodes?sort=date&order=desc').query).get('order')).toBe('date.desc,id.asc');
    expect(new URLSearchParams(translate('read/hero_config').query).get('order')).toBe('id.asc');
  });
  it('turns other params into equality filters', () => {
    const q = new URLSearchParams(translate('read/custom_pages_church?slug_key=our-beliefs').query);
    expect(q.get('slug_key')).toBe('eq.our-beliefs');
  });
  it('never writes generated columns', () => {
    const r = translate('update/posts/7', { method: 'PUT', body: JSON.stringify({ id: 7, created_at: 'x', title: 'Hi' }) });
    expect(r.method).toBe('PATCH');
    expect(r.query).toBe('id=eq.7');
    expect(r.body).toEqual({ title: 'Hi' });
    expect(translate('create/posts', { method: 'POST', body: JSON.stringify({ id: 1, title: 'a' }) }).body).toEqual({ title: 'a' });
  });
  it('rejects injection attempts', () => {
    expect(translate('read/posts;drop?x=1').error).toBeTruthy();
    expect(translate('read/posts?bad column=1').error).toBeTruthy();
    expect(translate('read/posts?sort=id;drop:asc').error).toBeTruthy();
    expect(translate('delete/posts/1 or 1=1').error).toBeTruthy();
    expect(translate('update/posts/abc', { method: 'PUT', body: '{}' }).error).toBeTruthy();
    expect(translate('nope/posts').error).toBeTruthy();
  });
});

describe('data', () => {
  it('reads with the anonymous key when signed out', async () => {
    const { backend, calls } = setup(() => reply([{ id: 1 }]));
    const res = await backend.data('read/sermons');
    expect(res).toEqual({ status: 'success', data: [{ id: 1 }] });
    expect(calls[0].url).toBe('https://p.supabase.co/rest/v1/sermons?select=*&order=id.asc');
    expect(calls[0].init.headers.Authorization).toBe('Bearer ANON');
    expect(calls[0].init.headers.apikey).toBe('ANON');
  });

  it('returns the created row for signed-in writes and nothing for anonymous inserts', async () => {
    const { backend, calls } = setup(() => reply([{ id: 9, name: 'A' }], 201));
    expect((await backend.data('create/hero_config', { method: 'POST', body: '{"heading":"x"}' })).data.id).toBe(9);
    expect(calls[0].init.headers.Prefer).toBe('return=representation');

    const anon = setup(() => Promise.resolve({ ok: true, status: 201, json: () => Promise.reject(new Error('empty')) }));
    const res = await anon.backend.data('create/contact_messages_church', { method: 'POST', body: '{"name":"A"}' }, { minimal: true });
    expect(res).toEqual({ status: 'success', data: {} });
    expect(anon.calls[0].init.headers.Prefer).toBe('return=minimal');
  });

  it('reports a blocked update or delete instead of pretending it worked', async () => {
    const { backend } = setup(() => reply([]));
    const upd = await backend.data('update/posts/1', { method: 'PUT', body: '{"title":"x"}' });
    expect(upd.status).toBe('error');
    expect(upd.httpStatus).toBe(403);
    expect((await backend.data('delete/posts/1', { method: 'DELETE' })).status).toBe('error');
  });

  it('replaces database error messages with a generic one', async () => {
    const { backend } = setup(() => reply({ message: 'permission denied for table posts' }, 401));
    const res = await backend.data('read/posts');
    expect(res.error).not.toContain('permission denied');
    expect(res.error).toMatch(/permission to do that/);
    expect(res.httpStatus).toBe(401);
  });

  it('returns a clear error when it is not configured', async () => {
    const backend = createBackend({ url: '', anonKey: '', storage: memoryStorage(), fetchImpl: vi.fn() });
    expect((await backend.data('read/posts')).error).toMatch(/not configured/);
  });

  it('handles network failures', async () => {
    const { backend } = setup(() => Promise.reject(new Error('offline')));
    expect((await backend.data('read/posts')).error).toBe('offline');
  });
});

describe('auth', () => {
  const tokens = (over = {}) => ({ access_token: 'JWT1', refresh_token: 'R1', expires_in: 3600, user: { email: 'a@b.c', app_metadata: { role: 'admin' } }, ...over });

  it('signs in and then uses the user token for requests', async () => {
    const { backend, calls } = setup((url) => (url.includes('/auth/v1/token') ? reply(tokens()) : reply([])));
    const res = await backend.signIn('a@b.c', 'pw');
    expect(res.status).toBe('success');
    expect(res.data.app_metadata.role).toBe('admin');
    expect(JSON.parse(calls[0].init.body)).toEqual({ email: 'a@b.c', password: 'pw' });
    await backend.data('read/posts');
    expect(calls[1].init.headers.Authorization).toBe('Bearer JWT1');
  });

  it('gives a friendly message for wrong credentials', async () => {
    const { backend } = setup(() => reply({ error_description: 'Invalid login credentials' }, 400));
    expect((await backend.signIn('a@b.c', 'bad')).error).toBe('Incorrect email or password');
  });

  it('refreshes a token that is about to expire', async () => {
    const clock = { t: 1_700_000_000_000 };
    const { backend, calls } = setup((url) => {
      if (url.includes('grant_type=password')) return reply(tokens());
      if (url.includes('grant_type=refresh_token')) return reply(tokens({ access_token: 'JWT2', refresh_token: 'R2' }));
      return reply([]);
    }, { clock });
    await backend.signIn('a@b.c', 'pw');
    clock.t += 3_590_000; // 10 seconds before expiry
    await backend.data('read/posts');
    const refreshCall = calls.find(c => c.url.includes('grant_type=refresh_token'));
    expect(JSON.parse(refreshCall.init.body)).toEqual({ refresh_token: 'R1' });
    expect(calls.at(-1).init.headers.Authorization).toBe('Bearer JWT2');
  });

  it('drops the session when the refresh token is rejected', async () => {
    const clock = { t: 1_700_000_000_000 };
    const { backend, calls } = setup((url) => {
      if (url.includes('grant_type=password')) return reply(tokens());
      if (url.includes('grant_type=refresh_token')) return reply({ error: 'invalid' }, 400);
      return reply([]);
    }, { clock });
    await backend.signIn('a@b.c', 'pw');
    clock.t += 4_000_000;
    await backend.data('read/posts');
    expect(calls.at(-1).init.headers.Authorization).toBe('Bearer ANON');
    expect(await backend.getUser()).toBeNull();
  });

  it('confirms the stored session with the server and clears it when rejected', async () => {
    let userStatus = 200;
    const { backend, storage } = setup((url) => {
      if (url.includes('grant_type=password')) return reply(tokens());
      return reply({ email: 'a@b.c', app_metadata: { role: 'admin' } }, userStatus);
    });
    await backend.signIn('a@b.c', 'pw');
    expect((await backend.getUser()).email).toBe('a@b.c');
    userStatus = 401;
    expect(await backend.getUser()).toBeNull();
    expect(storage.getItem('urf_session')).toBeNull();
  });

  it('signs out locally even if the server call fails', async () => {
    const { backend, storage } = setup((url) => (url.includes('logout') ? Promise.reject(new Error('x')) : reply(tokens())));
    await backend.signIn('a@b.c', 'pw');
    await backend.signOut();
    expect(storage.getItem('urf_session')).toBeNull();
    expect(await backend.getUser()).toBeNull();
  });
});
