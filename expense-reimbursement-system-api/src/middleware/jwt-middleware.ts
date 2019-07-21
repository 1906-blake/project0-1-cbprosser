import * as jwt from 'jsonwebtoken';
import { jwtConfiguration } from '../config/jwt-config';

export const jwtMiddleware = () => (req, res, next) => {
    let token = req.headers['authorization'];
    if (token) {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        jwt.verify(token, jwtConfiguration.secret, (err, decoded) => {
            if (err) {
                return res.json('Invalid JWT');
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.status(400);
        return res.json('JWT not supplied');
    }
};