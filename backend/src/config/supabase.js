import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://ptqrptapzjffhzqhvecs.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_secret_w-GSZiXFqpUvQTSAj5HvXA_uCknjKPB';

let client;
try {
  client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  console.log('Supabase JS Client initialized successfully targeting:', supabaseUrl);
} catch (e) {
  console.warn('Supabase Client initialization fallback notice:', e.message);
  client = {
    from: () => ({
      insert: () => ({ select: () => Promise.resolve({ data: null, error: null }) }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      select: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    })
  };
}

export const supabase = client;

