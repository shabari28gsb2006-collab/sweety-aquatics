ALTER TABLE "ContactSettings" ADD COLUMN IF NOT EXISTS "customCategories" JSONB NOT NULL DEFAULT '[]'::jsonb;
