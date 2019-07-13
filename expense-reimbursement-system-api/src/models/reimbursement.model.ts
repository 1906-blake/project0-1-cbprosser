import User from "./user.model";
import ReimbursementStatus from "./reimbursement.status";
import ReimbursementType from "./reimbursement.type";

export default class Reimbursement {
    constructor(
        reimbursementId: number,
        author: User,
        amount: number,
        dateSubmitted: number,
        dateResolved: number,
        description: string,
        resolver: User,
        status: ReimbursementStatus,
        type: ReimbursementType
    ) { };
}