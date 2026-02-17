export default function ProgressBar({ progress, label }) {
    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca7c5' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#5eead4', fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #14b8a6, #06b6d4)', transition: 'width 0.3s ease', width: `${progress}%` }} />
            </div>
        </div>
    );
}
