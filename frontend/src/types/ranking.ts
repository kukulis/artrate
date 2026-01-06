export interface Ranking {
  id: string
  ranking_type: string
  helper_type: string
  user_id: string
  article_id: string
  value: number
  description: string
  created_at?: Date
  updated_at?: Date
}

export interface RankingFilter {
  user_id?: string
  article_id?: string
  ranking_type?: string
  ranking_helper?: string
}

export interface RankingType {
  code: string
  description: string
}

export interface RankingHelper {
  code: string
  description: string
}
