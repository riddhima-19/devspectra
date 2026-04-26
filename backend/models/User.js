const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, required: [true, 'Name is required'],
      trim: true, maxlength: [80, 'Name too long'],
    },
    email: {
      type: String, required: [true, 'Email is required'],
      unique: true, lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String, required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    avatar:  { type: String, default: null },
    bio:     { type: String, maxlength: 300 },
    role:    { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    preferences: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      emailNotifications: { type: Boolean, default: true },
    },
    stats: {
      totalProjects: { type: Number, default: 0 },
      totalAnalyses: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);