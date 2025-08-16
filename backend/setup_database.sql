-- Bubbl Database Setup for Supabase
-- Run these commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comics table
CREATE TABLE IF NOT EXISTS comics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pdf_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comic_id UUID REFERENCES comics(id) ON DELETE CASCADE,
    current_panel INTEGER DEFAULT 1,
    current_page INTEGER DEFAULT 1,
    character_assignments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for comics (run this in Supabase storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('comics', 'comics', true);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE comics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view own data" ON users
    FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Users can manage own comics" ON comics
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own sessions" ON sessions
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Insert a test user for MVP (since we're not implementing full auth yet)
INSERT INTO users (id, name, email) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Test User', 'test@bubbl.app')
ON CONFLICT (id) DO NOTHING;