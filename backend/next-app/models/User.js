// FILE: next-app/models/User.js
// Mongoose schema for User with platform handles and avatar fallback

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must be at most 30 characters'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password by default
    },
    lc_username: {
      type: String,
      trim: true,
      default: '',
    },
    cf_handle: {
      type: String,
      trim: true,
      default: '',
    },
    cc_username: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio must be at most 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/**
 * Virtual: Generate initials-based avatar fallback
 */
UserSchema.virtual('avatarFallback').get(function () {
  if (this.avatar) return this.avatar;
  const initials = this.username
    .split(/[_-]/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return initials || this.username.slice(0, 2).toUpperCase();
});

/**
 * Ensure virtuals are included in JSON/Object output
 */
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

UserSchema.set('toObject', { virtuals: true });

/**
 * Index for faster queries
 */
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
