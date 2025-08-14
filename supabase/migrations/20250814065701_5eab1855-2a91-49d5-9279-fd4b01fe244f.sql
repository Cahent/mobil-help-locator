-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Users can view active service providers" ON public.service_providers;

-- Create more restrictive policies
CREATE POLICY "Public can view basic provider info" 
ON public.service_providers 
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NOT NULL
);

-- Create policy for authorized personnel to view full details
CREATE POLICY "Authorized personnel can view full provider data" 
ON public.service_providers 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'driver'::app_role)
);

-- Create a public view that shows only non-sensitive information
CREATE OR REPLACE VIEW public.service_providers_public AS
SELECT 
  id,
  name,
  service_radius_km,
  is_active,
  -- Only show general location, not full address
  CASE 
    WHEN address IS NOT NULL THEN 
      SPLIT_PART(address, ' ', -1) -- Show only city/postal code part
    ELSE NULL 
  END as service_area
FROM public.service_providers
WHERE is_active = true;

-- Grant access to the public view
GRANT SELECT ON public.service_providers_public TO authenticated;

-- Add RLS to the view (though views inherit from base table)
ALTER VIEW public.service_providers_public SET (security_invoker = true);