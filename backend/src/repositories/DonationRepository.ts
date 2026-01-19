import { Donation, DonationStatusType } from '../entities/Donation';
import { Pool } from "mysql2/promise";

export class DonationRepository {

    private pool: Pool;

    public constructor(pool: Pool) {
        this.pool = pool;
    }

    /**
     * Find donation by ID
     */
    async findById(id: string): Promise<Donation | null> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>('SELECT * FROM donations WHERE id = ?', [id]);

            return rows.length > 0 ? (rows[0] as Donation) : null;
        } finally {
            connection.release();
        }
    }

    /**
     * Find donation by order ID
     */
    async findByOrderId(orderId: string): Promise<Donation | null> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>('SELECT * FROM donations WHERE order_id = ?', [orderId]);

            return rows.length > 0 ? (rows[0] as Donation) : null;
        } finally {
            connection.release();
        }
    }

    /**
     * Find all donations
     */
    async findAll(): Promise<Donation[]> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>('SELECT * FROM donations ORDER BY created_at DESC');

            return rows as Donation[];
        } finally {
            connection.release();
        }
    }

    /**
     * Find donations by status
     */
    async findByStatus(status: DonationStatusType): Promise<Donation[]> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>(
                'SELECT * FROM donations WHERE status = ? ORDER BY created_at DESC',
                [status]
            );

            return rows as Donation[];
        } finally {
            connection.release();
        }
    }

    /**
     * Create a new donation
     */
    async create(data: Omit<Donation, 'created_at' | 'updated_at'>): Promise<Donation> {
        const connection = await this.pool.getConnection();
        try {
            await connection.query(
                `INSERT INTO donations (id, order_id, email, name, amount, currency, status, paysera_payment_id, message, completed_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.id,
                    data.order_id,
                    data.email,
                    data.name,
                    data.amount,
                    data.currency,
                    data.status,
                    data.paysera_payment_id,
                    data.message,
                    data.completed_at
                ]
            );

            const created = await this.findById(data.id);
            if (!created) {
                throw new Error('Failed to retrieve created donation');
            }

            return created;
        } finally {
            connection.release();
        }
    }

    /**
     * Update an existing donation
     */
    async update(data: Partial<Donation> & { id: string }): Promise<Donation | null> {
        const connection = await this.pool.getConnection();
        try {
            const updates: string[] = [];
            const values: any[] = [];

            if (data.email !== undefined) {
                updates.push('email = ?');
                values.push(data.email);
            }
            if (data.name !== undefined) {
                updates.push('name = ?');
                values.push(data.name);
            }
            if (data.amount !== undefined) {
                updates.push('amount = ?');
                values.push(data.amount);
            }
            if (data.currency !== undefined) {
                updates.push('currency = ?');
                values.push(data.currency);
            }
            if (data.status !== undefined) {
                updates.push('status = ?');
                values.push(data.status);
            }
            if (data.paysera_payment_id !== undefined) {
                updates.push('paysera_payment_id = ?');
                values.push(data.paysera_payment_id);
            }
            if (data.message !== undefined) {
                updates.push('message = ?');
                values.push(data.message);
            }
            if (data.completed_at !== undefined) {
                updates.push('completed_at = ?');
                values.push(data.completed_at);
            }

            if (updates.length === 0) {
                return this.findById(data.id);
            }

            updates.push('updated_at = NOW()');
            values.push(data.id);

            await connection.query(
                `UPDATE donations
                 SET ${updates.join(', ')}
                 WHERE id = ?`,
                values
            );

            return this.findById(data.id);
        } finally {
            connection.release();
        }
    }
}
