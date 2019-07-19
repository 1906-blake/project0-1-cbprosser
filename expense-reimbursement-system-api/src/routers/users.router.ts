/**
 * All requests to this router will stem from /users
 * This router handles all requests to interact with the
 * ers users.
 */

import express from 'express';
import * as usersDAO from '../daos/users.dao';
import { authMiddleware } from '../middleware/auth.middleware';

export const usersRouter = express.Router();

/**
 * This endpoint returns all users on the system if the
 * current user has Administrator or Finance Manager
 * level access.
 */
usersRouter.get('', [authMiddleware('Administrator', 'Finance Manager'),
async (req, res) => {
    const users = await usersDAO.findAllUsers();
    res.json(users);
}]);

/**
 * This endpoint returns a user by their ID. All levels
 * may access this, but employees' IDs must match the
 * provided ID or it won't return.
 */
usersRouter.get('/:id', [authMiddleware('Administrator', 'Finance Manager' , 'Employee'),
async (req, res) => {
    const user = req.session.user;
    if (user && (user.userId === +req.params.id || user.role.role === 'Administrator' || user.role.role === 'Finance Manager')) {
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
usersRouter.post('', [authMiddleware('Administrator'),
async (req, res) => {
    const user = req.body;
    if (!user) {
        res.sendStatus(400);
    } else {
        const id = await usersDAO.createUser(user);
        if (!id) {
            res.sendStatus(400);
        } else {
            user.id = id;
            res.status(201); // created status code
            res.json(user);
        }
    }
}]);

/**
 * This endpoint updates a user. Administrators are the
 * only ones who may access this endpoint.
 */
usersRouter.patch('', [authMiddleware('Administrator'),
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