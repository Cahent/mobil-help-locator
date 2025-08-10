-- =====================================================
-- PANNENPRO SCHEMA EXPORT FÜR EIGENEN SUPABASE SERVER
-- =====================================================

-- 1. ENUMS ERSTELLEN
CREATE TYPE app_role AS ENUM ('admin', 'user', 'driver');
CREATE TYPE vehicle_status AS ENUM ('verfügbar', 'unterwegs', 'im_einsatz', 'wartung');

-- 2. TABELLEN ERSTELLEN

-- Profiles Tabelle
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    username text,
    display_name text
);

-- User Roles Tabelle
CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- License Keys Tabelle
CREATE TABLE public.license_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    is_active boolean DEFAULT true NOT NULL,
    expires_at timestamp with time zone,
    max_users integer,
    current_users integer DEFAULT 0,
    features jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    license_key text NOT NULL,
    name text,
    description text
);

-- Service Providers Tabelle
CREATE TABLE public.service_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    service_radius_km integer DEFAULT 50,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    address text,
    name text NOT NULL,
    contact_person text,
    phone text,
    email text
);

-- Emergency Vehicles Tabelle
CREATE TABLE public.emergency_vehicles (
    assigned_user_id uuid,
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    service_provider_id uuid NOT NULL,
    year integer,
    current_location_lat numeric,
    current_location_lng numeric,
    is_available boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status vehicle_status DEFAULT 'verfügbar'::vehicle_status,
    equipment text[],
    license_plate text NOT NULL,
    vehicle_type text NOT NULL,
    brand text,
    model text
);

-- 3. FUNKTIONEN ERSTELLEN

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- License key generator
CREATE OR REPLACE FUNCTION public.generate_license_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  key_part1 TEXT;
  key_part2 TEXT;
  key_part3 TEXT;
  key_part4 TEXT;
  full_key TEXT;
  random_uuid TEXT;
BEGIN
  random_uuid := replace(gen_random_uuid()::text, '-', '');
  
  key_part1 := upper(substring(random_uuid from 1 for 4));
  key_part2 := upper(substring(random_uuid from 5 for 4));
  key_part3 := upper(substring(random_uuid from 9 for 4));
  key_part4 := upper(substring(random_uuid from 13 for 4));
  
  key_part1 := translate(key_part1, '0123456789', 'ABCDEFGHIJ');
  key_part2 := translate(key_part2, '0123456789', 'KLMNOPQRST');
  key_part3 := translate(key_part3, '0123456789', 'UVWXYZABCD');
  key_part4 := translate(key_part4, '0123456789', 'EFGHIJKLMN');
  
  full_key := key_part1 || '-' || key_part2 || '-' || key_part3 || '-' || key_part4;
  
  RETURN full_key;
END;
$$;

-- Role checker function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- New user handler
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- 4. TRIGGER ERSTELLEN

-- Update timestamp triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_license_keys_updated_at
    BEFORE UPDATE ON public.license_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at
    BEFORE UPDATE ON public.service_providers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_vehicles_updated_at
    BEFORE UPDATE ON public.emergency_vehicles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Auth trigger (nur wenn auth.users Tabelle existiert)
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION public.handle_new_user();

-- 5. ROW LEVEL SECURITY AKTIVIEREN

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_vehicles ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES ERSTELLEN

-- Profiles Policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Roles Policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- License Keys Policies
CREATE POLICY "Users can view active license keys" ON public.license_keys FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all license keys" ON public.license_keys FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Service Providers Policies
CREATE POLICY "Users can view active service providers" ON public.service_providers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all service providers" ON public.service_providers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Emergency Vehicles Policies
CREATE POLICY "Users can view available vehicles" ON public.emergency_vehicles FOR SELECT USING (is_available = true);
CREATE POLICY "Drivers can update their assigned vehicle status" ON public.emergency_vehicles FOR UPDATE USING (assigned_user_id = auth.uid()) WITH CHECK (assigned_user_id = auth.uid());
CREATE POLICY "Admins can manage all vehicles" ON public.emergency_vehicles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- ENDE DES SCHEMA EXPORTS
-- =====================================================