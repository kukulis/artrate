import dotenv from 'dotenv';
import { initConfig } from '../config';
import { EmailInterface, EmailService } from '../services/EmailService';

dotenv.config();

async function sendTestEmail() {
    // Initialize configuration
    initConfig();

    // Create email service
    const emailService: EmailInterface = new EmailService();

    // Verify connection
    const connected = await emailService.verifyConnection();
    if (!connected) {
        console.error('SMTP connection failed');
        process.exit(1);
    }

    console.log('SMTP connection successful');

    // Send test email
    try {
        await emailService.sendEmail({
            to: 'giedrius@darbelis.eu',
            subject: 'test artcorrect',
            text: 'press link\n\nhttp://darbelis.eu',
            html: '<p>press link</p><p><a href="http://darbelis.eu">http://darbelis.eu</a></p>'
        });

        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Failed to send email:', error);
        process.exit(1);
    }
}

sendTestEmail();
