// The front page area below the hero. Staff save several layouts and turn them on or off;
// every layout that is on (and inside its optional start and end days) is shown, in order.

export const LAYOUTS = [
  { value: 'centered', label: 'Centered text' },
  { value: 'photo-right', label: 'Text with photo on the right' },
  { value: 'photo-left', label: 'Text with photo on the left' },
  { value: 'banner', label: 'Slim banner with one button' },
];

export const TONES = [
  { value: 'white', label: 'White' },
  { value: 'tan', label: 'Sand' },
  { value: 'ink', label: 'Near black' },
  { value: 'terra', label: 'Orange red' },
  { value: 'gold', label: 'Amber' },
];

const off = (v) => v === false || v === 0 || v === '0' || v === 'false';
const day = (v) => (v ? String(v).slice(0, 10) : '');

export function activeSpotlights(rows, today = new Date().toISOString().slice(0, 10)) {
  return (rows ?? [])
    .filter(r => r && !off(r.published))
    .filter(r => !day(r.publish_date) || day(r.publish_date) <= today)
    .filter(r => !day(r.end_date) || day(r.end_date) >= today)
    .filter(r => r.title || r.body || r.image_url)
    .sort((a, b) => (Number(a.sort_order_num) || 0) - (Number(b.sort_order_num) || 0));
}
