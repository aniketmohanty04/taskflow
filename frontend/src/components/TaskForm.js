import React, { useState, useEffect } from 'react';

const INITIAL_FORM = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  category: 'General',
  dueDate: '',
  assignedTo: '',
  tags: '',
};

function TaskForm({ task, onSubmit, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        category: task.category || 'General',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignedTo: task.assignedTo || '',
        tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
      });
    }
  }, [task]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
    if (form.description.length > 500) errs.description = 'Max 500 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        tags: form.tags
          ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
          : [],
        dueDate: form.dueDate || null,
      };
      await onSubmit(payload);
    } catch (err) {
      // Error is already handled by App.js toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">
            {task ? '✏️ Edit Task' : '➕ Create New Task'}
          </h2>
          <button className="modal__close" onClick={onClose} title="Close">✕</button>
        </div>

        <div className="modal__body">
          <form onSubmit={handleSubmit} noValidate>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title <span>*</span></label>
              <input
                type="text"
                name="title"
                className={`form-control ${errors.title ? 'error' : ''}`}
                placeholder="e.g., Design homepage wireframes"
                value={form.title}
                onChange={handleChange}
                maxLength={100}
                autoFocus
              />
              {errors.title && <span style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                placeholder="Add details about this task..."
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={500}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', float: 'right' }}>
                {form.description.length}/500
              </span>
            </div>

            {/* Status & Priority */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                  <option value="todo">📝 To Do</option>
                  <option value="in-progress">🔄 In Progress</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select name="priority" className="form-control" value={form.priority} onChange={handleChange}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            {/* Category & Due Date */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  name="category"
                  className="form-control"
                  placeholder="e.g., Design, Dev, Marketing"
                  value={form.category}
                  onChange={handleChange}
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  className="form-control"
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Assigned To */}
            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <input
                type="text"
                name="assignedTo"
                className="form-control"
                placeholder="e.g., John Doe"
                value={form.assignedTo}
                onChange={handleChange}
                maxLength={50}
              />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">Tags <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(comma-separated)</span></label>
              <input
                type="text"
                name="tags"
                className="form-control"
                placeholder="e.g., frontend, urgent, bug"
                value={form.tags}
                onChange={handleChange}
              />
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? '⏳ Saving...' : task ? '💾 Update Task' : '➕ Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TaskForm;
