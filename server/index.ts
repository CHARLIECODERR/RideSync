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
import { Server } from 'socket.io';
import http from 'http';


dotenv.config();

const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PORT = process.env.SERVER_PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

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

// --- AUTH MIDDLEWARE ---
const authenticate = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// --- AUTH ROUTES ---

// Auth: Get Current Profile
app.get('/api/auth/me', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.profile.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.patch('/api/auth/profile', authenticate, async (req: any, res) => {
  try {
    const { name, avatar_url } = req.body;
    const user = await prisma.profile.update({
      where: { id: req.user.id },
      data: { name, avatar_url }
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
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
    console.error('Registration error:', err);
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
  (req: any, res) => {
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
  try {
    const communities = await prisma.community.findMany({
      include: { 
        creator: { select: { name: true, avatar_url: true } },
        _count: { select: { members: true, rides: true } }
      }
    });
    // Format to match frontend expectations
    const formatted = communities.map(c => ({
      ...c,
      members_count: c._count.members,
      rides_count: c._count.rides
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to Fetch communities' });
  }
});

app.post('/api/communities', authenticate, async (req: any, res) => {
  try {
    const { name, description } = req.body;
    const user_id = req.user.id;

    // Verify user exists in DB (especially after reset)
    const profile = await prisma.profile.findUnique({ where: { id: user_id } });
    if (!profile) {
      return res.status(401).json({ error: 'User profile not found. Please log in again.' });
    }

    const join_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const community = await prisma.community.create({
      data: {
        name,
        description,
        created_by: user_id,
        join_code,
        members: {
          create: {
            user_id: user_id,
            role: 'Admin'
          }
        }
      },
      include: {
        _count: { select: { members: true, rides: true } }
      }
    });

    res.json({
      ...community,
      members_count: community._count.members,
      rides_count: community._count.rides
    });
  } catch (err: any) {
    console.error('Community creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to create community' });
  }
});


app.post('/api/communities/join', authenticate, async (req: any, res) => {
  try {
    const { code } = req.body;
    const user_id = req.user.id;

    const community = await prisma.community.findUnique({
      where: { join_code: code }
    });

    if (!community) return res.status(404).json({ error: 'Community not found with this code' });

    // Check if already a member
    const existing = await prisma.communityMember.findUnique({
      where: {
        community_id_user_id: {
          community_id: community.id,
          user_id: user_id
        }
      }
    });

    if (existing) return res.status(400).json({ error: 'You are already a member of this community' });

    await prisma.communityMember.create({
      data: {
        community_id: community.id,
        user_id: user_id,
        role: 'Rider'
      }
    });

    res.json(community);
  } catch (err) {
    res.status(500).json({ error: 'Failed to join community' });
  }
});

app.post('/api/rides/join-by-code', authenticate, async (req: any, res) => {
  try {
    const { code } = req.body;
    const user_id = req.user.id;

    const ride = await prisma.ride.findUnique({
      where: { ride_code: code }
    });

    if (!ride) return res.status(404).json({ error: 'Ride not found with this code' });

    // Check if already a participant
    const existing = await prisma.rideParticipant.findUnique({
      where: {
        ride_id_user_id: {
          ride_id: ride.id,
          user_id: user_id
        }
      }
    });

    if (existing) return res.status(400).json({ error: 'You are already in this ride' });

    await prisma.rideParticipant.create({
      data: {
        ride_id: ride.id,
        user_id: user_id,
        role: 'Rider'
      }
    });

    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: 'Failed to join ride' });
  }
});


app.get('/api/rides', async (req, res) => {
  try {
    const rides = await prisma.ride.findMany({
      include: {
        community: { select: { name: true } },
        route: true,
        _count: { select: { participants: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rides' });
  }
});

app.get('/api/rides/:id', async (req, res) => {
  const { id } = req.params;
  try {
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
  } catch (err) {
    res.status(404).json({ error: 'Ride not found' });
  }
});

app.post('/api/rides', authenticate, async (req: any, res) => {
  try {
    const { ride, route, stops } = req.body;
    const creator_id = req.user.id;

    // Verify user exists in DB
    const profile = await prisma.profile.findUnique({ where: { id: creator_id } });
    if (!profile) {
      return res.status(401).json({ error: 'User profile not found. Please log in again.' });
    }

    const newRide = await prisma.ride.create({
      data: {
        name: ride.name,
        description: ride.description,
        community_id: ride.community_id,
        start_time: new Date(ride.start_time),
        max_participants: ride.max_participants || 15,
        created_by: creator_id,
        status: 'Planned',
        ride_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        route: {
          create: {
            start_location: route.start_location,
            end_location: route.end_location,
            distance_km: route.distance_km,
            duration_mins: route.duration_mins,
            geometry: route.geometry,
            waypoints: route.waypoints
          }
        },
        stops: {
          create: stops.map((s: any, i: number) => ({
            name: s.name,
            type: s.type,
            location: s.location,
            order: i + 1,
            note: s.note
          }))
        },
        participants: {
          create: {
            user_id: creator_id,
            role: 'Lead'
          }
        }
      }
    });
    res.json(newRide);
  } catch (err: any) {
    console.error('Ride creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to create ride' });
  }
});


app.get('/api/communities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true, avatar_url: true } },
        _count: { select: { members: true, rides: true } }
      }
    });

    if (!community) return res.status(404).json({ error: 'Community not found' });

    res.json({
      ...community,
      members_count: community._count.members,
      rides_count: community._count.rides
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch community' });
  }
});

app.get('/api/communities/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const members = await prisma.communityMember.findMany({
      where: { community_id: id },
      include: {
        user: { select: { name: true, avatar_url: true } }
      }
    });
    // Format to match frontend
    const formatted = members.map(m => ({
      ...m,
      user_profile: m.user
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

app.get('/api/communities/:id/members/me', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const member = await prisma.communityMember.findUnique({
      where: {
        community_id_user_id: {
          community_id: id,
          user_id: req.user.id
        }
      }
    });
    if (!member) return res.status(404).json({ error: 'Not a member' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch membership' });
  }
});

app.post('/api/communities/:id/members', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Check if requester is admin
    const admin = await prisma.communityMember.findUnique({
      where: { community_id_user_id: { community_id: id, user_id: req.user.id } }
    });
    if (admin?.role !== 'Admin') return res.status(403).json({ error: 'Only admins can induct members manually' });

    const targetUser = await prisma.profile.findUnique({ where: { email } });
    if (!targetUser) return res.status(404).json({ error: 'User not found in RideSync directory' });

    const member = await prisma.communityMember.create({
      data: {
        community_id: id,
        user_id: targetUser.id,
        role: 'Rider'
      }
    });

    res.json(member);
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'User is already a member' });
    res.status(500).json({ error: 'Failed to add member' });
  }
});

app.patch('/api/communities/:id/members/:userId', authenticate, async (req: any, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    const admin = await prisma.communityMember.findUnique({
      where: { community_id_user_id: { community_id: id, user_id: req.user.id } }
    });
    if (admin?.role !== 'Admin' && admin?.role !== 'Arranger') {
      return res.status(403).json({ error: 'Only admins or arrangers can modify roles' });
    }

    const member = await prisma.communityMember.update({
      where: { community_id_user_id: { community_id: id, user_id: userId } },
      data: { role }
    });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

app.delete('/api/communities/:id/members/:userId', authenticate, async (req: any, res) => {
  try {
    const { id, userId } = req.params;

    const admin = await prisma.communityMember.findUnique({
      where: { community_id_user_id: { community_id: id, user_id: req.user.id } }
    });
    if (admin?.role !== 'Admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    await prisma.communityMember.delete({
      where: { community_id_user_id: { community_id: id, user_id: userId } }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

app.get('/api/communities/:id/members/me', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const member = await prisma.communityMember.findUnique({
      where: { community_id_user_id: { community_id: id, user_id: req.user.id } }
    });
    res.json(member || { role: null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your role' });
  }
});


app.get('/api/communities/:id/rides', async (req, res) => {
  try {
    const { id } = req.params;
    const rides = await prisma.ride.findMany({
      where: { community_id: id },
      include: {
        route: true,
        _count: { select: { participants: true } }
      },
      orderBy: { start_time: 'asc' }
    });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch community rides' });
  }
});

app.post('/api/rides/:id/join', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const participant = await prisma.rideParticipant.create({
      data: {
        ride_id: id,
        user_id: req.user.id,
        role: 'Rider'
      }
    });
    res.json(participant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to join ride' });
  }
});

app.patch('/api/rides/:id/status', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ride = await prisma.ride.update({
      where: { id },
      data: { status }
    });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ride status' });
  }
});

app.delete('/api/rides/:id', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    // Check if user is creator
    const ride = await prisma.ride.findUnique({ where: { id } });
    if (ride?.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this ride' });
    }
    await prisma.ride.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Ride Deletion Error:', err);
    res.status(500).json({ error: 'Failed to delete ride' });
  }
});


// --- SOCKET.IO REAL-TIME LOGIC ---
io.on('connection', (socket) => {
  console.log('New tactical link established:', socket.id);

  socket.on('join-ride', ({ rideId, user }) => {
    socket.join(`ride-${rideId}`);
    console.log(`Rider ${user.name} joined mission room: ride-${rideId}`);
    
    // Notify others in the pack
    socket.to(`ride-${rideId}`).emit('rider-joined', { 
      userId: user.id, 
      name: user.name,
      timestamp: Date.now()
    });
  });

  socket.on('update-location', ({ rideId, userId, name, location }) => {
    // location: { lat, lng, speed, heading }
    socket.to(`ride-${rideId}`).emit('location-updated', {
      userId,
      name,
      location,
      timestamp: Date.now()
    });
  });

  socket.on('send-alert', ({ rideId, alert }) => {
    io.to(`ride-${rideId}`).emit('new-alert', alert);
  });

  socket.on('leave-ride', ({ rideId, userId }) => {
    socket.leave(`ride-${rideId}`);
    socket.to(`ride-${rideId}`).emit('rider-left', { userId });
  });

  socket.on('disconnect', () => {
    console.log('Tactical link severed:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Tactical Hub running on http://localhost:${PORT}`);
});


