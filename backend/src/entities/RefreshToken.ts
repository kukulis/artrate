import { z } from 'zod';

export const RefreshTokenSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    token: z.string(),
    expires_at: z.date(),
    is_revoked: z.boolean(),
    user_agent: z.string().nullable(),
    ip_address: z.string().nullable(),
    created_at: z.date()
});

export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
