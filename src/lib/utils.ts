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

/** agency fee (raw) and with its taxes */
export function agencyFeeWithTaxes(item: any, isPrixResto: boolean) {
    const batch = item;
    // const batch = getSelectedBatch(item);
    if (!batch) return 0;
    const basePrice = isPrixResto ? batch.selected_price : batch.selected_price_tax_in;

    let agencyRaw = 0;
    if (batch.selected_agency_fee_is_percentage !== undefined || batch.selected_agency_fee_percentage !== null) {
        if (batch.selected_agency_fee_is_percentage)
            agencyRaw = ((batch.selected_agency_fee_percentage ?? 0) / 100) * basePrice;
        else agencyRaw = batch.selected_agency_fee_net ?? 0;
    } else {
        agencyRaw = (16 / 100) * basePrice;
    }

    return applyTaxes(agencyRaw);
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
