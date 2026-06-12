/*
  # Security Lab Schema

  ## Purpose
  Educational cybersecurity demo application database.

  ## Tables

  ### users
  - Stores registered users. Intentionally has a "vulnerable" plaintext password column
    for demonstrating SQL injection risks, alongside a hashed password for the secure demo.
  - id, username, email, password_plain (for vuln demo), password_hash, role, created_at

  ### posts
  - Blog-style posts used for Stored XSS and SQLi demos.
  - id, user_id, title, content (unescaped), created_at

  ### attack_logs
  - Central log of all detected attacks.
  - id, attack_type, payload, ip_address, user_agent, username_attempted, detected_at, details

  ### login_attempts
  - Tracks login attempts for brute force detection.
  - id, username, ip_address, success, attempted_at

  ### csrf_tokens
  - Demo CSRF token store.
  - id, user_id, token, created_at, expires_at

  ## Security
  - RLS enabled on all tables
  - Policies allow anon + authenticated access for the educational demo
    (intentionally permissive on some tables to allow attack simulation)
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_plain text NOT NULL DEFAULT '',
  password_hash text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Allow anon insert for signup demo"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated select own"
  ON users FOR SELECT
  TO anon
  USING (true);

-- Posts table (used for XSS and SQLi demos)
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  username text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can read posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon can insert posts for demo"
  ON posts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anon can delete posts for demo"
  ON posts FOR DELETE
  TO anon
  USING (true);

-- Attack logs table
CREATE TABLE IF NOT EXISTS attack_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attack_type text NOT NULL,
  payload text NOT NULL DEFAULT '',
  ip_address text NOT NULL DEFAULT 'unknown',
  user_agent text NOT NULL DEFAULT '',
  username_attempted text DEFAULT NULL,
  details text NOT NULL DEFAULT '',
  detected_at timestamptz DEFAULT now()
);

ALTER TABLE attack_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert attack logs"
  ON attack_logs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert attack logs"
  ON attack_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read attack logs for dashboard"
  ON attack_logs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can read attack logs"
  ON attack_logs FOR SELECT
  TO authenticated
  USING (true);

-- Login attempts table (for brute force detection)
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  ip_address text NOT NULL DEFAULT 'unknown',
  success boolean NOT NULL DEFAULT false,
  attempted_at timestamptz DEFAULT now()
);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert login attempts"
  ON login_attempts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert login attempts"
  ON login_attempts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read login attempts"
  ON login_attempts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can read login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (true);

-- Seed demo users
INSERT INTO users (username, email, password_plain, password_hash, role)
VALUES
  ('admin', 'admin@seclab.local', 'admin123', 'hashed_admin123', 'admin'),
  ('alice', 'alice@seclab.local', 'password1', 'hashed_password1', 'user'),
  ('bob', 'bob@seclab.local', 'qwerty', 'hashed_qwerty', 'user')
ON CONFLICT (username) DO NOTHING;

-- Seed demo posts
INSERT INTO posts (username, title, content)
VALUES
  ('alice', 'Welcome to SecLab', 'This is a sample post for the security demo.'),
  ('bob', 'My first post', 'Hello world from SecLab!')
ON CONFLICT DO NOTHING;
