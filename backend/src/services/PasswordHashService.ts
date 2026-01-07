import bcrypt from 'bcrypt';

export class PasswordHashService {
    private readonly saltRounds = 12; // Good balance of security and performance

    /**
     * Hash a plain text password
     */
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    /**
     * Compare plain text password with hash
     */
    async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
