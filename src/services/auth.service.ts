import bcrypt from 'bcrypt';
import { User } from '../models';
import { ConflictError, UnauthorizedError } from '../lib/errors';
import { signToken } from '../middleware/auth';

const SALT_ROUNDS = 10;

export class AuthService {
  async register(email: string, password: string, name?: string) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      email,
      passwordHash,
      name,
    });

    const token = signToken(user._id.toString(), user.email);
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken(user._id.toString(), user.email);
    return {
      user: { id: user._id.toString(), email: user.email, name: user.name },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    };
  }
}

export const authService = new AuthService();
