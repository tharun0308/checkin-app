'use client'

interface Props {
  weekDaysUsed: number
  weeklyLimit: number
  onConfirm: () => void
  onCancel: () => void
}

export default function WarningModal({ weekDaysUsed, weeklyLimit, onConfirm, onCancel }: Props) {
  const ordinal = getOrdinal(weekDaysUsed)

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="warning-heading">
      <div
        className="modal-sheet card p-6 flex flex-col gap-5"
        style={{ background: 'var(--color-bg-raised)', border: '1px solid rgba(196, 128, 106, 0.3)' }}
      >
        {/* Icon */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(196, 128, 106, 0.15)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-coral)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2
            id="warning-heading"
            className="text-base font-semibold leading-snug"
            style={{ color: 'var(--color-text)' }}
          >
            Just a heads up
          </h2>
        </div>

        {/* Body */}
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          This would be your{' '}
          <span style={{ color: 'var(--color-coral-light)', fontWeight: 600 }}>
            {ordinal} day
          </span>{' '}
          this week, past your goal of{' '}
          <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>
            {weeklyLimit}
          </span>.
          {' '}That's okay — logging it honestly is what matters.
        </p>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-faint)' }}>
          You can always update your weekly goal in Settings if it no longer feels right.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            id="warning-log-anyway-btn"
            onClick={onConfirm}
            className="btn-primary w-full py-3.5 text-sm"
          >
            Log it anyway
          </button>
          <button
            id="warning-nevermind-btn"
            onClick={onCancel}
            className="btn-ghost w-full py-3 text-sm"
          >
            Never mind
          </button>
        </div>
      </div>
    </div>
  )
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}
