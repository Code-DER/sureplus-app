-- Add imageUrl to CharityPost table
ALTER TABLE "CharityPost" ADD COLUMN "imageUrl" TEXT;

-- Create storage bucket for charity images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('charity_images', 'charity_images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for charity_images
-- Use DO blocks to safely create policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'charity_images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Charities can upload images' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Charities can upload images" ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'charity_images' AND 
            auth.role() = 'authenticated'
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own files' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Users can update their own files" ON storage.objects
        FOR UPDATE USING ( bucket_id = 'charity_images' AND owner = auth.uid() );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own files' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Users can delete their own files" ON storage.objects
        FOR DELETE USING ( bucket_id = 'charity_images' AND owner = auth.uid() );
    END IF;
END
$$;
