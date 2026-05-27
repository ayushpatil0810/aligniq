-- AlignIQ Schema Migration
-- Run this in your Neon PostgreSQL console or via drizzle-kit generate

-- ─── Enums ────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE resume_status AS ENUM ('pending', 'processing', 'done', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE job_category AS ENUM ('frontend', 'backend', 'fullstack', 'mobile', 'devops', 'data', 'ai', 'design', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE job_level AS ENUM ('intern', 'junior', 'mid', 'senior', 'staff', 'principal');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE analysis_status AS ENUM ('pending', 'processing', 'done', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE readiness_level AS ENUM ('not-ready', 'developing', 'ready', 'strong');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── Resume ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "resume" (
  "id"           text PRIMARY KEY,
  "user_id"      text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "file_name"    text NOT NULL,
  "file_url"     text NOT NULL,
  "storage_path" text NOT NULL,
  "raw_text"     text,
  "parsed_data"  jsonb,
  "score"        integer,
  "status"       resume_status NOT NULL DEFAULT 'pending',
  "created_at"   timestamp DEFAULT now() NOT NULL,
  "updated_at"   timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "resume_userId_idx" ON "resume"("user_id");
CREATE INDEX IF NOT EXISTS "resume_status_idx" ON "resume"("status");

-- ─── Job Description ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS "job_description" (
  "id"           text PRIMARY KEY,
  "title"        text NOT NULL,
  "company"      text NOT NULL,
  "category"     job_category NOT NULL,
  "level"        job_level NOT NULL,
  "description"  text NOT NULL,
  "requirements" jsonb NOT NULL,
  "is_active"    boolean NOT NULL DEFAULT true,
  "created_at"   timestamp DEFAULT now() NOT NULL,
  "updated_at"   timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "job_category_idx" ON "job_description"("category");
CREATE INDEX IF NOT EXISTS "job_level_idx" ON "job_description"("level");
CREATE INDEX IF NOT EXISTS "job_active_idx" ON "job_description"("is_active");

-- ─── Analysis Result ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS "analysis_result" (
  "id"               text PRIMARY KEY,
  "user_id"          text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "resume_id"        text NOT NULL REFERENCES "resume"("id") ON DELETE CASCADE,
  "job_id"           text NOT NULL REFERENCES "job_description"("id") ON DELETE CASCADE,
  "match_score"      integer,
  "skills_matched"   jsonb,
  "skills_missing"   jsonb,
  "strengths"        jsonb,
  "weaknesses"       jsonb,
  "insights"         text,
  "readiness_level"  readiness_level,
  "status"           analysis_status NOT NULL DEFAULT 'pending',
  "created_at"       timestamp DEFAULT now() NOT NULL,
  "updated_at"       timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "analysis_userId_idx" ON "analysis_result"("user_id");
CREATE INDEX IF NOT EXISTS "analysis_resumeId_idx" ON "analysis_result"("resume_id");
CREATE INDEX IF NOT EXISTS "analysis_jobId_idx" ON "analysis_result"("job_id");
CREATE INDEX IF NOT EXISTS "analysis_status_idx" ON "analysis_result"("status");

-- ─── Roadmap ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "roadmap" (
  "id"           text PRIMARY KEY,
  "analysis_id"  text NOT NULL REFERENCES "analysis_result"("id") ON DELETE CASCADE,
  "user_id"      text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "weeks"        jsonb NOT NULL,
  "current_week" integer NOT NULL DEFAULT 1,
  "progress"     integer NOT NULL DEFAULT 0,
  "created_at"   timestamp DEFAULT now() NOT NULL,
  "updated_at"   timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "roadmap_userId_idx" ON "roadmap"("user_id");
CREATE INDEX IF NOT EXISTS "roadmap_analysisId_idx" ON "roadmap"("analysis_id");

-- ─── Interview Questions ──────────────────────────────────

CREATE TABLE IF NOT EXISTS "interview_question" (
  "id"           text PRIMARY KEY,
  "analysis_id"  text NOT NULL REFERENCES "analysis_result"("id") ON DELETE CASCADE,
  "user_id"      text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "questions"    jsonb NOT NULL,
  "created_at"   timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "interview_userId_idx" ON "interview_question"("user_id");
CREATE INDEX IF NOT EXISTS "interview_analysisId_idx" ON "interview_question"("analysis_id");
