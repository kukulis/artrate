export interface Author {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAuthorDTO {
  id: string;
  name: string;
  description: string;
}

export interface UpdateAuthorDTO {
  name?: string;
  description?: string;
}
