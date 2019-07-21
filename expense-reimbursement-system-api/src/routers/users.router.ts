/**
 * All requests to this router will stem from /users
 * This router handles all requests to interact with the
 * ers users.
 */

import express from 'express';
import * as usersDAO from '../daos/users.dao';
import { authMiddleware } from '../middleware/auth.middleware';
import { jwtMiddleware } from '../middleware/jwt-middleware';

export const usersRouter = express.Router();

/**
 * This endpoint returns all users on the system if the
 * current user has Administrator or Finance Manager
 * level access.
 */
usersRouter.get('', [jwtMiddleware(), authMiddleware('Administrator', 'Finance Manager'),
async (req, res) => {
    let count, page;
    if (req.query.count !== undefined && req.query.page !== undefined) {
        count = (req.query.count > 10) ? 10 : (req.query.count < 1) ? 1 : req.query.count;
        page = (req.query.page > 0) ? count * (req.query.page - 1) : 0;
    } else {
        count = 10;
        page = 0;
    }
    const users = await usersDAO.findAllUsers(count, page);
    res.json(users);
}]);

/**
 * This endpoint returns a user by their ID. All levels
 * may access this, but employees' IDs must match the
 * provided ID or it won't return.
 */
usersRouter.get('/:id', [jwtMiddleware(), authMiddleware('Administrator', 'Finance Manager' , 'Employee'),
async (req, res) => {
    const currentUser = req.decoded.user;
    if (currentUser && (currentUser.userId === +req.params.id || currentUser.role.role === 'Administrator' || currentUser.role.role === 'Finance Manager')) {
        const users = await usersDAO.findByUserID(req.params.id);
        res.json(users);
    } else {
        res.status(400);
        res.send('You can only access your own information.');
    }
}]);

/**
 * This endpoint creates a new user. Administrators are
 * the only ones with access to this endpoint.
 */
usersRouter.post('', [jwtMiddleware(), authMiddleware('Administrator'),
async (req, res) => {
    const user = req.body;
    if (!user) {
        res.sendStatus(400);
    } else {
        const newUser = await usersDAO.createUser(user);
        if (!newUser) {
            res.sendStatus(400);
        } else {
            newUser;
            res.status(201); // created status code
            res.json(newUser);
        }
    }
}]);

/**
 * This endpoint updates a user. Administrators are the
 * only ones who may access this endpoint.
 */
usersRouter.patch('', [jwtMiddleware(), authMiddleware('Administrator'),
async (req, res) => {
    const userToUpdate = req.body;
    const updatedUser = await usersDAO.patchUser(userToUpdate);
    if (!updatedUser) {
        res.status(400);
        res.send('That user id does not exist.');
    } else {
        res.send(updatedUser);
    }
}]);