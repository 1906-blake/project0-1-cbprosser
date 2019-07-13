import express from "express"

export const loginRounter = express.Router();

/**
 * All requests in this router will stem from /login
 */

loginRounter.post('', (req, res) => {
    res.send('Login Functionality still needs implemented!');
});