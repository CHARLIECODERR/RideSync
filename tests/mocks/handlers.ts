import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Supabase Auth
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: { id: 'test-user-id', email: 'test@example.com' }
    })
  }),

  http.get('*/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'authenticated'
    })
  }),

  // Mock Profiles
  http.get('*/rest/v1/profiles*', () => {
    return HttpResponse.json([
      { id: 'test-user-id', name: 'Test User', email: 'test@example.com', avatar_url: null }
    ])
  }),

  // Mock Communities — list requests (no Accept: object header)
  http.get('*/rest/v1/communities*', ({ request }) => {
    const accept = request.headers.get('Accept') ?? ''
    const isSingle = accept.includes('vnd.pgrst.object')
    const communityObj = { 
      id: 'comm-1', 
      name: 'Viking Path', 
      description: 'Testing community', 
      created_at: new Date().toISOString(),
      members: [{ count: 10 }],
      rides: [{ count: 5 }]
    }
    // .single() → PostgREST returns a plain object; list → array
    return HttpResponse.json(isSingle ? communityObj : [communityObj])
  }),

  // Mock community_members — .single() for getMyRole returns object; list returns array
  http.get('*/rest/v1/community_members*', ({ request }) => {
    const accept = request.headers.get('Accept') ?? ''
    const isSingle = accept.includes('vnd.pgrst.object')
    const memberObj = { role: 'Admin', user_id: 'test-user-id' }
    return HttpResponse.json(isSingle ? memberObj : [memberObj])
  }),

  // Mock Rides Fetch & Details
  http.get('*/rest/v1/rides', ({ request }) => {
    const url = new URL(request.url)
    const idFilter = url.searchParams.get('id')
    
    // If it's a detail request (with ID filter)
    if (idFilter && idFilter.startsWith('eq.')) {
      return HttpResponse.json([{
        id: idFilter.replace('eq.', ''),
        name: 'Test Ride',
        status: 'Planned',
        ride_code: 'TEST01',
        communities: { name: 'Test Community' },
        route: [{ 
          distance_km: 10, 
          duration_mins: 60, 
          start_location: { name: 'A', lat: 20, lng: 70 }, 
          end_location: { name: 'B', lat: 21, lng: 71 },
          geometry: { type: 'LineString', coordinates: [[70, 20], [71, 21]] }
        }],
        stops: []
      }])
    }

    // Default list response
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Ride',
        status: 'Planned',
        ride_code: 'TEST01',
        communities: { name: 'Test Community' },
        ride_routes: [{ distance_km: 10, duration_mins: 60 }]
      }
    ])
  }),

  // Mock ride status updates (PATCH — used by startRide / endRide)
  http.patch('*/rest/v1/rides*', () => {
    return HttpResponse.json({ id: 'ride-1', status: 'Completed' })
  }),

  // Mock ride deletes
  http.delete('*/rest/v1/rides*', () => {
    return HttpResponse.json(null, { status: 204 })
  }),
]
