import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Supabase Auth
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: { id: 'test-user-id', email: 'test@example.com' }
    })
  }),

  // Mock Rides Fetch & Details
  http.get('*/rest/v1/rides', ({ request }) => {
    const url = new URL(request.url)
    const idFilter = url.searchParams.get('id')
    
    // If it's a detail request (with ID filter)
    if (idFilter && idFilter.startsWith('eq.')) {
      return HttpResponse.json({
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
      })
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
  })
]
