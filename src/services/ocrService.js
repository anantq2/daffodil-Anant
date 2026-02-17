import Tesseract from 'tesseract.js';

/**
 * Extract text from an image file using OCR
 * @param {File} file - The image file to extract text from
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromImage(file, onProgress) {
    try {
        const result = await Tesseract.recognize(
            file,
            'eng',
            {
                logger: (info) => {
                    if (info.status === 'recognizing text' && onProgress) {
                        onProgress(Math.round(info.progress * 100));
                    }
                },
            }
        );

        if (!result.data.text || result.data.text.trim().length === 0) {
            throw new Error('No text could be detected in the image. Please try a clearer image.');
        }

        return result.data.text.trim();
    } catch (error) {
        console.error('OCR error:', error);
        if (error.message.includes('No text')) {
            throw error;
        }
        throw new Error(`Failed to extract text from image: ${error.message}`);
    }
}
