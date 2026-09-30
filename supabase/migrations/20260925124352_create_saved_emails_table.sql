/*
# Create saved_emails table (single-tenant, no auth)

1. New Tables
- `saved_emails`
  - `id` (uuid, primary key)
  - `recipient_name` (text, name of email recipient)
  - `purpose` (text, purpose/subject of the email)
  - `email_type` (text, type: General, Job Application, Leave Request, Meeting Request, Thank You)
  - `tone` (text, tone: Professional, Friendly, Formal, Casual)
  - `length` (text, length: Short, Medium, Long)
  - `generated_email` (text, the full generated email body)
  - `created_at` (timestamp, when the email was saved)

2. Security
- Enable RLS on `saved_emails`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in screen in this app).
*/

CREATE TABLE IF NOT EXISTS saved_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name text NOT NULL DEFAULT '',
  purpose text NOT NULL DEFAULT '',
  email_type text NOT NULL DEFAULT 'General',
  tone text NOT NULL DEFAULT 'Professional',
  length text NOT NULL DEFAULT 'Medium',
  generated_email text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_saved_emails" ON saved_emails;
CREATE POLICY "anon_select_saved_emails" ON saved_emails FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_saved_emails" ON saved_emails;
CREATE POLICY "anon_insert_saved_emails" ON saved_emails FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_saved_emails" ON saved_emails;
CREATE POLICY "anon_update_saved_emails" ON saved_emails FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_saved_emails" ON saved_emails;
CREATE POLICY "anon_delete_saved_emails" ON saved_emails FOR DELETE
TO anon, authenticated USING (true);
