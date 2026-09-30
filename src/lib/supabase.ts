import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SavedEmail {
  id: string;
  recipient_name: string;
  purpose: string;
  email_type: string;
  tone: string;
  length: string;
  generated_email: string;
  created_at: string;
}
