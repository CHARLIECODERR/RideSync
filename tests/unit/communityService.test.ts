import { describe, it, expect } from 'vitest'
import { communityService } from '@/features/community/services/communityService'

describe('communityService', () => {
  it('should list all communities with counts', async () => {
    const communities = await communityService.listCommunities()
    expect(communities.length).toBeGreaterThan(0)
    expect(communities[0].members_count).toBe(10)
    expect(communities[0].rides_count).toBe(5)
  })

  it('should get community details', async () => {
    const community = await communityService.getCommunity('comm-1')
    expect(community.name).toBe('Viking Path')
  })

  it('should fetch my role in a community', async () => {
    const role = await communityService.getMyRole('comm-1')
    expect(role).toBe('Admin')
  })
})
