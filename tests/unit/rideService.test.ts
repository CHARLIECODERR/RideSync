import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockRide } from '../mocks/supabaseMock'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      const builder: any = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        // terminal
        single: vi.fn().mockResolvedValue({ data: mockRide, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockRide, error: null }),
        // list resolver
        then: (resolve: any) => Promise.resolve({ data: [mockRide], error: null }).then(resolve),
      }
      return builder
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
    },
  },
}))

import { rideService } from '@/features/rides/services/rideService'

describe('rideService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should list all rides and return an array', async () => {
    const rides = await rideService.listAllRides()
    expect(Array.isArray(rides)).toBe(true)
    expect(rides.length).toBeGreaterThan(0)
    expect(rides[0]).toHaveProperty('name')
    expect(rides[0]).toHaveProperty('ride_code')
  })

  it('should return the correct ride for getRideDetails', async () => {
    const ride = await rideService.getRideDetails('ride-1')
    expect(ride).toBeDefined()
    expect(ride.id).toBe('ride-1')
    expect(ride.name).toBe('Thunder Run')
  })

  it('should update ride status without throwing', async () => {
    await expect(rideService.updateRideStatus('ride-1', 'Active')).resolves.not.toThrow()
  })

  it('should delete a ride without throwing', async () => {
    await expect(rideService.deleteRide('ride-1')).resolves.not.toThrow()
  })

  it('should list community rides', async () => {
    const rides = await rideService.listCommunityRides('comm-1')
    expect(Array.isArray(rides)).toBe(true)
  })
})
