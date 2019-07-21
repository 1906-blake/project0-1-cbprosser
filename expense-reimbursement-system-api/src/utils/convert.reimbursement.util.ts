import Reimbursement from '../models/reimbursement.model';
import User from '../models/user.model';
import ReimbursementStatus from '../models/reimbursement.status.model';
import ReimbursementType from '../models/reimbursement.type.model';

export function convertSQLReimbursement(row: any) {
    return new Reimbursement(row.reimbursement_id,
        new User(row.author_id, row.author_username, '', row.author_first_name, row.author_last_name),
        row.amount,
        row.date_submitted,
        row.date_resolved,
        row.description,
        new User(row.resolver_id, row.resolver_username, '', row.resolver_first_name, row.resolver_last_name),
        new ReimbursementStatus(row.status_id, row.reimbursement_status),
        new ReimbursementType(row.type_id, row.reimbursement_type));
}