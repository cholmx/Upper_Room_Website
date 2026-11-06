// Turns a YouTube video into the fields of a message. Titles on the channel usually look like
// "Acts 10-11 :: Who Is the Gospel For? // Josh Osborn" (passage :: title // speaker). Anything that does
// not fit that shape keeps its whole title, and staff can edit every field after importing.

export function parseVideoTitle(raw) {
  let title = String(raw || '').trim();
  let speaker = '';
  let scripture = '';
  const bySpeaker = title.split(/\s+\/\/\s+/);
  if (bySpeaker.length > 1) {
    speaker = bySpeaker.pop().trim();
    title = bySpeaker.join(' // ').trim();
  }
  const byPassage = title.split(/\s+::\s+/);
  if (byPassage.length > 1) {
    scripture = byPassage.shift().trim();
    title = byPassage.join(' :: ').trim();
  }
  return { title, speaker, scripture };
}

export function toMessage(video) {
  const { title, speaker, scripture } = parseVideoTitle(video.title);
  return {
    title: title || video.title,
    speaker,
    scripture,
    date: String(video.published || '').slice(0, 10) || null,
    description: String(video.description || '').trim().slice(0, 4000),
    video_url: `https://www.youtube.com/watch?v=${video.id}`,
  };
}
