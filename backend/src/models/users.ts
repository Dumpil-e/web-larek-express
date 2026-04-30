import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser {
  name?: string;
  email: string;
  password: string;
  tokens: Array<{ token: string }>
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Ё-мое',
    minlength: 2,
    maxlength: 30,
  },
  tokens: {
    type: [{
      token: {
        type: String,
        required: true,
      },
    }],
    select: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    select: false,
    type: String,
    required: true,
    minlength: 6,
  },
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

export default mongoose.model<IUser>('user', userSchema);
