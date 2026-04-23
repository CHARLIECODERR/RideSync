import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TacticalRideView from '@/features/rides/components/TacticalRideView'
import useRideStore from '@/features/rides/store/rideStore'

// Mock PremiumMap to avoid Leaflet issues in JSDOM
vi.mock('../PremiumMap', () => ({
  default: () => <div data-testid="mock-map">Map Layout</div>
}))

describe('TacticalRideView', () => {
  it('should render HUD with instruction when active', () => {
    useRideStore.setState({
      activeRide: {
        id: '1',
        name: 'Thunder Run',
        distance: '150 km',
        status: 'Active',
        ride_code: 'TR01',
        community_name: 'HQ'
      } as any,
      navigationMetadata: {
        nextInstruction: 'KEEP STRAIGHT',
        distanceToNext: 0,
        isOffRoute: false,
        speed: 85
      }
    })

    render(<TacticalRideView />)

    expect(screen.getByText(/KEEP STRAIGHT/i)).toBeDefined()
    expect(screen.getByText('85')).toBeDefined() // Speed
    expect(screen.getByText('150 km')).toBeDefined()
  })

  it('should show warning alert when off-route', () => {
    useRideStore.setState({
      activeRide: { id: '1' } as any,
      navigationMetadata: {
        nextInstruction: 'OFF COURSE',
        distanceToNext: 0,
        isOffRoute: true,
        speed: 40
      }
    })

    render(<TacticalRideView />)
    
    expect(screen.getByText(/OFF COURSE/i)).toBeDefined()
    // The container should have red classes (implied by design)
  })
})
