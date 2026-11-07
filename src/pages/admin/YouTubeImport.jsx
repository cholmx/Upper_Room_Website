import React, { useEffect, useMemo, useState } from 'react';
import { backend } from '../../lib/backend';
import { dataFetch } from '../../api';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';
import { toMessage, fetchChannelVideos } from '../../lib/youtube';
import { ytId, formatDate } from '../../utils';

// Lists the videos on the church's YouTube channel and creates a message for each one picked.
export default function YouTubeImport({ existing, onClose, onImported }) {
  const { user } = useAuth();
  const [state, setState] = useState({ phase: 'loading', error: '', videos: [], source: '' });
  const [picked, setPicked] = useState({});
  const [publish, setPublish] = useState(true);
  const [progress, setProgress] = useState(null);
  const [confirmFix, setConfirmFix] = useState(false);
  const [fixed, setFixed] = useState(null);

  const have = useMemo(() => new Set(existing.map(m => ytId(m.video_url || m.yt)).filter(Boolean)), [existing]);

  useEffect(() => {
    let live = true;
    const key = import.meta.env.VITE_YOUTUBE_API_KEY;
    const load = key
      ? fetchChannelVideos(key).then(
        videos => ({ status: 'success', data: { videos, source: 'api' } }),
        err => ({ status: 'error', error: err.message || 'Could not read the channel.' }),
      )
      : backend.invoke('youtube-videos');
    load.then(res => {
      if (!live) return;
      if (res.status !== 'success') { setState({ phase: 'error', error: res.error, videos: [], source: '' }); return; }
      const videos = res.data?.videos ?? [];
      setState({ phase: 'ready', error: '', videos, source: res.data?.source || '' });
      setPicked(Object.fromEntries(videos.filter(v => !have.has(v.id)).map(v => [v.id, true])));
    });
    return () => { live = false; };
  }, [have]);

  const rowById = useMemo(() => Object.fromEntries(existing.map(m => [ytId(m.video_url || m.yt), m]).filter(([k]) => k)), [existing]);
  const known = state.videos.filter(v => rowById[v.id]);
  const fresh = state.videos.filter(v => !have.has(v.id));
  const chosen = fresh.filter(v => picked[v.id]);

  const run = async () => {
    setProgress({ done: 0, failed: 0, total: chosen.length });
    let done = 0; let failed = 0;
    // Oldest first, so the newest message ends up last in the list's creation order.
    for (const v of [...chosen].reverse()) {
      const res = await dataFetch('create/sermons', { method: 'POST', body: JSON.stringify({ ...toMessage(v), published: publish ? 1 : 0 }) });
      if (res.status === 'success') done += 1; else failed += 1;
      setProgress({ done, failed, total: chosen.length });
    }
    if (done) logActivity(user, 'imported', 'Messages', `${done} from YouTube`);
    onImported();
    setProgress({ done, failed, total: chosen.length, finished: true });
  };

  const fix = async () => {
    setConfirmFix(false);
    setFixed({ done: 0, failed: 0, total: known.length });
    let done = 0; let failed = 0;
    for (const v of known) {
      const { title, speaker, scripture, series, date } = toMessage(v);
      const res = await dataFetch(`update/sermons/${rowById[v.id].id}`, { method: 'PUT', body: JSON.stringify({ title, speaker, scripture, series, date }) });
      if (res.status === 'success') done += 1; else failed += 1;
      setFixed({ done, failed, total: known.length });
    }
    if (done) logActivity(user, 'refreshed', 'Messages', `${done} from YouTube`);
    onImported();
    setFixed({ done, failed, total: known.length, finished: true });
  };

  const busy = progress && !progress.finished;

  return (
    <div className="bg-white rounded-2xl border border-[#1e2522]/10 shadow-sm p-6 mb-8" role="region" aria-label="Import from YouTube">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold">Import from YouTube</h3>
          <p className="text-sm text-[#1e2522]/70 mt-1">Videos from the Upper Room Fellowship channel. Each one you pick becomes a message with its title, speaker, passage, date and summary filled in. You can edit any of it afterward.</p>
        </div>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#1e2522]/20 font-bold text-sm">Close</button>
      </div>

      {state.phase === 'loading' && <p role="status" className="text-[#1e2522]/70">Reading the channel.</p>}
      {state.phase === 'error' && <p role="alert" className="text-[#c74f2f] font-medium">{state.error}</p>}

      {state.phase === 'ready' && (
        <>
          {state.source === 'feed' && <p className="text-sm text-[#1e2522]/70 mb-3">This list shows the 15 newest videos. To bring in older ones, ask Bolt to add a YouTube Data API key as VITE_YOUTUBE_API_KEY.</p>}
          {known.length > 0 && (
            <div className="mb-5 p-4 rounded-lg bg-[#1e2522]/5 text-sm">
              <p><strong>{known.length}</strong> of these are already in your messages. If their titles, speakers or dates came in wrong, you can read them again from the channel.</p>
              {confirmFix ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="font-semibold">This replaces the title, speaker, passage, series and date of {known.length} messages. Changes you made to those fields will be lost.</span>
                  <button type="button" onClick={fix} className="bg-[#c74f2f] text-white font-bold py-2 px-4 rounded-lg">Replace them</button>
                  <button type="button" onClick={() => setConfirmFix(false)} className="px-4 py-2 rounded-lg border border-[#1e2522]/20 font-bold">Cancel</button>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => setConfirmFix(true)} disabled={fixed && !fixed.finished} className="px-4 py-2 rounded-lg border border-[#1e2522]/20 bg-white font-bold disabled:opacity-50">Read titles again</button>
                  {fixed && <span role="status" className="font-semibold">{fixed.finished ? `${fixed.done} updated${fixed.failed ? `, ${fixed.failed} could not be saved` : ''}.` : `Updating ${fixed.done + fixed.failed} of ${fixed.total}`}</span>}
                </div>
              )}
            </div>
          )}
          {fresh.length === 0 ? (
            <p className="text-[#1e2522]/70">Every video on the channel is already in your messages.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
                <button type="button" onClick={() => setPicked(Object.fromEntries(fresh.map(v => [v.id, true])))} className="underline underline-offset-4 font-semibold">Select all</button>
                <button type="button" onClick={() => setPicked({})} className="underline underline-offset-4 font-semibold">Select none</button>
                <span className="text-[#1e2522]/70">{chosen.length} of {fresh.length} selected</span>
              </div>
              <ul className="divide-y divide-[#1e2522]/10 max-h-[28rem] overflow-y-auto border border-[#1e2522]/10 rounded-lg">
                {fresh.map(v => {
                  const m = toMessage(v);
                  return (
                    <li key={v.id}>
                      <label className="flex items-start gap-4 p-3 cursor-pointer hover:bg-[#1e2522]/5">
                        <input type="checkbox" checked={Boolean(picked[v.id])} onChange={(e) => setPicked(p => ({ ...p, [v.id]: e.target.checked }))} className="mt-1 w-5 h-5 accent-[#c74f2f]" />
                        <img src={v.thumbnail} alt="" loading="lazy" className="w-28 aspect-video object-cover rounded bg-[#1e2522]/10" />
                        <span className="text-sm">
                          <span className="block font-bold">{m.title}</span>
                          <span className="block text-[#1e2522]/70">{[m.speaker, m.scripture, m.date && formatDate(m.date)].filter(Boolean).join('  |  ')}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <label className="flex items-center gap-3 mt-4 text-sm cursor-pointer">
                <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="w-5 h-5 accent-[#c74f2f]" />
                Show them on the website right away (leave unchecked to save them as drafts)
              </label>
              <div className="mt-4 flex items-center gap-4">
                <button type="button" onClick={run} disabled={busy || chosen.length === 0} className="bg-[#eaa235] text-[#1e2522] font-bold py-2.5 px-5 rounded-lg disabled:opacity-50">
                  {busy ? `Importing ${progress.done + progress.failed} of ${progress.total}` : `Import ${chosen.length} ${chosen.length === 1 ? 'video' : 'videos'}`}
                </button>
                {progress?.finished && (
                  <p role="status" className="text-sm font-semibold">
                    {progress.done} imported{progress.failed ? `, ${progress.failed} could not be saved` : ''}.
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
