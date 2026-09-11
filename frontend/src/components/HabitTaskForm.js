import React, { useState, useEffect } from 'react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = ['#818cf8','#60a5fa','#34d399','#f472b6','#fbbf24','#f97316','#2dd4bf','#a78bfa','#fb923c','#4ade80'];

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

function getMonthDays(year, month) {
  const days = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function isScheduled(task, date) {
  if (task.type === 'fixed') return true;
  return task.scheduledDays.includes(date.getDay());
}

export default function HabitTaskForm({ task, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: task?.name || '',
    type: task?.type || 'fixed',
    scheduledDays: task?.scheduledDays || [],
    color: task?.color || COLORS[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      scheduledDays: f.scheduledDays.includes(day)
        ? f.scheduledDays.filter(d => d !== day)
        : [...f.scheduledDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Name is required'); return; }
    if (form.type === 'variable' && form.scheduledDays.length === 0) {
      setErr('Select at least one day for variable task'); return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal__header">
          <h2 className="modal__title">{task ? '✏️ Edit Habit' : '➕ New Habit Task'}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Task Name <span>*</span></label>
              <input className="form-control" type="text" placeholder="e.g. Exercise for 30 minutes"
                value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErr(''); }}
                maxLength={80} autoFocus />
            </div>

            {/* Type */}
            <div className="form-group">
              <label className="form-label">Task Type</label>
              <div className="type-toggle">
                <button type="button"
                  className={`type-btn ${form.type === 'fixed' ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, type: 'fixed', scheduledDays: [] }))}>
                  📌 Fixed <small>Every day</small>
                </button>
                <button type="button"
                  className={`type-btn ${form.type === 'variable' ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, type: 'variable' }))}>
                  📅 Variable <small>Specific days</small>
                </button>
              </div>
            </div>

            {/* Day Selector for Variable */}
            {form.type === 'variable' && (
              <div className="form-group">
                <label className="form-label">Scheduled Days</label>
                <div className="day-selector">
                  {DAY_NAMES.map((name, i) => (
                    <button type="button" key={i}
                      className={`day-btn ${form.scheduledDays.includes(i) ? 'active' : ''}`}
                      onClick={() => toggleDay(i)}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="color-picker">
                {COLORS.map(c => (
                  <button type="button" key={c}
                    className={`color-dot ${form.color === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                  />
                ))}
              </div>
            </div>

            {err && <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginBottom: 12 }}>{err}</p>}

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? '⏳ Saving...' : task ? '💾 Update' : '➕ Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
