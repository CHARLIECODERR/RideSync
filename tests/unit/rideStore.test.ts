import { describe, it, expect, beforeEach, vi } from 'vitest'
import useRideStore from '@/features/rides/store/rideStore'

describe('rideStore', () => {
  beforeEach(() => {
    useRideStore.setState({
      activeRide: null,
      isRideModeActive: false,
      navigationMetadata: null,
      currentUserLocation: null
    })
  })

  it('should toggle ride mode', () => {
    const { setRideMode } = useRideStore.getState()
    setRideMode(true)
    expect(useRideStore.getState().isRideModeActive).toBe(true)
  })

  it('should update navigation metadata', () => {
    const { updateNavigationMetadata } = useRideStore.getState()
    const meta = { nextInstruction: 'Turn Left', distanceToNext: 100, isOffRoute: false, speed: 60 }
    updateNavigationMetadata(meta)
    expect(useRideStore.getState().navigationMetadata).toEqual(meta)
  })

  it('should clear telemetry on endRide', async () => {
    // Mocking cleanup
    useRideStore.setState({ watchId: 123, currentUserLocation: { lat: 10, lng: 10 } })
    
    // We need to mock window.navigator.geolocation
    const clearWatchMock = vi.fn()
    vi.stubGlobal('navigator', {
      geolocation: {
        clearWatch: clearWatchMock
      }
    })

    await useRideStore.getState().endRide('ride-1')
    
    expect(useRideStore.getState().watchId).toBeNull()
    expect(useRideStore.getState().currentUserLocation).toBeNull()
  })
})
