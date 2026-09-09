import React from 'react';

const PRIORITY_LABELS = { low: '🟢 Low', medium: '🟡 Medium', high: '🔴 High' };

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'completed') return false;
  return new Date() > new Date(dueDate);
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className={`task-card ${overdue ? 'overdue' : ''} ${task.status === 'completed' ? 'completed-card' : ''}`}>
      <div className="task-card__header">
        <h3 className="task-card__title">{task.title}</h3>
        <div className="task-card__actions">
          <button
            className="btn btn-icon btn-sm"
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            ✏️
          </button>
          <button
            className="btn btn-icon btn-sm"
            onClick={() => onDelete(task._id)}
            title="Delete task"
            style={{ color: 'var(--danger)' }}
          >
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-card__description">{task.description}</p>
      )}

      <div className="task-card__meta">
        <span className={`badge badge-priority-${task.priority}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {task.category && task.category !== 'General' && (
          <span className="badge badge-category">📁 {task.category}</span>
        )}
        {overdue && <span className="badge badge-overdue">⚠️ Overdue</span>}
        {task.tags && task.tags.slice(0, 2).map((tag, i) => (
          <span key={i} className="badge badge-tag">#{tag}</span>
        ))}
        {task.tags && task.tags.length > 2 && (
          <span className="badge badge-tag">+{task.tags.length - 2}</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
        {/* Inline Status Change */}
        <select
          className="status-select"
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
        >
          <option value="todo">📝 To Do</option>
          <option value="in-progress">🔄 In Progress</option>
          <option value="completed">✅ Done</option>
        </select>

        {task.dueDate && (
          <span className={`task-card__due ${overdue ? 'overdue' : ''}`}>
            📅 {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {task.assignedTo && (
        <div style={{ marginTop: '8px', fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          👤 {task.assignedTo}
        </div>
      )}
    </div>
  );
}

export default TaskCard;
