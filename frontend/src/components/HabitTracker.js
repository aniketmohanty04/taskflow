import React, { useState, useEffect, useCallback } from 'react';
import { habitAPI, completionAPI } from '../services/habitAPI';
import { toast } from 'react-toastify';
import HabitTaskForm from './HabitTaskForm';
import ProgressChart from './ProgressChart';

const DAY_ABBR = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

function getMonthDays(year, month) {
  const days = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) { days.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return days;
}

function toDateStr(d) { return d.toISOString().split('T')[0]; }

function isScheduled(task, date) {
  if (task.type === 'fixed') return true;
  return task.scheduledDays.includes(date.getDay());
}

export default function HabitTracker() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState({}); // {taskId_date: true/false}
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [chartKey, setChartKey] = useState(0); // force chart re-fetch

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const days = getMonthDays(year, month);

  // ─── Fetch tasks + completions ─────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, compRes] = await Promise.all([
        habitAPI.getAll(),
        completionAPI.getByMonth(monthStr)
      ]);
      setTasks(tasksRes.data.data);
      // Build lookup map: "taskId_date" -> completed
      const map = {};
      compRes.data.data.forEach(c => {
        map[`${c.taskId}_${c.date}`] = c.completed;
      });
      setCompletions(map);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [monthStr]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Toggle completion ─────────────────────────────────────────────────────
  const toggleCell = async (taskId, dateStr) => {
    const key = `${taskId}_${dateStr}`;
    const prev = completions[key];
    // Optimistic update
    setCompletions(c => ({ ...c, [key]: !prev }));
    try {
      await completionAPI.toggle(taskId, dateStr);
      setChartKey(k => k + 1); // refresh chart
    } catch (e) {
      setCompletions(c => ({ ...c, [key]: prev }));
      toast.error(e.message);
    }
  };

  // ─── CRUD handlers ─────────────────────────────────────────────────────────
  const handleCreate = async (data) => {
    try {
      await habitAPI.create(data);
      toast.success('✅ Habit task added!');
      setShowForm(false);
      fetchData();
    } catch (e) { toast.error(e.message); }
  };

  const handleUpdate = async (data) => {
    try {
      await habitAPI.update(editTask._id, data);
      toast.success('✅ Habit task updated!');
      setEditTask(null);
      fetchData();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit task?')) return;
    try {
      await habitAPI.delete(id);
      toast.success('🗑️ Task deleted!');
      fetchData();
    } catch (e) { toast.error(e.message); }
  };

  // ─── Month nav ─────────────────────────────────────────────────────────────
  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  // ─── Per-task row completion % ─────────────────────────────────────────────
  function taskPct(task) {
    const scheduled = days.filter(d => isScheduled(task, d));
    if (!scheduled.length) return 0;
    const done = scheduled.filter(d => completions[`${task._id}_${toDateStr(d)}`]).length;
    return Math.round((done / scheduled.length) * 100);
  }

  // ─── Per-day column completion % ──────────────────────────────────────────
  function dayPct(day) {
    const scheduled = tasks.filter(t => isScheduled(t, day));
    if (!scheduled.length) return null;
    const done = scheduled.filter(t => completions[`${t._id}_${toDateStr(day)}`]).length;
    return Math.round((done / scheduled.length) * 100);
  }

  const isToday = (d) => toDateStr(d) === toDateStr(today);
  const isFuture = (d) => d > today;

  return (
    <div className="habit-tracker">
      {/* Progress Chart */}
      <ProgressChart key={chartKey} />

      {/* Header */}
      <div className="ht-header">
        <div className="ht-month-nav">
          <button className="ht-nav-btn" onClick={prevMonth}>‹</button>
          <h2 className="ht-month-title">{MONTH_NAMES[month]} {year}</h2>
          <button className="ht-nav-btn" onClick={nextMonth}>›</button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setShowForm(true); }}>
          ➕ Add Habit
        </button>
      </div>

      {/* Task Form Modal */}
      {(showForm || editTask) && (
        <HabitTaskForm
          task={editTask}
          onSubmit={editTask ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditTask(null); }}
        />
      )}

      {/* Grid */}
      {loading ? (
        <div className="loading-wrapper"><div className="spinner" /><span>Loading tracker...</span></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <h3 className="empty-state__title">No habit tasks yet</h3>
          <p className="empty-state__desc">Add your first Fixed or Variable habit task to start tracking!</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>➕ Add First Habit</button>
        </div>
      ) : (
        <div className="ht-grid-wrap">
          <table className="ht-grid">
            <thead>
              <tr>
                {/* Task name column header */}
                <th className="ht-th-task">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                  </span>
                </th>
                <th className="ht-th-pct">%</th>
                {/* Day columns */}
                {days.map((d, i) => (
                  <th key={i} className={`ht-th-day ${isToday(d) ? 'ht-today-col' : ''}`}>
                    <div className="ht-day-label">
                      <span className="ht-day-num">{d.getDate()}</span>
                      <span className="ht-day-abbr">{DAY_ABBR[d.getDay()]}</span>
                    </div>
                  </th>
                ))}
              </tr>
              {/* Day completion % row */}
              <tr className="ht-day-pct-row">
                <td className="ht-td-label">
                  <span className="ht-day-pct-label">Daily %</span>
                </td>
                <td />
                {days.map((d, i) => {
                  const pct = dayPct(d);
                  return (
                    <td key={i} className={`ht-td-daypct ${isToday(d) ? 'ht-today-col' : ''}`}>
                      {pct !== null && !isFuture(d) ? (
                        <span className="ht-daypct-val" style={{
                          color: pct === 100 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'
                        }}>{pct}%</span>
                      ) : <span style={{ color: 'var(--text-dim)' }}>—</span>}
                    </td>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, rowIdx) => {
                const pct = taskPct(task);
                return (
                  <tr key={task._id} className="ht-row">
                    {/* Task name */}
                    <td className="ht-td-label">
                      <div className="ht-task-info">
                        <span className="ht-task-dot" style={{ background: task.color }} />
                        <span className="ht-task-name" style={{ color: task.color }}>{task.name}</span>
                        <span className={`ht-type-badge ${task.type}`}>
                          {task.type === 'fixed' ? '📌' : '📅'}
                        </span>
                      </div>
                      <div className="ht-task-actions">
                        <button className="ht-action-btn" onClick={() => setEditTask(task)} title="Edit">✏️</button>
                        <button className="ht-action-btn" onClick={() => handleDelete(task._id)} title="Delete">🗑️</button>
                      </div>
                    </td>
                    {/* Row % */}
                    <td className="ht-td-pct">
                      <div className="ht-pct-wrap">
                        <span className="ht-pct-val" style={{
                          color: pct === 100 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--text-muted)'
                        }}>{pct}%</span>
                        <div className="ht-pct-bar">
                          <div className="ht-pct-fill" style={{ width: `${pct}%`, background: task.color }} />
                        </div>
                      </div>
                    </td>
                    {/* Checkboxes */}
                    {days.map((d, ci) => {
                      const dateStr = toDateStr(d);
                      const scheduled = isScheduled(task, d);
                      const done = !!completions[`${task._id}_${dateStr}`];
                      const future = isFuture(d) && !isToday(d);

                      // Color cycling by week
                      const weekIdx = Math.floor((d.getDate() - 1) / 7);
                      const weekColors = ['#818cf8','#f472b6','#2dd4bf','#fbbf24','#f97316'];
                      const cellColor = scheduled ? (task.color || weekColors[weekIdx % weekColors.length]) : 'transparent';

                      return (
                        <td key={ci} className={`ht-td-cell ${isToday(d) ? 'ht-today-col' : ''}`}>
                          {scheduled ? (
                            <button
                              className={`ht-checkbox ${done ? 'checked' : ''} ${future ? 'future' : ''}`}
                              style={done ? { borderColor: cellColor, background: cellColor + '33' } : { borderColor: cellColor + '66' }}
                              onClick={() => !future && toggleCell(task._id, dateStr)}
                              disabled={future}
                              title={`${task.name} — ${dateStr}`}
                            >
                              {done && <span className="ht-check" style={{ color: cellColor }}>✓</span>}
                            </button>
                          ) : (
                            <div className="ht-na" title="Not scheduled">·</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="ht-legend">
        <span className="ht-legend-item"><span className="ht-legend-dot" style={{ background: '#818cf8' }} /> Fixed task (every day)</span>
        <span className="ht-legend-item"><span className="ht-legend-dot" style={{ background: '#fbbf24' }} /> Variable task (selected days)</span>
        <span className="ht-legend-item"><span style={{ opacity: 0.4 }}>·</span> Not scheduled</span>
        <span className="ht-legend-item"><span style={{ color: 'var(--success)' }}>✓</span> Completed</span>
      </div>
    </div>
  );
}
