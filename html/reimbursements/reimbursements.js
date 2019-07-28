let view = 0;
let currentPage = 1;
let lastPage = 1;
let status;
let fullCount = 0;

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
    if (reimbursements[0].reimbursementId === null) {
        row = document.createElement('tr');
        tableBody.appendChild(row);
        data = document.createElement('td');
        data.setAttribute('colspan', '5');
        data.innerHTML = `<p>Oops! Ran out of data to show!</p>`
        row.appendChild(data);
        return;
    }
    lastPage = Math.ceil(+reimbursements[reimbursements.length - 1] / view);
    fullCount = +reimbursements[reimbursements.length - 1];
    for (let i = 0; i < reimbursements.length - 1; i++) {
        /** Create visible row */
        row = document.createElement('tr');
        row.setAttribute('data-toggle', 'collapse');
        row.setAttribute('data-target', `#row${i}`);
        tableBody.appendChild(row);

        /** Create columns */
        data = document.createElement('td');
        data.setAttribute('scope', 'col');
        data.setAttribute('class', 'd-none d-sm-table-cell');
        data.innerText = reimbursements[i].reimbursementId;
        row.appendChild(data);

        data = document.createElement('td');
        data.innerText = reimbursements[i].author.username;
        row.appendChild(data);

        data = document.createElement('td');
        data.innerText = reimbursements[i].dateSubmitted.slice(0, 10);
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
        data.setAttribute('class', 'collapse');
        data.innerHTML = `<p>Status: ${reimbursements[i].status.status}</p>
        <p>Resolver: ${(reimbursements[i].resolver.username) ? reimbursements[i].resolver.username : '~'}</p>
        <p>Resolved: ${(reimbursements[i].dateResolved) ? reimbursements[i].dateResolved.slice(0, 10) : '~'}</p>`
        row.appendChild(data);
    }
    buildPaginationToolbar();
    setPage();
}

function updateStatusDropdown(event) {
    const statusDropdown = document.getElementById('reimbursement-dropdown');
    status = event.target.innerText
    statusDropdown.innerText = status;
    view = +document.getElementById('paginate-dropdown').innerText;
    if (view && view !== 'View ') {
        currentPage = 1;
        getReimbursements(status, +view, 1);
    }
}

function updatePaginateDropdown(event) {
    const paginateDropdown = document.getElementById('paginate-dropdown');
    view = +event.target.innerText
    paginateDropdown.innerText = view;
    status = document.getElementById('reimbursement-dropdown').innerText;
    if (status && status !== 'Status ') {
        currentPage = 1;
        getReimbursements(status, +view, 1);
    }
}

function nextPage() {
    if (currentPage === lastPage) {
        return;
    }
    currentPage++;
    getReimbursements(status, +view, currentPage);
}

function prevPage() {
    if (currentPage === 1) {
        return;
    }
    currentPage--;
    getReimbursements(status, +view, currentPage);
}

function setPage() {
    const toolbar = document.getElementById('paginate-toolbar');
    const buttons = toolbar.children[1];
    const lastButton = buttons.children.length - 1;
    for (let i = 0; i <= lastButton; i++) {
        if (+buttons.children[i].innerText === currentPage) {
            if (i === 0) {
                toolbar.children[0].children[0].setAttribute('disabled', '');
            } else {
                toolbar.children[0].children[0].removeAttribute('disabled');
            }
            if(i === lastButton) {
                toolbar.children[2].children[0].setAttribute('disabled', '');
            } else {
                toolbar.children[2].children[0].removeAttribute('disabled');
            }
            buttons.children[i].setAttribute('disabled', '');
        } else {
            if (buttons.children[i].innerText !== '...') {
                buttons.children[i].removeAttribute('disabled');
            }
        }
    }
}

function selectPage(event) {
    currentPage = +event.target.childNodes[0].data;
    getReimbursements(status, view, currentPage);
}

function buildPaginationToolbar() {
    if (fullCount < 1) {
        return;
    }

    const toolbarContainer = document.getElementById('paginate-toolbar');
    toolbarContainer.innerHTML = null;
    let currentDiv = document.createElement('div');
    currentDiv.setAttribute('class', 'btn-group button-group sm mr-2');
    toolbarContainer.appendChild(currentDiv);

    let currentButton = document.createElement('button');
    currentButton.setAttribute('type', 'button');
    currentButton.setAttribute('class', 'btn btn-secondary');
    currentButton.setAttribute('onclick', 'prevPage()');
    currentButton.innerText = 'Prev';
    currentDiv.appendChild(currentButton);

    currentDiv = document.createElement('div');
    currentDiv.setAttribute('class', 'btn-group button-group sm mr-2');
    toolbarContainer.appendChild(currentDiv);

    let paginated = pagination(currentPage, lastPage)
    for (let i = 0; i < paginated.length; i++) {
        currentButton = document.createElement('button');
        currentButton.setAttribute('type', 'button');
        currentButton.setAttribute('class', 'btn btn-secondary');
        if (paginated[i] === '...') {
            currentButton.setAttribute('disabled', '');
        } else {
            currentButton.setAttribute('onclick', 'selectPage(event)');
        }
        currentButton.innerText = paginated[i];
        currentDiv.appendChild(currentButton);
    }

    currentDiv = document.createElement('div');
    currentDiv.setAttribute('class', 'btn-group button-group sm mr-2');
    toolbarContainer.appendChild(currentDiv);

    currentButton = document.createElement('button');
    currentButton.setAttribute('type', 'button');
    currentButton.setAttribute('class', 'btn btn-secondary');
    currentButton.setAttribute('onclick', 'nextPage()');
    currentButton.innerText = 'next';
    currentDiv.appendChild(currentButton);
}

// Thanks to kottenator for the logic
// https://gist.github.com/kottenator/9d936eb3e4e3c3e02598
function pagination(currentPage, finalPage) {
    let left = currentPage - 1,
        right = currentPage + 2,
        range = [],
        rangeWithDots = [],
        l;

    for (let i = 1; i <= finalPage; i++) {
        if (i == 1 || i == finalPage || i >= left && i < right) {
            range.push(i);
        }
    }

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
}