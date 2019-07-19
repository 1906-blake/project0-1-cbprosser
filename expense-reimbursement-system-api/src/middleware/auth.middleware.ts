/**
 * Authentication middleware configuration. Checks if the user
 * has the proper role to access the information requested. If the
 * user does not exist, it sends status code 401 (Unauthorized).
 * If the user exists, it send status code 403 (Forbidden).
 * Otherwise, it passes through to the intended request.
 * @param roles The roles passed into the authenticator to check
 *              if the user has access.
 */

export const authMiddleware = (...roles: string[]) => (req, res, next) => {
    const userRole = req.session.user;
    if (userRole) {
        if (roles.includes(userRole.role.role)) {
            next();
        } else {
            res.status(403);
            res.send('You are not authorized for this operation');
        }
    } else {
        res.status(401);
        res.send('You are not authorized for this operation');
    }
};