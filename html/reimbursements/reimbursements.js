async function getReimbursements(start, end) {
    const resp = await fetch('http://localhost:8012/reimbursements/status/Pending?count=10&page=1', {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + localStorage.tk,
        }
    });
    const reimbursements = await resp.json();
    console.log(reimbursements);
    let table = document.getElementById('accordionTable');
    let tableBody = document.getElementById('reimbursement-table-body');
    tableBody.innerHTML = null;
    let row, data, rowDiv;
    for(let i = 0; i < reimbursements.length; i++) {
        /** ***Set div container */
        rowDiv = document.createElement('div')
        rowDiv.setAttribute('id',`#row${i}`);
        table.appendChild(rowDiv);
        

        /** **Set visible row */
        row = document.createElement('tr');
        row.setAttribute('data-toggle', 'collapse');
        row.setAttribute('data-parent', '#accordianTable');
        row.setAttribute('href', `#collapseRow${i}`);
        row.setAttribute('aria-expanded', 'false');
        row.setAttribute('aria-controls', `collapseRow${i}`);
        row.setAttribute('class', 'collapsed');
        table.appendChild(row);
        

        /** *Set columns of visible row */
        // Reimbursement ID column
        data = document.createElement('td');
        data.setAttribute('scope','col');
        data.setAttribute('class','d-none d-sm-table-cell');
        data.innerText=reimbursements[i].reimbursementId;
        row.appendChild(data);
        

        // Author Username
        data = document.createElement('td');
        data.innerText=reimbursements[i].author.username;
        row.appendChild(data);
        

        // Resolution Date
        data = document.createElement('td');
        data.innerText=reimbursements[i].dateSubmitted.slice(0,10);
        row.appendChild(data);
        

        // Amount
        data = document.createElement('td');
        data.innerText='$' + reimbursements[i].amount;
        row.appendChild(data);
        

        // Purpose
        data = document.createElement('td');
        data.innerText=reimbursements[i].type.type;
        row.appendChild(data);
        console.log(rowDiv);

        /** Set collapsed row */
        row = document.createElement('tr');
        row.setAttribute('id', `collapseRow${i}`);
        row.setAttribute('class', 'collapse');
        row.setAttribute('role', 'tabpanel');
        row.setAttribute('aria-labelledby', `#row${i}`);
        row.setAttribute('data-parent', '#accordianTable');
        tableBody.appendChild(row);

        // Set as single column
        data = document.createElement('td');
        data.setAttribute('colspan', '5');
        row.appendChild(data);

        data.innerHTML = `<p>Status: ${reimbursements[i].status.status}</p>
        <p>Resolver: ${reimbursements.resolver && reimbursements.resolver.username}</p>
        <p>Date Resolved: ${reimbursements.dateResolved}</p>`
    }
}