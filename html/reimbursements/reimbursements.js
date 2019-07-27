async function getReimbursements(type, length, page) {
    const resp = await fetch(`http://localhost:8012/reimbursements/status/${type}?count=${length}&page=${page}`, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + localStorage.tk,
        }
    });
    const reimbursements = await resp.json();
    console.log(reimbursements);
    let tableBody = document.getElementById('reimbursement-table-body');
    tableBody.innerHTML = null;
    let row, data;
    for(let i = 0; i < reimbursements.length; i++) {
        /** Create visible row */
        row = document.createElement('tr');
        row.setAttribute('data-toggle','collapse');
        row.setAttribute('data-target', `#row${i}`);
        tableBody.appendChild(row);

        /** Create columns */
        data = document.createElement('td');
        data.setAttribute('scope', 'col');
        data.setAttribute('class','d-none d-sm-table-cell');
        data.innerText = reimbursements[i].reimbursementId;
        row.appendChild(data);
        
        data = document.createElement('td');
        data.innerText = reimbursements[i].author.username;
        row.appendChild(data);

        data = document.createElement('td');
        data.innerText = reimbursements[i].dateSubmitted.slice(0,10);
        row.appendChild(data);

        data = document.createElement('td');
        data.innerText = reimbursements[i].amount;
        row.appendChild(data);
        
        data = document.createElement('td');
        data.innerText = reimbursements[i].type.type;
        row.appendChild(data);
        
        /** Create hidden row */
        row = document.createElement('tr');
        tableBody.appendChild(row);

        data = document.createElement('td');
        data.setAttribute('colspan', '5');
        data.setAttribute('id', `row${i}`);
        data.setAttribute('class','collapse');
        data.innerHTML = `<p>Status: ${reimbursements[i].status.status}</p>
        <p>Resolver: ${(reimbursements[i].resolver.username) ? reimbursements[i].resolver.username : '~' }</p>
        <p>Resolved: ${(reimbursements[i].dateResolved) ? reimbursements[i].dateResolved.slice(0,10) : '~'}</p>`
        row.appendChild(data);
    }
}