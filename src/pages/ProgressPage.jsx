import { useState } from 'react'
import {
  getLast7Days, getLast30Days, getStreak, getBestStreak,
  getCompletionCount, formatDateShort, getDayCompletion,
  getWeeklyProgress, getCurrentWeekDays
} from '../lib/storage.js'

export default function ProgressPage({ habits, logs }) {
  const [selectedHabit, setSelectedHabit] = useState('all')
  const last7  = getLast7Days()
  const last30 = getLast30Days()

  const selectedHabits = selectedHabit === 'all'
    ? habits
    : habits.filter(h => h.id === selectedHabit)

  return (
    <div style={s.page}>

      {/* Habit filter tabs */}
      <div style={s.filterBar}>
        <button style={{ ...s.filterBtn, ...(selectedHabit === 'all' ? s.filterBtnActive : {}) }}
          onClick={() => setSelectedHabit('all')}>All</button>
        {habits.map(h => (
          <button key={h.id}
            style={{ ...s.filterBtn, ...(selectedHabit === h.id ? { ...s.filterBtnActive, background: h.color, borderColor: h.color } : {}) }}
            onClick={() => setSelectedHabit(h.id)}>
            {h.emoji}
          </button>
        ))}
      </div>

      {/* Weekly Goals */}
      <div style={s.sectionLabel}>🎯 This Week's Goals</div>
      <div style={s.goalsGrid}>
        {selectedHabits.map(h => {
          const weekly = getWeeklyProgress(h.id, logs, h.weeklyGoal || 7)
          return (
            <div key={h.id} style={{ ...s.goalCard, borderColor: weekly.met ? '#1a7a3a' : h.color }}>
              <div style={s.goalTop}>
                <span style={s.goalEmoji}>{h.emoji}</span>
                <div style={s.goalInfo}>
                  <div style={s.goalName}>{h.name}</div>
                  <div style={s.goalTarget}>Goal: {weekly.goal}x per week</div>
                </div>
                <div style={{ ...s.goalCount, color: weekly.met ? '#1a7a3a' : h.color }}>
                  {weekly.done}<span style={s.goalOf}>/{weekly.goal}</span>
                </div>
              </div>
              {/* Day dots for current week */}
              <div style={s.goalDots}>
                {weekly.days.map((day, i) => {
                  const done = logs[day]?.[h.id]?.done
                  const isToday = day === new Date().toISOString().split('T')[0]
                  const isFuture = new Date(day + 'T12:00:00') > new Date()
                  return (
                    <div key={day} style={{
                      ...s.goalDot,
                      background: done ? h.color : isFuture ? '#f0f0f8' : '#eeeef8',
                      opacity: isFuture ? 0.4 : 1,
                      border: isToday ? `2px solid ${h.color}` : '2px solid transparent',
                    }}>
                      {done ? '✓' : <span style={{ fontSize: 8, color: '#c0c0d8' }}>{'SMTWTFS'[i]}</span>}
                    </div>
                  )
                })}
              </div>
              {/* Progress bar */}
              <div style={s.goalBar}>
                <div style={{ ...s.goalFill, width: `${weekly.pct}%`, background: weekly.met ? '#1a7a3a' : h.color }} />
              </div>
              {weekly.met && <div style={s.goalMet}>🎯 Goal achieved this week!</div>}
              {!weekly.met && weekly.done > 0 && (
                <div style={s.goalRemain}>{weekly.goal - weekly.done} more to reach your goal</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Streak cards */}
      <div style={s.sectionLabel}>🔥 Current Streaks</div>
      <div style={s.streakGrid}>
        {selectedHabits.map(h => {
          const streak = getStreak(h.id, logs)
          const best = getBestStreak(h.id, logs)
          return (
            <div key={h.id} style={{ ...s.streakCard, borderColor: h.color }}>
              <div style={s.streakEmoji}>{h.emoji}</div>
              <div style={s.streakName}>{h.name}</div>
              <div style={{ ...s.streakNum, color: h.color }}>{streak}</div>
              <div style={s.streakLabel}>day streak</div>
              <div style={s.streakBest}>Best: {best} days</div>
            </div>
          )
        })}
      </div>

      {/* Weekly summary */}
      <div style={s.sectionLabel}>📅 Last 7 Days</div>
      <div style={s.weekCard}>
        {/* Day headers */}
        <div style={s.weekHeader}>
          {last7.map(day => (
            <div key={day} style={s.weekDayLabel}>
              {new Date(day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
            </div>
          ))}
        </div>

        {/* Per-habit rows */}
        {selectedHabits.map(h => (
          <div key={h.id} style={s.weekRow}>
            <div style={s.weekRowLabel}>{h.emoji}</div>
            {last7.map(day => {
              const done = logs[day]?.[h.id]?.done
              const isToday = day === last7[last7.length - 1]
              return (
                <div key={day} style={{
                  ...s.weekCell,
                  background: done ? h.color : isToday ? '#f0f0f8' : '#f7f7fd',
                  border: isToday ? `2px solid ${h.color}` : '2px solid transparent',
                  opacity: done ? 1 : 0.4,
                }}>
                  {done ? '✓' : ''}
                </div>
              )
            })}
            <div style={s.weekCount}>
              {getCompletionCount(h.id, logs, last7)}/7
            </div>
          </div>
        ))}
      </div>

      {/* 30-day stats */}
      <div style={s.sectionLabel}>📊 Last 30 Days</div>
      <div style={s.statsGrid}>
        {selectedHabits.map(h => {
          const count = getCompletionCount(h.id, logs, last30)
          const pct = Math.round((count / 30) * 100)
          return (
            <div key={h.id} style={s.statCard}>
              <div style={s.statTop}>
                <span style={s.statEmoji}>{h.emoji}</span>
                <span style={s.statName}>{h.name}</span>
              </div>
              <div style={s.statBar}>
                <div style={{ ...s.statFill, width: `${pct}%`, background: h.color }} />
              </div>
              <div style={s.statBottom}>
                <span style={{ color: h.color, fontWeight: 700 }}>{count} days</span>
                <span style={{ color: '#8a8ab8' }}>{pct}% completion</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 30-day heatmap calendar */}
      <div style={s.sectionLabel}>🗓️ 30-Day Overview</div>
      <div style={s.heatmapCard}>
        <div style={s.heatmap}>
          {last30.map(day => {
            const pct = getDayCompletion(logs, day, selectedHabits)
            const isToday = day === last30[last30.length - 1]
            const opacity = pct === 0 ? 0.08 : pct < 50 ? 0.35 : pct < 100 ? 0.65 : 1
            return (
              <div key={day} style={s.heatmapCellWrap} title={`${formatDateShort(day)}: ${pct}%`}>
                <div style={{
                  ...s.heatmapCell,
                  background: `rgba(108,99,255,${opacity})`,
                  border: isToday ? '2px solid #6c63ff' : '2px solid transparent',
                }} />
                {isToday && <div style={s.todayDot} />}
              </div>
            )
          })}
        </div>
        <div style={s.heatmapLegend}>
          <span style={s.legendLabel}>Less</span>
          {[0.08, 0.35, 0.65, 1].map((o, i) => (
            <div key={i} style={{ ...s.legendCell, background: `rgba(108,99,255,${o})` }} />
          ))}
          <span style={s.legendLabel}>More</span>
        </div>
      </div>

      {/* Notes log */}
      <div style={s.sectionLabel}>📝 Recent Notes</div>
      <div style={s.notesList}>
        {[...last30].reverse().map(day => {
          const dayLogs = logs[day] || {}
          const notesForDay = selectedHabits
            .filter(h => dayLogs[h.id]?.detail)
            .map(h => ({ habit: h, detail: dayLogs[h.id].detail }))
          if (notesForDay.length === 0) return null
          return (
            <div key={day} style={s.noteDay}>
              <div style={s.noteDayLabel}>{formatDateShort(day)}</div>
              {notesForDay.map(({ habit, detail }) => (
                <div key={habit.id} style={s.noteItem}>
                  <span style={s.noteEmoji}>{habit.emoji}</span>
                  <span style={s.noteText}>{detail}</span>
                </div>
              ))}
            </div>
          )
        }).filter(Boolean)}
        {last30.every(d => !selectedHabits.some(h => logs[d]?.[h.id]?.detail)) && (
          <div style={s.noNotes}>No notes yet — add details when you log a habit!</div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 80 },

  goalsGrid: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  goalCard: { background: '#fff', border: '2px solid', borderRadius: 14, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  goalTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  goalEmoji: { fontSize: 24, flexShrink: 0 },
  goalInfo: { flex: 1, minWidth: 0 },
  goalName: { fontSize: 15, fontWeight: 700, color: '#1a1a2e' },
  goalTarget: { fontSize: 12, color: '#8a8ab8', marginTop: 1 },
  goalCount: { fontSize: 26, fontWeight: 800, lineHeight: 1, flexShrink: 0, fontFamily: 'inherit' },
  goalOf: { fontSize: 14, color: '#c0c0d8', fontWeight: 400 },
  goalDots: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 },
  goalDot: { height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 700, transition: 'all 0.2s' },
  goalBar: { height: 6, background: '#eeeef8', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  goalFill: { height: '100%', borderRadius: 3, transition: 'width 0.4s' },
  goalMet: { fontSize: 12, color: '#1a7a3a', fontWeight: 700 },
  goalRemain: { fontSize: 12, color: '#8a8ab8' },
  filterBar: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: { background: '#fff', border: '2px solid #e0e0f0', borderRadius: 20, padding: '6px 14px', fontSize: 14, fontWeight: 600, color: '#8a8ab8', fontFamily: 'inherit', transition: 'all 0.15s' },
  filterBtnActive: { background: '#6c63ff', borderColor: '#6c63ff', color: '#fff' },

  sectionLabel: { fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 10, marginTop: 4 },

  streakGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 24 },
  streakCard: { background: '#fff', border: '2px solid', borderRadius: 14, padding: '14px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  streakEmoji: { fontSize: 28, marginBottom: 4 },
  streakName: { fontSize: 12, color: '#8a8ab8', fontWeight: 600, marginBottom: 6 },
  streakNum: { fontSize: 36, fontWeight: 800, lineHeight: 1 },
  streakLabel: { fontSize: 11, color: '#8a8ab8', marginTop: 2 },
  streakBest: { fontSize: 11, color: '#c0c0d8', marginTop: 6 },

  weekCard: { background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  weekHeader: { display: 'grid', gridTemplateColumns: '24px repeat(7,1fr) 36px', gap: 4, marginBottom: 8 },
  weekDayLabel: { textAlign: 'center', fontSize: 11, color: '#8a8ab8', fontWeight: 600 },
  weekRow: { display: 'grid', gridTemplateColumns: '24px repeat(7,1fr) 36px', gap: 4, marginBottom: 6, alignItems: 'center' },
  weekRowLabel: { fontSize: 16, textAlign: 'center' },
  weekCell: { height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, transition: 'all 0.2s' },
  weekCount: { fontSize: 11, color: '#8a8ab8', textAlign: 'right', fontWeight: 600 },

  statsGrid: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 12, padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  statTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  statEmoji: { fontSize: 18 },
  statName: { fontSize: 14, fontWeight: 700, color: '#1a1a2e', flex: 1 },
  statBar: { height: 8, background: '#eeeef8', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  statFill: { height: '100%', borderRadius: 4, transition: 'width 0.4s' },
  statBottom: { display: 'flex', justifyContent: 'space-between', fontSize: 12 },

  heatmapCard: { background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  heatmap: { display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gap: 4, marginBottom: 10 },
  heatmapCellWrap: { position: 'relative' },
  heatmapCell: { height: 0, paddingBottom: '100%', borderRadius: 4, transition: 'all 0.2s' },
  todayDot: { position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#6c63ff' },
  heatmapLegend: { display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  legendLabel: { fontSize: 10, color: '#8a8ab8' },
  legendCell: { width: 12, height: 12, borderRadius: 2 },

  notesList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  noteDay: { background: '#fff', borderRadius: 12, padding: '10px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  noteDayLabel: { fontSize: 12, color: '#8a8ab8', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  noteItem: { display: 'flex', gap: 8, alignItems: 'flex-start', padding: '4px 0', borderTop: '1px solid #f0f0f8' },
  noteEmoji: { fontSize: 16, flexShrink: 0, paddingTop: 1 },
  noteText: { fontSize: 14, color: '#3a3a5e', lineHeight: 1.5 },
  noNotes: { color: '#c0c0d8', fontSize: 14, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' },
}
