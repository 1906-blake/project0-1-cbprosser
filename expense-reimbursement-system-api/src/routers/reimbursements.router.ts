/**
 * All requests to this router will stem from /reimbursements
 * This router handles all requests to interact with the
 * reimbursements.
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as reimbursementDAO from '../daos/reimbursements.dao';
import { jwtMiddleware } from '../middleware/jwt-middleware';

export const reimbursementsRouter = express.Router();

/**
 * This returns all reimbursements by their status. This may
 * be accessed by Administrators and Finance managers. It
 * should sort by the date submitted.
 *
 * CHALLENGE: Have the DB sort using
 * /reimbursements/status/:statudId/date-submitted?start=:startDate&end=:endDate
 */
reimbursementsRouter.get('/status/:statusId', [jwtMiddleware(), authMiddleware('Administrator', 'Finance Manager'),
async (req, res) => {
    const reimbursementId = req.params.statusId;
    let count, page;
    const startDate = req.query.startDate, endDate = req.query.endDate;
    if (req.query.count !== undefined && req.query.page !== undefined) {
        count = (req.query.count > 50) ? 50 : (req.query.count < 1) ? 1 : req.query.count;
        page = (req.query.page > 0) ? count * (req.query.page - 1) : 0;
    } else {
        count = 10;
        page = 0;
    }
    if (!reimbursementId) {
        res.sendStatus(400);
    } else {
        let reimbursements;
        if (!startDate || !endDate) {
            reimbursements = await reimbursementDAO.findByReimbursementStatus(reimbursementId, count, page);
        } else {
            reimbursements = await reimbursementDAO.findByReimbursementStatusDateRange(reimbursementId, count, page, startDate, endDate);
        }
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
reimbursementsRouter.get('/author/userId/:id', [jwtMiddleware(), authMiddleware('Administrator', 'Finance Manager', 'Employee'),
async (req, res) => {
    const currentUser = req.decoded.user;
    let count, page;
    const startDate = req.query.startDate, endDate = req.query.endDate;
    if (req.query.count !== undefined && req.query.page !== undefined) {
        count = (req.query.count > 50) ? 50 : (req.query.count < 1) ? 1 : req.query.count;
        page = (req.query.page > 0) ? count * (req.query.page - 1) : 0;
    } else {
        count = 10;
        page = 0;
    }
    if (currentUser && (currentUser.userId === +req.params.id || currentUser.role.role === 'Administrator' || currentUser.role.role === 'Finance Manager')) {
        let users;
        if (!startDate || !endDate) {
            users = await reimbursementDAO.findByUserID(req.params.id, count, page);
        } else {
            users = await reimbursementDAO.findByUserIDDateRange(req.params.id, count, page, startDate, endDate);
        }
        res.json(users);
    } else {
        res.status(400);
        res.json('You can only access your own information.');
    }
}]);

/**
 * This allows a user to create a reimbursement. It will return
 * a status code of 201 CREATED if successful. ReimbursementID
 * should be sent as 0, and the DB will serialize it.
 */
reimbursementsRouter.post('', [jwtMiddleware(), authMiddleware('Administrator', 'Finance Manager', 'Employee'),
async (req, res) => {
    const reimbursement = req.body;
    if (!reimbursement) {
        res.sendStatus(400);
    } else {
        const user = req.decoded.user;
        reimbursement.author = user;
        const result = await reimbursementDAO.createReimbursement(reimbursement);
        res.status(201);
        res.json(result);
    }
}]);

/**
 * This allows a Finance Manager or Administrator to update the
 * status of the reimbursement. ReimbursementID must be the same
 * as the DB, but any missing fields will not be updated. Returns
 * the updated reimbursement.
 */
reimbursementsRouter.patch('', [jwtMiddleware(), authMiddleware('Administrator', 'Finance Manager'),
async (req, res) => {
    const reimbursement = req.body;
    if (!reimbursement) {
        res.sendStatus(400);
    } else {
        const user = req.decoded.user;
        reimbursement.resolver = user;
        const result = await reimbursementDAO.patchReimbursement(reimbursement);
        res.json(result);
    }
}]);