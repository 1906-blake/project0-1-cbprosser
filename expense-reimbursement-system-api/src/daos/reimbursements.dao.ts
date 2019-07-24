/**
 * This DAO provides sql access to the ers database,
 * and provides the functionality to interact with
 * reimbursements.
 */
import Reimbursement from '../models/reimbursement.model';
import { PoolClient } from 'pg';
import { connectionPool } from '../utils/connection.util';
import { convertSQLReimbursement } from '../utils/convert.reimbursement.util';

export async function createReimbursement(reimbursement: Reimbursement) {
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        const queryString = `
        WITH inserted AS(
            WITH cte AS(
                SELECT status_id, type_id
                FROM reimbursement_status s
                JOIN reimbursement_type t
                ON (s.reimbursement_status = 'Pending')
                AND (t.reimbursement_type = $1)
            )
            INSERT INTO reimbursement(author_id, amount, date_submitted, description, status_id, type_id)
            VALUES ($2, $3, current_timestamp, $4, (SELECT status_id FROM cte), (SELECT type_id FROM cte))
            RETURNING *
        )
        SELECT * FROM inserted
        LEFT JOIN reimbursement_status USING (status_id)
        LEFT JOIN reimbursement_type USING (type_id)
        LEFT JOIN author_view USING (author_id)`;
        const params = [reimbursement.type.type, reimbursement.author.userId, reimbursement.amount, reimbursement.description];
        const result = await client.query(queryString, params);
        return convertSQLReimbursement(result.rows[0]);
    } catch (err) {
        console.log(err);
        return undefined;
    } finally {
        client && client.release();
    }
}

export async function findByReimbursementStatus(status: string, count: number, page: number) {
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        const queryString = `
        SELECT * FROM reimbursement r
        LEFT JOIN reimbursement_status USING (status_id)
        LEFT JOIN reimbursement_type USING (type_id)
        LEFT JOIN author_view USING (author_id)
		LEFT JOIN resolver_view USING (resolver_id)
        WHERE reimbursement_status = $1
        ORDER BY date_submitted DESC
        LIMIT $2
        OFFSET $3`;
        const result = await client.query(queryString, [status, count, page]);
        const sqlReimbursement = result.rows;
        return sqlReimbursement && sqlReimbursement.map(convertSQLReimbursement);
    } catch (err) {
        console.log(err);
        return undefined;
    } finally {
        client && client.release();
    }
}

export async function findByReimbursementStatusDateRange(status: string, count: number, page: number, startDate: number, endDate: number) {
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        const queryString = `
        SELECT * FROM reimbursement r
        LEFT JOIN reimbursement_status USING (status_id)
        LEFT JOIN reimbursement_type USING (type_id)
        LEFT JOIN author_view USING (author_id)
		LEFT JOIN resolver_view USING (resolver_id)
        WHERE reimbursement_status = $1
        AND date_submitted between $4 and $5
        ORDER BY date_submitted DESC
        LIMIT $2
        OFFSET $3`;
        const result = await client.query(queryString, [status, count, page, startDate, endDate]);
        const sqlReimbursement = result.rows;
        return sqlReimbursement && sqlReimbursement.map(convertSQLReimbursement);
    } catch (err) {
        console.log(err);
        return undefined;
    } finally {
        client && client.release();
    }
}

export async function findByUserID(id: number, count: number, page: number) {
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        const queryString = `
        SELECT * FROM reimbursement r
        LEFT JOIN reimbursement_status USING (status_id)
        LEFT JOIN reimbursement_type USING (type_id)
		LEFT JOIN author_view USING (author_id)
		LEFT JOIN resolver_view USING (resolver_id)
        WHERE author_id = $1
        ORDER BY date_submitted DESC
        LIMIT $2
        OFFSET $3`;
        const result = await client.query(queryString, [id, count, page]);
        const sqlReimbursement = result.rows;
        return sqlReimbursement && sqlReimbursement.map(convertSQLReimbursement);
    } catch (err) {
        console.log(err);
        return undefined;
    } finally {
        client && client.release();
    }
}

export async function findByUserIDDateRange(id: number, count: number, page: number, startDate: number, endDate: number) {
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        const queryString = `
        SELECT * FROM reimbursement r
        LEFT JOIN reimbursement_status USING (status_id)
        LEFT JOIN reimbursement_type USING (type_id)
		LEFT JOIN author_view USING (author_id)
		LEFT JOIN resolver_view USING (resolver_id)
        WHERE author_id = $1
        AND date_submitted between $4 and $5
        ORDER BY date_submitted DESC
        LIMIT $2
        OFFSET $3`;
        const result = await client.query(queryString, [id, count, page, startDate, endDate]);
        const sqlReimbursement = result.rows;
        return sqlReimbursement && sqlReimbursement.map(convertSQLReimbursement);
    } catch (err) {
        console.log(err);
        return undefined;
    } finally {
        client && client.release();
    }
}

export async function findByReimbursementID(id: number) {
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        const queryString = `
        SELECT * FROM reimbursement
        LEFT JOIN author_view USING (author_id)
        LEFT JOIN resolver_view USING (resolver_id)
        WHERE reimbursement_id = $1`;
        const result = await client.query(queryString, [id]);
        const sqlReimbursement = result.rows[0];
        return convertSQLReimbursement(sqlReimbursement);
    } catch (err) {
        console.log(err);
        return undefined;
    } finally {
        client && client.release();
    }
}

export async function patchReimbursement(reimbursement: Reimbursement) {
    const oldReimbursement = await findByReimbursementID(reimbursement.reimbursementId);
    if (!oldReimbursement) {
        return undefined;
    }
    reimbursement = {
        ...oldReimbursement,
        ...reimbursement
    };
    console.log(reimbursement);
    let client: PoolClient;
    try {
        client = await connectionPool.connect();
        // This query uses a CTE to make two queries into one.
        const queryString = `
            WITH updated_entry AS(
                UPDATE reimbursement
                SET date_resolved = current_timestamp,
                    resolver_id = $1,
                    status_id = (
                        SELECT status_id
                        FROM reimbursement_status
                        WHERE reimbursement_status = $2
                    )
                WHERE reimbursement_id = $3
                RETURNING *
            )
            SELECT * FROM updated_entry
            LEFT JOIN reimbursement_status USING (status_id)
            LEFT JOIN reimbursement_type USING (type_id)`;
        const params = [reimbursement.resolver.userId, reimbursement.status, reimbursement.reimbursementId];
        const result = await client.query(queryString, params);
        const sqlReimbursement = result.rows[0];
        return convertSQLReimbursement(sqlReimbursement);
    } catch (err) {
        console.log(err);
    } finally {
        client && client.release();
    }
    return undefined;
}