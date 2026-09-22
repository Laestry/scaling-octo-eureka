export function debounce<F extends (...args: unknown[]) => void>(
    func: F,
    timeout: number = 300
): (...args: Parameters<F>) => void {
    let timer: ReturnType<typeof setTimeout> | null;
    return (...args: Parameters<F>) => {
        if (timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => func(...args), timeout);
    };
}

export function getNumberFromId(gid: string) {
    const matches = gid.match(/\d+/g);
    if (matches) {
        return matches.join('');
    }
    return '';
}

/** Dispatch event on click outside of node */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function clickOutside(node) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const handleClick = (event) => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(new CustomEvent('click_outside', node));
        }
    };

    document.addEventListener('click', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    };
}

export function teleport(node, name) {
    let teleportContainer = document.querySelector(name);
    teleportContainer.appendChild(node);

    return {
        destroy() {
            node.remove();
        }
    };
}

export const delay = (delayInms) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
};

function getSelectedBatch(item: any) {
    if (!item || !Array.isArray(item.alcohol_batches)) return undefined;
    return item.alcohol_batches.find((b: any) => String(b.id) === String(item.selectedBatchId));
}

/** tax stacking: GST 5%, then QST 9.975% on (amount + GST) */
function applyTaxes(amount: number): number {
    const gst = amount * 0.05;
    const qst = (amount + gst) * 0.09975;
    return amount + gst + qst;
}

/** base price with its taxes */
export function baseWithTaxes(item: any, isPrixResto: boolean) {
    // const batch = getSelectedBatch(item);
    const batch = item;
    if (!batch) return 0;
    return isPrixResto ? batch.selected_price : batch.selected_price_tax_in;
    // const basePrice = isPrixResto ? batch.price_tax_in : batch.price;
    // return basePrice + applyTaxes(basePrice);
}

/**
 * Agency fee for one bottle, before taxes.
 *
 * Portaus charges a flat amount per bottle, the same for resto and perso, and the catalogue
 * carries it as `selected_agency_fee_net`. The percentage path is only a fallback for items
 * that predate that.
 */
export function agencyFeeRaw(item: any, isPrixResto: boolean) {
    const batch = item;
    if (!batch) return 0;

    if (batch.selected_agency_fee_is_percentage === false && batch.selected_agency_fee_net != null) {
        return Number(batch.selected_agency_fee_net) || 0;
    }

    const basePrice = Number(isPrixResto ? batch.selected_price : batch.selected_price_tax_in) || 0;
    const pct = batch.selected_agency_fee_percentage ?? 16;
    return (Number(pct) / 100) * basePrice;
}

/**
 * Agency fee for one bottle with its taxes. For display only: multiplying this by a bottle count
 * drifts from what is charged, because Portaus totals the fee first and taxes the subtotal.
 * Use agencyFeeTotal() for a cart total.
 */
export function agencyFeeWithTaxes(item: any, isPrixResto: boolean) {
    return applyTaxes(agencyFeeRaw(item, isPrixResto));
}

/**
 * What the customer is actually charged online for a whole cart: the fee summed across every
 * bottle, then GST and QST applied to that subtotal and rounded once each. This is the same
 * order of operations Portaus uses, so the figure matches the Stripe amount to the cent.
 */
export function agencyFeeTotal(items: any[], isPrixResto: boolean) {
    const subtotal = (items ?? []).reduce(
        (sum, item) => sum + agencyFeeRaw(item, isPrixResto) * (Number(item?.quantity) || 0) * (Number(item?.uvc) || 0),
        0
    );
    const round2 = (v: number) => Math.round(v * 100) / 100;
    return round2(subtotal + round2(subtotal * 0.05) + round2(subtotal * 0.09975));
}

/** totals for a single item (per unit) */
export function totalsPerUnit(item: any, isPrixResto: boolean) {
    const base = baseWithTaxes(item, isPrixResto);
    const agencyWithTax = agencyFeeWithTaxes(item, isPrixResto);
    // console.log('totalsPerUnit', item.name, base, agencyWithTax);
    return {
        base: base,
        agencyWithTaxes: agencyWithTax,
        lineTotal: base + agencyWithTax
    };
}
