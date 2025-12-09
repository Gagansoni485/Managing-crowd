const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    validate: {
      validator: function(v) {
        // Accept formats: +919876543210, 9876543210, +12345678901
        return /^(\+?\d{10,13})$/.test(v.replace(/[\s-]/g, ''));
      },
      message: props => `${props.value} is not a valid phone number! Use format: +919876543210 or 9876543210`
    }
  },
  profileImage: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['visitor', 'volunteer', 'admin', 'guard', 'medical', 'staff'],
    default: 'visitor',
  },
  staffRole: {
    type: String,
    enum: ['volunteer', 'guard', 'medical', 'security', 'first-aid', 'cleaning', 'information-desk', null],
    default: null,
  },
  assignedTasks: [{
    task: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    zone: String,
  }],
  currentZone: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
