/**
 * All requests to this router will stem from /reimbursements
 * This router handles all requests to interact with the
 * reimbursements.
 */

import express from 'express';

export const reimbursementsRouter = express.Router();

/**
 * This returns all reimbursements by their status. This may
 * be accessed by Administrators and Finance managers. It
 * should sort by the date submitted.
 *
 * CHALLENGE: Have the DB sort using
 * /reimbursements/status/:statudId/date-submitted?start=:startDate&end=:endDate
 */
reimbursementsRouter.get('/status/:statusId', (req, res) => {
    res.send('Reimbursements by status id functionality still needs implemented!');
});

/**
 * This returns all reimbursements by a single user. This may
 * be accessed by Administrators and Finance Managers, or if
 * the user ID matches the reimbursement user ID. It should be
 * sorted by date submitted.
 *
 * CHALLENGE: As above
 *  /reimbursements/author/userId/:userId/date-submitted?start=:startDate&end=:endDate
 */
reimbursementsRouter.get('/author/userId:userId', (req, res) => {
    res.send('Reimbursements by user functionality still needs implemented!');
});

/**
 * This allows a user to create a reimbursement. It will return
 * a status code of 201 CREATED if successful. ReimbursementID
 * should be sent as 0, and the DB will serialize it.
 */
reimbursementsRouter.post('', (req, res) => {
    res.send('Reimbursement submissions functionality still needs implemented!');
});

/**
 * This allows a Finance Manager or Administrator to update the
 * status of the reimbursement. ReimbursementID must be the same
 * as the DB, but any missing fields will not be updated. Returns
 * the updated reimbursement.
 */
reimbursementsRouter.patch('', (req, res) => {
    res.send('Reimbursement updates functionality still needs implemented!');
});