import { z } from 'zod';

// Full User entity schema (matching database)
export const UserSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    name: z.string().min(1),
    password_hash: z.string().nullable(),
    is_active: z.boolean(),
    role: z.enum(['user', 'admin', 'super_admin']),
    password_reset_token: z.string().nullable(),
    password_reset_expires: z.date().nullable(),
    confirm_token: z.string().nullable(),
    last_login_at: z.date().nullable(),
    created_at: z.date(),
    updated_at: z.date()
});

// Schema for user registration
export const RegisterUserSchema = z.object({
    email: z.string().email("Valid email is required"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    captchaToken: z.string().min(1, "CAPTCHA verification required")
});

// Schema for user login
export const LoginUserSchema = z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(1, "Password is required")
});

// Schema for password reset request
export const PasswordResetRequestSchema = z.object({
    email: z.string().email("Valid email is required"),
    captchaToken: z.string().min(1, "CAPTCHA verification required")
});

// Schema for password reset confirmation
export const PasswordResetConfirmSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
});

// TypeScript types
export type User = z.infer<typeof UserSchema>;
export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;
export type LoginUserDTO = z.infer<typeof LoginUserSchema>;
export type PasswordResetRequestDTO = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetConfirmDTO = z.infer<typeof PasswordResetConfirmSchema>;

// Safe user object (without sensitive data)
export type SafeUser = Omit<User, 'password_hash' | 'password_reset_token' | 'password_reset_expires' | 'confirm_token'>;

