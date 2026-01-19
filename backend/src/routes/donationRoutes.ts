import { Router } from 'express';
import { DonationController } from '../controllers/DonationController';
import { DonationRepository } from '../repositories/DonationRepository';
import { DonationService } from '../services/DonationService';
import { Pool } from 'mysql2/promise';

/**
 * Create donation routes with a given connection pool
 * This allows tests to inject their own pool for better isolation
 */
export function createDonationRoutes(dbPool: Pool) {
    const router = Router();

    const donationRepository = new DonationRepository(dbPool);
    const donationService = new DonationService(donationRepository);
    const donationController = new DonationController(donationService);

    /**
     * @route   POST /api/donations
     * @desc    Create a new donation and get payment URL
     * @access  Public
     */
    router.post('/', donationController.createDonation);

    /**
     * @route   GET /api/donations/callback
     * @desc    Handle Paysera callback (server-to-server)
     * @access  Public (called by Paysera)
     */
    router.get('/callback', donationController.handleCallback);

    /**
     * @route   GET /api/donations/:orderId/status
     * @desc    Get donation status by order ID
     * @access  Public
     */
    router.get('/:orderId/status', donationController.getDonationStatus);

    return router;
}
