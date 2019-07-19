/**
 * This utility converts a SQL user object to a JS user object
 */

import User from '../models/user.model';
import Role from '../models/role.model';

export function convertSQLUser(row: any) {
    return new User(row.user_id,
                    row.username,
                    row.password,
                    row.first_name,
                    row.last_name,
                    row.email,
                    new Role(row.role_id, row.role_name));
}