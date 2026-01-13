import { MockEmailService } from './MockEmailService';

describe('MockEmailService', () => {
    let mockEmail: MockEmailService;

    beforeEach(() => {
        mockEmail = new MockEmailService();
    });

    test('should record sendEmail calls', async () => {
        await mockEmail.sendEmail({
            to: 'test@example.com',
            subject: 'Test Subject',
            text: 'Test Body'
        });

        expect(mockEmail.wasCalled('sendEmail')).toBe(true);
        expect(mockEmail.getCallCount('sendEmail')).toBe(1);

        const lastCall = mockEmail.getLastCallFor('sendEmail');
        expect(lastCall?.args[0]).toEqual({
            to: 'test@example.com',
            subject: 'Test Subject',
            text: 'Test Body'
        });
    });

    test('should record sendConfirmationEmail calls', async () => {
        await mockEmail.sendConfirmationEmail('user@example.com', 'token123');

        expect(mockEmail.wasCalled('sendConfirmationEmail')).toBe(true);
        expect(mockEmail.wasCalledWith('sendConfirmationEmail', 'user@example.com', 'token123')).toBe(true);

        const lastCall = mockEmail.getLastCallFor('sendConfirmationEmail');
        expect(lastCall?.args).toEqual(['user@example.com', 'token123']);
    });

    test('should record sendPasswordResetEmail calls', async () => {
        await mockEmail.sendPasswordResetEmail('user@example.com', 'reset-token');

        expect(mockEmail.wasCalled('sendPasswordResetEmail')).toBe(true);

        const lastCall = mockEmail.getLastCallFor('sendPasswordResetEmail');
        expect(lastCall?.args[0]).toBe('user@example.com');
        expect(lastCall?.args[1]).toBe('reset-token');
    });

    test('should record verifyConnection calls', async () => {
        const result = await mockEmail.verifyConnection();

        expect(result).toBe(true);
        expect(mockEmail.wasCalled('verifyConnection')).toBe(true);
        expect(mockEmail.getCallCount('verifyConnection')).toBe(1);
    });

    test('should track multiple calls', async () => {
        await mockEmail.sendEmail({ to: 'a@test.com', subject: 'Test 1', text: 'Body 1' });
        await mockEmail.sendEmail({ to: 'b@test.com', subject: 'Test 2', text: 'Body 2' });
        await mockEmail.sendConfirmationEmail('c@test.com', 'token1');

        expect(mockEmail.getCallCount()).toBe(3);
        expect(mockEmail.getCallCount('sendEmail')).toBe(2);
        expect(mockEmail.getCallCount('sendConfirmationEmail')).toBe(1);

        const allCalls = mockEmail.getCalls();
        expect(allCalls.length).toBe(3);
        expect(allCalls[0].method).toBe('sendEmail');
        expect(allCalls[1].method).toBe('sendEmail');
        expect(allCalls[2].method).toBe('sendConfirmationEmail');
    });

    test('should clear calls', async () => {
        await mockEmail.sendEmail({ to: 'test@test.com', subject: 'Test', text: 'Body' });
        expect(mockEmail.getCallCount()).toBe(1);

        mockEmail.clearCalls();
        expect(mockEmail.getCallCount()).toBe(0);
        expect(mockEmail.wasCalled('sendEmail')).toBe(false);
    });

    test('should reset mock', async () => {
        await mockEmail.sendConfirmationEmail('test@test.com', 'token');
        expect(mockEmail.getCallCount()).toBe(1);

        mockEmail.reset();
        expect(mockEmail.getCallCount()).toBe(0);
    });

    test('should record timestamps', async () => {
        const before = new Date();
        await mockEmail.sendEmail({ to: 'test@test.com', subject: 'Test', text: 'Body' });
        const after = new Date();

        const lastCall = mockEmail.getLastCall();
        expect(lastCall?.timestamp).toBeInstanceOf(Date);
        expect(lastCall?.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(lastCall?.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
});
