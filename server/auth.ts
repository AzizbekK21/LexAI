import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { randomBytes } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateUserId(): string {
  return randomBytes(16).toString('hex');
}

export async function authenticateUser(email: string, password: string) {
  const user = await storage.getUserByEmail(email);
  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Return user without password hash
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function registerUser(email: string, password: string, firstName?: string, lastName?: string) {
  // Check if user already exists
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const userId = generateUserId();
  
  const user = await storage.createUser({
    id: userId,
    email,
    passwordHash,
    firstName,
    lastName,
  });

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}