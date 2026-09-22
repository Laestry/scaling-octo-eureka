import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

/**
 * Server-side Supabase client for jobs that run without a user session (cron syncs, webhooks).
 * Uses SUPABASE_SERVICE_ROLE when set; the cms_saq tables have RLS disabled, so the anon key
 * works as a fallback but should not be relied on in production.
 */
export function createServiceClient(): SupabaseClient {
    const key = privateEnv['SUPABASE_SERVICE_ROLE'] || publicEnv.PUBLIC_SUPABASE_ANON_KEY;
    if (!publicEnv.PUBLIC_SUPABASE_URL || !key) throw new Error('Supabase URL / key missing');
    return createClient(publicEnv.PUBLIC_SUPABASE_URL, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

/** Upsert in chunks; on a failed chunk retry row by row so one bad row does not sink the batch. */
export async function upsertChunked(
    client: SupabaseClient,
    schema: string,
    table: string,
    rows: Record<string, unknown>[],
    chunkSize = 200
): Promise<{ ok: number; failed: Array<{ id: unknown; error: string }> }> {
    let ok = 0;
    const failed: Array<{ id: unknown; error: string }> = [];
    for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const { error } = await client.schema(schema).from(table).upsert(chunk);
        if (!error) {
            ok += chunk.length;
            continue;
        }
        for (const row of chunk) {
            const { error: rowError } = await client.schema(schema).from(table).upsert(row);
            if (rowError) failed.push({ id: row['id'], error: rowError.message });
            else ok += 1;
        }
    }
    return { ok, failed };
}
