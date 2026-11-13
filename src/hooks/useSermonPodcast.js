import { useMemo } from 'react';
import useFetch from './useFetch';
import { findEpisode } from '../lib/podcastMatch';
import { safeUrl } from '../utils';

// The sermon podcast episodes, and the one that goes with a given message (matched by title and date).
export default function useSermonPodcast(message) {
  const { data } = useFetch('read/sermon_podcast_episodes_church?sort=published_at:desc');
  const episode = useMemo(() => (message ? findEpisode(message, data) : null), [message, data]);
  return {
    episode,
    appleUrl: episode ? safeUrl(episode.apple_url) : '',
    audioUrl: episode ? safeUrl(episode.audio_url) : '',
  };
}
