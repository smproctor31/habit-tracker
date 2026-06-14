import { useState, useEffect, useCallback } from 'react'
import {
  loadHabits, saveHabits, loadLogs, saveLogs,
  loadSettings, saveSettings, todayKey
} from './lib/storage.js'
import TodayPage    from './pages/TodayPage.jsx'
import ProgressPage from './pages/ProgressPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

// Schedule daily browser notification
function scheduleReminder(time, enabled) {
  if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return
  const [hours, minutes] = time.split(':').map(Number)
  const now = new Date()
  const next = new Date()
  next.setHours(hours, minutes, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  const delay = next - now
  return setTimeout(() => {
    new Notification('Habit Tracker 🌟', {
      body: "Time to check in on your daily habits!",
      icon: '/favicon.ico',
    })
  }, delay)
}

export default function App() {
  const [tab, setTab]           = useState('today')
  const [habits, setHabits]     = useState(() => loadHabits())
  const [logs, setLogs]         = useState(() => loadLogs())
  const [settings, setSettings] = useState(() => loadSettings())

  // Schedule reminder whenever settings change
  useEffect(() => {
    const timer = scheduleReminder(settings.reminderTime, settings.reminderEnabled)
    return () => clearTimeout(timer)
  }, [settings.reminderTime, settings.reminderEnabled])

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleToggle(dateKey, habitId) {
    setLogs(prev => {
      const next = { ...prev }
      if (!next[dateKey]) next[dateKey] = {}
      if (!next[dateKey][habitId]) next[dateKey][habitId] = { done: false, detail: '' }
      next[dateKey][habitId] = {
        ...next[dateKey][habitId],
        done: !next[dateKey][habitId].done,
      }
      saveLogs(next)
      return next
    })
  }

  function handleDetail(dateKey, habitId, detail) {
    setLogs(prev => {
      const next = { ...prev }
      if (!next[dateKey]) next[dateKey] = {}
      if (!next[dateKey][habitId]) next[dateKey][habitId] = { done: false, detail: '' }
      next[dateKey][habitId] = { ...next[dateKey][habitId], detail }
      saveLogs(next)
      return next
    })
  }

  function handleHabitsChange(newHabits) {
    setHabits(newHabits)
    saveHabits(newHabits)
  }

  function handleSettingsChange(newSettings) {
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  // Completion count for today (shown in nav badge)
  const todayLogs = logs[todayKey()] || {}
  const todayDone = habits.filter(h => todayLogs[h.id]?.done).length
  const allDoneToday = todayDone === habits.length && habits.length > 0

  return (
    <div style={s.app}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerTitle}>
          {tab === 'today'    ? '✅ Today'    : ''}
          {tab === 'progress' ? '📊 Progress' : ''}
          {tab === 'settings' ? '⚙️ Settings' : ''}
        </div>
        {tab === 'today' && habits.length > 0 && (
          <div style={s.headerBadge}>
            <span style={{ ...s.badge, background: allDoneToday ? '#1a7a3a' : '#6c63ff' }}>
              {todayDone}/{habits.length}
            </span>
          </div>
        )}
      </header>

      {/* Page content */}
      <div style={s.content}>
        {tab === 'today'    && <TodayPage    habits={habits} logs={logs} onToggle={handleToggle} onDetail={handleDetail} />}
        {tab === 'progress' && <ProgressPage habits={habits} logs={logs} />}
        {tab === 'settings' && <SettingsPage habits={habits} settings={settings} onHabitsChange={handleHabitsChange} onSettingsChange={handleSettingsChange} />}
      </div>

      {/* Bottom nav */}
      <nav style={s.nav}>
        {[
          { id: 'today',    emoji: '☀️', label: 'Today' },
          { id: 'progress', emoji: '📊', label: 'Progress' },
          { id: 'settings', emoji: '⚙️', label: 'Settings' },
        ].map(t => (
          <button key={t.id}
            style={{ ...s.navBtn, ...(tab === t.id ? s.navBtnActive : {}) }}
            onClick={() => setTab(t.id)}>
            <span style={s.navEmoji}>{t.emoji}</span>
            <span style={s.navLabel}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

const s = {
  app: { height: '100%', display: 'flex', flexDirection: 'column', background: '#f5f5fa', maxWidth: 480, margin: '0 auto', position: 'relative' },

  header: {
    background: '#fff', padding: '16px 20px 12px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid #eeeef8', flexShrink: 0,
    boxShadow: '0 2px 8px rgba(108,99,255,0.06)',
  },
  headerTitle: { fontSize: 20, fontWeight: 800, color: '#1a1a2e' },
  headerBadge: {},
  badge: { borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#fff' },

  content: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },

  nav: {
    display: 'flex', background: '#fff',
    borderTop: '1px solid #eeeef8', flexShrink: 0,
    paddingBottom: 'env(safe-area-inset-bottom)',
    boxShadow: '0 -2px 8px rgba(108,99,255,0.06)',
  },
  navBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 8px', background: 'transparent', border: 'none', fontFamily: 'inherit', gap: 2 },
  navBtnActive: { borderTop: '2px solid #6c63ff' },
  navEmoji: { fontSize: 22 },
  navLabel: { fontSize: 11, fontWeight: 600, color: '#8a8ab8' },
}
