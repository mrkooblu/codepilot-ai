-- ============================================
-- 002_v15_collections.sql
-- V1.5 Schema — Collections, Tags, Generation Tags
-- Define now, create when needed (Month 2-3)
-- ============================================

-- ============================================
-- COLLECTIONS (folders for organizing generations)
-- ============================================
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Collection',
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,      -- For community showcase gallery
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_collections_user_id ON collections(user_id);

-- Add FK to generations
ALTER TABLE generations
  ADD CONSTRAINT fk_generations_collection
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL;
CREATE INDEX idx_generations_collection_id ON generations(collection_id);

-- ============================================
-- TAGS (free-text labels for generations)
-- ============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE(user_id, name)
);

CREATE TABLE generation_tags (
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (generation_id, tag_id)
);
