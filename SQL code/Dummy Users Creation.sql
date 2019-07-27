INSERT INTO ers_user(username, password, first_name, last_name, email, role_id)
VALUES ('cbprosser', crypt('cbppass', gen_salt('bf', 7)), 'chris', 'prosser', 'chrisbprosser@gmail.com', (SELECT role_id FROM role WHERE role_name = 'Administrator')),
	   ('nottthebrave', crypt('halfling', gen_salt('bf', 7)), 'nott', 'the brave', 'nott.the.brave@gmail.com', (SELECT role_id FROM role WHERE role_name = 'Finance Manager')),
	   ('pyromancer', crypt('bren', gen_salt('bf', 7)), 'caleb', 'widowgast', 'calebwidowgast@gmail.com', (SELECT role_id FROM role WHERE role_name = 'Employee'));
