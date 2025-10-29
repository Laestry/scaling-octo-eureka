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

export function getVinImage(product, order) {
    // console.log('getVinImage', product);
    if (
        product.alcohol_website &&
        product.alcohol_website[0].alcohol_images &&
        product.alcohol_website[0].alcohol_images.length > 0
    ) {
        const images = product.alcohol_website[0].alcohol_images;
        return ALCOHOL_BASE_PATH + images[order].files.uuid + '/' + images[order].files.file_name;
    }

    switch (order) {
        case 0:
            return '/images/example_wines/SHOP PAGE/Product Shot - stack.png';
        case 1:
            return '/images/example_wines/SHOP PAGE/9x16 Product Shot - stack.png';
        case 2:
            return '/images/example_wines/SHOP PAGE/In-situ Product Shot - stack.png';
    }
}
