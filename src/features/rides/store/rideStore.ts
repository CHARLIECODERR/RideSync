import { create } from 'zustand'
import { rideService, RideRoute, RideStop, Ride as ServiceRide } from '../services/rideService'
import { mockRides, mockParticipants, mockAlerts } from '@/lib/mockData'

export interface Ride {
  id: string
  name: string
  description?: string
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
  stops?: any[]
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
  locationSimInterval: any
  fetchRides: () => Promise<void>
  createRide: (rideData: Partial<Ride>, routeData: RideRoute, stops: RideStop[]) => Promise<Ride>
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
  rides: [],
  activeRide: null,
  participants: [],
  alerts: [],
  isLoading: false,
  locationSimInterval: null,

  fetchRides: async () => {
    set({ isLoading: true })
    try {
      const dbRides = await rideService.listAllRides()
      const uiRides: Ride[] = dbRides.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        status: r.status,
        ride_code: r.ride_code,
        participants: r.participants?.[0]?.count || 0,
        max_participants: r.max_participants,
        community_name: r.communities?.name || 'HQ', 
        community_id: r.community_id,
        distance: r.ride_routes?.[0]?.distance_km ? `${r.ride_routes[0].distance_km} km` : '0 km',
        estimated_duration: r.ride_routes?.[0]?.duration_mins ? `${r.ride_routes[0].duration_mins} mins` : '0 mins',
        start_time: r.start_time,
        created_at: r.created_at
      }))
      set({ rides: uiRides, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch rides', error)
      set({ isLoading: false })
    }
  },

  createRide: async (rideData, routeData, stops) => {
    set({ isLoading: true })
    try {
      // Align types for service call
      const serviceRideData: Partial<ServiceRide> = {
        name: rideData.name,
        description: rideData.description,
        community_id: rideData.community_id,
        start_time: rideData.start_time,
        max_participants: rideData.max_participants,
        status: rideData.status as ServiceRide['status']
      }

      const dbRide = await rideService.createRide(serviceRideData, routeData, stops)
      
      // Transform ServiceRide back to UI Ride
      const newRide: Ride = {
        ...dbRide,
        participants: 1, 
        community_name: 'HQ', 
        distance: '0.0 km', 
        estimated_duration: '0 mins',
        status: dbRide.status
      }

      set((state) => ({
        rides: [newRide, ...state.rides],
        isLoading: false,
      }))

      return newRide
    } catch (error) {
      console.error('Failed to create ride', error)
      set({ isLoading: false })
      throw error
    }
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
