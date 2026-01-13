import {Knex} from 'knex';
import {User} from "../src/entities";
import {PasswordHashService} from "../src/services/PasswordHashService";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.resolve(__dirname, '../.env'),
    override: true
});


dotenv.config();

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    // await knex('users').del();

    const passwordHashService = new PasswordHashService()
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'aaa'
    console.log('defaultAdminPassword=' + defaultAdminPassword)


    const users: Partial<User> [] = [
        {
            id: 1,
            email: 'admin@darbelis.eu',
            name: 'Admin User',
            role: 'admin',
            is_active: true,
            password_hash: await passwordHashService.hash(defaultAdminPassword),
        },
        {
            email: 'user@darbelis.eu',
            name: 'Sample User',
        },
    ]

    for (const user of users) {
        const existingUser = await knex('users').where('email', user.email).select('*').first()
        if (existingUser !== undefined) {
            console.log('existing User :' + existingUser.email + ' ' + existingUser.id)
            continue;
        }

        console.log('Creating user ' + user.email)
        await knex('users').insert([
            user,
        ]);
    }
}
