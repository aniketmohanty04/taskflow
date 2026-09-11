import React, { useEffect, useState, useCallback } from 'react';
import { completionAPI } from '../services/habitAPI';

// ─── Smooth bezier path generator ────────────────────────────────────────────
function smoothPath(points, W, H, pad = 20) {
  if (points.length < 2) return { line: '', area: '' };
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (W - 2 * pad));
  const ys = points.map(p => H - pad - (p / 100) * (H - 2 * pad));

  let line = `M ${xs[0]} ${ys[0]}`;
  let area = `M ${xs[0]} ${H - pad} L ${xs[0]} ${ys[0]}`;

  for (let i = 1; i < points.length; i++) {
    const cpx = (xs[i - 1] + xs[i]) / 2;
    const seg = ` C ${cpx} ${ys[i - 1]} ${cpx} ${ys[i]} ${xs[i]} ${ys[i]}`;
    line += seg;
    area += seg;
  }
  area += ` L ${xs[xs.length - 1]} ${H - pad} Z`;
  return { line, area };
}

// ─── X-axis label (every 5 days) ──────────────────────────────────────────────
function formatLabel(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const W = 900, H = 180, PAD = 28;

export default function ProgressChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await completionAPI.getChart(30);
      setData(res.data.data);
    } catch (e) {
      console.error('Chart load error:', e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="chart-wrap">
      <div className="chart-loading">
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 2 }} />
        <span>Loading chart...</span>
      </div>
    </div>
  );

  const pcts = data.map(d => d.pct);
  const { line, area } = smoothPath(pcts, W, H, PAD);
  const avgPct = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;

  // X positions for labels and hover
  const xs = pcts.map((_, i) => PAD + (i / (pcts.length - 1 || 1)) * (W - 2 * PAD));
  const ys = pcts.map(p => H - PAD - (p / 100) * (H - 2 * PAD));

  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <div>
          <h2 className="chart-title">Daily Completion Rate</h2>
          <p className="chart-sub">Last 30 days — Avg: <strong style={{ color: 'var(--primary)' }}>{avgPct}%</strong></p>
        </div>
        <div className="chart-badges">
          {[0, 25, 50, 75, 100].map(v => (
            <span key={v} className="chart-badge">{v}%</span>
          ))}
        </div>
      </div>

      <div className="chart-svg-wrap">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="chart-svg"
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
            </linearGradient>
            {/* Horizontal gridlines */}
            {[25, 50, 75].map(v => {
              const y = H - PAD - (v / 100) * (H - 2 * PAD);
              return (
                <line key={v} x1={PAD} y1={y} x2={W - PAD} y2={y}
                  stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
              );
            })}
          </defs>

          {/* Gridlines */}
          {[25, 50, 75].map(v => {
            const y = H - PAD - (v / 100) * (H - 2 * PAD);
            return <line key={v} x1={PAD} y1={y} x2={W - PAD} y2={y}
              stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />;
          })}

          {/* Area fill */}
          {pcts.length > 1 && <path d={area} fill="url(#areaGrad)" />}

          {/* Line */}
          {pcts.length > 1 && (
            <path d={line} fill="none" stroke="#818cf8" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Hover dots + invisible hit areas */}
          {data.map((d, i) => (
            <g key={i}>
              <rect
                x={xs[i] - 10} y={0} width={20} height={H}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
              />
              {hovered === i && (
                <>
                  <line x1={xs[i]} y1={PAD} x2={xs[i]} y2={H - PAD}
                    stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />
                  <circle cx={xs[i]} cy={ys[i]} r={5} fill="#818cf8" stroke="#1e293b" strokeWidth={2} />
                  <rect x={xs[i] - 36} y={ys[i] - 28} width={72} height={22} rx={5}
                    fill="#334155" stroke="#475569" strokeWidth={1} />
                  <text x={xs[i]} y={ys[i] - 13} textAnchor="middle"
                    fill="#f1f5f9" fontSize={10} fontWeight="600">
                    {d.pct}% — {formatLabel(d.date)}
                  </text>
                </>
              )}
            </g>
          ))}

          {/* X-axis labels every 5 days */}
          {data.map((d, i) => {
            if (i % 5 !== 0 && i !== data.length - 1) return null;
            return (
              <text key={i} x={xs[i]} y={H - 4} textAnchor="middle"
                fill="#64748b" fontSize={9}>
                {formatLabel(d.date)}
              </text>
            );
          })}

          {/* Y-axis labels */}
          {[0, 50, 100].map(v => {
            const y = H - PAD - (v / 100) * (H - 2 * PAD);
            return (
              <text key={v} x={PAD - 6} y={y + 4} textAnchor="end"
                fill="#64748b" fontSize={9}>
                {v}%
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
