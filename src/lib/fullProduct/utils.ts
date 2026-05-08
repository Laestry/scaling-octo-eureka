export function getOldestBatch(product): any | null {
    if (!product?.alcohol_batches || !Array.isArray(product.alcohol_batches)) return null;

    const valid = product.alcohol_batches.filter((b) => !b.is_archived);
    if (!valid.length) return null;

    // sort by earliest sell_before_date
    valid.sort((a, b) => {
        const aT = a.sell_before_date ? new Date(a.sell_before_date).getTime() : Infinity;
        const bT = b.sell_before_date ? new Date(b.sell_before_date).getTime() : Infinity;
        return aT - bT;
    });
    console.log('selected batch', valid[0]);

    return valid[0];
}
