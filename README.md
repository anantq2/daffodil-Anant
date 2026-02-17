# ContentAnalyzer - Social Media Content Analyzer

A web application that extracts text from PDFs and images (via OCR) and provides AI-powered social media engagement improvement suggestions.

## Approach Write-Up (200 words)

Built a Social Media Content Analyzer using React + Vite that lets users upload PDFs and images to extract text and get AI-powered engagement suggestions. For PDF parsing, I used Mozilla's pdfjs-dist library which runs entirely in the browser. For scanned documents/images, I integrated Tesseract.js, a WebAssembly-based OCR engine that also runs client-side, ensuring user privacy since files never leave the browser. The extracted text is sent to a serverless API route (`/api/analyze`) that securely calls Google's Gemini API (free tier), so the API key is never exposed in client code. The endpoint also applies basic IP-based rate limiting to reduce repeated abuse. Gemini returns sentiment analysis, engagement scores, hashtag recommendations, and content improvement suggestions. The UI features a modern dark theme with glassmorphism effects, smooth animations, and responsive design built with Tailwind CSS. Error handling covers invalid file types, size limits, and API failures with user-friendly messages. Loading states with progress indicators keep users informed during OCR processing and AI analysis. The app is deployed on Vercel's free tier for instant, reliable hosting with automatic deployments from GitHub.

## Features

- **Document Upload** - Drag-and-drop or file picker for PDFs and images (PNG, JPG, BMP, TIFF, WebP)
- **PDF Text Extraction** - Extracts text from multi-page PDFs while maintaining structure (using `pdfjs-dist`)
- **OCR (Optical Character Recognition)** - Extracts text from scanned documents/images (using `Tesseract.js`)
- **AI Content Analysis** - Analyzes extracted text with Google Gemini AI for social media engagement insights
- **Rich Analysis Dashboard** - Sentiment, engagement score, hashtag recommendations, platform suggestions, improved content version
- **Modern UI** - Dark theme, glassmorphism, micro-animations, responsive design
- **Error Handling** - File type validation, size limits, API error handling, loading states with progress bars

## Tech Stack

| Technology | Purpose |
| ---------- | ------- |
| React 19 + Vite 7 | Frontend framework and build tool |
| Tailwind CSS 4 | Styling |
| pdfjs-dist | PDF text extraction (browser-side) |
| Tesseract.js | OCR engine (browser-side, WebAssembly) |
| Google Gemini API | AI-powered content analysis |
| Lucide React | Icons |

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key ([Get free key here](https://aistudio.google.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/anantq2/daffodil-Anant
cd daffodil-Anant

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Gemini API key
```

### Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
RATE_LIMIT_MAX_REQUESTS=8
RATE_LIMIT_WINDOW_MS=60000
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

`npm run dev` serves both frontend and local `/api/analyze` middleware for secure Gemini calls.

### Production Build

```bash
npm run build
npm run preview
```

## How It Works

1. **Upload** - User uploads a PDF or image file via drag-and-drop or file picker
2. **Extract** - Text is extracted client-side:
   - PDFs -> `pdfjs-dist` parses each page and extracts text content
   - Images -> `Tesseract.js` runs OCR (WebAssembly-based) with real-time progress
3. **Analyze** - Extracted text is sent to a protected `/api/analyze` endpoint (with IP rate limiting), which then calls Google Gemini API and returns:
   - Sentiment analysis (Positive/Negative/Neutral)
   - Engagement score (0-100)
   - 5 specific improvement suggestions
   - Hashtag recommendations
   - Best platform recommendation
   - Improved content version
   - Tone analysis and target audience

## Deployment

This app is deployed on [Vercel](https://vercel.com). To deploy your own:

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add `GEMINI_API_KEY`, `GEMINI_MODEL`, `RATE_LIMIT_MAX_REQUESTS`, and `RATE_LIMIT_WINDOW_MS` as environment variables in Vercel settings
4. Deploy

## License

MIT
