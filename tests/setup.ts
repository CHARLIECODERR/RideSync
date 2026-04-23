import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

export const server = setupServer(...handlers)

// Start server before all tests — use 'warn' so unhandled internal Supabase
// calls (WebSocket, realtime) don't crash the test suite.
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Reset handlers after each test for isolation
afterEach(() => server.resetHandlers())

// Close server after all tests
afterAll(() => server.close())

// ── Global browser API stubs ────────────────────────────────────────────────
// navigator.geolocation is not present in JSDOM
const geolocationMock = {
  getCurrentPosition: vi.fn((success) =>
    success({ coords: { latitude: 12.9716, longitude: 77.5946, speed: 0 }, timestamp: Date.now() })
  ),
  watchPosition: vi.fn(() => 42),
  clearWatch: vi.fn(),
}
vi.stubGlobal('navigator', { ...navigator, geolocation: geolocationMock })

// window.matchMedia stub needed by some UI components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// ResizeObserver stub
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
