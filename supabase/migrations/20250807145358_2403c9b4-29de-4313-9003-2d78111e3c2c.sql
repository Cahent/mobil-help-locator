-- Create license keys table
CREATE TABLE public.license_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_users INTEGER,
  current_users INTEGER DEFAULT 0,
  features JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all license keys" 
ON public.license_keys 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view active license keys" 
ON public.license_keys 
FOR SELECT 
USING (is_active = true);

-- Create function to generate license key
CREATE OR REPLACE FUNCTION generate_license_key()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Create trigger for updated_at
CREATE TRIGGER update_license_keys_updated_at
BEFORE UPDATE ON public.license_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();