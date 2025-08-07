-- Fix the generate_license_key function to use available PostgreSQL functions
CREATE OR REPLACE FUNCTION public.generate_license_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  key_part1 TEXT;
  key_part2 TEXT;
  key_part3 TEXT;
  key_part4 TEXT;
  full_key TEXT;
  random_uuid TEXT;
BEGIN
  -- Generate a random UUID and use it to create key parts
  random_uuid := replace(gen_random_uuid()::text, '-', '');
  
  -- Extract 4 character parts from the UUID (remove hyphens first)
  key_part1 := upper(substring(random_uuid from 1 for 4));
  key_part2 := upper(substring(random_uuid from 5 for 4));
  key_part3 := upper(substring(random_uuid from 9 for 4));
  key_part4 := upper(substring(random_uuid from 13 for 4));
  
  -- Ensure alphanumeric by replacing any non-alphanumeric characters
  key_part1 := translate(key_part1, '0123456789', 'ABCDEFGHIJ');
  key_part2 := translate(key_part2, '0123456789', 'KLMNOPQRST');
  key_part3 := translate(key_part3, '0123456789', 'UVWXYZABCD');
  key_part4 := translate(key_part4, '0123456789', 'EFGHIJKLMN');
  
  full_key := key_part1 || '-' || key_part2 || '-' || key_part3 || '-' || key_part4;
  
  RETURN full_key;
END;
$function$;