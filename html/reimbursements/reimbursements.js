let view = 0;
let currentPage = 1;
let status;

async function getReimbursements(type, limit, page) {
    const resp = await fetch(`http://localhost:8012/reimbursements/status/${type}?count=${limit}&page=${page}`, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + localStorage.tk,
        }
    });
    const reimbursements = await resp.json();
    let tableBody = document.getElementById('reimbursement-table-body');
    tableBody.innerHTML = null;
    let row, data;
    if(reimbursements[0].reimbursementId === null){
        row = document.createElement('tr');
        tableBody.appendChild(row);
        data = document.createElement('td');
        data.setAttribute('colspan', '5');
        data.innerHTML = `<p>Oops! Ran out of data to show!</p>`
        row.appendChild(data);
        return;
    }
    for(let i = 0; i < reimbursements.length - 1; i++) {
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

function updateStatusDropdown(event) {
    const statusDropdown = document.getElementById('reimbursement-dropdown');
    status = event.target.innerText
    statusDropdown.innerText = status;
    view = +document.getElementById('paginate-dropdown').innerText;
    if(view && view !== 'View ')
    {
        currentPage = 1;
        getReimbursements(status, +view,1);
    }
}

function updatePaginateDropdown(event) {
    const paginateDropdown = document.getElementById('paginate-dropdown');
    view = +event.target.innerText
    paginateDropdown.innerText = view;
    status = document.getElementById('reimbursement-dropdown').innerText;
    if(status && status !== 'Status ')
    {
        currentPage = 1;
        getReimbursements(status, +view,1);
    }
}

async function nextPage() {
    currentPage++;
    getReimbursements(status, +view, currentPage);
}

async function prevPage() {
    currentPage--;
    getReimbursements(status, +view, currentPage);
}