// Image uploads go to Cloudinary using an unsigned upload preset. When the two
// env vars are not set the admin falls back to pasting an image URL.
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadsEnabled = Boolean(CLOUD && PRESET);

export async function uploadImage(file) {
  if (!uploadsEnabled) throw new Error('Image uploads are not configured');
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file');
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be 10 MB or smaller');

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.secure_url) throw new Error(json?.error?.message || 'Upload failed');
  return json.secure_url;
}
