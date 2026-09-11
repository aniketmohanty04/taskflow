const express = require('express');
const router = express.Router();
const DailyCompletion = require('../models/DailyCompletion');
const HabitTask = require('../models/HabitTask');
const auth = require('../middleware/auth');

// Protect all completion routes
router.use(auth);

// GET /api/completions?month=YYYY-MM  — all completions for a month for the user's habits
router.get('/', async (req, res, next) => {
  try {
    const { month } = req.query; // e.g. "2026-09"
    if (!month) return res.status(400).json({ success: false, message: 'month query required (YYYY-MM)' });

    // Get all task IDs belonging to the authenticated user
    const userTasks = await HabitTask.find({ userId: req.user.id }).select('_id').lean();
    const taskIds = userTasks.map(t => t._id);

    const completions = await DailyCompletion.find({
      taskId: { $in: taskIds },
      date: { $regex: `^${month}` },
      completed: true
    }).lean();

    res.json({ success: true, data: completions });
  } catch (err) { next(err); }
});

// GET /api/completions/chart?days=30 — daily completion % for chart for user's habits only
router.get('/chart', async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 90);
    // Find ONLY the authenticated user's active tasks
    const tasks = await HabitTask.find({ userId: req.user.id, isActive: true }).lean();

    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay(); // 0=Sun...6=Sat

      // Determine scheduled tasks for this day
      const scheduled = tasks.filter(t =>
        t.type === 'fixed' ||
        (t.type === 'variable' && t.scheduledDays.includes(dayOfWeek))
      );

      if (scheduled.length === 0) {
        result.push({ date: dateStr, pct: 0, completed: 0, total: 0 });
        continue;
      }

      const completions = await DailyCompletion.countDocuments({
        taskId: { $in: scheduled.map(t => t._id) },
        date: dateStr,
        completed: true
      });

      result.push({
        date: dateStr,
        pct: Math.round((completions / scheduled.length) * 100),
        completed: completions,
        total: scheduled.length
      });
    }

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// POST /api/completions/toggle — toggle a task completion for a date
router.post('/toggle', async (req, res, next) => {
  try {
    const { taskId, date } = req.body;
    if (!taskId || !date) return res.status(400).json({ success: false, message: 'taskId and date required' });

    // Verify task ownership
    const task = await HabitTask.findOne({ _id: taskId, userId: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Habit task not found or access denied' });

    const existing = await DailyCompletion.findOne({ taskId, date });
    if (existing) {
      // Toggle
      existing.completed = !existing.completed;
      if (!existing.userId) existing.userId = req.user.id;
      await existing.save();
      res.json({ success: true, data: existing });
    } else {
      // Create new completion with userId
      const completion = await DailyCompletion.create({
        taskId,
        date,
        completed: true,
        userId: req.user.id
      });
      res.status(201).json({ success: true, data: completion });
    }
  } catch (err) { next(err); }
});

// GET /api/completions/streak/:taskId — streak count for a task
router.get('/streak/:taskId', async (req, res, next) => {
  try {
    // Verify task ownership
    const task = await HabitTask.findOne({ _id: req.params.taskId, userId: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Habit task not found' });

    let streak = 0;
    let d = new Date();

    while (true) {
      const dateStr = d.toISOString().split('T')[0];
      const comp = await DailyCompletion.findOne({
        taskId: req.params.taskId,
        date: dateStr,
        completed: true
      });
      if (!comp) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }

    res.json({ success: true, data: { streak } });
  } catch (err) { next(err); }
});

module.exports = router;
