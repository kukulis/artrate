import { EmailInterface, EmailOptions } from './EmailService';

export interface EmailCall {
    method: 'sendEmail' | 'sendConfirmationEmail' | 'sendPasswordResetEmail' | 'verifyConnection';
    args: any[];
    timestamp: Date;
}

export class MockEmailService implements EmailInterface {
    private calls: EmailCall[] = [];

    async sendEmail(options: EmailOptions): Promise<void> {
        this.calls.push({
            method: 'sendEmail',
            args: [options],
            timestamp: new Date()
        });
    }

    async sendConfirmationEmail(email: string, token: string): Promise<void> {
        this.calls.push({
            method: 'sendConfirmationEmail',
            args: [email, token],
            timestamp: new Date()
        });
    }

    async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        this.calls.push({
            method: 'sendPasswordResetEmail',
            args: [email, token],
            timestamp: new Date()
        });
    }

    async verifyConnection(): Promise<boolean> {
        this.calls.push({
            method: 'verifyConnection',
            args: [],
            timestamp: new Date()
        });
        return true;
    }

    /**
     * Get all recorded method calls
     */
    getCalls(): EmailCall[] {
        return [...this.calls];
    }

    /**
     * Get calls for a specific method
     */
    getCallsFor(method: EmailCall['method']): EmailCall[] {
        return this.calls.filter(call => call.method === method);
    }

    /**
     * Get the last call made
     */
    getLastCall(): EmailCall | undefined {
        return this.calls[this.calls.length - 1];
    }

    /**
     * Get the last call for a specific method
     */
    getLastCallFor(method: EmailCall['method']): EmailCall | undefined {
        const calls = this.getCallsFor(method);
        return calls[calls.length - 1];
    }

    /**
     * Check if a method was called
     */
    wasCalled(method: EmailCall['method']): boolean {
        return this.calls.some(call => call.method === method);
    }

    /**
     * Check if a method was called with specific arguments
     */
    wasCalledWith(method: EmailCall['method'], ...args: any[]): boolean {
        return this.calls.some(call =>
            call.method === method &&
            JSON.stringify(call.args) === JSON.stringify(args)
        );
    }

    /**
     * Get count of calls for a specific method
     */
    getCallCount(method?: EmailCall['method']): number {
        if (method) {
            return this.getCallsFor(method).length;
        }
        return this.calls.length;
    }

    /**
     * Clear all recorded calls
     */
    clearCalls(): void {
        this.calls = [];
    }

    /**
     * Reset the mock (alias for clearCalls)
     */
    reset(): void {
        this.clearCalls();
    }
}
