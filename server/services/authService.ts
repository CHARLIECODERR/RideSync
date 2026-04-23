import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Passport Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0].value;
      if (!email) return done(new Error("No email found in Google profile"));

      let user = await prisma.profile.findUnique({ where: { google_id: profile.id } });
      
      if (!user) {
        // Check if user exists with same email but no google_id
        user = await prisma.profile.findUnique({ where: { email } });
        
        if (user) {
          // Link google_id to existing account
          user = await prisma.profile.update({
            where: { email },
            data: { google_id: profile.id, avatar_url: profile.photos?.[0].value }
          });
        } else {
          // Create new user
          user = await prisma.profile.create({
            data: {
              email,
              name: profile.displayName,
              google_id: profile.id,
              avatar_url: profile.photos?.[0].value
            }
          });
        }
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
}

export const generateToken = (user: any) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
};

export const authService = {
  async register(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await prisma.profile.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });
  },

  async login(email: string, password: string) {
    const user = await prisma.profile.findUnique({ where: { email } });
    if (!user || !user.password) throw new Error('Invalid credentials');
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid credentials');
    
    return user;
  }
};
