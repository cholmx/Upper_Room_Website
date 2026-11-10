/*
# Allow short videos in the photo storage

The "site-images" bucket accepted only images, up to 10 MB. It now also accepts MP4 and WebM videos, up to 50 MB,
so a short silent loop can be uploaded in place of a photo in Site Photos. Safe to run more than once.
*/

UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
WHERE id = 'site-images';
