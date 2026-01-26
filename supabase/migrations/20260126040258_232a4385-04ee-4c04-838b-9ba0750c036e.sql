-- Create storage bucket for temporary brochure images
INSERT INTO storage.buckets (id, name, public)
VALUES ('brochure-images', 'brochure-images', true);

-- Allow public read access to brochure images
CREATE POLICY "Public read access for brochure images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'brochure-images');

-- Allow service role to upload images (edge functions use service role)
CREATE POLICY "Service role can upload brochure images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'brochure-images');

-- Allow service role to delete old images
CREATE POLICY "Service role can delete brochure images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'brochure-images');