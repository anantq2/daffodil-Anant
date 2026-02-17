import { useState, useCallback, useRef, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import FileUploader from './components/FileUploader';
import TextDisplay from './components/TextDisplay';
import AnalysisResult from './components/AnalysisResult';
import ProgressBar from './components/ProgressBar';
import { extractTextFromPDF } from './services/pdfService';
import { extractTextFromImage } from './services/ocrService';
import { analyzeContent, isApiKeyConfigured } from './services/geminiService';
import { isPDF } from './utils/fileHelpers';
import {
  Sparkles, AlertCircle, Loader2, Scan, TrendingUp,
  Hash, Brain, MessageSquareText, ShieldCheck
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const features = [
  { icon: Brain, title: 'Smart Analysis', desc: 'Tone, readability and CTA quality checks', color: '#14b8a6' },
  { icon: TrendingUp, title: 'Engagement Score', desc: 'Score with specific changes to increase reach', color: '#22c55e' },
  { icon: Hash, title: 'Hashtag Fit', desc: 'Relevant hashtags matched to your content intent', color: '#06b6d4' },
  { icon: MessageSquareText, title: 'Rewrite Draft', desc: 'A cleaner social-ready version of your copy', color: '#f59e0b' },
];

const heroPills = ['PDF + Image OCR', 'Real-time extraction', 'Actionable social insights'];

export default function App() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionLabel, setExtractionLabel] = useState('');
  const [error, setError] = useState(null);

  const resultsRef = useRef(null);
  const analysisRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    if (extractedText && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 220);
    }
  }, [extractedText]);

  useEffect(() => {
    if (analysis && analysisRef.current) {
      setTimeout(() => {
        analysisRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 220);
    }
  }, [analysis]);

  useEffect(() => {
    if (error && errorRef.current) {
      setTimeout(() => {
        errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 180);
    }
  }, [error]);

  const handleFileSelect = useCallback(async (selectedFile) => {
    setExtractedText('');
    setAnalysis(null);
    setError(null);
    setExtractionProgress(0);
    setFile(selectedFile);
    if (!selectedFile) return;

    setIsExtracting(true);
    try {
      let text = '';
      if (isPDF(selectedFile)) {
        setExtractionLabel('Extracting text from PDF...');
        text = await extractTextFromPDF(selectedFile, (progress) => setExtractionProgress(progress));
      } else {
        setExtractionLabel('Running OCR on image...');
        text = await extractTextFromImage(selectedFile, (progress) => setExtractionProgress(progress));
      }
      setExtractedText(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!extractedText) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeContent(extractedText);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [extractedText]);

  const container = {
    width: '100%',
    maxWidth: '940px',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: '18px',
    paddingRight: '18px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: '#0b0f1a',
      color: '#eef2ff',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(40% 35% at 15% 12%, rgba(20,184,166,0.16), transparent 70%), radial-gradient(30% 25% at 88% 28%, rgba(34,197,94,0.12), transparent 75%), radial-gradient(26% 20% at 45% 98%, rgba(6,182,212,0.12), transparent 75%)',
      }} />

      <nav style={{
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(9,13,24,0.82)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{
          ...container,
          maxWidth: '1120px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(145deg, #14b8a6, #0f766e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(20,184,166,0.28)',
            }}>
              <Scan style={{ width: '16px', height: '16px', color: '#fff' }} />
            </div>
            <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.01em' }}>ContentIQ</span>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: '#87f6d2',
            border: '1px solid rgba(20,184,166,0.28)',
            background: 'rgba(20,184,166,0.09)',
            padding: '4px 10px',
            borderRadius: '999px',
          }}>
            <ShieldCheck style={{ width: '12px', height: '12px' }} />
            Ready
          </div>
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 2, paddingBottom: '48px' }}>
        <div style={container}>
          <Motion.section
            initial="hidden"
            animate="visible"
            variants={stagger}
            style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '30px' }}
          >
            <Motion.div
              variants={fadeUp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(20,184,166,0.12)',
                border: '1px solid rgba(20,184,166,0.22)',
                marginBottom: '18px',
              }}
            >
              <Sparkles style={{ width: '12px', height: '12px', color: '#8ff9e2' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#a8ffeb' }}>AI Content Performance Lab</span>
            </Motion.div>

            <Motion.h1
              variants={fadeUp}
              style={{
                fontSize: 'clamp(34px, 6.8vw, 58px)',
                lineHeight: 1.02,
                fontWeight: 700,
                letterSpacing: '-0.03em',
              }}
            >
              Turn any draft into a
              <span style={{
                display: 'block',
                marginTop: '6px',
                background: 'linear-gradient(90deg, #a8ffeb, #7dd3fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                high-engagement social post
              </span>
            </Motion.h1>

            <Motion.p
              variants={fadeUp}
              style={{
                marginTop: '16px',
                marginLeft: 'auto',
                marginRight: 'auto',
                maxWidth: '650px',
                fontSize: '15px',
                color: '#9ca7c5',
                lineHeight: 1.75,
              }}
            >
              Upload PDF or scanned images. ContentIQ extracts text, evaluates social impact, and returns concrete rewrites with hashtags and platform fit.
            </Motion.p>

            <Motion.div
              variants={fadeUp}
              style={{
                marginTop: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {heroPills.map((pill) => (
                <span
                  key={pill}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(12,17,29,0.72)',
                    fontSize: '11px',
                    color: '#b6c3e2',
                  }}
                >
                  {pill}
                </span>
              ))}
            </Motion.div>
          </Motion.section>

          <Motion.section initial="hidden" animate="visible" variants={fadeUp} style={{ paddingBottom: '30px' }}>
            <FileUploader onFileSelect={handleFileSelect} disabled={isExtracting} />
          </Motion.section>

          <AnimatePresence>
            {isExtracting && (
              <Motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ paddingBottom: '24px' }}>
                <div style={{
                  borderRadius: '16px',
                  background: 'linear-gradient(180deg, rgba(18,25,40,0.92), rgba(12,17,28,0.92))',
                  border: '1px solid rgba(20,184,166,0.24)',
                  padding: '20px',
                }}>
                  <ProgressBar progress={extractionProgress} label={extractionLabel} />
                  <p style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#9aa6c8',
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}>
                    <Loader2 style={{ width: '14px', height: '14px', color: '#14b8a6', animation: 'spin 1s linear infinite' }} />
                    {extractionLabel}
                  </p>
                </div>
              </Motion.section>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <Motion.div
                ref={errorRef}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '15px',
                  borderRadius: '12px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.26)',
                  marginBottom: '24px',
                }}
              >
                <AlertCircle style={{ width: '16px', height: '16px', color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '14px', color: '#fecaca', lineHeight: 1.6 }}>{error}</p>
              </Motion.div>
            )}
          </AnimatePresence>

          <div ref={resultsRef} />

          {extractedText && (
            <Motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '22px' }}
            >
              <TextDisplay text={extractedText} fileName={file?.name} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                {!isApiKeyConfigured() && (
                  <p style={{
                    fontSize: '11px',
                    color: '#fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.25)',
                  }}>
                    <AlertCircle style={{ width: '12px', height: '12px' }} />
                    Add your API key in .env to enable analysis
                  </p>
                )}

                <Motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 14px 30px rgba(20,184,166,0.28)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !extractedText}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '13px 26px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    background: 'linear-gradient(145deg, #14b8a6, #0f766e)',
                    color: '#fff',
                    border: '1px solid rgba(20,184,166,0.25)',
                    cursor: 'pointer',
                    boxShadow: '0 7px 18px rgba(20,184,166,0.2)',
                    opacity: (isAnalyzing || !extractedText) ? 0.45 : 1,
                  }}
                >
                  {isAnalyzing
                    ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Analyzing...</>
                    : <><Sparkles style={{ width: '16px', height: '16px' }} /> Analyze for Social Media</>
                  }
                </Motion.button>
              </div>
            </Motion.section>
          )}

          <div ref={analysisRef} />
          {analysis && (
            <Motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: '34px' }}>
              <AnalysisResult analysis={analysis} onReanalyze={handleAnalyze} isLoading={isAnalyzing} />
            </Motion.section>
          )}

          <Motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ paddingBottom: '32px' }}>
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.32), transparent)', marginBottom: '24px' }} />
            <p style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#7f8bb1',
              textTransform: 'uppercase',
              letterSpacing: '0.11em',
              marginBottom: '12px',
              textAlign: 'center',
            }}>
              What you get
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {features.map((feature) => (
                <Motion.div
                  key={feature.title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  style={{
                    borderRadius: '14px',
                    background: 'linear-gradient(180deg, rgba(21,29,46,0.88), rgba(15,21,36,0.88))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: `${feature.color}1f`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <feature.icon style={{ width: '16px', height: '16px', color: feature.color }} />
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5ff' }}>{feature.title}</p>
                  <p style={{ fontSize: '12px', color: '#9ca7c5', lineHeight: 1.6 }}>{feature.desc}</p>
                </Motion.div>
              ))}
            </div>
          </Motion.section>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '14px 0 22px', position: 'relative', zIndex: 2 }}>
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(156,167,197,0.68)' }}>
          Built by Anant | ContentIQ  2026
        </p>
      </footer>
    </div>
  );
}

