// ── Keys ─────────────────────────────────────────────────────────────────────
const HABITS_KEY   = 'ht_habits_v1'
const LOGS_KEY     = 'ht_logs_v1'
const SETTINGS_KEY = 'ht_settings_v1'

// ── Default habits ────────────────────────────────────────────────────────────
export const DEFAULT_HABITS = [
  { id: 'workout',  name: 'Work Out',     emoji: '💪', color: '#e05500', weeklyGoal: 5, detailLabel: 'What did you do? (e.g. 45 min run)',    detailPlaceholder: 'e.g. 45 min run, chest day, yoga…' },
  { id: 'eating',   name: 'Eat Healthy',  emoji: '🥗', color: '#1a7a3a', weeklyGoal: 7, detailLabel: 'What did you eat well today?',          detailPlaceholder: 'e.g. salad for lunch, no sugar…' },
  { id: 'reading',  name: 'Read',         emoji: '📚', color: '#1a4db5', weeklyGoal: 5, detailLabel: 'What did you read?',                    detailPlaceholder: 'e.g. 30 min of Atomic Habits…' },
  { id: 'family',   name: 'Family Time',  emoji: '❤️', color: '#c0392b', weeklyGoal: 7, detailLabel: 'How did you spend time with family?',   detailPlaceholder: 'e.g. dinner together, game night…' },
]

export const DEFAULT_SETTINGS = {
  reminderEnabled: false,
  reminderTime: '20:00',
  startOfWeek: 0, // 0 = Sunday
}

// ── Load / Save ───────────────────────────────────────────────────────────────
export function loadHabits() {
  try {
    const raw = localStorage.getItem(HABITS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_HABITS
  } catch { return DEFAULT_HABITS }
}

export function saveHabits(habits) {
  try { localStorage.setItem(HABITS_KEY, JSON.stringify(habits)) } catch {}
}

export function loadLogs() {
  try {
    const raw = localStorage.getItem(LOGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function saveLogs(logs) {
  try { localStorage.setItem(LOGS_KEY, JSON.stringify(logs)) } catch {}
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch { return DEFAULT_SETTINGS }
}

export function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch {}
}

// ── Date helpers ──────────────────────────────────────────────────────────────
export function todayKey() {
  return new Date().toISOString().split('T')[0]
}

export function dateKey(date) {
  return date.toISOString().split('T')[0]
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(dateKey(d))
  }
  return days
}

export function getLast30Days() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(dateKey(d))
  }
  return days
}

export function getWeekDays(weeksBack = 0) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - dayOfWeek - weeksBack * 7)
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    days.push(dateKey(d))
  }
  return days
}

// ── Current week helpers ─────────────────────────────────────────────────────
// Returns the days of the current Sun–Sat week
export function getCurrentWeekDays() {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 6=Sat
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - dayOfWeek + i)
    days.push(dateKey(d))
  }
  return days
}

// Returns { done, goal, pct, met } for a habit this week
export function getWeeklyProgress(habitId, logs, weeklyGoal) {
  const days = getCurrentWeekDays()
  const done = days.filter(d => logs[d]?.[habitId]?.done).length
  const goal = weeklyGoal || 7
  const pct  = Math.min(Math.round((done / goal) * 100), 100)
  const met  = done >= goal
  return { done, goal, pct, met, days }
}

// ── Stats helpers ─────────────────────────────────────────────────────────────

// Returns current streak for a habit
export function getStreak(habitId, logs) {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = dateKey(d)
    if (logs[key]?.[habitId]?.done) {
      streak++
    } else {
      // Allow today to not be logged yet without breaking streak
      if (i === 0) continue
      break
    }
  }
  return streak
}

// Returns best streak ever for a habit
export function getBestStreak(habitId, logs) {
  const sortedDays = Object.keys(logs).sort()
  let best = 0
  let current = 0
  let prevDate = null

  sortedDays.forEach(day => {
    if (logs[day]?.[habitId]?.done) {
      if (prevDate) {
        const prev = new Date(prevDate + 'T12:00:00')
        const curr = new Date(day + 'T12:00:00')
        const diff = (curr - prev) / (1000 * 60 * 60 * 24)
        if (diff === 1) {
          current++
        } else {
          current = 1
        }
      } else {
        current = 1
      }
      best = Math.max(best, current)
      prevDate = day
    } else {
      current = 0
      prevDate = null
    }
  })
  return best
}

// Returns completion count for a habit over a set of days
export function getCompletionCount(habitId, logs, days) {
  return days.filter(d => logs[d]?.[habitId]?.done).length
}

// Returns overall completion % for a day
export function getDayCompletion(logs, dateStr, habits) {
  if (habits.length === 0) return 0
  const done = habits.filter(h => logs[dateStr]?.[h.id]?.done).length
  return Math.round((done / habits.length) * 100)
}
