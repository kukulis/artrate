import {PasswordHashService} from "../services/PasswordHashService";

const args = process.argv.slice(2);

async function main() {
    const password = args[0] || 'default';
    const hashService = new PasswordHashService();
    const passwordHash = await hashService.hash(password)
    console.log('password = ' + password + '  passwordHash = ' + passwordHash)
}

main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
});
