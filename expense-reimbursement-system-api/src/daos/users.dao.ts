/**
 * This DAO provides sql access to the ers database,
 * and provides the functionality to interact with it.
 */
import { PoolClient } from 'pg';
import { connectionPool } from '../utils/connection.util';
import { convertSQLUser } from '../utils/convert.user.util';
import User from '../models/user.model';

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
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        const queryString = `
        SELECT *
        FROM ers_user e
        FULL JOIN role r
        ON (e.role = r.role_id)`;
        const result = await client.query(queryString);
        const sqlUsers = result.rows;
        return sqlUsers && sqlUsers.map(convertSQLUser);
    } catch (err) {
        console.log(err);
        return undefined;
    } finally {
        client && client.release();
    }
}

export async function findByUserID(id: number) {
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        const queryString = `
        SELECT *
        FROM ers_user e
        FULL JOIN role r
        ON (e.role = r.role_id)
        WHERE user_id = $1`;
        const result = await client.query(queryString, [id]);
        const sqlUser = result.rows[0];
        return sqlUser && convertSQLUser(sqlUser);
    } catch (err) {
        console.log(err);
        return undefined;
    } finally {
        client && client.release();
    }
}

export async function createUser(user: User) {
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        const queryString = `
        INSERT INTO ers_user (username, password, first_name, last_name, email, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id`;
        const params = [user.username, user.password, user.firstName, user.lastName, user.email, user.role];
        const result = await client.query(queryString, params);
        return result.rows[0].user_id;
    } catch (err) {
        console.log(err);
        return undefined;
    } finally {
        client && client.release();
    }
}

export async function patchUser(user: User) {
    const oldUser = await findByUserID(user.userId);
    if (!oldUser) {
        return undefined;
    }
    user = {
        ...oldUser,
        ...user
    };
    let client: PoolClient;
    try {
        client = await connectionPool.connect(); // basically .then is everything after this
        const queryString = `
            WITH updated_user AS(
                UPDATE ers_user SET username = $1, password = $2, first_name = $3, last_name = $4, email = $5, role = $6
                WHERE user_id = $7
                RETURNING *
                )
            SELECT *
            FROM updated_user u
            FULL JOIN role r
            ON (U.role = r.role_id)
            WHERE user_id = $7
        `;
        const params = [user.username, user.password, user.firstName, user.lastName, user.email, user.role.roleId, user.userId];
        console.log(params);
        const result = await client.query(queryString, params);
        const sqlUser = result.rows[0];
        return convertSQLUser(sqlUser);
    } catch (err) {
        console.log(err);
    } finally {
        client && client.release();
    }
    return undefined;
}