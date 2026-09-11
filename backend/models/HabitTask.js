const mongoose = require('mongoose');

const TASK_COLORS = ['#818cf8','#60a5fa','#34d399','#f472b6','#fbbf24','#f97316','#2dd4bf','#a78bfa'];

const habitTaskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters']
    },
    type: {
      type: String,
      enum: ['fixed', 'variable'],
      default: 'fixed'
    },
    // For variable tasks: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    scheduledDays: {
      type: [Number],
      default: []
    },
    color: {
      type: String,
      default: '#818cf8'
    },
    order: {
      type: Number,
      default: 0
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

habitTaskSchema.index({ userId: 1, order: 1 });

const HabitTask = mongoose.model('HabitTask', habitTaskSchema);
module.exports = HabitTask;
