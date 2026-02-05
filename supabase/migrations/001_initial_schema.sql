-- ============================================
-- 001_initial_schema.sql
-- MVP Schema — Users, Generations, Usage Tracking
-- ============================================

-- ============================================
-- USERS (synced from Clerk via webhook)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_subscription_status TEXT CHECK (stripe_subscription_status IN (
    'active', 'past_due', 'canceled', 'incomplete', 'trialing', NULL
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);

-- ============================================
-- GENERATIONS (each screenshot-to-code conversion)
-- ============================================
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Input
  input_image_url TEXT NOT NULL,        -- R2 URL for uploaded screenshot
  input_image_hash TEXT NOT NULL,       -- SHA-256 of normalized image pixels
  input_framework TEXT NOT NULL CHECK (input_framework IN (
    'html-tailwind', 'react', 'vue', 'plain-html'
  )),
  input_refinement_prompt TEXT,         -- If this is a follow-up refinement

  -- Output
  output_code TEXT,
  cache_key TEXT,                       -- SHA-256 for deduplication

  -- AI metadata
  model_used TEXT NOT NULL DEFAULT 'kimi-k2.5',
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_cost_usd DECIMAL(10, 6),
  latency_ms INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'streaming', 'completed', 'failed', 'cached'
  )),
  error_message TEXT,

  -- Iteration tracking
  parent_generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  iteration_number INTEGER DEFAULT 1,

  -- User feedback (for quality tracking / kill criteria)
  quality_rating SMALLINT CHECK (quality_rating IN (1, -1, NULL)),  -- thumbs up / thumbs down

  -- Organization (V1.5 -- nullable for now)
  collection_id UUID,                   -- FK added when collections table is created

  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_cache_key ON generations(cache_key);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX idx_generations_user_created ON generations(user_id, created_at DESC);

-- ============================================
-- USAGE TRACKING (daily aggregates for free tier limit + analytics)
-- ============================================
CREATE TABLE usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  generations_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  UNIQUE(user_id, date)
);
CREATE INDEX idx_usage_daily_user_date ON usage_daily(user_id, date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_daily ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "users_own_data" ON users
  FOR ALL USING (clerk_id = current_setting('app.clerk_id', true));

CREATE POLICY "generations_own_data" ON generations
  FOR ALL USING (user_id = (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));

CREATE POLICY "usage_own_data" ON usage_daily
  FOR ALL USING (user_id = (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));
