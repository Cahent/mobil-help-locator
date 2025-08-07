-- Fix security warning for generate_license_key function
CREATE OR REPLACE FUNCTION generate_license_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  key_part1 TEXT;
  key_part2 TEXT;
  key_part3 TEXT;
  key_part4 TEXT;
  full_key TEXT;
BEGIN
  -- Generate 4 parts of 4 characters each (alphanumeric)
  key_part1 := upper(substring(encode(gen_random_bytes(3), 'base64') from 1 for 4));
  key_part2 := upper(substring(encode(gen_random_bytes(3), 'base64') from 1 for 4));
  key_part3 := upper(substring(encode(gen_random_bytes(3), 'base64') from 1 for 4));
  key_part4 := upper(substring(encode(gen_random_bytes(3), 'base64') from 1 for 4));
  
  -- Remove problematic characters and ensure alphanumeric
  key_part1 := translate(key_part1, '/+=', 'ABC');
  key_part2 := translate(key_part2, '/+=', 'DEF');
  key_part3 := translate(key_part3, '/+=', 'GHI');
  key_part4 := translate(key_part4, '/+=', 'JKL');
  
  full_key := key_part1 || '-' || key_part2 || '-' || key_part3 || '-' || key_part4;
  
  RETURN full_key;
END;
$$;