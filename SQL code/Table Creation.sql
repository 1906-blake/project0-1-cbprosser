CREATE TABLE role (
	role_id SERIAL PRIMARY KEY,
	name TEXT UNIQUE
);

CREATE TABLE ers_user (
	user_id SERIAL PRIMARY KEY,
	username TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	firstName TEXT NOT NULL,
	lastName TEXT NOT NULL,
	email TEXT NOT NULL,
	role INTEGER REFERENCES role(role_id) NOT NULL
);

CREATE TABLE reimbursement_status (
	status_id SERIAL PRIMARY KEY,
	status TEXT UNIQUE NOT NULL
);

CREATE TABLE reimbursement_type (
	type_id SERIAL PRIMARY KEY,
	type TEXT UNIQUE NOT NULL
);

CREATE TABLE reimbursement (
	reimbursement_id SERIAL PRIMARY KEY,
	author INTEGER REFERENCES ers_user(user_id) NOT NULL,
	amount NUMERIC(11,2),
	dateSubmitted DATE NOT NULL,
	dateResolved DATE,
	description TEXT NOT NULL,
	resolver INTEGER REFERENCES ers_user(user_id),
	status INTEGER REFERENCES reimbursement_status(status_id) NOT NULL,
	type INTEGER REFERENCES reimbursement_type(type_id)
);