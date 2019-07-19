WITH inserted AS(
	WITH cte AS(
		SELECT status_id, type_id 
		FROM reimbursement_status s 
		JOIN reimbursement_type t 
		ON (s.reimbursement_status = 'Pending') 
		AND (t.reimbursement_type = 'Other')
	)
	INSERT INTO reimbursement(author_id, amount, date_submitted, description, status_id, type_id)
	VALUES (3, 400.15, current_timestamp, 'Another test', (SELECT status_id FROM cte), (SELECT type_id FROM CTE))
	RETURNING *
)
SELECT * FROM inserted
JOIN reimbursement_status USING (status_id)
JOIN reimbursement_type USING (type_id)