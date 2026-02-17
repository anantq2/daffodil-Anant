const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim();

function buildApiUrl(pathname) {
    const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    if (!API_BASE_URL) return cleanPath;
    return `${API_BASE_URL.replace(/\/$/, '')}${cleanPath}`;
}

function mapStatusToMessage(status, fallbackMessage) {
    if (status === 400) return 'Invalid content sent for analysis. Please try a shorter or cleaner input.';
    if (status === 401 || status === 403) return 'AI service access is not configured correctly on the server.';
    if (status === 404) return 'Analysis API endpoint not found. Make sure the app is running via "npm run dev" or deployed correctly.';
    if (status === 405) return 'Analysis endpoint method is invalid. Please contact support.';
    if (status === 413) return 'Text is too large for analysis. Please upload shorter content.';
    if (status === 429) return 'Too many requests from this source. Please wait a minute and try again.';
    if (status >= 500) return 'Server error while analyzing content. Please try again shortly.';
    return fallbackMessage || 'AI analysis failed. Please try again in a moment.';
}

/**
 * Analyze extracted text using the protected backend endpoint.
 * @param {string} text - Extracted text
 * @returns {Promise<object>} - Analysis JSON
 */
export async function analyzeContent(text) {
    const trimmedText = String(text || '').trim();
    if (!trimmedText) {
        throw new Error('No text available to analyze.');
    }

    try {
        const response = await fetch(buildApiUrl('/api/analyze'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: trimmedText }),
        });

        const rawBody = await response.text();
        let payload = null;
        try {
            payload = rawBody ? JSON.parse(rawBody) : null;
        } catch {
            payload = null;
        }

        if (!response.ok) {
            if (response.status === 404 && !payload) {
                throw new Error('Analysis API endpoint not found. Restart "npm run dev" and try again.');
            }
            const message = payload?.error || mapStatusToMessage(response.status);
            throw new Error(mapStatusToMessage(response.status, message));
        }

        if (!payload?.analysis) {
            throw new Error('Invalid analysis response from server.');
        }

        return payload.analysis;
    } catch (error) {
        const message = String(error?.message || '').toLowerCase();
        if (message.includes('failed to fetch') || message.includes('network')) {
            throw new Error('Unable to reach analysis server. Check your internet/deployment and try again.');
        }
        throw new Error(error?.message || 'AI analysis failed. Please try again in a moment.');
    }
}

/**
 * Key now lives on server-side, so frontend should not block the button.
 */
export function isApiKeyConfigured() {
    return true;
}
