import Role from './role.model';

export default class User {
    constructor(
        public userId: number,
        public username: string,
        password: string,
        public firstName: string,
        public lastName: string,
        email: string,
        public role: Role
    ) { }
}