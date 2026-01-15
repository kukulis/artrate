export interface User {
    id: number
    name: string
    email: string
    role?: 'user' | 'admin' | 'super_admin'
}
