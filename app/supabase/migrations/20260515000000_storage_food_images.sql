-- ============================================================
-- Storage: food-images bucket
-- Public bucket for food listing photos uploaded by sellers.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'food_images',
  'food_images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
