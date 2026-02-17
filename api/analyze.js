import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const MAX_TEXT_CHARS = 2200;
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 8);

const rateBuckets = globalThis.__analysisRateBuckets || new Map();
globalThis.__analysisRateBuckets = rateBuckets;

function sendJson(response, status, payload) {
    response.statusCode = status;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(payload));
}

function readRawBody(request) {
    return new Promise((resolve, reject) => {
        let raw = '';
        request.on('data', (chunk) => {
            raw += chunk;
            if (raw.length > 1_000_000) {
                reject(new Error('Payload too large'));
            }
        });
        request.on('end', () => resolve(raw));
        request.on('error', reject);
    });
}

async function parseRequestBody(request) {
    if (request.body !== undefined && request.body !== null) {
        if (typeof request.body === 'string') {
            return request.body ? JSON.parse(request.body) : {};
        }
        if (typeof request.body === 'object') {
            return request.body;
        }
        return {};
    }

    const raw = await readRawBody(request);
    if (!raw) return {};
    return JSON.parse(raw);
}

function getClientIp(request) {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }
    return request.socket?.remoteAddress || 'unknown';
}

function hitRateLimit(ip) {
    const now = Date.now();
    const existing = rateBuckets.get(ip) || [];
    const recent = existing.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

    if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
        rateBuckets.set(ip, recent);
        return true;
    }

    recent.push(now);
    rateBuckets.set(ip, recent);
    return false;
}

function getModelCandidates() {
    const configured = (process.env.GEMINI_MODEL || '').trim();
    return Array.from(
        new Set(
            [configured || DEFAULT_MODEL, DEFAULT_MODEL, 'gemini-2.0-flash']
                .map((name) => name.trim())
                .filter(Boolean)
        )
    );
}

function normalizeJson(rawText) {
    const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    let jsonText = codeBlockMatch ? codeBlockMatch[1] : rawText;
    jsonText = jsonText.trim();

    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
        jsonText = jsonText.slice(firstBrace, lastBrace + 1);
    }
    return jsonText;
}

function mapApiError(error, modelName) {
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('api key')) return { status: 401, error: 'Gemini API key is missing or invalid on server.' };
    if (message.includes('permission') || message.includes('403')) return { status: 403, error: 'Gemini API key does not have access permissions.' };
    if (message.includes('404') || (message.includes('model') && message.includes('not found'))) {
        return { status: 404, error: `Model "${modelName}" is unavailable for this project.` };
    }
    if (message.includes('429') || message.includes('quota') || message.includes('too many requests') || message.includes('rate limit')) {
        return { status: 429, error: 'Gemini rate limit reached. Please retry shortly.' };
    }
    return { status: 500, error: 'Failed to generate analysis.' };
}

function buildPrompt(text) {
    return `You are a social media content expert. Analyze the following text and provide actionable insights for social media engagement improvement.

Return your response in the following JSON format ONLY (no markdown, no extra text, just valid JSON):
{
  "sentiment": {
    "label": "Positive/Negative/Neutral",
    "score": 0.0 to 1.0,
    "explanation": "Brief explanation"
  },
  "engagementScore": {
    "score": 0 to 100,
    "explanation": "Why this score"
  },
  "suggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2",
    "Specific suggestion 3",
    "Specific suggestion 4",
    "Specific suggestion 5"
  ],
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "bestPlatform": {
    "platform": "Instagram/Twitter/LinkedIn/Facebook/TikTok",
    "reason": "Why this platform suits best"
  },
  "improvedVersion": "A rewritten, improved version of the content optimized for social media",
  "toneAnalysis": "Description of the current tone and recommended changes",
  "targetAudience": "Who this content would appeal to most"
}

Content to analyze:
"""
${text.slice(0, MAX_TEXT_CHARS)}
"""`;
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
        return;
    }

    const ip = getClientIp(req);
    if (hitRateLimit(ip)) {
        sendJson(res, 429, { error: 'Too many analyze requests. Please wait and retry.' });
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        sendJson(res, 401, { error: 'Server Gemini API key is not configured.' });
        return;
    }

    let requestBody = {};
    try {
        requestBody = await parseRequestBody(req);
    } catch {
        sendJson(res, 400, { error: 'Invalid JSON payload.' });
        return;
    }
    const text = String(requestBody.text || '').trim();
    if (!text) {
        sendJson(res, 400, { error: 'No text provided for analysis.' });
        return;
    }

    if (text.length > 20_000) {
        sendJson(res, 413, { error: 'Input text is too large.' });
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = buildPrompt(text);
    const modelCandidates = getModelCandidates();
    let lastError = null;

    for (const modelName of modelCandidates) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const rawText = response.text();
            const parsed = JSON.parse(normalizeJson(rawText));
            sendJson(res, 200, { analysis: parsed, model: modelName });
            return;
        } catch (error) {
            lastError = error;
            const mapped = mapApiError(error, modelName);
            if (mapped.status === 404) {
                continue;
            }
            sendJson(res, mapped.status, { error: mapped.error });
            return;
        }
    }

    const finalError = mapApiError(lastError, modelCandidates[0] || DEFAULT_MODEL);
    sendJson(res, finalError.status, { error: finalError.error });
}
