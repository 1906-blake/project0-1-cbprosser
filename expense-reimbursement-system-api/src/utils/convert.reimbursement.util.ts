import Reimbursement from '../models/reimbursement.model';
import User from '../models/user.model';
import ReimbursementStatus from '../models/reimbursement.status.model';
import ReimbursementType from '../models/reimbursement.type.model';

export function convertSQLReimbursement(row: any) {
    return new Reimbursement(row.reimbursement_id,
        new User(row.author_id),
        row.amount,
        row.date_submitted,
        row.date_resolved,
        row.description,
        new User(row.resolver_id),
        new ReimbursementStatus(row.status_id),
        new ReimbursementType(row.type_id));
}