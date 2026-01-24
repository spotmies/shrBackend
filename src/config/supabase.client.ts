import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Ensure environment variables are loaded if this is imported directly
// Checks for local .env in the same directory (useful for dev)
if (!process.env.SUPABASE_URL) {
    dotenv.config({ path: path.resolve(__dirname, '.env') });
}

// Check again, if still missing, try looking two levels up (project root) in case of weird CWD
if (!process.env.SUPABASE_URL) {
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Service Role Key must be provided in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
