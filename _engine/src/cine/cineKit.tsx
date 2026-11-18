import React from 'react';
const INK = '#07070b';

export const wob = (t: number, f: number, s = 0) => Math.sin(t * f + s);
export const Limb: React.FC<{x: number; y: number; a: number; b: number; L1: number; L2: number; w1: number; w2: number; end: number; c: string; cd?: string; endC?: string; sw?: number}> =
  ({x, y, a, b, L1, L2, w1, w2, end, c, cd, endC, sw = 8}) => (
    <g transform={`translate(${x} ${y}) rotate(${a})`} stroke={INK} strokeWidth={sw} strokeLinejoin="round">
      <rect x={-w1 / 2} y={-w1 / 2} width={L1 + w1 / 2} height={w1} rx={w1 / 2} fill={c} />
      {cd && <rect x={0} y={w1 * 0.1} width={L1} height={w1 * 0.38} rx={w1 * 0.19} fill={cd} stroke="none" />}
      <g transform={`translate(${L1} 0) rotate(${b})`}>
        <rect x={-w2 / 2} y={-w2 / 2} width={L2 + w2 / 2} height={w2} rx={w2 / 2} fill={c} />
        {cd && <rect x={0} y={w2 * 0.1} width={L2} height={w2 * 0.36} rx={w2 * 0.18} fill={cd} stroke="none" />}
        <circle cx={L2 + end * 0.3} cy={0} r={end} fill={endC ?? c} />
      </g>
    </g>
  );
