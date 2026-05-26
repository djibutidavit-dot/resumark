import { useState, useEffect } from 'react'

export default function ScoreRing({ score, size = 130 }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)'

  useEffect(() => {
    const t = setTimeout(() => setOffset(circumference - (score / 100) * circumference), 100)
    return () => clearTimeout(t)
  }, [score, circumference])

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.36, color, fontWeight: 400, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  )
}
