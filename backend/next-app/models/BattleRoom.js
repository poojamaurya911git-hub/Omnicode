// FILE: next-app/models/BattleRoom.js
// Mongoose schema for competitive battle rooms

import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    solved: {
      type: [String], // Array of problem IDs solved
      default: [],
    },
  },
  { _id: false }
);

const BattleRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: [100, 'Room name must be at most 100 characters'],
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host ID is required'],
    },
    participants: {
      type: [ParticipantSchema],
      default: [],
    },
    problemId: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty must be one of: easy, medium, hard',
      },
      default: 'medium',
    },
    timeLimit: {
      type: Number, // Time limit in minutes
      required: [true, 'Time limit is required'],
      min: [5, 'Time limit must be at least 5 minutes'],
      max: [120, 'Time limit must be at most 120 minutes'],
      default: 30,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: [2, 'Minimum 2 participants required'],
      max: [10, 'Maximum 10 participants allowed'],
      default: 4,
    },
    status: {
      type: String,
      enum: {
        values: ['waiting', 'active', 'ended'],
        message: 'Status must be one of: waiting, active, ended',
      },
      default: 'waiting',
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

/**
 * JSON transform
 */
BattleRoomSchema.set('toJSON', {
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
BattleRoomSchema.index({ status: 1 });
BattleRoomSchema.index({ hostId: 1 });
BattleRoomSchema.index({ createdAt: -1 });

const BattleRoom = mongoose.models.BattleRoom || mongoose.model('BattleRoom', BattleRoomSchema);

export default BattleRoom;
