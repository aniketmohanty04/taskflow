const mongoose = require('mongoose');

const dailyCompletionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HabitTask',
      required: true
    },
    date: {
      type: String,  // stored as "YYYY-MM-DD"
      required: true
    },
    completed: {
      type: Boolean,
      default: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthUser',
      index: true
    }
  },
  { timestamps: true }
);

// Unique per task per day
dailyCompletionSchema.index({ taskId: 1, date: 1 }, { unique: true });
dailyCompletionSchema.index({ userId: 1, date: 1 });

const DailyCompletion = mongoose.model('DailyCompletion', dailyCompletionSchema);
module.exports = DailyCompletion;
