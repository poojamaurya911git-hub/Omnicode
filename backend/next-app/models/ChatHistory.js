// FILE: next-app/models/ChatHistory.js
// Mongoose schema for AI chat conversation history

import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: {
        values: ['user', 'assistant', 'system'],
        message: 'Role must be one of: user, assistant, system',
      },
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ChatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title must be at most 200 characters'],
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/**
 * Pre-save hook: auto-generate title from first user message
 */
ChatHistorySchema.pre('save', function (next) {
  if (this.isNew && !this.title && this.messages.length > 0) {
    const firstUserMsg = this.messages.find((m) => m.role === 'user');
    if (firstUserMsg) {
      this.title = firstUserMsg.content.slice(0, 100) + (firstUserMsg.content.length > 100 ? '...' : '');
    } else {
      this.title = 'New Conversation';
    }
  }
  next();
});

/**
 * JSON transform
 */
ChatHistorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

/**
 * Indexes
 */
ChatHistorySchema.index({ userId: 1, updatedAt: -1 });

const ChatHistory = mongoose.models.ChatHistory || mongoose.model('ChatHistory', ChatHistorySchema);

export default ChatHistory;
