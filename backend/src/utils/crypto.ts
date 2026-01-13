import crypto from 'crypto';

/**
 * Generate a cryptographically secure random string
 * @param length - Length of the string in characters (default: 32)
 * @param encoding - Encoding format: 'hex' (default), 'base64', or 'base64url'
 * @returns Random string
 *
 * @example
 * generateRandomString(32) // Returns 64 hex characters (32 bytes)
 * generateRandomString(32, 'base64') // Returns 44 base64 characters (32 bytes)
 * generateRandomString(32, 'base64url') // Returns 43 URL-safe base64 characters (32 bytes)
 */
export function generateRandomString(
    length: number = 32,
    encoding: 'hex' | 'base64' | 'base64url' = 'hex'
): string {
    const bytes = crypto.randomBytes(length);

    switch (encoding) {
        case 'hex':
            return bytes.toString('hex');
        case 'base64':
            return bytes.toString('base64');
        case 'base64url':
            return bytes.toString('base64url');
        default:
            return bytes.toString('hex');
    }
}

/**
 * Generate a cryptographically secure random token (alias for common use case)
 * @param byteLength - Number of random bytes (default: 32)
 * @returns Hex-encoded random string
 */
export function generateSecureToken(byteLength: number = 32): string {
    return generateRandomString(byteLength, 'hex');
}

/**
 * Generate a URL-safe random string (useful for tokens in URLs)
 * @param byteLength - Number of random bytes (default: 32)
 * @returns URL-safe base64-encoded string
 */
export function generateUrlSafeToken(byteLength: number = 32): string {
    return generateRandomString(byteLength, 'base64url');
}
