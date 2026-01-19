import { DonationRepository } from '../repositories/DonationRepository';
import { Donation, CreateDonationDTO, DonationStatus } from '../entities/Donation';
import { randomBytes } from 'crypto';
import { getConfig } from '../config';
import Paysera from 'paysera-nodejs';

interface CreateDonationResult {
    donation: Donation;
    paymentUrl: string;
}

export class DonationService {
    private donationRepository: DonationRepository;
    private paysera: any;

    constructor(donationRepository: DonationRepository) {
        this.donationRepository = donationRepository;

        const config = getConfig();
        const siteUrl = config.site.url;

        this.paysera = new Paysera({
            projectid: config.paysera.projectId,
            sign_password: config.paysera.signPassword,
            accepturl: `${siteUrl}/donate/success`,
            cancelurl: `${siteUrl}/donate/cancel`,
            callbackurl: `${siteUrl}/api/donations/callback`,
            test: config.nodeEnv !== 'production' ? 1 : 0
        });
    }

    /**
     * Generate a unique donation ID
     */
    private generateId(): string {
        return randomBytes(16).toString('hex');
    }

    /**
     * Generate a unique order ID for Paysera
     */
    private generateOrderId(): string {
        const timestamp = Date.now().toString(36);
        const random = randomBytes(8).toString('hex');

        return `DON-${timestamp}-${random}`;
    }

    /**
     * Create a new donation and return the Paysera payment URL
     */
    async createDonation(data: CreateDonationDTO): Promise<CreateDonationResult> {
        const id = this.generateId();
        const orderId = this.generateOrderId();

        // Create donation record with pending status
        const donation = await this.donationRepository.create({
            id,
            order_id: orderId,
            email: data.email,
            name: data.name || null,
            amount: data.amount,
            currency: 'EUR',
            status: DonationStatus.PENDING,
            paysera_payment_id: null,
            message: data.message || null,
            completed_at: null,
        });

        // Build Paysera payment URL
        const paymentUrl = this.paysera.buildRequestUrl({
            orderid: orderId,
            p_email: data.email,
            amount: data.amount, // Already in cents
            currency: 'EUR',
        });

        return { donation, paymentUrl };
    }

    /**
     * Process Paysera callback
     * Returns the updated donation if successful
     */
    async processCallback(request: { data: string; ss1: string; ss2: string }): Promise<Donation | null> {
        // Verify callback signature
        const isValid = this.paysera.checkCallback(request);
        if (!isValid) {
            throw new Error('Invalid callback signature');
        }

        // Decode callback data
        const callbackData = this.paysera.decode(request.data);
        const orderId = callbackData.orderid;
        const status = callbackData.status;

        // Find donation by order ID
        const donation = await this.donationRepository.findByOrderId(orderId);
        if (!donation) {
            throw new Error(`Donation not found for order ID: ${orderId}`);
        }

        // Map Paysera status to our status
        // Paysera status codes:
        // 0 - payment has not been executed
        // 1 - payment successful
        // 2 - payment accepted but not executed
        // 3 - additional payment info
        let newStatus: typeof DonationStatus[keyof typeof DonationStatus];
        let completedAt: Date | null = null;

        if (status === '1') {
            newStatus = DonationStatus.COMPLETED;
            completedAt = new Date();
        } else if (status === '0') {
            newStatus = DonationStatus.FAILED;
        } else {
            // For other statuses, keep as pending
            newStatus = DonationStatus.PENDING;
        }

        // Update donation
        const updated = await this.donationRepository.update({
            id: donation.id,
            status: newStatus,
            paysera_payment_id: callbackData.requestid || null,
            completed_at: completedAt,
        });

        return updated;
    }

    /**
     * Get donation by order ID
     */
    async getDonationByOrderId(orderId: string): Promise<Donation | null> {
        return this.donationRepository.findByOrderId(orderId);
    }

    /**
     * Get donation by ID
     */
    async getDonationById(id: string): Promise<Donation | null> {
        return this.donationRepository.findById(id);
    }
}
