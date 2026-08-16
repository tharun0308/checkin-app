'use client'

interface Props {
  daysUsed: number
  limit: number
  weekStart?: string  // ISO date e.g. "2024-03-18"
}

export default function WeekProgress({ daysUsed, limit, weekStart }: Props) {
  const pct = Math.min((daysUsed / limit) * 100, 100)
  const over = daysUsed > limit
  const fillClass = over ? 'progress-fill-coral' : 'progress-fill-sage'

  // Build the Mon–Sun labels
  const labels = weekStart ? buildWeekLabels(weekStart) : []

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text-faint)', letterSpacing: '0.08em' }}>
          This week
        </h2>
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: over ? 'var(--color-coral-light)' : 'var(--color-text)' }}
        >
          {daysUsed}
          <span className="text-base font-medium ml-1" style={{ color: 'var(--color-text-faint)' }}>
            / {limit}
          </span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-track h-2.5 w-full">
        <div className={`${fillClass} h-full`} style={{ width: `${pct}%` }} />
      </div>

      {/* Day dots */}
      {labels.length > 0 && (
        <div className="flex justify-between px-0.5">
          {labels.map(({ label, hasEntry, isToday }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors"
                style={{
                  background: hasEntry
                    ? (over ? 'rgba(196,128,106,0.2)' : 'rgba(122,171,138,0.2)')
                    : 'transparent',
                  color: isToday
                    ? 'var(--color-gold)'
                    : hasEntry
                    ? (over ? 'var(--color-coral-light)' : 'var(--color-sage-light)')
                    : 'var(--color-text-faint)',
                  border: isToday ? '1.5px solid var(--color-gold)' : '1.5px solid transparent',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status line */}
      <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
        {over
          ? `${daysUsed - limit} day${daysUsed - limit !== 1 ? 's' : ''} over your goal this week — still good to log honestly.`
          : daysUsed === limit
          ? `At your goal for the week.`
          : `${limit - daysUsed} day${limit - daysUsed !== 1 ? 's' : ''} remaining before your goal.`}
      </p>
    </div>
  )
}

interface DayLabel {
  label: string
  hasEntry: boolean
  isToday: boolean
}

function buildWeekLabels(weekStartIso: string): DayLabel[] {
  // weekStartIso is Monday
  const start = new Date(weekStartIso + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return dayLetters.map((letter, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const isToday = d.getTime() === today.getTime()
    const isPast = d < today
    return { label: letter, hasEntry: false, isToday }
  })
}
