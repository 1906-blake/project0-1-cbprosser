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
            VALUES ($2, $3, current_timestamp, $4, (SELECT status_id FROM cte), (SELECT type_id FROM CTE))
            RETURNING *
        )
        SELECT * FROM inserted
        JOIN reimbursement_status USING (status_id)
        JOIN reimbursement_type USING (type_id)`;
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