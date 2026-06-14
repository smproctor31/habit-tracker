import { useState } from 'react'
import { todayKey, formatDate, getWeeklyProgress } from '../lib/storage.js'

export default function TodayPage({ habits, logs, onToggle, onDetail }) {
  const today = todayKey()
  const todayLogs = logs[today] || {}
  const completedCount = habits.filter(h => todayLogs[h.id]?.done).length
  const allDone = completedCount === habits.length && habits.length > 0
  const pct = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0

  return (
    <div style={s.page}>
      {/* Date and progress header */}
      <div style={s.header}>
        <div style={s.dateLabel}>{formatDate(today)}</div>
        <div style={s.progressRow}>
          <div style={s.progressLabel}>
            {allDone ? '🎉 All done!' : `${completedCount} of ${habits.length} habits complete`}
          </div>
          <div style={s.pctLabel}>{pct}%</div>
        </div>
        <div style={s.progressBar}>
          <div style={{ ...s.progressFill, width: `${pct}%`, background: allDone ? '#1a7a3a' : '#6c63ff' }} />
        </div>
      </div>

      {/* Habit cards */}
      <div style={s.habitList}>
        {habits.length === 0 && (
          <div style={s.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={s.emptyTitle}>No habits yet</div>
            <div style={s.emptySub}>Go to Settings to add your first habit!</div>
          </div>
        )}
        {habits.map(habit => {
          const log = todayLogs[habit.id]
          const done = log?.done || false
          const detail = log?.detail || ''

          return (
            <HabitCard
              key={habit.id}
              habit={habit}
              done={done}
              detail={detail}
              logs={logs}
              onToggle={() => onToggle(today, habit.id)}
              onDetailSave={(text) => onDetail(today, habit.id, text)}
            />
          )
        })}
      </div>

      {/* Motivational footer */}
      {allDone && habits.length > 0 && (
        <div style={s.successBanner}>
          🌟 Perfect day! Keep the streak going tomorrow!
        </div>
      )}
    </div>
  )
}

function HabitCard({ habit, done, detail, logs, onToggle, onDetailSave }) {
  const weekly = getWeeklyProgress(habit.id, logs, habit.weeklyGoal || 7)
  const [expanded, setExpanded] = useState(false)
  const [detailText, setDetailText] = useState(detail)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onDetailSave(detailText)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setExpanded(false)
  }

  return (
    <div style={{ ...s.card, ...(done ? { ...s.cardDone, borderColor: habit.color } : {}) }}>
      {/* Main row */}
      <div style={s.cardMain}>
        {/* Check button */}
        <button
          style={{ ...s.checkBtn, ...(done ? { background: habit.color, borderColor: habit.color } : {}) }}
          onClick={onToggle}
          aria-label={done ? `Unmark ${habit.name}` : `Mark ${habit.name} complete`}
        >
          {done ? '✓' : ''}
        </button>

        {/* Habit info */}
        <div style={s.habitInfo} onClick={() => setExpanded(e => !e)}>
          <div style={s.habitTop}>
            <span style={s.habitEmoji}>{habit.emoji}</span>
            <span style={{ ...s.habitName, ...(done ? { textDecoration: 'line-through', color: '#9a9ab8' } : {}) }}>
              {habit.name}
            </span>
          </div>
          {detail && !expanded && (
            <div style={s.detailPreview}>📝 {detail}</div>
          )}
        </div>

        {/* Expand button */}
        <button style={s.expandBtn} onClick={() => setExpanded(e => !e)}>
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Weekly goal progress bar */}
      <div style={s.weeklyBar}>
        <div style={s.weeklyBarInner}>
          <div style={{ ...s.weeklyFill, width: `${weekly.pct}%`, background: weekly.met ? '#1a7a3a' : habit.color }} />
        </div>
        <div style={s.weeklyLabel}>
          <span style={{ color: weekly.met ? '#1a7a3a' : '#8a8ab8', fontWeight: weekly.met ? 700 : 400 }}>
            {weekly.met ? '🎯 Goal met! ' : ''}{weekly.done}/{weekly.goal} this week
          </span>
        </div>
      </div>

      {/* Expanded detail entry */}
      {expanded && (
        <div style={s.detailSection}>
          <label style={s.detailLabel}>{habit.detailLabel}</label>
          <textarea
            style={s.detailInput}
            placeholder={habit.detailPlaceholder}
            value={detailText}
            onChange={e => setDetailText(e.target.value)}
            rows={3}
          />
          <div style={s.detailActions}>
            <button style={s.saveBtn} onClick={handleSave}>
              {saved ? '✓ Saved!' : 'Save Note'}
            </button>
            <button style={s.cancelDetailBtn} onClick={() => setExpanded(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 80 },

  header: { background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 16, boxShadow: '0 2px 12px rgba(108,99,255,0.08)' },
  dateLabel: { fontSize: 13, color: '#8a8ab8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  progressRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 15, fontWeight: 700, color: '#1a1a2e' },
  pctLabel: { fontSize: 22, fontWeight: 800, color: '#6c63ff' },
  progressBar: { height: 8, background: '#eeeef8', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, transition: 'width 0.4s ease, background 0.3s' },

  habitList: { display: 'flex', flexDirection: 'column', gap: 12 },

  emptyState: { textAlign: 'center', padding: '48px 20px' },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#8a8ab8' },

  card: {
    background: '#fff', borderRadius: 16, border: '2px solid #eeeef8',
    overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'all 0.2s',
  },
  cardDone: { background: '#fafffe' },

  cardMain: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px' },

  checkBtn: {
    width: 36, height: 36, borderRadius: '50%', border: '2.5px solid #d0d0e8',
    background: '#fff', color: '#fff', fontSize: 18, fontWeight: 700,
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s', fontFamily: 'inherit',
  },

  habitInfo: { flex: 1, minWidth: 0, cursor: 'pointer' },
  habitTop: { display: 'flex', alignItems: 'center', gap: 8 },
  habitEmoji: { fontSize: 22, flexShrink: 0 },
  habitName: { fontSize: 17, fontWeight: 700, color: '#1a1a2e', transition: 'all 0.2s' },
  detailPreview: { fontSize: 12, color: '#8a8ab8', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  expandBtn: { background: 'transparent', border: 'none', color: '#c0c0d8', fontSize: 12, padding: '4px 8px', flexShrink: 0, fontFamily: 'inherit' },

  detailSection: { padding: '0 16px 16px', borderTop: '1px solid #f0f0f8' },
  detailLabel: { display: 'block', fontSize: 12, color: '#6a6a8a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '12px 0 6px' },
  detailInput: { width: '100%', background: '#f7f7fd', border: '1px solid #e0e0f0', borderRadius: 10, padding: '10px 12px', color: '#1a1a2e', resize: 'none', outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' },
  detailActions: { display: 'flex', gap: 8, marginTop: 8 },
  saveBtn: { background: '#6c63ff', border: 'none', color: '#fff', padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: 'inherit' },
  cancelDetailBtn: { background: '#f0f0f8', border: 'none', color: '#8a8ab8', padding: '9px 16px', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' },

  weeklyBar: { padding: '0 16px 10px', borderTop: '1px solid #f5f5fb' },
  weeklyBarInner: { height: 5, background: '#eeeef8', borderRadius: 3, overflow: 'hidden', marginBottom: 5 },
  weeklyFill: { height: '100%', borderRadius: 3, transition: 'width 0.4s ease' },
  weeklyLabel: { fontSize: 11, color: '#8a8ab8' },
  successBanner: { background: 'linear-gradient(135deg,#1a7a3a,#2ecc71)', borderRadius: 14, padding: '16px', textAlign: 'center', color: '#fff', fontSize: 16, fontWeight: 700, marginTop: 16 },
}
