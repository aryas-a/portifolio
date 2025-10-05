-- Add image_url column to projects table
ALTER TABLE public.projects
ADD COLUMN image_url TEXT;

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project images
CREATE POLICY "Anyone can view project images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

CREATE POLICY "Admins can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update project images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-images' AND auth.role() = 'authenticated' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete project images"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-images' AND auth.role() = 'authenticated' AND public.has_role(auth.uid(), 'admin'::app_role));