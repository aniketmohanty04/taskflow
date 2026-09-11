const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const HabitTask = require('../models/HabitTask');
const auth = require('../middleware/auth');

// Protect all habit routes
router.use(auth);

const validate = [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ min: 2, max: 80 }),
  body('type').optional().isIn(['fixed', 'variable']),
  body('scheduledDays').optional().isArray(),
  body('color').optional().isString(),
];

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

// GET all active habit tasks for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const tasks = await HabitTask.find({ userId: req.user.id, isActive: true })
      .sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
});

// POST create habit task for the authenticated user
router.post('/', validate, handleErrors, async (req, res, next) => {
  try {
    const { name, type, scheduledDays, color, order } = req.body;
    const count = await HabitTask.countDocuments({ userId: req.user.id, isActive: true });
    const task = await HabitTask.create({
      name,
      type,
      scheduledDays: scheduledDays || [],
      color,
      order: order ?? count,
      userId: req.user.id
    });
    res.status(201).json({ success: true, message: 'Habit task created', data: task });
  } catch (err) { next(err); }
});

// PUT update habit task (user-isolated)
router.put('/:id', validate, handleErrors, async (req, res, next) => {
  try {
    const task = await HabitTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Habit task updated', data: task });
  } catch (err) { next(err); }
});

// PATCH reorder habit task (user-isolated)
router.patch('/:id/order', async (req, res, next) => {
  try {
    const task = await HabitTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { order: req.body.order },
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
});

// DELETE habit task (soft delete, user-isolated)
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await HabitTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: false },
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Habit task deleted', data: { deletedId: req.params.id } });
  } catch (err) { next(err); }
});

module.exports = router;
