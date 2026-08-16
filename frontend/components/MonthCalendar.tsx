'use client'

import { type EntryOut } from '@/lib/api'

interface Props {
  year: number
  month: number  // 1-based
  entries: EntryOut[]
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export default function MonthCalendar({ year, month, entries }: Props) {
  // Build set of entry_date strings like "2024-03-07"
  const entryDateSet = new Set(entries.map(e => e.entry_date))
  const today = new Date()
  const todayStr = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate())

  // Days in month
  const daysInMonth = new Date(year, month, 0).getDate()
  // First day of month (0=Sun, adjust to Mon=0)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  const startOffset = (firstDayOfMonth + 6) % 7  // Mon=0

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Month header */}
      <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
        {MONTH_NAMES[month - 1]} {year}
      </h2>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map(d => (
          <div
            key={d}
            className="text-center text-[10px] font-medium pb-1"
            style={{ color: 'var(--color-text-faint)' }}
          >
            {d}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }
          const dateStr = formatDate(year, month, day)
          const hasEntry = entryDateSet.has(dateStr)
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr

          return (
            <div
              key={dateStr}
              className="aspect-square flex flex-col items-center justify-center rounded-xl relative"
              style={{
                background: hasEntry
                  ? 'rgba(212, 168, 83, 0.12)'
                  : isToday
                  ? 'rgba(255,255,255,0.04)'
                  : 'transparent',
                border: isToday
                  ? '1.5px solid rgba(212,168,83,0.5)'
                  : '1.5px solid transparent',
              }}
            >
              <span
                className="text-xs font-medium"
                style={{
                  color: isFuture
                    ? 'var(--color-text-faint)'
                    : hasEntry
                    ? 'var(--color-gold-light)'
                    : isToday
                    ? 'var(--color-gold)'
                    : 'var(--color-text-muted)',
                  opacity: isFuture ? 0.4 : 1,
                }}
              >
                {day}
              </span>
              {hasEntry && (
                <div
                  className="cal-dot mt-0.5"
                  style={{
                    width: '4px',
                    height: '4px',
                    background: 'var(--color-gold)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(212,168,83,0.25)' }} />
          <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>Drink logged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ border: '1.5px solid rgba(212,168,83,0.5)', background: 'transparent' }}
          />
          <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>Today</span>
        </div>
      </div>
    </div>
  )
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
