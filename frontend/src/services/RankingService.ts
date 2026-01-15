import apiClient from './api'
import type {
    RankingResponse,
    RankingFilterParams,
    CreateRankingRequest,
    UpdateRankingRequest,
    RankingUpsertResponse,
    RankingTypeResponse,
    RankingHelperResponse
} from '../types/api'
import { RankingGroup } from "../types/ranking-group"

/**
 * Service for Ranking-related API calls
 */
class RankingService {
    /**
     * Get rankings with optional filters
     */
    async getAll(filter: RankingFilterParams): Promise<RankingResponse[]> {
        const response = await apiClient.get<RankingResponse[]>('/rankings', {
            params: filter
        })

        return response.data
    }

    /**
     * Get a single ranking by ID
     */
    async getById(id: string): Promise<RankingResponse> {
        const response = await apiClient.get<RankingResponse>(`/rankings/${id}`)

        return response.data
    }

    /**
     * Create a new ranking
     */
    async create(ranking: CreateRankingRequest): Promise<RankingResponse> {
        const response = await apiClient.post<RankingResponse>('/rankings', ranking)

        return response.data
    }

    /**
     * Update an existing ranking
     */
    async update(id: string, ranking: UpdateRankingRequest): Promise<RankingResponse> {
        const response = await apiClient.patch<RankingResponse>(`/rankings/${id}`, ranking)

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
    async upsert(rankings: CreateRankingRequest[]): Promise<RankingUpsertResponse> {
        const response = await apiClient.put<RankingUpsertResponse>('/rankings/upsert', rankings)

        return response.data
    }

    /**
     * Get all available ranking types
     */
    async getRankingTypes(group_id?: number): Promise<RankingTypeResponse[]> {
        let params = '';
        if (group_id !== undefined) {
            params = '?group_id=' + group_id
        }
        const response = await apiClient.get<RankingTypeResponse[]>('/ranking-types' + params)

        return response.data
    }

    /**
     * Get all available ranking helpers
     */
    async getRankingHelpers(): Promise<RankingHelperResponse[]> {
        const response = await apiClient.get<RankingHelperResponse[]>('/ranking-helpers')

        return response.data
    }

    async getRankingGroups(articleId: string): Promise<RankingGroup[]> {
        const rankingFilter: RankingFilterParams = {
            article_id: articleId
        }

        const rankings = await this.getAll(rankingFilter)

        return RankingGroup.buildGroups(rankings)
    }
}

// Export a singleton instance
export default new RankingService()
