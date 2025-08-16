-- Remove the security definer view that was causing issues
DROP VIEW IF EXISTS public.service_providers_public;

-- Create a simple view without security definer
CREATE VIEW public.service_providers_public AS
SELECT 
  id,
  name,
  service_radius_km,
  is_active,
  -- Only show general location info, not full address  
  CASE 
    WHEN address IS NOT NULL THEN 
      TRIM(SPLIT_PART(address, ',', 2)) -- Show city part after first comma
    ELSE 'Service Area'
  END as service_area
FROM public.service_providers
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.service_providers_public TO authenticated;
GRANT SELECT ON public.service_providers_public TO anon;