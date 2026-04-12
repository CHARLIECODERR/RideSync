import { create } from 'zustand'
import { rideService, RideRoute, RideStop, Ride as ServiceRide } from '../services/rideService'
import * as turf from '@turf/turf'

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
  route?: any
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
  isRideModeActive: boolean
  navigationMetadata: { 
    nextInstruction: string, 
    distanceToNext: number, 
    isOffRoute: boolean,
    speed: number 
  } | null
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
  deleteRide: (rideId: string) => Promise<void>
  setRideMode: (active: boolean) => void
  updateNavigationMetadata: (meta: any) => void
  currentUserLocation: { lat: number, lng: number } | null
  watchId: number | null
}

const useRideStore = create<RideState>((set, get) => ({
  rides: [],
  activeRide: null,
  participants: [],
  alerts: [],
  isLoading: false,
  isRideModeActive: false,
  navigationMetadata: null,
  locationSimInterval: null,
  currentUserLocation: null,
  watchId: null,

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
        distance: (Array.isArray(r.ride_routes) ? r.ride_routes[0] : r.ride_routes)?.distance_km ? `${(Array.isArray(r.ride_routes) ? r.ride_routes[0] : r.ride_routes).distance_km} km` : '0 km',
        estimated_duration: (Array.isArray(r.ride_routes) ? r.ride_routes[0] : r.ride_routes)?.duration_mins ? `${(Array.isArray(r.ride_routes) ? r.ride_routes[0] : r.ride_routes).duration_mins} mins` : '0 mins',
        start_time: r.start_time,
        route: Array.isArray(r.ride_routes) ? r.ride_routes[0] : r.ride_routes,
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
      const serviceRideData: Partial<ServiceRide> = {
        name: rideData.name,
        description: rideData.description,
        community_id: rideData.community_id || '',
        start_time: rideData.start_time,
        max_participants: rideData.max_participants,
        status: rideData.status as ServiceRide['status']
      }

      const dbRide = await rideService.createRide(serviceRideData, routeData, stops)
      
      const newRide: Ride = {
        id: dbRide.id,
        name: dbRide.name,
        description: dbRide.description || '',
        status: dbRide.status,
        ride_code: dbRide.ride_code,
        participants: 1,
        max_participants: dbRide.max_participants,
        community_id: dbRide.community_id,
        community_name: 'HQ',
        distance: routeData.distance_km ? `${routeData.distance_km} km` : '0 km',
        estimated_duration: routeData.duration_mins ? `${routeData.duration_mins} mins` : '0 mins',
        start_time: dbRide.start_time,
        route: routeData,
        created_at: new Date().toISOString()
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

  getRide: (id: string) => {
    return get().rides.find(r => r.id === id)
  },

  setActiveRide: (ride: Ride | null) => {
    set({ activeRide: ride })
  },

  startRide: async (rideId: string) => {
    try {
      await rideService.updateRideStatus(rideId, 'Active')
      set((state) => ({
        rides: state.rides.map(r =>
          r.id === rideId ? { ...r, status: 'Active' as const } : r
        ),
      }))

      if ("geolocation" in navigator) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed } = position.coords
            const currentSpeed = speed ? Math.round(speed * 3.6) : 0 // km/h
            
            set({ currentUserLocation: { lat: latitude, lng: longitude } })
            
            // Navigation Logic
            const state = get()
            const activeRide = state.activeRide
            const route = activeRide?.route
            
            if (route && route.geometry) {
              try {
                const userPoint = turf.point([longitude, latitude])
                const line = turf.lineString(route.geometry.coordinates)
                const snapped = turf.nearestPointOnLine(line, userPoint)
                const distanceOff = turf.distance(userPoint, snapped, { units: 'meters' })
                
                // Advanced Navigation Metadata
                const isOffRoute = distanceOff > 100 // Warning if > 100m off
                
                set({ 
                  navigationMetadata: {
                    nextInstruction: isOffRoute ? "OFF COURSE! REJOIN ROUTE" : "STAY ON PLANNED ROUTE",
                    distanceToNext: 0, 
                    isOffRoute,
                    speed: currentSpeed
                  }
                })
              } catch (e) {
                console.error('Navigation calculation failed', e)
              }
            }
          },
          (error) => {
            console.error('CRITICAL: Tracking lost', error)
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000
          }
        )
        set({ watchId: id, isRideModeActive: true })
      }
    } catch (error) {
      console.error('Failed to start ride', error)
    }
  },

  endRide: async (rideId: string) => {
    try {
      await rideService.updateRideStatus(rideId, 'Completed')
      set((state) => ({
        rides: state.rides.map(r =>
          r.id === rideId ? { ...r, status: 'Completed' as const, end_time: new Date().toISOString() } : r
        ),
      }))

      const { watchId } = get()
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
        set({ watchId: null, currentUserLocation: null, isRideModeActive: false, navigationMetadata: null })
      }
    } catch (error) {
      console.error('Failed to end ride', error)
    }
  },

  joinRide: async (rideCode: string) => {
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

  approveParticipant: (userId: string) => {
    set((state) => ({
      participants: state.participants.map(p =>
        p.id === userId ? { ...p, status: 'Approved' as const } : p
      ),
    }))
  },

  sendAlert: (alert: Partial<RideAlert>) => {
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

  getRidesByStatus: (status: Ride['status']) => {
    return get().rides.filter(r => r.status === status)
  },

  getRidesByCommunity: (communityId: string) => {
    return get().rides.filter(r => r.community_id === communityId)
  },

  deleteRide: async (rideId: string) => {
    set({ isLoading: true })
    try {
      await rideService.deleteRide(rideId)
      set((state) => ({
        rides: state.rides.filter(r => r.id !== rideId),
        isLoading: false
      }))
    } catch (error) {
      console.error('Failed to delete ride', error)
      set({ isLoading: false })
      throw error
    }
  },

  setRideMode: (active: boolean) => set({ isRideModeActive: active }),
  
  updateNavigationMetadata: (meta: any) => set({ navigationMetadata: meta }),
}))

export default useRideStore
