/**
 * This DAO provides sql access to the ers database,
 * and provides the functionality to interact with
 * users.
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
        SELECT * FROM user_no_pass
        LEFT JOIN role USING (role_id)
        WHERE user_id = (
            SELECT user_id FROM ers_user
            WHERE password = (
                SELECT crypt($2, (
                    SELECT password
                    FROM ers_user
                    WHERE username = $1
                    )
                )
            )
        )`;
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

export async function findAllUsers(count: number, page: number) {
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        const queryString = `
        SELECT *, COUNT(*) OVER() AS full_count
        FROM user_no_pass e
        LEFT JOIN role USING (role_id)
        ORDER BY user_id
        LIMIT $1
        OFFSET $2`;
        const result = await client.query(queryString, [count, page]);
        const sqlUsers = result.rows;
        const modelUsersWithCount = sqlUsers && sqlUsers.map(convertSQLUser);
        if (modelUsersWithCount) {
            modelUsersWithCount.push(sqlUsers && sqlUsers[0].full_count);
        }
        return modelUsersWithCount;
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
        FROM user_no_pass e
        LEFT JOIN role USING (role_id)
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
        WITH inserted_user AS(
            INSERT INTO ers_user (username, password, first_name, last_name, email, role_id)
            VALUES ($1, crypt($2, gen_salt('bf', 7)), $3, $4, $5, $6)
            RETURNING *
            )
        SELECT user_id, username, first_name, last_name, email, role_id, role_name
        FROM inserted_user
        LEFT JOIN role USING (role_id)`;
        const params = [user.username, user.password, user.firstName, user.lastName, user.email, user.role];
        const result = await client.query(queryString, params);
        const sqlUser = result.rows[0];
        return convertSQLUser(sqlUser);
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
        client = await connectionPool.connect();

        let queryString, params;
        if (user.password === '') {
            queryString = `
            WITH updated_user AS(
                UPDATE ers_user SET username = $1, first_name = $2, last_name = $3, email = $4, role_id = $5
                WHERE user_id = $6
                RETURNING *
                )
            SELECT user_id, username, first_name, last_name, email, role_id, role_name
            FROM updated_user
            LEFT JOIN role USING (role_id)
            WHERE user_id = $6
        `;
        params = [user.username, user.firstName, user.lastName, user.email, user.role.roleId, user.userId];
        } else {
            queryString = `
            WITH updated_user AS(
                UPDATE ers_user SET username = $1, password = crypt($7, gen_salt('bf', 7)), first_name = $2, last_name = $3, email = $4, role_id = $5
                WHERE user_id = $6
                RETURNING *
                )
            SELECT user_id, username, first_name, last_name, email, role_id, role_name
            FROM updated_user
            LEFT JOIN role USING (role_id)
            WHERE user_id = $6
        `;
        params = [user.username, user.firstName, user.lastName, user.email, user.role.roleId, user.userId, user.password];
        }
        // This query uses a CTE to make two queries into one.
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