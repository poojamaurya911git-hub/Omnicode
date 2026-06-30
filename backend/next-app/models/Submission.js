// FILE: next-app/models/Submission.js
// Mongoose schema for code submissions with verdict tracking

import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    problemId: {
      type: String,
      required: [true, 'Problem ID is required'],
      trim: true,
    },
    problemTitle: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: ['leetcode', 'codeforces', 'codechef'],
        message: 'Platform must be one of: leetcode, codeforces, codechef',
      },
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      enum: {
        values: ['cpp', 'python', 'java', 'javascript'],
        message: 'Language must be one of: cpp, python, java, javascript',
      },
    },
    verdict: {
      type: String,
      required: [true, 'Verdict is required'],
      enum: {
        values: ['AC', 'WA', 'TLE', 'MLE', 'CE', 'RE'],
        message: 'Verdict must be one of: AC, WA, TLE, MLE, CE, RE',
      },
    },
    runtime: {
      type: String,
      default: '',
    },
    memory: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We use submittedAt instead
  }
);

/**
 * JSON transform
 */
SubmissionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

/**
 * Indexes for common queries
 */
SubmissionSchema.index({ userId: 1, submittedAt: -1 });
SubmissionSchema.index({ userId: 1, platform: 1 });
SubmissionSchema.index({ userId: 1, verdict: 1 });
SubmissionSchema.index({ userId: 1, submittedAt: 1 }); // For heatmap queries

const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);

export default Submission;
