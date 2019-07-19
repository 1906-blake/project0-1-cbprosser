/**
 * This DAO provides sql access to the ers database,
 * and provides the functionality to interact with it.
 */
import { PoolClient } from 'pg';
import { connectionPool } from '../utils/connection.util';
import { convertSQLUser } from '../utils/convert.user.util';
import { authMiddleware } from '../middleware/auth.middleware';

export async function findUserByUserPass(username: string, password: string) {
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        const queryString = `
        SELECT *
        FROM ers_user e
        FULL JOIN role r
        ON (e.role = r.role_id)
        WHERE username = $1
        AND password = $2`;
        const result = await client.query(queryString, [username, password]);
        const sqlUser = result.rows[0];
        return sqlUser && convertSQLUser(sqlUser);
    } catch (err) {
        console.log(err);
        return undefined;
    } finally {
        client && client.release();
    }
}

export async function findAllUsers() {
    authMiddleware('Administrator', 'Manager');
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        const queryString = `
        SELECT *
        FROM ers_user`;
        const result = await client.query(queryString);
        const sqlUser = result.rows;
        return sqlUser && sqlUser.map(convertSQLUser);
    } catch (err) {
        console.log(err);
        return undefined;
    } finally {
        client && client.release();
    }
}