import { create } from 'zustand'
import { mockRides, mockParticipants, mockAlerts, generateRideCode } from '@/lib/mockData'

export interface Ride {
  id: string
  name: string
  status: 'Active' | 'Planned' | 'Completed' | 'Draft'
  ride_code: string
  participants: number
  max_participants: number
  community_name: string
  community_id: string
  distance: string
  estimated_duration: string
  start_time: string
  end_time?: string
  stops?: import('@/lib/mockData').Stop[]
  created_at?: string
}

export interface Participant {
  id: string
  name: string
  avatar?: string
  status: 'Approved' | 'Pending' | 'Rejected'
  lat?: number
  lng?: number
  lastUpdate?: number
}

export interface RideAlert {
  id: string
  type: string
  message: string
  from: string
  time: number
}

interface RideState {
  rides: Ride[]
  activeRide: Ride | null
  participants: Participant[]
  alerts: RideAlert[]
  isLoading: boolean
  locationSimInterval: any // ReturnType<typeof setInterval> | null
  fetchRides: () => Promise<void>
  createRide: (rideData: Partial<Ride>) => Promise<Ride>
  getRide: (id: string) => Ride | undefined
  setActiveRide: (ride: Ride | null) => void
  startRide: (rideId: string) => void
  endRide: (rideId: string) => void
  joinRide: (rideCode: string) => Promise<Ride | null>
  approveParticipant: (userId: string) => void
  sendAlert: (alert: Partial<RideAlert>) => void
  getRidesByStatus: (status: Ride['status']) => Ride[]
  getRidesByCommunity: (communityId: string) => Ride[]
}

const useRideStore = create<RideState>((set, get) => ({
  rides: [...mockRides] as Ride[],
  activeRide: null,
  participants: [...mockParticipants] as Participant[],
  alerts: [...mockAlerts] as RideAlert[],
  isLoading: false,
  locationSimInterval: null,

  fetchRides: async () => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 600))
    set({ isLoading: false })
  },

  createRide: async (rideData) => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 800))

    const newRide: Ride = {
      id: 'ride-' + Date.now(),
      name: rideData.name || 'New Ride',
      status: 'Planned',
      ride_code: generateRideCode(rideData.community_name?.substring(0, 3).toUpperCase() || 'RS'),
      participants: 1,
      max_participants: rideData.max_participants || 15,
      community_name: rideData.community_name || 'General',
      community_id: rideData.community_id || 'comm-1',
      distance: rideData.distance || '0 km',
      estimated_duration: rideData.estimated_duration || '0h',
      start_time: rideData.start_time || new Date().toISOString(),
      stops: rideData.stops || [],
      created_at: new Date().toISOString(),
      ...rideData,
    }

    set((state) => ({
      rides: [newRide, ...state.rides],
      isLoading: false,
    }))

    return newRide
  },

  getRide: (id) => {
    return get().rides.find(r => r.id === id)
  },

  setActiveRide: (ride) => {
    set({ activeRide: ride })
  },

  startRide: (rideId) => {
    set((state) => ({
      rides: state.rides.map(r =>
        r.id === rideId ? { ...r, status: 'Active' as const } : r
      ),
    }))

    // Start simulating location updates
    const interval = setInterval(() => {
      set((state) => ({
        participants: state.participants.map(p => {
          if (p.lat && p.lng && p.status === 'Approved') {
            return {
              ...p,
              lat: p.lat + (Math.random() - 0.5) * 0.002,
              lng: p.lng + (Math.random() - 0.5) * 0.002,
              lastUpdate: Date.now(),
            }
          }
          return p
        }),
      }))
    }, 3000)

    set({ locationSimInterval: interval })
  },

  endRide: (rideId) => {
    const { locationSimInterval } = get()
    if (locationSimInterval) clearInterval(locationSimInterval)

    set((state) => ({
      rides: state.rides.map(r =>
        r.id === rideId ? { ...r, status: 'Completed' as const, end_time: new Date().toISOString() } : r
      ),
      locationSimInterval: null,
    }))
  },

  joinRide: async (rideCode) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const ride = get().rides.find(r => r.ride_code === rideCode)
    if (ride) {
      set((state) => ({
        rides: state.rides.map(r =>
          r.id === ride.id ? { ...r, participants: r.participants + 1 } : r
        ),
      }))
      return ride
    }
    return null
  },

  approveParticipant: (userId) => {
    set((state) => ({
      participants: state.participants.map(p =>
        p.id === userId ? { ...p, status: 'Approved' as const } : p
      ),
    }))
  },

  sendAlert: (alert) => {
    const newAlert: RideAlert = {
      id: 'a-' + Date.now(),
      type: alert.type || 'Info',
      message: alert.message || '',
      from: alert.from || 'System',
      time: Date.now(),
      ...alert,
    }
    set((state) => ({
      alerts: [newAlert, ...state.alerts],
    }))
  },

  getRidesByStatus: (status) => {
    return get().rides.filter(r => r.status === status)
  },

  getRidesByCommunity: (communityId) => {
    return get().rides.filter(r => r.community_id === communityId)
  },
}))

export default useRideStore
