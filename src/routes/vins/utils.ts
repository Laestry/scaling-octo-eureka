export function getOldestBatch(product): any | null {
    return (
        product.alcohol_batches
            ?.filter((b) => !b.is_archived && b.quantity > 0 && b.calculated_quantity > 0)
            .sort((a, b) => {
                const aT = a.sell_before_date ? new Date(a.sell_before_date).getTime() : Infinity;
                const bT = b.sell_before_date ? new Date(b.sell_before_date).getTime() : Infinity;
                return aT - bT;
            })[0] ?? null
    );
}
