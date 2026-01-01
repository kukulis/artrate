import { RankingType } from '../types/RankingType';

export interface Ranking {
  id: string;
  ranking_type: string;  // Stores RankingType.code
  user_id: string;
  value: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRankingDTO {
  id: string;
  ranking_type: string;  // Should be a valid RankingType.code
  user_id: string;
  value: number;
}

export interface UpdateRankingDTO {
  ranking_type?: string;  // Should be a valid RankingType.code
  user_id?: string;
  value?: number;
}

// Helper functions for working with RankingType
export const RankingHelpers = {
  /**
   * Get the RankingType object for a ranking.
   * @param ranking - The ranking entity
   * @returns RankingType instance or undefined if invalid
   */
  getRankingType(ranking: Ranking): RankingType | undefined {
    return RankingType.fromCode(ranking.ranking_type);
  },

  /**
   * Check if a ranking has a valid ranking type.
   * @param ranking - The ranking entity
   * @returns true if ranking_type is valid
   */
  hasValidType(ranking: Ranking): boolean {
    return RankingType.isValid(ranking.ranking_type);
  },

  /**
   * Get the description for a ranking's type.
   * @param ranking - The ranking entity
   * @returns Description string or undefined if invalid
   */
  getTypeDescription(ranking: Ranking): string | undefined {
    return this.getRankingType(ranking)?.description;
  }
};
