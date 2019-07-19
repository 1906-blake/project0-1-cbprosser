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
 * current user has Administrator level access. Finance
 * Manager access returns all users that are not
 * Administrators.
 */
usersRouter.get('', [ authMiddleware('Administrator', 'Finance Manager'),
                      async (req, res) => {
                              const users = await usersDAO.findAllUsers();
                                  res.json(users);
                                } ]);

/**
 * This endpoint returns a user by their ID. All levels
 * may access this, but employees' IDs must match the
 * provided ID or it won't return.
 */
usersRouter.get('/:id', (req, res) => {
    res.send('Find all users by ID functionality still needs implemented!');
});


/**
 * This endpoint updates a user. Administrators are the
 * only ones who may access this endpoint.
 */
usersRouter.patch('/:id', (req, res) => {
    res.send('Update user functionality still needs implemented!');
});