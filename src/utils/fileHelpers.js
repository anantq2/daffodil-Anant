/**
 * Supported file types
 */
export const SUPPORTED_TYPES = {
    pdf: ['application/pdf'],
    image: ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/tiff', 'image/webp'],
};

export const ALL_SUPPORTED_TYPES = [...SUPPORTED_TYPES.pdf, ...SUPPORTED_TYPES.image];

export const ACCEPTED_EXTENSIONS = '.pdf,.png,.jpg,.jpeg,.bmp,.tiff,.webp';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Check if a file is a PDF
 */
export function isPDF(file) {
    return SUPPORTED_TYPES.pdf.includes(file.type) || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Check if a file is an image
 */
export function isImage(file) {
    return SUPPORTED_TYPES.image.includes(file.type) ||
        /\.(png|jpe?g|bmp|tiff|webp)$/i.test(file.name);
}

/**
 * Validate file type and size
 */
export function validateFile(file) {
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }

    if (!isPDF(file) && !isImage(file)) {
        return {
            valid: false,
            error: `Unsupported file type "${file.type || file.name.split('.').pop()}". Please upload a PDF or image file (PNG, JPG, BMP, TIFF, WebP).`
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        return {
            valid: false,
            error: `File size (${sizeMB}MB) exceeds the 10MB limit. Please upload a smaller file.`
        };
    }

    return { valid: true, error: null };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
