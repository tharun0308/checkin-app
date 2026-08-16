'use client'

import { useEffect, useState } from 'react'
import MonthCalendar from '@/components/MonthCalendar'
import { getEntries, getMonthStats, type EntryOut, type MonthStats } from '@/lib/api'

export default function MonthPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)  // 1-based

  const [entries, setEntries] = useState<EntryOut[]>([])
  const [monthStats, setMonthStats] = useState<MonthStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    Promise.all([
      getEntries(monthStr),
      getMonthStats(),
    ]).then(([e, s]) => {
      setEntries(e)
      setMonthStats(s)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [year, month])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const now = new Date()
    // Don't allow navigating into the future beyond current month
    if (year === now.getFullYear() && month === now.getMonth() + 1) return
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1

  // Count distinct days in the viewed month (using the loaded entries)
  const daysThisView = new Set(entries.map(e => e.entry_date)).size

  return (
    <div className="flex flex-col gap-5">
      {/* Page heading */}
      <div className="pt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Month view
        </h1>
        {/* Month navigator */}
        <div className="flex items-center gap-1">
          <button
            id="month-prev-btn"
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center btn-ghost"
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button
            id="month-next-btn"
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center btn-ghost disabled:opacity-30"
            aria-label="Next month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div
          className="rounded-2xl h-72 animate-pulse"
          style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(255,255,255,0.05)' }}
        />
      ) : (
        <MonthCalendar year={year} month={month} entries={entries} />
      )}

      {/* Summary card */}
      {monthStats && (
        <div className="card p-5 flex flex-col gap-3">
          <h2
            className="text-sm font-semibold tracking-wide uppercase"
            style={{ color: 'var(--color-text-faint)', letterSpacing: '0.08em' }}
          >
            At a glance
          </h2>
          <div className="flex gap-6">
            <Stat
              value={daysThisView}
              label="this month"
              color={
                monthStats.goal && daysThisView > monthStats.goal
                  ? 'var(--color-coral-light)'
                  : 'var(--color-text)'
              }
            />
            <Stat value={monthStats.days_last_month} label="last month" color="var(--color-text-muted)" />
            {monthStats.goal != null && (
              <Stat value={monthStats.goal} label="monthly goal" color="var(--color-gold)" />
            )}
          </div>

          {monthStats.goal != null && (
            <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
              {daysThisView === 0
                ? 'No drinks logged yet this month.'
                : daysThisView <= monthStats.goal
                ? `On track with your monthly goal of ${monthStats.goal} day${monthStats.goal !== 1 ? 's' : ''}.`
                : `${daysThisView - monthStats.goal} day${daysThisView - monthStats.goal !== 1 ? 's' : ''} over your monthly goal — you can update it in Settings anytime.`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-bold tabular-nums" style={{ color }}>{value}</span>
      <span className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>{label}</span>
    </div>
  )
}
