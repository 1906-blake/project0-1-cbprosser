SELECT * FROM ers_user;

INSERT INTO ers_user(username, password, first_name, last_name, email, role_id)
	         VALUES ('cbprosser', 'cbppass', 'chris', 'prosser', 'chrisbprosser@gmail.com', (SELECT role_id FROM role WHERE name = 'Administrator')),
					('nottthebrave', 'halfling', 'nott', 'the brave', 'nott.the.brave@gmail.com', (SELECT role_id FROM role WHERE name = 'Finance Manager')),
					('pyromancer', 'bren', 'caleb', 'widowgast', 'calebwidowgast@gmail.com', (SELECT role_id FROM role WHERE name = 'Employee'));

SELECT * FROM ers_user;