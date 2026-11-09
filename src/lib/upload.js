import { backend } from './backend';

// Photos upload to Supabase Storage (the "site-images" bucket) as the signed-in staff member.
// If a Cloudinary cloud name and unsigned preset are set in the environment, those are used instead.
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const BUCKET = 'site-images';
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_EDGE = 1920;
const KEEP_UNDER = 250 * 1024;

export const uploadsEnabled = Boolean((CLOUD && PRESET) || backend.configured);

const safeName = (name) => String(name || 'photo').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'photo';
const extFor = (type) => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }[type] || 'jpg');

// Photos are resized to 1920px wide at most and saved as WebP before upload so pages stay fast. Small images, GIFs and anything the browser cannot draw go up unchanged.
async function shrink(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || typeof createImageBitmap !== 'function' || typeof document === 'undefined') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < KEEP_UNDER) { bitmap.close?.(); return file; }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    // WebP keeps transparency (logos, leader photos) and is far smaller than JPEG or PNG at the same look.
    let blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.8));
    if (!blob || blob.type !== 'image/webp') blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    return blob && blob.size < file.size ? new File([blob], file.name, { type: blob.type }) : file;
  } catch {
    return file;
  }
}

export async function uploadImage(input) {
  if (!uploadsEnabled) throw new Error('Photo uploads are not set up');
  if (!input.type.startsWith('image/')) throw new Error('Please choose an image file');
  if (input.size > MAX_BYTES * 2) throw new Error('That photo is too large. Please choose one under 20 MB.');
  const file = await shrink(input);
  if (file.size > MAX_BYTES) throw new Error('Image must be 10 MB or smaller');

  if (!backend.configured && CLOUD && PRESET) {
    const body = new FormData();
    body.append('file', file);
    body.append('upload_preset', PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.secure_url) throw new Error(json?.error?.message || 'Upload failed');
    return json.secure_url;
  }

  const stamp = new Date();
  const path = `${stamp.getFullYear()}/${String(stamp.getMonth() + 1).padStart(2, '0')}/${Math.random().toString(36).slice(2, 10)}-${safeName(file.name)}.${extFor(file.type)}`;
  const res = await backend.upload(BUCKET, path, file);
  if (res.status !== 'success') throw new Error(res.error || 'Upload failed');
  return res.data.url;
}
