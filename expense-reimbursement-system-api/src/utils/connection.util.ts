/**
 * This utility creates a pool of connections for
 * speeding up DB access.
 */
import { Pool } from 'pg';

const connectionConfiguration = {
    user: process.env.ERS_DB_USERNAME,
    password: process.env.ERS_DB_PASSWORD,
    host: process.env.ERS_DB_URL,
    database: process.env.ERS_DB_NAME,
    port: +process.env.ERS_DB_PORT,
    max: 5
};

export const connectionPool = new Pool(connectionConfiguration);