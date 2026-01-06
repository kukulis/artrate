export interface Article {
  id: string
  title: string
  author_id: string
  user_id: number
  content: string
  created_at?: Date
  updated_at?: Date
}
