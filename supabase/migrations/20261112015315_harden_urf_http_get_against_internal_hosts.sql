-- F4: block server-side fetches aimed at loopback, private and link-local hosts,
-- on the initial URL and on every redirect hop.

CREATE OR REPLACE FUNCTION public.urf_url_is_public(target_url text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE
  host text;
BEGIN
  IF target_url IS NULL OR btrim(target_url) = '' THEN
    RETURN false;
  END IF;

  -- only plain http(s) is allowed (no file:, gopher:, dict:, ftp: ...)
  IF target_url !~* '^https?://' THEN
    RETURN false;
  END IF;

  host := lower(split_part(regexp_replace(target_url, '^https?://', '', 'i'), '/', 1));
  -- strip credentials and port
  host := split_part(host, '@', greatest(array_length(string_to_array(host, '@'), 1), 1));
  host := split_part(host, ':', 1);
  host := btrim(host, '[]');

  IF host = '' THEN
    RETURN false;
  END IF;

  -- hostnames that resolve inside the network
  IF host IN ('localhost', 'localhost.localdomain', 'metadata', 'metadata.google.internal') THEN
    RETURN false;
  END IF;
  IF host ~ '\.(local|internal|localdomain|home|lan)$' THEN
    RETURN false;
  END IF;

  -- IPv6 loopback / unique-local / link-local
  IF host = '::1' OR host ~ '^(fc|fd)[0-9a-f]{2}:' OR host ~ '^fe80:' OR host ~ '^::ffff:' THEN
    RETURN false;
  END IF;

  -- IPv4 literals in reserved ranges
  IF host ~ '^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$' THEN
    IF host ~ '^127\.'
       OR host ~ '^10\.'
       OR host ~ '^192\.168\.'
       OR host ~ '^169\.254\.'
       OR host ~ '^0\.'
       OR host ~ '^172\.(1[6-9]|2[0-9]|3[01])\.'
       OR host ~ '^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\.'
       OR host ~ '^(22[4-9]|2[3-5][0-9])\.'
    THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END
$function$;

REVOKE EXECUTE ON FUNCTION public.urf_url_is_public(text) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.urf_http_get(start_url text)
RETURNS extensions.http_response
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  u text := start_url;
  r extensions.http_response;
  loc text;
  i integer;
BEGIN
  IF NOT public.urf_url_is_public(u) THEN
    RAISE EXCEPTION 'That address is not allowed.';
  END IF;

  PERFORM extensions.http_set_curlopt('CURLOPT_TIMEOUT', '30');

  FOR i IN 1..6 LOOP
    r := extensions.http(('GET', u, ARRAY[extensions.http_header('User-Agent', 'UpperRoomFellowshipSite/1.0')], NULL, NULL)::extensions.http_request);
    IF r.status IN (301, 302, 303, 307, 308) THEN
      SELECT h.value INTO loc FROM unnest(r.headers) h WHERE lower(h.field) = 'location' LIMIT 1;
      EXIT WHEN loc IS NULL OR btrim(loc) = '';
      IF loc ~* '^https?://' THEN
        u := loc;
      ELSIF loc LIKE '/%' THEN
        u := substring(u from '^https?://[^/]+') || loc;
      ELSE
        EXIT;
      END IF;
      IF NOT public.urf_url_is_public(u) THEN
        RAISE EXCEPTION 'That address is not allowed.';
      END IF;
    ELSE
      RETURN r;
    END IF;
  END LOOP;

  RETURN r;
END
$function$;
