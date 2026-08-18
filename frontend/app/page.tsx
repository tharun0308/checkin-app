'use client'

import { useEffect, useState, useCallback } from 'react'
import CheckInButton from '@/components/CheckInButton'
import WeekProgress from '@/components/WeekProgress'
import StreakCard from '@/components/StreakCard'
import TipsPanel from '@/components/TipsPanel'
import { getWeekStats, getStreakStats, type WeekStats, type StreakStats, type ConfirmResponse } from '@/lib/api'

export default function HomePage() {
  const [weekStats, setWeekStats] = useState<WeekStats | null>(null)
  const [streakStats, setStreakStats] = useState<StreakStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [w, s] = await Promise.all([getWeekStats(), getStreakStats()])
      setWeekStats(w)
      setStreakStats(s)
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Couldn't connect to the backend. Is it running?")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // After a successful check-in, refresh stats
  function handleCheckinSuccess(_result: ConfirmResponse) {
    load()
  }

  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <div className="pt-2">
        <p className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--color-text-faint)' }}>
          {dateLabel}
        </p>
        <h1 className="text-2xl font-bold mt-1 leading-snug" style={{ color: 'var(--color-text)' }}>
          How's today going?
        </h1>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="rounded-2xl px-4 py-3 text-sm"
          style={{ background: 'rgba(196,128,106,0.12)', color: 'var(--color-coral-light)', border: '1px solid rgba(196,128,106,0.2)' }}
        >
          {error}
        </div>
      )}

      {/* Primary action */}
      <CheckInButton onSuccess={handleCheckinSuccess} />

      {/* Week progress */}
      {loading ? (
        <SkeletonCard />
      ) : weekStats ? (
        <WeekProgress
          daysUsed={weekStats.days_used}
          limit={weekStats.limit}
          weekStart={weekStats.week_start}
        />
      ) : null}

      {/* Streak card */}
      {loading ? (
        <SkeletonCard />
      ) : streakStats ? (
        <StreakCard
          currentStreakDays={streakStats.current_streak_days}
          longestStreakDays={streakStats.longest_streak_days}
        />
      ) : null}

      {/* Tips — collapsed by default */}
      <TipsPanel />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl h-28 animate-pulse"
      style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(255,255,255,0.05)' }}
    />
  )
}
