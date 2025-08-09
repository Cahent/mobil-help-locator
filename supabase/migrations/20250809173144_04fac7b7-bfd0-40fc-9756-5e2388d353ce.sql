-- Erweitere die app_role enum um lizenzadmin
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'lizenzadmin';

-- Erstelle eine Tabelle für die Systemlizenz
CREATE TABLE public.system_license (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT false,
  activated_by uuid REFERENCES auth.users(id),
  activated_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS für system_license
ALTER TABLE public.system_license ENABLE ROW LEVEL SECURITY;

-- Policies für system_license
CREATE POLICY "Lizenzadmins can manage system license" 
ON public.system_license 
FOR ALL 
USING (has_role(auth.uid(), 'lizenzadmin'::app_role));

CREATE POLICY "All authenticated users can view active system license" 
ON public.system_license 
FOR SELECT 
USING (is_active = true);

-- Funktion um zu prüfen ob das System aktiviert ist
CREATE OR REPLACE FUNCTION public.is_system_licensed()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.system_license
    WHERE is_active = true
  )
$function$;

-- Trigger für updated_at
CREATE TRIGGER update_system_license_updated_at
  BEFORE UPDATE ON public.system_license
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Initiale Systemlizenz einfügen (inaktiv)
INSERT INTO public.system_license (license_key, is_active) 
VALUES ('SYSTEM-' || public.generate_license_key(), false);