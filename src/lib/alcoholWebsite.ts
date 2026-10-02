// Which website-content table to read: the live one, or the test copy that goes with the test
// Portaus setup. Driven by PUBLIC_USES_TEST_PORTAUS so both the browser and the server loads
// agree without a round trip.
//
// The two tables are the same shape, so callers only ever swap the name.

import { env } from '$env/dynamic/public';

/** True when the site is pointed at the test Portaus setup. */
export const usesTestPortaus = env['PUBLIC_USES_TEST_PORTAUS'] === 'true';

/** cms_saq table holding the site's wine content: names, slugs, descriptions, subtitles. */
export const ALCOHOL_WEBSITE_TABLE = usesTestPortaus ? 'alcohol_website_test' : 'alcohol_website';

/**
 * The embed clause for a PostgREST select, always aliased back to `alcohol_website`.
 *
 * The alias is what keeps this a one-line change: the response key, and therefore every
 * component reading `product.alcohol_website[0]`, stays the same whichever table is in use.
 * Filters on the embedded rows use the alias too, so `.eq('alcohol_website.slug', …)` is
 * unchanged.
 *
 * @param inner the selected columns, e.g. `*, alcohol_images(id, file_uuid)`
 */
export function alcoholWebsiteEmbed(inner: string, { inner: innerJoin = true } = {}): string {
    return `alcohol_website:${ALCOHOL_WEBSITE_TABLE}${innerJoin ? '!inner' : ''}(${inner})`;
}
