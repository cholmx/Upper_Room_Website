-- F8: pin the schema lookup path on the helper functions so a function or
-- operator cannot be shadowed by an object created in another schema.

ALTER FUNCTION public.urf_html(text) SET search_path = public;
ALTER FUNCTION public.urf_plain(text) SET search_path = public;
ALTER FUNCTION public.urf_speaker_name(text) SET search_path = public;
ALTER FUNCTION public.urf_split_description(text) SET search_path = public;
ALTER FUNCTION public.urf_parse_video_title(text) SET search_path = public;
ALTER FUNCTION public.urf_sunday_on_or_before(timestamp with time zone) SET search_path = public;
ALTER FUNCTION public.urf_xml_text(xml[]) SET search_path = public;
