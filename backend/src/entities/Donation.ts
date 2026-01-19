import { z } from 'zod';

// Donation status enum
export const DonationStatus = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
} as const;

export type DonationStatusType = typeof DonationStatus[keyof typeof DonationStatus];

// Zod schema for Donation
export const DonationSchema = z.object({
    id: z.string(),
    order_id: z.string(),
    email: z.string().email("Invalid email address"),
    name: z.string().nullable(),
    amount: z.number().int().positive("Amount must be positive"), // cents
    currency: z.string().length(3).default('EUR'),
    status: z.enum(['pending', 'completed', 'failed', 'cancelled']).default('pending'),
    paysera_payment_id: z.string().nullable(),
    message: z.string().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
    completed_at: z.date().nullable(),
});

// Schema for creating donations (from user input)
export const CreateDonationSchema = z.object({
    email: z.string().email("Invalid email address"),
    amount: z.number().int().min(100, "Minimum donation is 1 EUR"), // cents, minimum 1 EUR
    name: z.string().max(255).optional(),
    message: z.string().max(1000).optional(),
});

// Schema for Paysera callback
export const PayseraCallbackSchema = z.object({
    orderid: z.string(),
    status: z.string(),
});

// TypeScript types inferred from schemas
export type Donation = z.infer<typeof DonationSchema>;
export type CreateDonationDTO = z.infer<typeof CreateDonationSchema>;
export type PayseraCallbackDTO = z.infer<typeof PayseraCallbackSchema>;
