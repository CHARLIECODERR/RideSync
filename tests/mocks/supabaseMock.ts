/**
 * Shared Supabase mock factory.
 * Use this in vi.mock('@/lib/supabase', supabaseMockFactory) across tests.
 */
import { vi } from 'vitest'

// Reusable chainable query builder mock
export const makeQueryBuilder = (resolvedValue: any) => {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    // Terminal methods
    single: vi.fn().mockResolvedValue(resolvedValue),
    maybeSingle: vi.fn().mockResolvedValue(resolvedValue),
    // Promise resolution for list calls
    then: (resolve: any) => Promise.resolve(resolvedValue).then(resolve),
  }
  return builder
}

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'authenticated',
}

export const mockProfile = {
  id: 'test-user-id',
  name: 'Test Rider',
  email: 'test@example.com',
  avatar_url: null,
}

export const mockRide = {
  id: 'ride-1',
  name: 'Thunder Run',
  description: 'Mountain highway blast',
  status: 'Planned',
  ride_code: 'THR001',
  max_participants: 15,
  community_id: 'comm-1',
  communities: { name: 'Viking Path' },
  ride_routes: [{ distance_km: 120, duration_mins: 180 }],
  route: [{
    distance_km: 120,
    duration_mins: 180,
    start_location: { name: 'Bangalore', lat: 12.97, lng: 77.59 },
    end_location: { name: 'Mysore', lat: 12.30, lng: 76.65 },
    geometry: { type: 'LineString', coordinates: [[77.59, 12.97], [76.65, 12.30]] },
  }],
  stops: [],
  participants: [{ count: 3 }],
  created_at: new Date().toISOString(),
}

export const mockCommunity = {
  id: 'comm-1',
  name: 'Viking Path',
  description: 'Old skool riders',
  created_by: 'test-user-id',
  created_at: new Date().toISOString(),
  members: [{ count: 12 }],
  rides: [{ count: 5 }],
}

/** Call vi.mock('@/lib/supabase', createSupabaseMock()) in each test file */
export const createSupabaseMock = () => () => ({
  supabase: {
    from: vi.fn((table: string) => {
      // Return table-specific mock data
      const tableData: Record<string, any> = {
        rides:     { data: [mockRide], error: null },
        profiles:  { data: [mockProfile], error: null },
        communities: { data: [mockCommunity], error: null },
        community_members: { data: [{ role: 'Admin', user_id: 'test-user-id' }], error: null },
        ride_routes:  { data: [], error: null },
        ride_stops:   { data: [], error: null },
        ride_participants: { data: [], error: null },
      }
      const resolved = tableData[table] ?? { data: [], error: null }
      return makeQueryBuilder(resolved)
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: mockUser, session: { access_token: 'tok' } }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
  isDemoMode: false,
})
