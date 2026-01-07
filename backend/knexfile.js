"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    development: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'artcorrect_db',
        },
        migrations: {
            directory: './migrations',
            extension: 'ts',
            tableName: 'knex_migrations',
        },
        seeds: {
            directory: './seeds',
            extension: 'ts',
        },
    },
    production: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        },
        migrations: {
            directory: './migrations',
            extension: 'ts',
            tableName: 'knex_migrations',
        },
        pool: {
            min: 2,
            max: 10,
        },
    },
};
exports.default = config;
//# sourceMappingURL=knexfile.js.map