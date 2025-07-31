import { alcoholCategory, countries, volumeFormat } from './types';

export function getSpecificCategoryLabel(raw: string | Record<string, any>): string | null {
    try {
        const { category, specificCategory } = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (category !== 1) return null; // only “vin” (wine) for now
        const wineGroup = alcoholCategory.fr.find((c) => c.value === 1);
        if (!wineGroup) return null;
        const sub = wineGroup.sub.find((s) => s.value === specificCategory);
        return sub?.label ?? String(specificCategory);
    } catch {
        return null;
    }
}

export function formatLocation(raw: string | Record<string, any>): string {
    try {
        const { country_id, region_name } = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const country = countries.find((c) => c.id === country_id);
        const countryNameFr = country?.name?.fr ?? country?.country_name ?? '';
        if (region_name) {
            return `${countryNameFr}, ${region_name}`;
        }
        return countryNameFr;
    } catch {
        return String(raw);
    }
}

export function formatVolume(raw: string | Record<string, any>): string {
    try {
        const { volume, format } = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const fmt = volumeFormat.find((f) => f.value === format);
        if (!fmt) return String(volume);
        const unit = fmt.label.toLowerCase();
        if (unit === 'l') {
            const ml = Math.round(volume * 1000);
            return `${volume}${unit} (${ml}ml)`;
        }
        if (unit === 'ml') {
            const l = volume >= 1000 ? (volume / 1000).toFixed(2) : null;
            return l ? `${volume}${unit} (${l}l)` : `${volume}${unit}`;
        }
        return `${volume}${unit}`;
    } catch {
        return String(raw);
    }
}
