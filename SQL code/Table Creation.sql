CREATE TABLE role (
	role_id SERIAL PRIMARY KEY,
	role_name TEXT UNIQUE
);

CREATE TABLE ers_user (
	user_id SERIAL PRIMARY KEY,
	username TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	email TEXT NOT NULL,
	role_id INTEGER REFERENCES role(role_id) NOT NULL
);

CREATE TABLE reimbursement_status (
	status_id SERIAL PRIMARY KEY,
	reimbursement_status TEXT UNIQUE NOT NULL
);

CREATE TABLE reimbursement_type (
	type_id SERIAL PRIMARY KEY,
	reimbursement_type TEXT UNIQUE NOT NULL
);

CREATE TABLE reimbursement (
	reimbursement_id SERIAL PRIMARY KEY,
	author_id INTEGER REFERENCES ers_user(user_id) NOT NULL,
	amount NUMERIC(11,2),
	date_submitted TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	date_resolved TIMESTAMP WITHOUT TIME ZONE,
	description TEXT NOT NULL,
	resolver_id INTEGER REFERENCES ers_user(user_id),
	status_id INTEGER REFERENCES reimbursement_status(status_id) NOT NULL,
	type_id INTEGER REFERENCES reimbursement_type(type_id)
);