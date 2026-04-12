import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import RideDetailPage from '@/features/rides/pages/RideDetailPage'

// Mock the leaflet map as it's hard to test in jsdom
vi.mock('@/features/rides/components/PremiumMap', () => ({
  default: () => <div data-testid="mock-map">Map Intel Active</div>
}))

describe('RideDetailPage Component', () => {
  it('renders ride details correctly from intel', async () => {
    render(
      <MemoryRouter initialEntries={['/ride/1']}>
        <Routes>
          <Route path="/ride/:id" element={<RideDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Check loading state
    expect(screen.getByText(/loading ride details/i)).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Ride')).toBeInTheDocument()
    })

    expect(screen.getByText('TEST01')).toBeInTheDocument()
    expect(screen.getByTestId('mock-map')).toBeInTheDocument()
    expect(screen.getByText(/Total Distance/i)).toBeInTheDocument()
  })
})
