import nodemailer, { Transporter } from 'nodemailer';
import { getConfig } from '../config';
import { getLogger, wrapError } from '../logging';

const logger = getLogger();

export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export interface EmailInterface {
    sendEmail(options: EmailOptions): Promise<void>;
    sendConfirmationEmail(email: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
    verifyConnection(): Promise<boolean>;
}

export class EmailService implements EmailInterface {
    private transporter: Transporter;
    private from: string;
    private siteUrl: string;

    constructor() {
        const config = getConfig();

        this.from = config.email.from;
        this.siteUrl = config.site.url;

        this.transporter = nodemailer.createTransport({
            host: config.email.smtpHost,
            port: config.email.smtpPort,
            secure: config.email.smtpSecure,
            auth: {
                user: config.email.smtpUser,
                pass: config.email.smtpPassword
            },
            tls: {
                rejectUnauthorized: false // Accept self-signed certificates
            }
        });
    }

    /**
     * Send generic email
     */
    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: this.from,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html
            });

            logger.info('Email sent successfully', {
                messageId: info.messageId,
                to: options.to,
                subject: options.subject
            });
        } catch (error) {
            logger.error('Failed to send email', wrapError(error));
            throw new Error('Failed to send email');
        }
    }

    /**
     * Send email confirmation link to user
     */
    async sendConfirmationEmail(email: string, token: string): Promise<void> {
        const confirmLink = `${this.siteUrl}/api/auth/confirm?token=${token}`;

        const text = `Please press the link to confirm your login:\n\n${confirmLink}\n\nIf you did not register for this account, please ignore this email.`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Confirm Your Email</h2>
                <p>Please press the link below to confirm your login:</p>
                <p>
                    <a href="${confirmLink}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; display: inline-block; border-radius: 4px;">
                        Confirm Email
                    </a>
                </p>
                <p>Or copy this link into your browser:</p>
                <p style="word-break: break-all;">${confirmLink}</p>
                <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #666;">If you did not register for this account, please ignore this email.</p>
            </div>
        `;

        await this.sendEmail({
            to: email,
            subject: `Confirm your login to ${this.siteUrl}`,
            text,
            html
        });
    }

    /**
     * Send password reset link to user
     */
    async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        const resetLink = `${this.siteUrl}/reset-password?token=${token}`;

        const text = `You requested a password reset.\n\nClick the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email.`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your account.</p>
                <p>Click the button below to reset your password:</p>
                <p>
                    <a href="${resetLink}" style="background-color: #2196F3; color: white; padding: 14px 20px; text-decoration: none; display: inline-block; border-radius: 4px;">
                        Reset Password
                    </a>
                </p>
                <p>Or copy this link into your browser:</p>
                <p style="word-break: break-all;">${resetLink}</p>
                <p style="color: #ff9800; font-weight: bold;">This link will expire in 1 hour.</p>
                <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #666;">If you did not request a password reset, please ignore this email.</p>
            </div>
        `;

        await this.sendEmail({
            to: email,
            subject: `Password reset for ${this.siteUrl}`,
            text,
            html
        });
    }

    /**
     * Verify SMTP connection is working
     */
    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            logger.info('SMTP connection verified');
            return true;
        } catch (error) {
            logger.error('SMTP connection verification failed', wrapError(error));
            return false;
        }
    }
}
