import { supabase } from '@/lib/supabase'

export interface Ride {
  id: string
  name: string
  description: string
  community_id: string
  created_by: string
  start_time: string
  status: 'Planned' | 'Active' | 'Completed' | 'Draft'
  ride_code: string
  max_participants: number
}

export interface RideRoute {
  ride_id: string
  start_location: { lat: number, lng: number, name: string }
  end_location: { lat: number, lng: number, name: string }
  distance_km?: number
  duration_mins?: number
  geometry?: any
  waypoints?: Array<{ lat: number, lng: number }>
}

export interface RideStop {
  id?: string
  ride_id: string
  name: string
  type: 'fuel' | 'food' | 'break' | 'other' | 'start' | 'end'
  location: { lat: number, lng: number }
  order: number
  note?: string
}

export const rideService = {
  async createRide(rideData: Partial<Ride>, routeData: RideRoute, stops: RideStop[]) {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Unauthorized')

    const rideCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // 1. Create Ride
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .insert([{
        ...rideData,
        created_by: userData.user.id,
        ride_code: rideCode,
        status: 'Planned'
      }])
      .select()
      .single()

    if (rideError) throw rideError

    // 2. Create Route
    const { error: routeError } = await supabase
      .from('ride_routes')
      .insert([{
        ...routeData,
        ride_id: ride.id
      }])

    if (routeError) throw routeError

    // 3. Create Stops
    if (stops.length > 0) {
      const stopsWithId = stops.map(s => ({ ...s, ride_id: ride.id }))
      const { error: stopsError } = await supabase
        .from('ride_stops')
        .insert(stopsWithId)

      if (stopsError) throw stopsError
    }

    return ride as Ride
  },

  async getRideDetails(rideId: string) {
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select(`
        *,
        route:ride_routes(*),
        stops:ride_stops(*)
      `)
      .eq('id', rideId)
      .single()

    if (rideError) throw rideError
    return ride
  },

  async listCommunityRides(communityId: string) {
    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .eq('community_id', communityId)
      .order('start_time', { ascending: true })

    if (error) throw error
    return data as Ride[]
  },
  
  // ... other methods kept for compatibility
  async joinRide(rideId: string) {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Unauthorized')

    const { error } = await supabase
      .from('ride_participants')
      .insert([{
        ride_id: rideId,
        user_id: userData.user.id,
        role: 'Rider'
      }])

    if (error) throw error
  }
}
