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
        name: rideData.name,
        description: rideData.description,
        community_id: rideData.community_id,
        start_time: rideData.start_time || new Date().toISOString(),
        max_participants: rideData.max_participants || 15,
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
        ride_id: ride.id,
        start_location: routeData.start_location,
        end_location: routeData.end_location,
        waypoints: routeData.waypoints || [],
        distance_km: routeData.distance_km || 0,
        duration_mins: routeData.duration_mins || 0,
        geometry: routeData.geometry || null
      }])

    if (routeError) throw routeError

    // 3. Create Stops
    if (stops.length > 0) {
      const stopsToInsert = stops.map((s, index) => ({
        ride_id: ride.id,
        name: s.name,
        type: s.type,
        location: s.location,
        order: index + 1,
        note: s.note || ''
      }))
      const { error: stopsError } = await supabase
        .from('ride_stops')
        .insert(stopsToInsert)

      if (stopsError) throw stopsError
    }

    // 4. Add Creator as Lead Participant
    const { error: participantError } = await supabase
      .from('ride_participants')
      .insert([{
        ride_id: ride.id,
        user_id: userData.user.id,
        role: 'Lead'
      }])

    if (participantError) throw participantError

    return ride as Ride
  },

  async listAllRides() {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        communities(name),
        ride_routes(distance_km, duration_mins, start_location, end_location),
        participants:ride_participants(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getRideDetails(rideId: string) {
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select(`
        *,
        communities(name),
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
      .select(`
        *,
        ride_routes(distance_km, duration_mins, start_location, end_location),
        participants:ride_participants(count)
      `)
      .eq('community_id', communityId)
      .order('start_time', { ascending: true })

    if (error) throw error
    return data
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
  },

  async updateRideStatus(rideId: string, status: 'Planned' | 'Active' | 'Completed' | 'Cancelled') {
    const { error } = await supabase
      .from('rides')
      .update({ status })
      .eq('id', rideId)

    if (error) throw error
  }
}
