'use client'

import { useState } from 'react'
import { previewCheckin, confirmCheckin, type ConfirmResponse } from '@/lib/api'
import WarningModal from './WarningModal'

interface Props {
  onSuccess?: (result: ConfirmResponse) => void
}

type Phase = 'idle' | 'note' | 'previewing' | 'warning' | 'confirming' | 'done'

export default function CheckInButton({ onSuccess }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState<{ week_days_used: number; weekly_limit: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Step 1 — user taps the big button → show note input
  function handleOpen() {
    setPhase('note')
    setNote('')
    setError(null)
  }

  // Step 2 — user taps "Log it" in the note phase → call preview
  async function handlePreview() {
    setPhase('previewing')
    setError(null)
    try {
      const data = await previewCheckin(note || undefined)
      if (data.exceeds_limit) {
        setPreview({ week_days_used: data.week_days_used, weekly_limit: data.weekly_limit })
        setPhase('warning')
      } else {
        // No warning needed — go straight to confirm
        await doConfirm()
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setPhase('note')
    }
  }

  // Step 3 — actually save the entry (called directly or after warning confirmation)
  async function doConfirm() {
    setPhase('confirming')
    try {
      const result = await confirmCheckin(note || undefined)
      setPhase('done')
      onSuccess?.(result)
      // Reset after a short celebration pause
      setTimeout(() => setPhase('idle'), 2200)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setPhase('idle')
    }
  }

  function handleCancel() {
    setPhase('idle')
    setNote('')
  }

  // ── Render ───────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-3 animate-[slideUp_0.3s_ease-out]">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(122, 171, 138, 0.18)', border: '2px solid var(--color-sage)' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="text-lg font-semibold" style={{ color: 'var(--color-sage)' }}>Logged.</p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Thanks for being honest with yourself.
        </p>
      </div>
    )
  }

  if (phase === 'note') {
    return (
      <div className="flex flex-col gap-4 w-full animate-[slideUp_0.25s_ease-out]">
        <textarea
          id="checkin-note"
          className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 min-h-[90px]"
          style={{
            background: 'var(--color-bg-raised)',
            color: 'var(--color-text)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          placeholder="Add a note? (optional — what's the occasion, how are you feeling)"
          value={note}
          onChange={e => setNote(e.target.value)}
          autoFocus
        />
        {error && (
          <p className="text-sm text-center" style={{ color: 'var(--color-coral)' }}>{error}</p>
        )}
        <div className="flex gap-3">
          <button
            id="checkin-cancel-btn"
            onClick={handleCancel}
            className="btn-ghost flex-1 py-3 text-sm font-medium"
          >
            Never mind
          </button>
          <button
            id="checkin-confirm-btn"
            onClick={handlePreview}
            className="btn-primary flex-1 py-3 text-sm"
          >
            Log it
          </button>
        </div>
      </div>
    )
  }

  const isLoading = phase === 'previewing' || phase === 'confirming'

  return (
    <>
      <button
        id="checkin-main-btn"
        onClick={handleOpen}
        disabled={isLoading}
        className="btn-primary w-full py-5 text-base font-semibold flex items-center justify-center gap-3 shadow-lg"
        style={{
          fontSize: '1.05rem',
          letterSpacing: '0.01em',
          boxShadow: '0 6px 32px rgba(212, 168, 83, 0.22)',
        }}
      >
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2v4l-4-4H9a1.994 1.994 0 0 1-1.414-.586m0 0L11 14h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2v4l.586-.586"/>
            </svg>
            Logging a drink today
          </>
        )}
      </button>

      {phase === 'warning' && preview && (
        <WarningModal
          weekDaysUsed={preview.week_days_used}
          weeklyLimit={preview.weekly_limit}
          onConfirm={doConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}
