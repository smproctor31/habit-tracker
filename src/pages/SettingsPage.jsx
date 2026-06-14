import { useState } from 'react'
import { DEFAULT_HABITS } from '../lib/storage.js'

const EMOJI_OPTIONS = ['💪','🥗','📚','❤️','🏃','🧘','💤','💧','🥤','🍎','🧠','✍️','🎯','🙏','🚶','🎸','🎨','💼','🌿','🏋️']
const COLOR_OPTIONS = ['#6c63ff','#e05500','#1a7a3a','#1a4db5','#c0392b','#8e44ad','#d4a017','#2980b9','#27ae60','#e74c3c']

export default function SettingsPage({ habits, settings, onHabitsChange, onSettingsChange }) {
  const [editingHabit, setEditingHabit] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newHabit, setNewHabit] = useState({ name: '', emoji: '⭐', color: '#6c63ff', weeklyGoal: 5, detailLabel: 'Notes', detailPlaceholder: 'Add notes…' })
  const [notifStatus, setNotifStatus] = useState('')

  // ── Habit CRUD ───────────────────────────────────────────────────────────────
  function addHabit() {
    if (!newHabit.name.trim()) return
    const habit = {
      id: Date.now().toString(),
      name: newHabit.name.trim(),
      emoji: newHabit.emoji,
      color: newHabit.color,
      weeklyGoal: newHabit.weeklyGoal || 5,
      detailLabel: newHabit.detailLabel || 'Notes',
      detailPlaceholder: newHabit.detailPlaceholder || 'Add notes…',
    }
    onHabitsChange([...habits, habit])
    setNewHabit({ name: '', emoji: '⭐', color: '#6c63ff', detailLabel: 'Notes', detailPlaceholder: 'Add notes…' })
    setShowAddForm(false)
  }

  function updateHabit(id, updates) {
    onHabitsChange(habits.map(h => h.id === id ? { ...h, ...updates } : h))
  }

  function deleteHabit(id) {
    if (!window.confirm('Delete this habit? Your past logs will be kept.')) return
    onHabitsChange(habits.filter(h => h.id !== id))
    setEditingHabit(null)
  }

  function moveHabit(id, dir) {
    const idx = habits.findIndex(h => h.id === id)
    if (idx < 0) return
    const next = [...habits]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    onHabitsChange(next)
  }

  function resetToDefaults() {
    if (!window.confirm('Reset habits to the original 4 defaults? This will remove any custom habits.')) return
    onHabitsChange(DEFAULT_HABITS)
    setEditingHabit(null)
  }

  // ── Notifications ────────────────────────────────────────────────────────────
  async function requestNotifications() {
    if (!('Notification' in window)) {
      setNotifStatus('❌ Notifications not supported on this browser.')
      return
    }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setNotifStatus('✅ Notifications enabled!')
      onSettingsChange({ ...settings, reminderEnabled: true })
      scheduleTestNotification()
    } else {
      setNotifStatus('❌ Permission denied. Please enable in browser settings.')
    }
  }

  function scheduleTestNotification() {
    setTimeout(() => {
      new Notification('Habit Tracker', {
        body: '🌟 Time to check in on your daily habits!',
        icon: '/favicon.ico',
      })
    }, 3000)
  }

  return (
    <div style={s.page}>

      {/* Habits section */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <div style={s.sectionTitle}>My Habits</div>
          <button style={s.addBtn} onClick={() => setShowAddForm(true)}>+ Add</button>
        </div>

        {/* Add habit form */}
        {showAddForm && (
          <div style={s.addForm}>
            <div style={s.formRow}>
              <input style={s.nameInput} placeholder="Habit name (e.g. Meditate)"
                value={newHabit.name} onChange={e => setNewHabit(h => ({ ...h, name: e.target.value }))}
                autoFocus />
            </div>
            <div style={s.formLabel}>Pick an emoji</div>
            <div style={s.emojiGrid}>
              {EMOJI_OPTIONS.map(e => (
                <button key={e} style={{ ...s.emojiBtn, ...(newHabit.emoji === e ? s.emojiBtnActive : {}) }}
                  onClick={() => setNewHabit(h => ({ ...h, emoji: e }))}>{e}</button>
              ))}
            </div>
            <div style={s.formLabel}>Pick a color</div>
            <div style={s.colorGrid}>
              {COLOR_OPTIONS.map(c => (
                <button key={c} style={{ ...s.colorBtn, background: c, ...(newHabit.color === c ? s.colorBtnActive : {}) }}
                  onClick={() => setNewHabit(h => ({ ...h, color: c }))} />
              ))}
            </div>
            <div style={s.formLabel}>Weekly Goal (days per week)</div>
            <div style={s.goalBtnRow}>
              {[1,2,3,4,5,6,7].map(n => (
                <button key={n}
                  style={{ ...s.goalBtn, ...(newHabit.weeklyGoal === n ? s.goalBtnActive : {}) }}
                  onClick={() => setNewHabit(h => ({ ...h, weeklyGoal: n }))}>
                  {n}
                </button>
              ))}
            </div>
            <div style={s.formLabel}>Detail prompt (shown when logging)</div>
            <input style={s.nameInput} placeholder="e.g. What did you do?"
              value={newHabit.detailLabel} onChange={e => setNewHabit(h => ({ ...h, detailLabel: e.target.value }))} />
            <div style={s.formActions}>
              <button style={s.saveBtn} onClick={addHabit}>Add Habit</button>
              <button style={s.cancelBtn} onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Habit list */}
        <div style={s.habitList}>
          {habits.map((h, idx) => (
            <div key={h.id}>
              <div style={{ ...s.habitRow, borderColor: editingHabit === h.id ? h.color : '#eeeef8' }}>
                <div style={{ ...s.habitDot, background: h.color }}>{h.emoji}</div>
                <div style={s.habitName}>{h.name}</div>
                <div style={s.habitGoalBadge}>{h.weeklyGoal || 5}x/wk</div>
                <div style={s.habitActions}>
                  <button style={s.iconBtn} onClick={() => moveHabit(h.id, -1)} disabled={idx === 0}>↑</button>
                  <button style={s.iconBtn} onClick={() => moveHabit(h.id, 1)} disabled={idx === habits.length - 1}>↓</button>
                  <button style={s.iconBtn} onClick={() => setEditingHabit(editingHabit === h.id ? null : h.id)}>✏️</button>
                </div>
              </div>

              {/* Edit form */}
              {editingHabit === h.id && (
                <div style={s.editForm}>
                  <div style={s.formLabel}>Name</div>
                  <input style={s.nameInput} value={h.name}
                    onChange={e => updateHabit(h.id, { name: e.target.value })} />
                  <div style={s.formLabel}>Emoji</div>
                  <div style={s.emojiGrid}>
                    {EMOJI_OPTIONS.map(e => (
                      <button key={e} style={{ ...s.emojiBtn, ...(h.emoji === e ? s.emojiBtnActive : {}) }}
                        onClick={() => updateHabit(h.id, { emoji: e })}>{e}</button>
                    ))}
                  </div>
                  <div style={s.formLabel}>Color</div>
                  <div style={s.colorGrid}>
                    {COLOR_OPTIONS.map(c => (
                      <button key={c} style={{ ...s.colorBtn, background: c, ...(h.color === c ? s.colorBtnActive : {}) }}
                        onClick={() => updateHabit(h.id, { color: c })} />
                    ))}
                  </div>
                  <div style={s.formLabel}>Weekly Goal (days per week)</div>
                  <div style={s.goalBtnRow}>
                    {[1,2,3,4,5,6,7].map(n => (
                      <button key={n}
                        style={{ ...s.goalBtn, ...(h.weeklyGoal === n || (!h.weeklyGoal && n === 5) ? { ...s.goalBtnActive, background: h.color, borderColor: h.color } : {}) }}
                        onClick={() => updateHabit(h.id, { weeklyGoal: n })}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <div style={s.formLabel}>Detail prompt</div>
                  <input style={s.nameInput} value={h.detailLabel}
                    onChange={e => updateHabit(h.id, { detailLabel: e.target.value })} />
                  <div style={s.editActions}>
                    <button style={s.saveBtn} onClick={() => setEditingHabit(null)}>Done</button>
                    <button style={s.deleteBtn} onClick={() => deleteHabit(h.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button style={s.resetBtn} onClick={resetToDefaults}>Reset to defaults</button>
      </div>

      {/* Reminder section */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Daily Reminder</div>
        <div style={s.reminderRow}>
          <div style={s.reminderInfo}>
            <div style={s.reminderLabel}>Reminder time</div>
            <div style={s.reminderSub}>Get notified to check in each day</div>
          </div>
          <input type="time" style={s.timeInput}
            value={settings.reminderTime}
            onChange={e => onSettingsChange({ ...settings, reminderTime: e.target.value })} />
        </div>

        <div style={s.notifRow}>
          <div style={s.reminderInfo}>
            <div style={s.reminderLabel}>Push notifications</div>
            <div style={s.reminderSub}>
              {Notification.permission === 'granted' ? '✅ Enabled' : 'Tap to enable'}
            </div>
          </div>
          <button style={{ ...s.toggleBtn, ...(settings.reminderEnabled ? s.toggleBtnOn : {}) }}
            onClick={Notification.permission === 'granted'
              ? () => onSettingsChange({ ...settings, reminderEnabled: !settings.reminderEnabled })
              : requestNotifications}>
            {settings.reminderEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        {notifStatus && <div style={s.notifStatus}>{notifStatus}</div>}
        <div style={s.notifNote}>
          Note: Notifications only work when the app is open in your browser. For persistent reminders, add the app to your home screen.
        </div>
      </div>

      {/* About */}
      <div style={s.section}>
        <div style={s.sectionTitle}>About</div>
        <div style={s.aboutText}>
          Your habit data is stored privately on this device. No account required.
          To use on multiple devices, bookmark the page on each device separately.
        </div>
        <button style={s.dangerBtn} onClick={() => {
          if (window.confirm('Clear ALL habit logs? This cannot be undone.')) {
            localStorage.clear()
            window.location.reload()
          }
        }}>
          Clear all data
        </button>
      </div>
    </div>
  )
}

const s = {
  page: { flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 80 },

  section: { background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a2e' },
  addBtn: { background: '#6c63ff', border: 'none', color: '#fff', padding: '7px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: 'inherit' },

  addForm: { background: '#f7f7fd', borderRadius: 12, padding: '14px', marginBottom: 14 },
  editForm: { background: '#f7f7fd', borderRadius: 12, padding: '14px', margin: '0 0 8px' },
  formRow: { marginBottom: 10 },
  formLabel: { fontSize: 11, color: '#6a6a8a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 10 },
  nameInput: { width: '100%', background: '#fff', border: '1px solid #e0e0f0', borderRadius: 8, padding: '10px 12px', color: '#1a1a2e', outline: 'none', boxSizing: 'border-box' },

  emojiGrid: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  emojiBtn: { fontSize: 20, background: '#fff', border: '2px solid #e0e0f0', borderRadius: 8, padding: '4px 6px', cursor: 'pointer', fontFamily: 'inherit' },
  emojiBtnActive: { border: '2px solid #6c63ff', background: '#f0f0ff' },

  colorGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  colorBtn: { width: 28, height: 28, borderRadius: '50%', border: '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s' },
  colorBtnActive: { border: '3px solid #1a1a2e', transform: 'scale(1.2)' },

  formActions: { display: 'flex', gap: 8, marginTop: 12 },
  editActions: { display: 'flex', gap: 8, marginTop: 12 },
  saveBtn: { background: '#6c63ff', border: 'none', color: '#fff', padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: 'inherit' },
  cancelBtn: { background: '#f0f0f8', border: 'none', color: '#8a8ab8', padding: '9px 16px', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' },
  deleteBtn: { background: '#fef0f0', border: '1px solid #fcc', color: '#c0392b', padding: '9px 16px', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' },

  habitList: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
  habitRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px', border: '2px solid', borderRadius: 10, background: '#fafafe' },
  habitDot: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  habitName: { flex: 1, fontSize: 15, fontWeight: 600, color: '#1a1a2e' },
  habitActions: { display: 'flex', gap: 4 },
  iconBtn: { background: 'transparent', border: 'none', fontSize: 16, padding: '4px 6px', color: '#8a8ab8', fontFamily: 'inherit', borderRadius: 6 },

  goalBtnRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  goalBtn: { width: 36, height: 36, borderRadius: 8, border: '2px solid #e0e0f0', background: '#fff', color: '#8a8ab8', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
  goalBtnActive: { background: '#6c63ff', borderColor: '#6c63ff', color: '#fff' },
  habitGoalBadge: { fontSize: 11, color: '#8a8ab8', background: '#f0f0f8', borderRadius: 6, padding: '2px 8px', fontWeight: 600, flexShrink: 0 },
  resetBtn: { background: 'transparent', border: '1px solid #e0e0f0', color: '#8a8ab8', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', width: '100%' },

  reminderRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f8' },
  notifRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' },
  reminderInfo: { flex: 1 },
  reminderLabel: { fontSize: 15, fontWeight: 600, color: '#1a1a2e' },
  reminderSub: { fontSize: 12, color: '#8a8ab8', marginTop: 2 },
  timeInput: { background: '#f0f0f8', border: '1px solid #e0e0f0', borderRadius: 8, padding: '8px 10px', color: '#1a1a2e', fontFamily: 'inherit' },
  toggleBtn: { background: '#e0e0f0', border: 'none', color: '#8a8ab8', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', minWidth: 52 },
  toggleBtnOn: { background: '#6c63ff', color: '#fff' },
  notifStatus: { fontSize: 13, color: '#3a3a5e', padding: '6px 0' },
  notifNote: { fontSize: 12, color: '#c0c0d8', lineHeight: 1.5, marginTop: 8 },

  aboutText: { fontSize: 14, color: '#6a6a8a', lineHeight: 1.6, marginBottom: 14 },
  dangerBtn: { background: '#fef0f0', border: '1px solid #fcc', color: '#c0392b', padding: '9px 16px', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', width: '100%' },
}
