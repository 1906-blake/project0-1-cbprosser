import express from 'express';

export const usersRouter = express.Router();

/**
 * All requests to this router will stem from /users
 */

usersRouter.get('', (req, res) => {
    res.send("Find all users functionality still needs implemented!");
});

usersRouter.get('/:id', (req, res) => {
    res.send("Find all users by ID functionality still needs implemented!");
});

usersRouter.patch('', (req, res) => {
    res.send("Update user functionality still needs implemented!");
});