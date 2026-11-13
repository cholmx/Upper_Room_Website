import { useEffect, useMemo, useState } from 'react';
import { publicDataFetch } from '../api';
import { findEpisode } from '../lib/podcastMatch';
import { safeUrl } from '../utils';

// The sermon podcast is read once per page load and shared by every message on the page.
// feed: every episode from the podcast's own feed (audio file and episode page).
// apple: the newest episodes with their Apple Podcasts links.
let cache = null;
function load() {
  if (!cache) {
    cache = Promise.all([
      publicDataFetch('read/podcast_episodes_church?show_slug=sermons&sort=published_at:desc'),
      publicDataFetch('read/sermon_podcast_episodes_church?sort=published_at:desc'),
    ]).then(([feed, apple]) => {
      const out = {
        feed: feed.status === 'success' ? feed.data : [],
        apple: apple.status === 'success' ? apple.data : [],
      };
      // A failed read is not kept, so the next page tries again.
      if (feed.status !== 'success' && apple.status !== 'success') cache = null;
      return out;
    });
  }
  return cache;
}

export function resetSermonPodcastCache() { cache = null; }

// The Listen links for a message: its podcast episode on Apple Podcasts, the episode page (Spotify and more), and the audio file.
export default function useSermonPodcast(message) {
  const [lists, setLists] = useState(null);
  useEffect(() => {
    let live = true;
    load().then(l => { if (live) setLists(l); });
    return () => { live = false; };
  }, []);

  return useMemo(() => {
    if (!message || !lists) return { appleUrl: '', pageUrl: '', audioUrl: '', listenUrl: '' };
    const feedEp = findEpisode(message, lists.feed);
    const appleEp = findEpisode(message, lists.apple);
    const appleUrl = appleEp ? safeUrl(appleEp.apple_url) : '';
    const pageUrl = feedEp ? safeUrl(feedEp.page_url) : '';
    const audioUrl = (feedEp ? safeUrl(feedEp.audio_url) : '') || (appleEp ? safeUrl(appleEp.audio_url) : '');
    return { appleUrl, pageUrl, audioUrl, listenUrl: appleUrl || pageUrl };
  }, [message, lists]);
}
