import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import passport from 'passport';
import session from 'express-session';
import { authService, generateToken } from './services/authService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


dotenv.config();

const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PORT = process.env.SERVER_PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.profile.findUnique({ where: { id } });
  done(null, user);
});

// --- AUTH ROUTES ---

// Auth: Get Current Profile
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    const user = await prisma.profile.findUnique({ where: { id: decoded.id } });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Email/Password Register
app.post('/api/auth/register', async (req, res) => {

  try {
    const { email, password, name } = req.body;
    const user = await authService.register(email, password, name);
    const token = generateToken(user);
    res.json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// Email/Password Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    const token = generateToken(user);
    res.json({ user, token });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Login failed' });
  }
});

// Google OAuth
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user);
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  });

// --- DATA ROUTES ---

app.get('/api/profiles/:id', async (req, res) => {
  const { id } = req.params;
  const profile = await prisma.profile.findUnique({ where: { id } });
  res.json(profile);
});

app.get('/api/communities', async (req, res) => {
  const communities = await prisma.community.findMany({
    include: { creator: true }
  });
  res.json(communities);
});

app.post('/api/communities', async (req, res) => {
  const data = req.body;
  const community = await prisma.community.create({ data });
  res.json(community);
});

app.get('/api/rides', async (req, res) => {
  const rides = await prisma.ride.findMany({
    include: {
      community: { select: { name: true } },
      route: true,
      _count: { select: { participants: true } }
    },
    orderBy: { created_at: 'desc' }
  });
  res.json(rides);
});

app.get('/api/rides/:id', async (req, res) => {
  const { id } = req.params;
  const ride = await prisma.ride.findUnique({
    where: { id },
    include: {
      community: { select: { name: true } },
      route: true,
      stops: true,
      participants: { include: { user: true } }
    }
  });
  res.json(ride);
});

app.post('/api/rides', async (req, res) => {
  const { ride, route, stops, creator_id } = req.body;
  const newRide = await prisma.ride.create({
    data: {
      ...ride,
      created_by: creator_id,
      route: { create: route },
      stops: { create: stops.map((s: any, i: number) => ({ ...s, order: i + 1 })) },
      participants: { create: { user_id: creator_id, role: 'Lead' } }
    }
  });
  res.json(newRide);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
