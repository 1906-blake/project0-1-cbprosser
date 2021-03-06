/**
 * All requests in this router will stem from /login
 */

import express from 'express';
import * as usersDAO from '../daos/users.dao';
import * as jwt from 'jsonwebtoken';
import { jwtConfiguration } from '../config/jwt-config';
import { jwtMiddleware } from '../middleware/jwt-middleware';

export const authRouter = express.Router();

/**
 * Authentication endpoint. When credentials are sent to the /login
 * URL, they are checked against existing credentials. If the user
 * exists, create a session for them, and send the status code 200
 * (Okay). Otherwise, destroy the current session, set the status to
 * 400 (Bad Request), and then send the "Invalid Credentials" message.
 */
authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await usersDAO.findUserByUserPass(username, password);
    if (user) {
        const token = jwt.sign({ user: user },
            jwtConfiguration.secret,
            {
                expiresIn: '24h'
            }
        );
        res.status(200);
        res.json({
            success: true,
            message: 'Authentication successful!',
            token: token
        });
    } else {
        req.session.destroy(() => { });
        res.status(400);
        res.json('Invalid credentials');
    }
});

authRouter.get('/login/check', [jwtMiddleware(), async (req, res) => {
    const user = await usersDAO.findByUserID(req.decoded.user.userId);
    if (user) {
        const token = jwt.sign({ user: user },
            jwtConfiguration.secret,
            {
                expiresIn: '24h'
            }
        );
        res.status(200);
        res.json({
            success: true,
            message: 'New Token Supplied!',
            token: token
        });
    } else {
        req.session.destroy(() => { });
        res.status(400);
        res.json('User no longer exists!');
    }
}]);