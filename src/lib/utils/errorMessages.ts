interface ErrorDetails {
    missingBatches?: { batchId: number }[];
    insufficientStock?: { batchId: number; requested: number; available: number }[];
}

interface ApiError {
    error: string;
    message: string;
    details?: ErrorDetails;
}

export function getErrorMessage(error: ApiError | string, lang: 'fr' | 'en' = 'fr'): string {
    const messages = {
        fr: {
            InvalidBatches: 'Certains lots sont manquants ou n\'ont pas suffisamment de stock.',
            InsufficientStock: (details: ErrorDetails) => {
                if (details.insufficientStock && details.insufficientStock.length > 0) {
                    const items = details.insufficientStock.map(
                        (item) => `Lot ${item.batchId}: demandé ${item.requested}, disponible ${item.available}`
                    );
                    return `Stock insuffisant pour les articles suivants : ${items.join('; ')}.`;
                }
                return 'Stock insuffisant.';
            },
            NetworkError: 'Une erreur réseau est survenue. Veuillez réessayer plus tard.',
            ValidationError: 'Veuillez corriger les champs invalides.',
            FormError: 'Le formulaire contient des erreurs.',
            GenericError: 'Une erreur est survenue. Veuillez réessayer plus tard.'
        },
        en: {
            InvalidBatches: 'Some batches are missing or do not have enough stock.',
            InsufficientStock: (details: ErrorDetails) => {
                if (details.insufficientStock && details.insufficientStock.length > 0) {
                    const items = details.insufficientStock.map(
                        (item) => `Batch ${item.batchId}: requested ${item.requested}, available ${item.available}`
                    );
                    return `Insufficient stock for the following items: ${items.join('; ')}.`;
                }
                return 'Insufficient stock.';
            },
            NetworkError: 'A network error occurred. Please try again later.',
            ValidationError: 'Please correct the invalid fields.',
            FormError: 'The form contains errors.',
            GenericError: 'An error occurred. Please try again later.'
        }
    };


    if (typeof error === 'string') {
        const key = error as keyof typeof messages.fr;
        if (messages[lang][key] && typeof messages[lang][key] === 'string') {
            return messages[lang][key] as string;
        }
        return error;
    }


    if (error.error === 'InvalidBatches' && error.details) {
        return messages[lang].InsufficientStock(error.details);
    }


    const errorKey = error.error as keyof typeof messages.fr;
    if (messages[lang][errorKey] && typeof messages[lang][errorKey] === 'string') {
        return messages[lang][errorKey] as string;
    }

    return messages[lang].GenericError;
}

