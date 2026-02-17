import {
    TrendingUp, Hash, Target, MessageSquare, Lightbulb,
    RefreshCw, Copy, Check, SmilePlus, Meh, Frown, Globe
} from 'lucide-react';
import { useState } from 'react';

const card = {
    borderRadius: '16px',
    background: 'linear-gradient(180deg, rgba(21,29,46,0.88), rgba(15,21,36,0.88))',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '18px',
};
const label = { fontSize: '11px', fontWeight: 600, color: '#93a0c2', textTransform: 'uppercase', letterSpacing: '0.08em' };

const sentimentMap = {
    Positive: { icon: SmilePlus, color: '#22c55e' },
    Negative: { icon: Frown, color: '#ef4444' },
    Neutral: { icon: Meh, color: '#f59e0b' },
};

export default function AnalysisResult({ analysis, onReanalyze, isLoading }) {
    const [copiedImproved, setCopiedImproved] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(analysis.improvedVersion);
            setCopiedImproved(true);
            setTimeout(() => setCopiedImproved(false), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    if (!analysis) return null;

    const sentimentLabel = analysis.sentiment?.label || 'Neutral';
    const sentimentConfig = sentimentMap[sentimentLabel] || sentimentMap.Neutral;
    const SentimentIcon = sentimentConfig.icon;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={onReanalyze}
                    disabled={isLoading}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '9px',
                        fontSize: '11px',
                        color: '#a5b1cf',
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(12,18,30,0.7)',
                        cursor: 'pointer',
                        opacity: isLoading ? 0.6 : 1,
                    }}
                >
                    <RefreshCw style={{ width: '12px', height: '12px' }} className={isLoading ? 'animate-spin' : ''} /> Re-analyze
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                <div style={card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <SentimentIcon style={{ width: '14px', height: '14px', color: sentimentConfig.color }} />
                        <span style={label}>Sentiment</span>
                    </div>
                    <p style={{ fontSize: '22px', fontWeight: 800, color: sentimentConfig.color }}>{sentimentLabel}</p>
                    <p style={{ fontSize: '12px', color: '#9ca7c5', marginTop: '7px', lineHeight: 1.55 }}>{analysis.sentiment?.explanation}</p>
                </div>

                <div style={card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <TrendingUp style={{ width: '14px', height: '14px', color: '#14b8a6' }} />
                        <span style={label}>Engagement</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '30px', fontWeight: 800, color: '#14b8a6' }}>{analysis.engagementScore?.score || 0}</span>
                        <span style={{ fontSize: '12px', color: '#9ca7c5' }}>/100</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', marginTop: '10px', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                borderRadius: '999px',
                                background: 'linear-gradient(90deg, #14b8a6, #0ea5e9)',
                                width: `${analysis.engagementScore?.score || 0}%`,
                                transition: 'width 1s ease',
                            }}
                        />
                    </div>
                    <p style={{ fontSize: '12px', color: '#9ca7c5', marginTop: '7px', lineHeight: 1.55 }}>{analysis.engagementScore?.explanation}</p>
                </div>

                <div style={card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Globe style={{ width: '14px', height: '14px', color: '#7dd3fc' }} />
                        <span style={label}>Best Platform</span>
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#eef2ff' }}>{analysis.bestPlatform?.platform}</p>
                    <p style={{ fontSize: '12px', color: '#9ca7c5', marginTop: '7px', lineHeight: 1.55 }}>{analysis.bestPlatform?.reason}</p>
                </div>
            </div>

            <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <MessageSquare style={{ width: '14px', height: '14px', color: '#7dd3fc' }} />
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#eef2ff' }}>Improvement Suggestions</h4>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analysis.suggestions?.map((suggestion, index) => (
                        <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', fontSize: '13px', color: '#d7def4' }}>
                            <span style={{
                                flexShrink: 0,
                                width: '21px',
                                height: '21px',
                                borderRadius: '6px',
                                background: 'rgba(20,184,166,0.16)',
                                color: '#5eead4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: 800,
                                marginTop: '1px',
                            }}>
                                {index + 1}
                            </span>
                            <span style={{ lineHeight: 1.6 }}>{suggestion}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                <div style={card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Hash style={{ width: '14px', height: '14px', color: '#14b8a6' }} />
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#eef2ff' }}>Hashtags</h4>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {analysis.hashtags?.map((tag, index) => (
                            <span
                                key={index}
                                style={{
                                    padding: '5px 10px',
                                    borderRadius: '999px',
                                    fontSize: '12px',
                                    background: 'rgba(20,184,166,0.12)',
                                    color: '#67e8f9',
                                    border: '1px solid rgba(20,184,166,0.24)',
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={card}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <Target style={{ width: '12px', height: '12px', color: '#14b8a6' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#eef2ff' }}>Target Audience</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#d7def4', lineHeight: 1.6 }}>{analysis.targetAudience}</p>
                    </div>
                    <div style={card}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <MessageSquare style={{ width: '12px', height: '12px', color: '#f59e0b' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#eef2ff' }}>Tone Analysis</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#d7def4', lineHeight: 1.6 }}>{analysis.toneAnalysis}</p>
                    </div>
                </div>
            </div>

            {analysis.improvedVersion && (
                <div style={{ ...card, border: '1px solid rgba(20,184,166,0.32)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Lightbulb style={{ width: '14px', height: '14px', color: '#5eead4' }} />
                            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#eef2ff' }}>Improved Version</h4>
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
                            {copiedImproved
                                ? <><Check style={{ width: '12px', height: '12px', color: '#22c55e' }} />Copied</>
                                : <><Copy style={{ width: '12px', height: '12px' }} />Copy</>
                            }
                        </button>
                    </div>
                    <p
                        style={{
                            fontSize: '13px',
                            color: '#d7def4',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap',
                            padding: '15px',
                            borderRadius: '12px',
                            background: 'rgba(9,14,23,0.78)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            margin: 0,
                        }}
                    >
                        {analysis.improvedVersion}
                    </p>
                </div>
            )}
        </div>
    );
}
