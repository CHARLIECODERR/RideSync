import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockProfile } from '../mocks/supabaseMock'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      then: (resolve: any) => Promise.resolve({ data: [mockProfile], error: null }).then(resolve),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
    },
  },
}))

import { authService } from '@/features/auth/services/authService'

describe('authService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should fetch a user profile by ID', async () => {
    const profile = await authService.getProfile('test-user-id')
    expect(profile).toBeDefined()
    expect(profile?.id).toBe('test-user-id')
    expect(profile?.name).toBe('Test Rider')
    expect(profile?.email).toBe('test@example.com')
  })

  it('should create a new profile', async () => {
    const profile = await authService.createProfile('new-user', 'New Rider', 'new@example.com')
    expect(profile).toBeDefined()
    expect(profile.id).toBe('test-user-id') // mock returns same shape
  })

  it('should update an existing profile', async () => {
    const updated = await authService.updateProfile({
      id: 'test-user-id',
      name: 'Updated Name',
    })
    expect(updated).toBeDefined()
    expect(updated.id).toBe('test-user-id')
  })
})
