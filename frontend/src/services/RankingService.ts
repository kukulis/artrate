import apiClient from './api'
import type { Ranking, RankingFilter, RankingType, RankingHelper } from '../types/ranking'

/**
 * Service for Ranking-related API calls
 */
class RankingService {
  /**
   * Get rankings with optional filters
   */
  async getAll(filter?: RankingFilter): Promise<Ranking[]> {
    const response = await apiClient.get<Ranking[]>('/rankings', {
      params: filter
    })
    return response.data
  }

  /**
   * Get a single ranking by ID
   */
  async getById(id: string): Promise<Ranking> {
    const response = await apiClient.get<Ranking>(`/rankings/${id}`)
    return response.data
  }

  /**
   * Create a new ranking
   */
  async create(ranking: Omit<Ranking, 'id' | 'created_at' | 'updated_at'>): Promise<Ranking> {
    const response = await apiClient.post<Ranking>('/rankings', ranking)
    return response.data
  }

  /**
   * Update an existing ranking
   */
  async update(id: string, ranking: Omit<Ranking, 'id' | 'created_at' | 'updated_at'>): Promise<Ranking> {
    const response = await apiClient.patch<Ranking>(`/rankings/${id}`, ranking)
    return response.data
  }

  /**
   * Delete a ranking
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/rankings/${id}`)
  }

  /**
   * Upsert multiple rankings
   */
  async upsert(rankings: Omit<Ranking, 'id' | 'created_at' | 'updated_at'>[]): Promise<{ message: string; count: number }> {
    const response = await apiClient.put<{ message: string; count: number }>('/rankings/upsert', rankings)
    return response.data
  }

  /**
   * Get all available ranking types
   */
  async getRankingTypes(group_id?: int): Promise<RankingType[]> {

    let params = '';
    if ( group_id !== undefined) {
      params = '?group_id='+group_id
    }
    const response = await apiClient.get<RankingType[]>('/ranking-types'+params)
    return response.data
  }

  /**
   * Get all available ranking helpers
   */
  async getRankingHelpers(): Promise<RankingHelper[]> {
    const response = await apiClient.get<RankingHelper[]>('/ranking-helpers')
    return response.data
  }
}

// Export a singleton instance
export default new RankingService()
