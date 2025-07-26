import type { SupabaseClient } from '@supabase/supabase-js';

export let supabase: SupabaseClient;

export function setSupabase(client: SupabaseClient) {
    console.log('set supabase');
    supabase = client;
}
