export const ALCOHOL_BASE_PATH =
    'https://uiarruqklnnoewymfnpt.supabase.co/storage/v1/object/public/public-organization-files/2/cms_saq/alcohol_images/';

export const images = new Array(8).fill('').map((_, i) => `/images/example_wines/${i + 1}.jpg`);
export function getRandomNumber(product) {
    const n1 = typeof product.id === 'number' ? product.id : parseInt(String(product.id)) || 0;
    return n1;
}
export function getVinsImage(product) {
    if (product.main_image_file) return ALCOHOL_BASE_PATH + product.main_image_file;
    return '/defaultImages/default-alcohol.png';
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

    return '/defaultImages/default-alcohol.png';
}
