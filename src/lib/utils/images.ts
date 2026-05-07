export const ALCOHOL_BASE_PATH =
    'https://uiarruqklnnoewymfnpt.supabase.co/storage/v1/object/public/public-organization-files/2/cms_saq/alcohol_images/';

export const images = new Array(8).fill('').map((_, i) => `/images/example_wines/${i + 1}.jpg`);
export function getRandomNumber(product) {
    const n1 = typeof product.id === 'number' ? product.id : parseInt(String(product.id)) || 0;
    return n1;
}
export function getVinsImage(product) {
    if (product.main_image_file) return ALCOHOL_BASE_PATH + product.main_image_file;
    const n = getRandomNumber(product);
    return images[n % images.length]!;
}

const NO_IMAGE = ALCOHOL_BASE_PATH + 'noImgVine.png';

export function getVinImage(product, order) {
    const allImgs = product.alcohol_website?.[0]?.alcohol_images;

    if (allImgs?.length) {
        const active = [...allImgs]
            .filter((i) => !i.is_archived)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const img = active[order];
        if (img?.file_uuid && img?.file_name) {
            return ALCOHOL_BASE_PATH + img.file_uuid + '/' + img.file_name;
        }
    }

    if (product.main_image_file) {
        return ALCOHOL_BASE_PATH + product.main_image_file;
    }

    return NO_IMAGE;
}
