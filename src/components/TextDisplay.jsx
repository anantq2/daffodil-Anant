import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function TextDisplay({ text, fileName }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    const words = text.trim().split(/\s+/).filter(Boolean).length;

    return (
        <div style={{
            width: '100%',
            borderRadius: '16px',
            background: 'linear-gradient(180deg, rgba(21,29,46,0.88), rgba(15,21,36,0.88))',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '18px',
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#eef2ff' }}>Extracted Text</h4>
                        {fileName && <span style={{ fontSize: '11px', color: '#9ca7c5' }}>{fileName}</span>}
                    </div>
                    <span style={{
                        fontSize: '11px',
                        color: '#9ca7c5',
                        padding: '3px 9px',
                        borderRadius: '7px',
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(12,18,30,0.72)',
                    }}>
                        {words} words
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#a5b1cf',
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(12,18,30,0.72)',
                        cursor: 'pointer',
                    }}
                >
                    {copied ? <><Check style={{ width: '12px', height: '12px', color: '#22c55e' }} />Copied</> : <><Copy style={{ width: '12px', height: '12px' }} />Copy</>}
                </button>
            </div>
            <pre style={{
                width: '100%',
                maxHeight: '300px',
                overflow: 'auto',
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(9,14,23,0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '13px',
                color: '#d7def4',
                lineHeight: 1.7,
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                margin: 0,
            }}>
                {text}
            </pre>
        </div>
    );
}
