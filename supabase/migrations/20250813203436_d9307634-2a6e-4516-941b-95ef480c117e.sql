-- Create customers table for freight forwarders and logistics companies
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  mobile_phone TEXT,
  address_street TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_postal_code TEXT NOT NULL,
  address_country TEXT NOT NULL DEFAULT 'Deutschland',
  tax_number TEXT,
  vat_number TEXT,
  commercial_register TEXT,
  business_type TEXT DEFAULT 'Spedition',
  payment_terms TEXT DEFAULT 'Net 30',
  credit_limit DECIMAL(10,2) DEFAULT 0.00,
  fleet_size INTEGER DEFAULT 0,
  preferred_service_radius INTEGER DEFAULT 50,
  emergency_contact_phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for customer access
CREATE POLICY "Users can view customers they created" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their customers" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their customers" 
ON public.customers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can manage all customers
CREATE POLICY "Admins can manage all customers" 
ON public.customers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_company_name ON public.customers(company_name);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_is_active ON public.customers(is_active);