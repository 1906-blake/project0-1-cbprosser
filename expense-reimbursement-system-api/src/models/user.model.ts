import Role from "./role.model";

export default class User {
    constructor(
        userId: number,
        username: string,
        password: string,
        firstName: string,
        lastName: string,
        email: string,
        role: Role
    ) { };
}