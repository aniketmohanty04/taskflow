const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const Task = require('../models/Task');

// ─── Validation Middleware ─────────────────────────────────────────────────────
const validateTask = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status value'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority value'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('assignedTo')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('AssignedTo cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tasks — Fetch all tasks with filtering, sorting, pagination
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const {
      status,
      priority,
      category,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    // Execute query
    const [tasks, totalCount] = await Promise.all([
      Task.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Task.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tasks/stats — Dashboard statistics
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const [statusStats, priorityStats, totalCount, overdueCount] = await Promise.all([
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Task.countDocuments(),
      Task.countDocuments({
        status: { $ne: 'completed' },
        dueDate: { $lt: new Date() }
      })
    ]);

    // Reshape into readable objects
    const byStatus = { todo: 0, 'in-progress': 0, completed: 0 };
    statusStats.forEach(s => { byStatus[s._id] = s.count; });

    const byPriority = { low: 0, medium: 0, high: 0 };
    priorityStats.forEach(p => { byPriority[p._id] = p.count; });

    res.json({
      success: true,
      data: {
        total: totalCount,
        overdue: overdueCount,
        byStatus,
        byPriority,
        completionRate: totalCount > 0
          ? ((byStatus.completed / totalCount) * 100).toFixed(1)
          : '0.0'
      }
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tasks/:id — Fetch single task
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tasks — Create a new task
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', validateTask, handleValidationErrors, async (req, res, next) => {
  try {
    const { title, description, status, priority, category, dueDate, assignedTo, tags, userId } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      category,
      dueDate: dueDate || null,
      assignedTo,
      tags: tags || [],
      userId: userId || 'anonymous'
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/tasks/:id — Full update of a task
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', validateTask, handleValidationErrors, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/tasks/:id — Partial update (e.g., just status)
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const allowedFields = ['title', 'description', 'status', 'priority', 'category', 'dueDate', 'assignedTo', 'tags'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task patched successfully',
      data: task
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/tasks/:id — Delete a task
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: { deletedId: req.params.id }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/tasks — Delete all tasks (bulk)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/', async (req, res, next) => {
  try {
    const result = await Task.deleteMany({});
    res.json({
      success: true,
      message: `${result.deletedCount} tasks deleted successfully`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
