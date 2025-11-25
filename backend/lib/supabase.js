import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'anon-key';

// Singleton Supabase client for the backend
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export default supabase;
