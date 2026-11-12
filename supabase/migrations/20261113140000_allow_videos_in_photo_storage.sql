/*
# Allow MP4 and WebM videos in the photo storage (again)

The "site-images" bucket must accept videos up to 50 MB for the video option in Site Photos. An earlier migration
did this, but it is applied again here in case it was never run, or the bucket was reset afterward. The photo
storage migrations were also updated so running them again no longer takes video back out.

Safe to run more than once.
*/

UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
WHERE id = 'site-images';
