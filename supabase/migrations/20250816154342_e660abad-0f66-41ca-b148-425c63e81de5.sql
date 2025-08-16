-- Fix the service provider RLS policies to allow proper access
-- Drop the problematic policies
DROP POLICY IF EXISTS "Authenticated users can view basic provider info" ON public.service_providers;
DROP POLICY IF EXISTS "Authorized personnel can view full provider data" ON public.service_providers;

-- Create a policy that allows anyone to view basic service provider info for public search
CREATE POLICY "Public can view active service providers" 
ON public.service_providers 
FOR SELECT 
USING (is_active = true);

-- Create a policy for admins to manage all providers
CREATE POLICY "Admins can manage all service providers" 
ON public.service_providers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));