import crypto from 'crypto';
import { getRedisClient } from '../config/redis.js';
import AppError from '../utils/AppError.js';
import logger from '../config/logger.js';

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

const normalizeEmail = (email) => email.trim().toLowerCase();

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split(':');
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(hashPassword(password, salt).split(':')[1], 'hex')
  );
};

export class AuthService {
  async ensureDefaultAdmin() {
    const client = getRedisClient();
    const email = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@example.com');
    const existingId = await client.get(`user_email:${email}`);

    if (existingId) return;

    const password = process.env.ADMIN_PASSWORD || 'admin12345';
    await this.createUser({
      name: 'Admin',
      email,
      password,
      role: 'admin',
      status: 'active',
    });

    logger.info(`Default admin created: ${email}`);
  }

  async createUser({ name, email, password, role = 'host', status = 'active' }) {
    const client = getRedisClient();
    const normalizedEmail = normalizeEmail(email);
    const existingId = await client.get(`user_email:${normalizedEmail}`);

    if (existingId) {
      throw new AppError('Email already exists', 409);
    }

    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    const user = {
      userId,
      name,
      email: normalizedEmail,
      role,
      status,
      passwordHash: hashPassword(password),
      createdAt: now,
      updatedAt: now,
    };

    await client.hSet(`user:${userId}`, user);
    await client.set(`user_email:${normalizedEmail}`, userId);
    await client.sAdd('users', userId);

    return this.toPublicUser(user);
  }

  async login(email, password) {
    const client = getRedisClient();
    const normalizedEmail = normalizeEmail(email);
    const userId = await client.get(`user_email:${normalizedEmail}`);

    if (!userId) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = await client.hGetAll(`user:${userId}`);
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('Account is inactive', 403);
    }

    const token = crypto.randomBytes(32).toString('hex');
    await client.set(`session:${token}`, userId, { EX: SESSION_TTL_SECONDS });

    return {
      token,
      user: this.toPublicUser(user),
    };
  }

  async getUserByToken(token) {
    const client = getRedisClient();
    const userId = await client.get(`session:${token}`);
    if (!userId) return null;

    const user = await client.hGetAll(`user:${userId}`);
    return Object.keys(user).length > 0 ? this.toPublicUser(user) : null;
  }

  async logout(token) {
    const client = getRedisClient();
    await client.del(`session:${token}`);
    return true;
  }

  async getHosts() {
    const client = getRedisClient();
    const userIds = await client.sMembers('users');
    const hosts = [];

    for (const userId of userIds) {
      const user = await client.hGetAll(`user:${userId}`);
      if (user.role === 'host') {
        hosts.push(this.toPublicUser(user));
      }
    }

    return hosts.sort((a, b) => a.name.localeCompare(b.name));
  }

  async updateHost(userId, updates) {
    const client = getRedisClient();
    const key = `user:${userId}`;
    const user = await client.hGetAll(key);

    if (!user.userId || user.role !== 'host') {
      throw new AppError('Host not found', 404);
    }

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.status !== undefined) updateData.status = updates.status;

    if (updates.email !== undefined) {
      const normalizedEmail = normalizeEmail(updates.email);
      const existingId = await client.get(`user_email:${normalizedEmail}`);
      if (existingId && existingId !== userId) {
        throw new AppError('Email already exists', 409);
      }
      await client.del(`user_email:${user.email}`);
      await client.set(`user_email:${normalizedEmail}`, userId);
      updateData.email = normalizedEmail;
    }

    if (updates.password) {
      updateData.passwordHash = hashPassword(updates.password);
    }

    await client.hSet(key, updateData);
    return this.toPublicUser({ ...user, ...updateData });
  }

  async deleteHost(userId) {
    const client = getRedisClient();
    const key = `user:${userId}`;
    const user = await client.hGetAll(key);

    if (!user.userId || user.role !== 'host') {
      throw new AppError('Host not found', 404);
    }

    await client.del(key);
    await client.del(`user_email:${user.email}`);
    await client.sRem('users', userId);
    return true;
  }

  toPublicUser(user) {
    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export default new AuthService();
