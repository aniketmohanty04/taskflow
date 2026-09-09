import React, { useState } from 'react';
import TaskCard from './TaskCard';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'completed') return false;
  return new Date() > new Date(dueDate);
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ filters, onFilterChange }) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ search });
  };

  return (
    <div className="filter-bar">
      {/* Search */}
      <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
        <span className="filter-bar__search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!e.target.value) onFilterChange({ search: '' });
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
        />
      </form>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => onFilterChange({ status: e.target.value })}
      >
        <option value="">All Status</option>
        <option value="todo">📝 To Do</option>
        <option value="in-progress">🔄 In Progress</option>
        <option value="completed">✅ Completed</option>
      </select>

      {/* Priority Filter */}
      <select
        value={filters.priority}
        onChange={(e) => onFilterChange({ priority: e.target.value })}
      >
        <option value="">All Priority</option>
        <option value="low">🟢 Low</option>
        <option value="medium">🟡 Medium</option>
        <option value="high">🔴 High</option>
      </select>

      {/* Sort */}
      <select
        value={filters.sortBy}
        onChange={(e) => onFilterChange({ sortBy: e.target.value })}
      >
        <option value="createdAt">Sort: Created</option>
        <option value="dueDate">Sort: Due Date</option>
        <option value="priority">Sort: Priority</option>
        <option value="title">Sort: Title</option>
      </select>

      {/* Order */}
      <select
        value={filters.order}
        onChange={(e) => onFilterChange({ order: e.target.value })}
      >
        <option value="desc">↓ Desc</option>
        <option value="asc">↑ Asc</option>
      </select>

      {/* Clear Filters */}
      {(filters.status || filters.priority || filters.search) && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => { onFilterChange({ status: '', priority: '', search: '' }); setSearch(''); }}
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}

// ─── Board Column ─────────────────────────────────────────────────────────────
function BoardColumn({ title, status, icon, tasks, onEdit, onDelete, onStatusChange }) {
  const filtered = tasks.filter(t => t.status === status);
  return (
    <div className={`task-column ${status}`}>
      <div className="task-column__header">
        <span className="task-column__title">
          {icon} {title}
        </span>
        <span className="task-column__count">{filtered.length}</span>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: '0.825rem' }}>
          No tasks here
        </div>
      ) : (
        filtered.map(task => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))
      )}
    </div>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────
function ListRow({ task, onEdit, onDelete, onStatusChange }) {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <div className={`task-list-row ${overdue ? 'overdue' : ''} ${task.status === 'completed' ? 'completed-row' : ''}`}>
      <span style={{ fontSize: '1.1rem' }}>
        {task.status === 'completed' ? '✅' : task.status === 'in-progress' ? '🔄' : '📝'}
      </span>

      <div className="task-list-row__title">{task.title}</div>

      <div className="task-list-row__meta">
        <span className={`badge badge-priority-${task.priority}`}>{task.priority}</span>
        {task.category && task.category !== 'General' && (
          <span className="badge badge-category">{task.category}</span>
        )}
        {task.dueDate && (
          <span style={{ fontSize: '0.78rem', color: overdue ? 'var(--danger)' : 'var(--text-muted)' }}>
            📅 {formatDate(task.dueDate)}
          </span>
        )}
        {task.assignedTo && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            👤 {task.assignedTo}
          </span>
        )}
        <select
          className="status-select"
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Done</option>
        </select>
      </div>

      <div className="task-list-row__actions">
        <button className="btn btn-icon btn-sm" onClick={() => onEdit(task)} title="Edit">✏️</button>
        <button className="btn btn-icon btn-sm" onClick={() => onDelete(task._id)} title="Delete" style={{ color: 'var(--danger)' }}>🗑️</button>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ pagination, onPageChange }) {
  const { currentPage, totalPages, totalCount, limit } = pagination;
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, totalCount);

  return (
    <div className="pagination">
      <button className="pagination__btn" onClick={() => onPageChange(1)} disabled={currentPage === 1}>«</button>
      <button className="pagination__btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>

      <span className="pagination__info">Page {currentPage} of {totalPages} ({start}–{end} of {totalCount})</span>

      <button className="pagination__btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
      <button className="pagination__btn" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>»</button>
    </div>
  );
}

// ─── Main TaskList Component ──────────────────────────────────────────────────
function TaskList({
  tasks, loading, filters, onFilterChange,
  onEdit, onDelete, onStatusChange, onNewTask,
  pagination, onPageChange, activeView
}) {
  if (loading) {
    return (
      <div>
        <FilterBar filters={filters} onFilterChange={onFilterChange} />
        <div className="loading-wrapper">
          <div className="spinner"></div>
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <FilterBar filters={filters} onFilterChange={onFilterChange} />

      <div className="section-header">
        <h2>
          {filters.status
            ? `${filters.status === 'todo' ? '📝 To Do' : filters.status === 'in-progress' ? '🔄 In Progress' : '✅ Completed'} Tasks`
            : '📋 All Tasks'}
        </h2>
        <span className="section-header__count">{pagination.totalCount} task{pagination.totalCount !== 1 ? 's' : ''}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📭</div>
          <h3 className="empty-state__title">No tasks found</h3>
          <p className="empty-state__desc">
            {filters.search || filters.status || filters.priority
              ? 'Try adjusting your filters'
              : 'Create your first task to get started!'}
          </p>
          {!filters.search && !filters.status && !filters.priority && (
            <button className="btn btn-primary" onClick={onNewTask}>
              ➕ Create First Task
            </button>
          )}
        </div>
      ) : activeView === 'board' ? (
        <div className="task-board">
          <BoardColumn title="To Do" status="todo" icon="📝" tasks={tasks} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
          <BoardColumn title="In Progress" status="in-progress" icon="🔄" tasks={tasks} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
          <BoardColumn title="Completed" status="completed" icon="✅" tasks={tasks} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
        </div>
      ) : (
        <div className="task-list-view">
          {tasks.map(task => (
            <ListRow key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  );
}

export default TaskList;
