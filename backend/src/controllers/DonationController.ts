import { Request, Response } from 'express';
import { DonationService } from '../services/DonationService';
import { CreateDonationSchema } from '../entities/Donation';
import { ControllerHelper } from './ControllerHelper';
import { getLogger, wrapError } from '../logging';

const logger = getLogger();

export class DonationController {
    private donationService: DonationService;

    constructor(donationService: DonationService) {
        this.donationService = donationService;
    }

    /**
     * POST /api/donations
     * Create a new donation and return payment URL
     */
    createDonation = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate and parse request body with Zod
            const validatedData = CreateDonationSchema.parse(req.body);

            const result = await this.donationService.createDonation(validatedData);

            res.status(201).json({
                donation: {
                    id: result.donation.id,
                    order_id: result.donation.order_id,
                    amount: result.donation.amount,
                    currency: result.donation.currency,
                    status: result.donation.status,
                },
                paymentUrl: result.paymentUrl,
            });
        } catch (error) {
            if (ControllerHelper.handleZodError(error, res)) {
                logger.warn('ZOD Error creating donation', wrapError(error));

                return;
            }

            logger.error('Error creating donation', wrapError(error));
            res.status(500).json({
                error: 'Failed to create donation',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    /**
     * GET /api/donations/callback
     * Handle Paysera callback (server-to-server)
     */
    handleCallback = async (req: Request, res: Response): Promise<void> => {
        try {
            const { data, ss1, ss2 } = req.query;

            if (typeof data !== 'string' || typeof ss1 !== 'string' || typeof ss2 !== 'string') {
                logger.warn('Invalid callback parameters');
                res.status(400).send('Invalid parameters');

                return;
            }

            await this.donationService.processCallback({ data, ss1, ss2 });

            // Paysera expects "OK" response
            res.status(200).send('OK');
        } catch (error) {
            logger.error('Error processing callback', wrapError(error));
            // Still return OK to prevent Paysera from retrying indefinitely
            // Log the error for investigation
            res.status(200).send('OK');
        }
    };

    /**
     * GET /api/donations/:orderId/status
     * Get donation status by order ID
     */
    getDonationStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { orderId } = req.params;
            const donation = await this.donationService.getDonationByOrderId(orderId);

            if (!donation) {
                res.status(404).json({ error: 'Donation not found' });

                return;
            }

            res.json({
                id: donation.id,
                order_id: donation.order_id,
                status: donation.status,
                amount: donation.amount,
                currency: donation.currency,
                completed_at: donation.completed_at,
            });
        } catch (error) {
            logger.error('Error getting donation status', wrapError(error));
            res.status(500).json({
                error: 'Failed to get donation status',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
}
