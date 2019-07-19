/**
 * All requests to this router will stem from /reimbursements
 * This router handles all requests to interact with the
 * reimbursements.
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as reimbursementDAO from '../daos/reimbursements.dao';

export const reimbursementsRouter = express.Router();

/**
 * This returns all reimbursements by their status. This may
 * be accessed by Administrators and Finance managers. It
 * should sort by the date submitted.
 *
 * CHALLENGE: Have the DB sort using
 * /reimbursements/status/:statudId/date-submitted?start=:startDate&end=:endDate
 */
reimbursementsRouter.get('/status/:statusId', [authMiddleware('Administrator', 'Finance Manager'),
async (req, res) => {
    const reimbursementId = req.params.statusId;
    if (!reimbursementId) {
        res.sendStatus(400);
    } else {
        const reimbursements = await reimbursementDAO.findByReimbursementStatus(reimbursementId);
        res.json(reimbursements);
    }
}]);

/**
 * This returns all reimbursements by a single user. This may
 * be accessed by Administrators and Finance Managers, or if
 * the user ID matches the reimbursement user ID. It should be
 * sorted by date submitted.
 *
 * CHALLENGE: As above
 *  /reimbursements/author/userId/:userId/date-submitted?start=:startDate&end=:endDate
 */
reimbursementsRouter.get('/author/userId/:id', [authMiddleware('Administrator', 'Finance Manager', 'Employee'),
async (req, res) => {
    const currentUser = req.session.user;
    if (currentUser && (currentUser.userId === +req.params.id || currentUser.role.role === 'Administrator' || currentUser.role.role === 'Finance Manager')) {
        const users = await reimbursementDAO.findByUserID(req.params.id);
        res.json(users);
    } else {
        res.status(400);
        res.send('You can only access your own information.');
    }
}]);

/**
 * This allows a user to create a reimbursement. It will return
 * a status code of 201 CREATED if successful. ReimbursementID
 * should be sent as 0, and the DB will serialize it.
 */
reimbursementsRouter.post('', [authMiddleware('Administrator', 'Finance Manager', 'Employee'),
async (req, res) => {
    const reimbursement = req.body;
    if (!reimbursement) {
        res.sendStatus(400);
    } else {
        const user = req.session.user;
        reimbursement.author = user;
        const result = await reimbursementDAO.createReimbursement(reimbursement);
        res.send(result);
    }
}]);

/**
 * This allows a Finance Manager or Administrator to update the
 * status of the reimbursement. ReimbursementID must be the same
 * as the DB, but any missing fields will not be updated. Returns
 * the updated reimbursement.
 */
reimbursementsRouter.patch('', (req, res) => {
    res.send('Reimbursement updates functionality still needs implemented!');
});