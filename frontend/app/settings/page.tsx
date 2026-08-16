'use client'

import { useEffect, useState, useRef } from 'react'
import { getSettings, updateSettings, type Settings } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

type SettingsPatch = Partial<Omit<Settings, 'monthly_goal'>> & { monthly_goal?: number | null }

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const { logout } = useAuth()

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error)
  }, [])

  async function handleChange(patch: SettingsPatch) {
    if (!settings) return
    const next = { ...settings, ...patch }
    setSettings(next)

    // Debounce the save
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaving(true)
    setSaved(false)
    saveTimerRef.current = setTimeout(async () => {
      try {
        const updated = await updateSettings(patch)
        setSettings(updated)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch (e) {
        console.error(e)
      } finally {
        setSaving(false)
      }
    }, 600)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div className="pt-2 flex items-baseline gap-2">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Settings
        </h1>
        {saving && (
          <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>Saving…</span>
        )}
        {saved && !saving && (
          <span className="text-xs" style={{ color: 'var(--color-sage)' }}>Saved</span>
        )}
      </div>

      {!settings ? (
        <SkeletonSettings />
      ) : (
        <>
          {/* Name */}
          <SettingSection
            title="Name"
            description="How you'd like the app to refer to you."
          >
            <input
              id="settings-name-input"
              type="text"
              className="settings-input"
              value={settings.name}
              onChange={e => handleChange({ name: e.target.value })}
              maxLength={50}
            />
          </SettingSection>

          {/* Weekly limit */}
          <SettingSection
            title="Weekly limit"
            description="Days with at least one drink. A gentle goal, not a hard cap — you can always log honestly."
          >
            <div className="flex items-center gap-4">
              <button
                id="settings-limit-dec-btn"
                onClick={() => {
                  if (settings.weekly_limit > 1) handleChange({ weekly_limit: settings.weekly_limit - 1 })
                }}
                className="w-10 h-10 rounded-xl btn-ghost flex items-center justify-center text-lg font-medium"
                aria-label="Decrease weekly limit"
              >
                −
              </button>
              <span
                className="text-3xl font-bold w-10 text-center tabular-nums"
                style={{ color: 'var(--color-text)' }}
              >
                {settings.weekly_limit}
              </span>
              <button
                id="settings-limit-inc-btn"
                onClick={() => {
                  if (settings.weekly_limit < 7) handleChange({ weekly_limit: settings.weekly_limit + 1 })
                }}
                className="w-10 h-10 rounded-xl btn-ghost flex items-center justify-center text-lg font-medium"
                aria-label="Increase weekly limit"
              >
                +
              </button>
            </div>
          </SettingSection>

          {/* Monthly goal */}
          <SettingSection
            title="Monthly goal"
            description="Optional. If set, the month view will show progress against it."
          >
            <div className="flex items-center gap-4">
              <button
                id="settings-goal-dec-btn"
                onClick={() => {
                  const cur = settings.monthly_goal ?? 0
                  if (cur > 0) handleChange({ monthly_goal: cur - 1 })
                }}
                className="w-10 h-10 rounded-xl btn-ghost flex items-center justify-center text-lg font-medium"
                aria-label="Decrease monthly goal"
              >
                −
              </button>
              <span
                className="text-3xl font-bold w-12 text-center tabular-nums"
                style={{ color: 'var(--color-text)' }}
              >
                {settings.monthly_goal ?? '—'}
              </span>
              <button
                id="settings-goal-inc-btn"
                onClick={() => {
                  const cur = settings.monthly_goal ?? 0
                  handleChange({ monthly_goal: cur + 1 })
                }}
                className="w-10 h-10 rounded-xl btn-ghost flex items-center justify-center text-lg font-medium"
                aria-label="Increase monthly goal"
              >
                +
              </button>
            </div>
            {settings.monthly_goal != null && (
              <button
                id="settings-goal-clear-btn"
                className="text-xs mt-1"
                style={{ color: 'var(--color-text-faint)' }}
                onClick={() => handleChange({ monthly_goal: null })}
              >
                Clear goal
              </button>
            )}
          </SettingSection>

          {/* About & Account */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>About CheckIn</p>
              <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--color-text-faint)' }}>
                A private, calm tool to help track and gradually reduce drinking.
                All data stays on your server. Nothing is shared.
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-faint)' }}>v1.0.0 (PWA Ready)</p>
            </div>
            
            <button
              onClick={logout}
              className="w-full py-3 mt-2 rounded-xl text-sm font-medium transition-colors"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#F87171' }}
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function SettingSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-faint)' }}>
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}

function SkeletonSettings() {
  return (
    <div className="flex flex-col gap-4">
      {[100, 120, 100].map((h, i) => (
        <div
          key={i}
          className="rounded-2xl animate-pulse"
          style={{ height: h, background: 'var(--color-bg-card)', border: '1px solid rgba(255,255,255,0.05)' }}
        />
      ))}
    </div>
  )
}
