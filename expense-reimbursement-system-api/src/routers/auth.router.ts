/**
 * All requests in this router will stem from /login
 */

import express from 'express';

export const authRouter = express.Router();

/**
 * Authentication endpoint. When credentials are sent to the /login
 * URL, they are checked against existing credentials. If the user
 * exists, create a session for them, and send the status code 200
 * (Okay). Otherwise, destroy the current session, set the status to
 * 400 (Bad Request), and then send the "Invalid Credentials" message.
 */
authRouter.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = usersDAO.findUserByUserPass(username, password);
    if (user) {
        req.session.user = user;
        res.sendStatus(200);
    }
    req.session.destroy(() => { });
    res.status(400);
    res.send('Invalid credentials');
});

/**
 * Used to check the status of the current session. Mostly for
 * development, will remove.
 */
authRouter.get('/check-session', (req, res) => {
    res.json(req.session);
});