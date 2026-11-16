/*
# The new color palette in emails

The site now uses these colors: jet black #1C2A2B, dark teal #003235, jungle teal #5D947B, sandy brown #F9AB55,
rosy copper #C65D3B, cream #F4ECDD and white. This changes the colors written inside the database functions that build
emails (the weekly email, its sign-up confirmation, the welcome emails and the form notices):
- old ink #1e2522 becomes jet black, old terracotta #c74f2f becomes rosy copper, old amber #eaa235 becomes sandy brown
- gray text (#555, #666, #777) becomes dark teal, and gray lines (#ddd and similar) become jungle teal
- the pale boxes (#f4f1e8, #f1ede2, #ede9dc) become cream
Only the colors change. Safe to run more than once.
*/

DO $$
DECLARE
  f record;
  def text;
  nxt text;
  pairs text[][] := ARRAY[
    ['#c74f2f', '#C65D3B'], ['#a83f23', '#003235'], ['#1e2522', '#1C2A2B'], ['#eaa235', '#F9AB55'],
    ['#(?:555555|555|666666|666|777777|777)', '#003235'],
    ['#(?:dddddd|ddd|d9d2c0|ddd6c4|e6e0d0|e3e3e3)', '#5D947B'],
    ['#(?:f4f1e8|f1ede2|ede9dc)', '#F4ECDD']
  ];
  i integer;
BEGIN
  FOR f IN
    SELECT p.oid, p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prokind = 'f'
      AND p.prosrc ~* '#(?:c74f2f|a83f23|1e2522|eaa235|555555|555|666666|666|777777|777|dddddd|ddd|d9d2c0|ddd6c4|e6e0d0|e3e3e3|f4f1e8|f1ede2|ede9dc)(?![0-9a-f])'
  LOOP
    def := pg_get_functiondef(f.oid);
    FOR i IN 1..array_length(pairs, 1) LOOP
      def := regexp_replace(def, pairs[i][1] || '(?![0-9a-fA-F])', pairs[i][2], 'gi');
    END LOOP;
    EXECUTE def;
    RAISE NOTICE 'Updated the colors in %', f.proname;
  END LOOP;
END $$;
