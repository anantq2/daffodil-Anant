import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

function groupItemsIntoLines(items) {
    // Group by approximate Y position to preserve line breaks.
    const lineMap = new Map();

    for (const item of items) {
        const text = item?.str || '';
        if (!text.trim()) continue;

        const x = item?.transform?.[4] ?? 0;
        const y = item?.transform?.[5] ?? 0;
        const key = Math.round(y);

        if (!lineMap.has(key)) {
            lineMap.set(key, []);
        }

        lineMap.get(key).push({ text, x });
    }

    return Array.from(lineMap.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([, lineItems]) =>
            lineItems
                .sort((a, b) => a.x - b.x)
                .map((entry) => entry.text)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim()
        )
        .filter(Boolean)
        .join('\n');
}

/**
 * Extract text from a PDF file
 * @param {File} file - The PDF file to extract text from
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromPDF(file, onProgress) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        let fullText = '';

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = groupItemsIntoLines(textContent.items);

            fullText += `--- Page ${i} ---\n${pageText}\n\n`;

            if (onProgress) {
                onProgress(Math.round((i / totalPages) * 100));
            }
        }

        return fullText.trim();
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}
