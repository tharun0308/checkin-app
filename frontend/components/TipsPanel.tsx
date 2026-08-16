'use client'

import { useState } from 'react'

const TIPS = [
  {
    title: 'Wait 20 minutes',
    body: 'When the urge hits, set a timer for 20 minutes and do something else. The craving usually passes — or at least gets smaller.',
  },
  {
    title: 'Swap in something you enjoy',
    body: 'A sparkling water with lime, a good coffee, or an alcohol-free beer can scratch the same ritual itch without the same effect.',
  },
  {
    title: "Name what you're feeling",
    body: 'Boredom, stress, loneliness, celebration — they all lead to the same reflex. Noticing which one it is gives you a moment to choose.',
  },
  {
    title: 'Change the environment',
    body: "If you usually drink at a certain spot at a certain time, just moving — going for a walk, going to a different room — can break the automatic chain.",
  },
  {
    title: 'Make the first drink harder to start',
    body: "Don't buy in bulk, keep alcohol out of easy reach, or pour it into a smaller glass. Small friction helps more than willpower.",
  },
  {
    title: 'Notice how you feel the next morning',
    body: 'Not as a punishment — just as information. On mornings after fewer drinks, does anything feel different? Sleep, mood, energy?',
  },
  {
    title: "Progress isn't a straight line",
    body: "A week with more drinks than you planned doesn't erase the progress from the weeks before. Every log is honest data, not a verdict.",
  },
]


export default function TipsPanel() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TIPS.length))

  const tip = TIPS[index]

  function nextTip() {
    setIndex(i => (i + 1) % TIPS.length)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Collapse toggle */}
      <button
        id="tips-toggle-btn"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        style={{ background: 'var(--color-bg-card)' }}
      >
        <div className="flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Gentle ideas
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-faint)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Content */}
      {open && (
        <div
          className="px-5 pb-5 pt-1 flex flex-col gap-3"
          style={{ background: 'var(--color-bg-card)' }}
        >
          <div
            className="rounded-xl p-4 flex flex-col gap-2"
            style={{ background: 'var(--color-bg-raised)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {tip.title}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {tip.body}
            </p>
          </div>

          <button
            id="tips-next-btn"
            onClick={nextTip}
            className="text-xs self-end"
            style={{ color: 'var(--color-text-faint)' }}
          >
            Another idea →
          </button>
        </div>
      )}
    </div>
  )
}
