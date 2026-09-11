const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const HabitTask = require('../models/HabitTask');

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

// GET all active habit tasks
router.get('/', async (req, res, next) => {
  try {
    const tasks = await HabitTask.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
});

// POST create habit task
router.post('/', validate, handleErrors, async (req, res, next) => {
  try {
    const { name, type, scheduledDays, color, order } = req.body;
    const count = await HabitTask.countDocuments({ isActive: true });
    const task = await HabitTask.create({
      name, type, scheduledDays: scheduledDays || [], color, order: order ?? count
    });
    res.status(201).json({ success: true, message: 'Habit task created', data: task });
  } catch (err) { next(err); }
});

// PUT update habit task
router.put('/:id', validate, handleErrors, async (req, res, next) => {
  try {
    const task = await HabitTask.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Habit task updated', data: task });
  } catch (err) { next(err); }
});

// PATCH reorder
router.patch('/:id/order', async (req, res, next) => {
  try {
    const task = await HabitTask.findByIdAndUpdate(req.params.id, { order: req.body.order }, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
});

// DELETE habit task (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await HabitTask.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Habit task deleted', data: { deletedId: req.params.id } });
  } catch (err) { next(err); }
});

module.exports = router;
