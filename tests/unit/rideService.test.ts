import { describe, it, expect } from 'vitest'
import { rideService } from '@/features/rides/services/rideService'

describe('rideService', () => {
  it('should list all rides accurately', async () => {
    const rides = await rideService.listAllRides()
    expect(rides).toBeDefined()
    expect(Array.isArray(rides)).toBe(true)
    if (rides.length > 0) {
      expect(rides[0]).toHaveProperty('name')
      expect(rides[0]).toHaveProperty('ride_code')
    }
  })

  it('should get ride details by ID', async () => {
    const ride = await rideService.getRideDetails('1')
    expect(ride).toBeDefined()
    expect(ride.id).toBe('1')
    expect(ride.name).toBe('Test Ride')
  })
})
