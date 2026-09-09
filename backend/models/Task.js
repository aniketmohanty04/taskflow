const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'completed'],
        message: 'Status must be todo, in-progress, or completed'
      },
      default: 'todo'
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high'
      },
      default: 'medium'
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
      default: 'General'
    },
    dueDate: {
      type: Date,
      default: null
    },
    assignedTo: {
      type: String,
      trim: true,
      maxlength: [50, 'Assigned to cannot exceed 50 characters'],
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    completedAt: {
      type: Date,
      default: null
    },
    userId: {
      type: String,
      default: 'anonymous'
    }
  },
  {
    timestamps: true,  // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─── Indexes for performance ──────────────────────────────────────────────────
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ userId: 1 });
taskSchema.index({ createdAt: -1 });

// ─── Virtual: isOverdue ────────────────────────────────────────────────────────
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'completed') return false;
  return new Date() > new Date(this.dueDate);
});

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
taskSchema.pre('save', function (next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.status !== 'completed') {
    this.completedAt = null;
  }
  next();
});

// ─── Static Methods ────────────────────────────────────────────────────────────
taskSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  return stats;
};

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
