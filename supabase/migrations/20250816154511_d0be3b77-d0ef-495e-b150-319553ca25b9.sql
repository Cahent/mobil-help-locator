-- Recreate the service_providers_public view that was lost
CREATE OR REPLACE VIEW public.service_providers_public AS
SELECT 
  id,
  name,
  service_radius_km,
  is_active,
  -- Only show general location info, not full address
  CASE 
    WHEN address IS NOT NULL THEN 
      SPLIT_PART(address, ',', -1) -- Show only last part after comma (city/region)
    ELSE NULL 
  END as service_area
FROM public.service_providers
WHERE is_active = true;

-- Grant access to the public view
GRANT SELECT ON public.service_providers_public TO authenticated;
GRANT SELECT ON public.service_providers_public TO anon;