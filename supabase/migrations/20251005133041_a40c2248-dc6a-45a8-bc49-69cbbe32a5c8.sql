-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create settings table for profile image and contact link
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_image_url TEXT,
  contact_link TEXT DEFAULT 'https://t.me/yourusername',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings
INSERT INTO public.settings (profile_image_url, contact_link) 
VALUES (NULL, 'https://t.me/yourusername');

-- Enable RLS on settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Settings policies - anyone can read, only admins can update
CREATE POLICY "Anyone can view settings"
  ON public.settings
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update settings"
  ON public.settings
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech TEXT[] NOT NULL DEFAULT '{}',
  link TEXT DEFAULT '#',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects policies - anyone can read, only admins can modify
CREATE POLICY "Anyone can view projects"
  ON public.projects
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update projects"
  ON public.projects
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete projects"
  ON public.projects
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true);

-- Storage policies for profile images
CREATE POLICY "Anyone can view profile images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-images');

CREATE POLICY "Only admins can upload profile images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Only admins can update profile images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile-images' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Only admins can delete profile images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile-images' 
    AND public.has_role(auth.uid(), 'admin')
  );