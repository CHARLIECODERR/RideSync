// Mock data for demo mode

export interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  bio?: string
  phone?: string
  joinedAt?: string
}

export interface Community {
  id: string
  name: string
  description: string
  members: number
  rides: number
  image: string | null
  role: 'Admin' | 'Rider' | 'Arranger'
  created_by: string
  created_at: string
  tags: string[]
}

export interface Stop {
  id: string
  name: string
  type: 'fuel' | 'food' | 'break' | 'other'
  lat: number
  lng: number
  order: number
}

export interface Route {
  start: { lat: number; lng: number; name: string }
  end: { lat: number; lng: number; name: string }
}

export interface Ride {
  id: string
  name: string
  description: string
  community_id: string
  community_name: string
  organizer: string
  organizer_id: string
  status: 'Active' | 'Planned' | 'Completed' | 'Draft'
  ride_code: string
  start_time: string
  end_time: string | null
  participants: number
  max_participants: number
  distance: string
  estimated_duration: string
  stops: Stop[]
  route: Route
}

export interface Participant {
  id: string
  name: string
  status: 'Approved' | 'Pending' | 'Rejected'
  role: 'organizer' | 'rider'
  lat: number | null
  lng: number | null
  lastUpdate: number | null
  avatar?: string
}

export interface Alert {
  id: string
  type: string
  message: string
  time: number
  from: string
}

export const mockUser: User = {
  id: 'user-1',
  email: 'rider@ridesync.app',
  name: 'Alex Rider',
  avatar: null,
  bio: 'Weekend warrior on two wheels 🏍️',
  phone: '+1 555-0123',
  joinedAt: '2025-12-01',
}

export const mockCommunities: Community[] = [
  {
    id: 'comm-1',
    name: 'Thunder Riders',
    description: 'Weekend highway cruisers who love long rides and great food stops. Open to all skill levels.',
    members: 24,
    rides: 12,
    image: null,
    role: 'Admin',
    created_by: 'user-1',
    created_at: '2025-12-15',
    tags: ['Highway', 'Cruiser', 'Weekend'],
  },
  {
    id: 'comm-2',
    name: 'Mountain Mavericks',
    description: 'Adventure touring through mountain passes and scenic routes. Safety first, fun always.',
    members: 18,
    rides: 8,
    image: null,
    role: 'Rider',
    created_by: 'user-2',
    created_at: '2026-01-05',
    tags: ['Adventure', 'Mountains', 'Touring'],
  },
  {
    id: 'comm-3',
    name: 'City Sprint Club',
    description: 'Urban riders exploring the city streets. Early morning rides and coffee meetups.',
    members: 42,
    rides: 28,
    image: null,
    role: 'Arranger',
    created_by: 'user-3',
    created_at: '2026-02-10',
    tags: ['City', 'Sport', 'Morning'],
  },
]

export const mockRides: Ride[] = [
  {
    id: 'ride-1',
    name: 'Coastal Highway Run',
    description: 'A beautiful ride along the Pacific Coast Highway with stops at scenic viewpoints.',
    community_id: 'comm-1',
    community_name: 'Thunder Riders',
    organizer: 'Alex Rider',
    organizer_id: 'user-1',
    status: 'Active',
    ride_code: 'THR-2847',
    start_time: '2026-04-07T08:00:00',
    end_time: null,
    participants: 8,
    max_participants: 15,
    distance: '180 km',
    estimated_duration: '4h 30m',
    stops: [
      { id: 's1', name: 'Shell Gas Station', type: 'fuel', lat: 34.02, lng: -118.48, order: 1 },
      { id: 's2', name: 'Malibu Seafood', type: 'food', lat: 34.03, lng: -118.68, order: 2 },
      { id: 's3', name: 'Point Dume Overlook', type: 'break', lat: 34.00, lng: -118.80, order: 3 },
    ],
    route: {
      start: { lat: 34.0195, lng: -118.4912, name: 'Santa Monica Pier' },
      end: { lat: 34.2805, lng: -119.2945, name: 'Ventura Harbor' },
    },
  },
  {
    id: 'ride-2',
    name: 'Mountain Pass Explorer',
    description: 'An adventurous ride through Angeles Crest Highway with amazing switchbacks.',
    community_id: 'comm-2',
    community_name: 'Mountain Mavericks',
    organizer: 'Sam Trail',
    organizer_id: 'user-2',
    status: 'Planned',
    ride_code: 'MM-9153',
    start_time: '2026-04-10T07:00:00',
    end_time: null,
    participants: 5,
    max_participants: 10,
    distance: '120 km',
    estimated_duration: '3h 15m',
    stops: [
      { id: 's4', name: 'Newcomb Ranch', type: 'food', lat: 34.35, lng: -118.04, order: 1 },
      { id: 's5', name: 'Chilao Campground', type: 'break', lat: 34.33, lng: -118.02, order: 2 },
    ],
    route: {
      start: { lat: 34.1975, lng: -118.1711, name: 'La Cañada Flintridge' },
      end: { lat: 34.3717, lng: -117.6448, name: 'Wrightwood' },
    },
  },
  {
    id: 'ride-3',
    name: 'Downtown Dawn Dash',
    description: 'Early morning cruise through downtown before the city wakes up.',
    community_id: 'comm-3',
    community_name: 'City Sprint Club',
    organizer: 'Jordan Cruz',
    organizer_id: 'user-3',
    status: 'Completed',
    ride_code: 'CSC-4471',
    start_time: '2026-04-05T05:30:00',
    end_time: '2026-04-05T08:00:00',
    participants: 12,
    max_participants: 20,
    distance: '45 km',
    estimated_duration: '1h 30m',
    stops: [
      { id: 's6', name: 'Blue Bottle Coffee', type: 'food', lat: 34.04, lng: -118.25, order: 1 },
    ],
    route: {
      start: { lat: 34.0407, lng: -118.2468, name: 'Arts District' },
      end: { lat: 34.0522, lng: -118.2437, name: 'Grand Park' },
    },
  },
]

export const mockParticipants: Participant[] = [
  { id: 'user-1', name: 'Alex Rider', status: 'Approved', role: 'organizer', lat: 34.025, lng: -118.55, lastUpdate: Date.now() },
  { id: 'user-4', name: 'Maya Chen', status: 'Approved', role: 'rider', lat: 34.022, lng: -118.53, lastUpdate: Date.now() - 5000 },
  { id: 'user-5', name: 'Jake Morrison', status: 'Approved', role: 'rider', lat: 34.028, lng: -118.57, lastUpdate: Date.now() - 12000 },
  { id: 'user-6', name: 'Priya Sharma', status: 'Approved', role: 'rider', lat: 34.021, lng: -118.51, lastUpdate: Date.now() - 3000 },
  { id: 'user-7', name: 'Carlos Vega', status: 'Pending', role: 'rider', lat: null, lng: null, lastUpdate: null },
  { id: 'user-8', name: 'Lisa Park', status: 'Approved', role: 'rider', lat: 34.019, lng: -118.49, lastUpdate: Date.now() - 8000 },
]

export const mockAlerts: Alert[] = [
  { id: 'a1', type: 'speed', message: 'Slow down ahead — sharp curve', time: Date.now() - 120000, from: 'Alex Rider' },
  { id: 'a2', type: 'stop', message: 'Pulling into gas station on right', time: Date.now() - 60000, from: 'Alex Rider' },
  { id: 'a3', type: 'info', message: 'Beautiful viewpoint coming up!', time: Date.now() - 30000, from: 'Maya Chen' },
]

// Generate unique ride code
export function generateRideCode(prefix: string = 'RS'): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${num}`
}
