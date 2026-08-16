'use client'

interface Props {
  currentStreakDays: number
  longestStreakDays: number
}

export default function StreakCard({ currentStreakDays, longestStreakDays }: Props) {
  const isStreak = currentStreakDays > 0

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header */}
      <h2
        className="text-sm font-semibold tracking-wide uppercase"
        style={{ color: 'var(--color-text-faint)', letterSpacing: '0.08em' }}
      >
        Alcohol-free streak
      </h2>

      {/* Main number */}
      <div className="flex items-end gap-4">
        <div className="flex flex-col">
          <span
            className="text-5xl font-bold tabular-nums leading-none"
            style={{ color: isStreak ? 'var(--color-sage-light)' : 'var(--color-text-muted)' }}
          >
            {currentStreakDays}
          </span>
          <span className="text-sm mt-1" style={{ color: 'var(--color-text-faint)' }}>
            day{currentStreakDays !== 1 ? 's' : ''} in a row
          </span>
        </div>

        {/* Divider */}
        <div
          className="self-stretch w-px mx-2"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        />

        {/* Longest */}
        <div className="flex flex-col">
          <span
            className="text-2xl font-semibold tabular-nums leading-none"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {longestStreakDays}
          </span>
          <span className="text-xs mt-1" style={{ color: 'var(--color-text-faint)' }}>
            longest
          </span>
        </div>
      </div>

      {/* Encouragement */}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-faint)' }}>
        {currentStreakDays === 0
          ? 'Every day without a drink counts — even a single day is worth noting.'
          : currentStreakDays === 1
          ? 'One good day. Keep going if you can.'
          : currentStreakDays >= longestStreakDays && longestStreakDays > 1
          ? `This is your longest streak so far.`
          : `Doing well. Your record is ${longestStreakDays} day${longestStreakDays !== 1 ? 's' : ''}.`}
      </p>
    </div>
  )
}
