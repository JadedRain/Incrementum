import React from 'react';
import { describeArc } from '../utils/svg';
import { useFearGreed } from '../hooks/useFearGreed';
function valueToLabel(v: number) {
    if (v >= 75) return 'Currently in Extreme Greed';
    if (v >= 51) return 'Currently in Greed';
    if (v === 50) return 'Currently in Neutral';
    if (v >= 25) return 'Currently in Fear';
    return 'Extreme Fear';
}

function clamp(n: number, lo = 0, hi = 100) {
    return Math.max(lo, Math.min(hi, n));
}

const FearGreedGauge: React.FC = () => {
    const { value, loading, error } = useFearGreed();

    const accentColor = '#222';

    const size = 220;
    const stroke = 16;
    const radius = (size - stroke) / 2;
    const cx = size / 2;
    const cy = size / 2;

    const angleFor = (val: number) => {
        const t = clamp(val, 0, 100) / 100;
        return -90 + t * 180;
    };

    const needleAngle = value !== null ? angleFor(value) : -90;

    const label = value !== null ? valueToLabel(value) : '';

    return (
        <div style={{ width: size, textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
            <h3 style={{ color: accentColor, marginBottom: 8 }}>Fear Greed Index</h3>
            {loading && <div>Loading gauge…</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {!loading && value === null && !error && <div>No data available</div>}

            {!loading && value !== null && (
                <svg width={size} height={size / 1.2} viewBox={`0 0 ${size} ${size / 1.2}`}>
                    <path
                        d={describeArc(cx, cy, radius, -90, 90)}
                        fill="none"
                        stroke="#eee"
                        strokeWidth={stroke}
                        strokeLinecap="butt"
                    />

                    {[
                        { start: 0, end: 24, color: '#d9534f' },
                        { start: 25, end: 49, color: '#f0ad4e' },
                        { start: 50, end: 50, color: '#4f83cc' },
                        { start: 51, end: 74, color: '#5cb85c' },
                        { start: 75, end: 100, color: '#2b8a3e' },
                    ].map((s, idx) => {
                        const isSingle = s.start === s.end;
                        const startVal = isSingle ? Math.max(0, s.start - 0.5) : s.start;
                        const endVal = isSingle ? Math.min(100, s.end + 0.5) : s.end;
                        const startAngle = angleFor(startVal);
                        const endAngle = angleFor(endVal);
                        return (
                            <path
                                key={idx}
                                d={describeArc(cx, cy, radius, startAngle, endAngle)}
                                fill="none"
                                stroke={s.color}
                                strokeWidth={stroke}
                                strokeLinecap="butt"
                            />
                        );
                    })}

                    <g transform={`translate(${cx}, ${cy}) rotate(${needleAngle})`}>
                        <line x1="0" y1="0" x2="0" y2={-radius + stroke / 2} stroke="#222" strokeWidth={3} />
                        <circle cx="0" cy="0" r={6} fill="#222" />
                    </g>

                </svg>
            )}

            <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: accentColor }}>{value !== null ? value : '—'}</div>
                <div style={{ color: accentColor }}>{label}</div>
            </div>
        </div>
    );
};

export default FearGreedGauge;
