-- Update user do5sar@aol.com to admin role
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get the user_id for the email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'do5sar@aol.com';
    
    -- If user exists, update/insert their role to admin
    IF target_user_id IS NOT NULL THEN
        -- Remove any existing roles for this user
        DELETE FROM public.user_roles WHERE user_id = target_user_id;
        
        -- Insert admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin');
        
        RAISE NOTICE 'User do5sar@aol.com has been granted admin access';
    ELSE
        RAISE NOTICE 'User do5sar@aol.com not found';
    END IF;
END $$;