import { SUPABASE_URL, SUPABASE_API_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);