-- Create service providers table
CREATE TABLE public.service_providers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  service_radius_km integer DEFAULT 50,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create emergency vehicles table  
CREATE TABLE public.emergency_vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  license_plate text NOT NULL UNIQUE,
  vehicle_type text NOT NULL, -- 'tow_truck', 'mobile_service', 'crane', etc.
  brand text,
  model text,
  year integer,
  equipment text[], -- Array of equipment like ['winch', 'jump_starter', 'tire_repair']
  current_location_lat decimal(10,8),
  current_location_lng decimal(11,8),
  is_available boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_vehicles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_providers
CREATE POLICY "Admins can manage all service providers"
ON public.service_providers
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view active service providers"
ON public.service_providers
FOR SELECT
TO authenticated
USING (is_active = true);

-- RLS Policies for emergency_vehicles  
CREATE POLICY "Admins can manage all vehicles"
ON public.emergency_vehicles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view available vehicles"
ON public.emergency_vehicles
FOR SELECT
TO authenticated
USING (is_available = true);

-- Add triggers for updated_at
CREATE TRIGGER update_service_providers_updated_at
BEFORE UPDATE ON public.service_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_vehicles_updated_at
BEFORE UPDATE ON public.emergency_vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_service_providers_active ON public.service_providers(is_active);
CREATE INDEX idx_emergency_vehicles_provider ON public.emergency_vehicles(service_provider_id);
CREATE INDEX idx_emergency_vehicles_available ON public.emergency_vehicles(is_available);
CREATE INDEX idx_emergency_vehicles_location ON public.emergency_vehicles(current_location_lat, current_location_lng);