-- ============================================
-- 004_v3_api_keys.sql
-- V3 Schema — API Keys for Developer Access
-- Define now, create when needed (Month 6-12)
-- ============================================

-- ============================================
-- API KEYS (for developer API access)
-- ============================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT UNIQUE NOT NULL,        -- SHA-256 of the API key (never store plaintext)
  key_prefix TEXT NOT NULL,             -- First 8 chars for identification (cp_live_abc12345...)
  name TEXT NOT NULL DEFAULT 'Default',
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
