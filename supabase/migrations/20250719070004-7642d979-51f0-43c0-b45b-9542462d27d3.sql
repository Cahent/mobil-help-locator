-- Create vehicle status enum
CREATE TYPE public.vehicle_status AS ENUM ('verfügbar', 'im_einsatz', 'ruhezeit', 'nicht_verfügbar');

-- Add vehicle status and assigned user to emergency_vehicles table
ALTER TABLE public.emergency_vehicles 
ADD COLUMN status public.vehicle_status DEFAULT 'verfügbar',
ADD COLUMN assigned_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policies for emergency vehicles to allow drivers to update their own vehicle status
CREATE POLICY "Drivers can update their assigned vehicle status"
ON public.emergency_vehicles
FOR UPDATE
TO authenticated
USING (assigned_user_id = auth.uid())
WITH CHECK (assigned_user_id = auth.uid());

-- Create index for better performance
CREATE INDEX idx_emergency_vehicles_assigned_user ON public.emergency_vehicles(assigned_user_id);
CREATE INDEX idx_emergency_vehicles_status ON public.emergency_vehicles(status);