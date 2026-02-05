-- ============================================
-- 003_v2_templates.sql
-- V2 Schema — Templates, URL-to-Code Jobs
-- Define now, create when needed (Month 3-6)
-- ============================================

-- ============================================
-- TEMPLATES (curated + user-contributed)
-- ============================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Template metadata
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'hero', 'pricing', 'features', 'testimonials', 'footer', 'navbar',
    'dashboard', 'form', 'gallery', 'blog', 'ecommerce', 'other'
  )),

  -- Content
  screenshot_url TEXT NOT NULL,         -- R2 URL
  code_html_tailwind TEXT,
  code_react TEXT,
  code_vue TEXT,
  code_plain_html TEXT,

  -- Community
  is_curated BOOLEAN DEFAULT FALSE,     -- Staff-picked
  is_public BOOLEAN DEFAULT TRUE,
  upvote_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0,

  -- SEO (each template is a landing page)
  slug TEXT UNIQUE NOT NULL,            -- /templates/saas-hero-section-react
  meta_title TEXT,
  meta_description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_slug ON templates(slug);
CREATE INDEX idx_templates_is_public ON templates(is_public) WHERE is_public = TRUE;

-- ============================================
-- URL-TO-CODE JOBS (async processing)
-- ============================================
CREATE TABLE url_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  input_url TEXT NOT NULL,
  screenshot_url TEXT,                  -- R2 URL after screenshotting
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'screenshotting', 'generating', 'completed', 'failed'
  )),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
