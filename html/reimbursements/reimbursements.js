let view = 5;
let currentPage = 1;
let lastPage = 1;
let status = 'Pending';
let id = (localStorage.tk) ? (JSON.parse(atob(localStorage.tk.split('.')[1])).user.userId) : (0);
let fullCount = 0;
let sortByType;


async function getReimbursementsByStatus(type, limit, page) {
    try {
        const resp = await fetch(`${window.apiURL}/reimbursements/status/${type}?count=${limit}&page=${page}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'authorization': 'Bearer ' + localStorage.tk,
            }
        });
        const reimbursements = await resp.json();
        buildTable(reimbursements);
        if (fullCount === 0) {
            return;
        }
        buildPaginationToolbar();
        setPage();
    } catch (err) {
        console.log(err);
    }
}

async function getReimbursementsByID(id, limit, page) {
    try {
        const resp = await fetch(`${window.apiURL}/reimbursements/author/userId/${id}?count=${limit}&page=${page}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'authorization': 'Bearer ' + localStorage.tk,
            }
        });
        const reimbursements = await resp.json();
        buildTable(reimbursements);
        if (fullCount === 0) {
            return;
        }
        buildPaginationToolbar();
        setPage();
    } catch (err) {
        console.log(err);
    }
}

async function resolveReimbursement(event) {
    const choice = event.target.childNodes[0].data;
    const resolution = (choice === 'Approve') ? 'Approved' : 'Denied';
    const statusRow = event.target.parentElement.parentElement;
    const rowNumber = +statusRow.id.split('row')[1];
    const reimbursementID = +statusRow.parentNode.parentNode.children[rowNumber * 2].children[0].innerText;

    const token = localStorage.tk;
    if (token) {
        try {
            const resp = await fetch(`${window.apiURL}/reimbursements/`, {
                method: 'PATCH',
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + localStorage.tk,
                },
                body: JSON.stringify({
                    "reimbursementId": reimbursementID,
                    "status": resolution
                })

            });
            getProperReimbursements();
        } catch (err) {
            console.log(err);
        }
    }

}

function buildTable(reimbursements) {
    let tableBody = document.getElementById('reimbursement-table-body');
    tableBody.innerHTML = null;
    let row, data;
    if ((typeof reimbursements) === 'string') {
        row = document.createElement('tr');
        tableBody.appendChild(row);
        data = document.createElement('td');
        data.setAttribute('colspan', '5');
        data.innerHTML = reimbursements;
        row.appendChild(data);
        return;
    }
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
        data.setAttribute('colspan', '2');
        data.setAttribute('id', `row${i}`);
        data.setAttribute('class', 'collapse');
        if (reimbursements[i].status.status !== 'Pending') {
            data.innerHTML = `<p>Status: ${reimbursements[i].status.status}</p>
                              <p>Resolver: ${(reimbursements[i].resolver.username) ? reimbursements[i].resolver.username : '~'}</p>
                              <p>Resolved: ${(reimbursements[i].dateResolved) ? reimbursements[i].dateResolved.slice(0, 10) : '~'}</p>`
        } else {
            data.innerHTML = `<p>Status: ${reimbursements[i].status.status}</p>
                                <button class="btn btn-secondary dropdown-toggle" type="button"
                                    data-toggle="dropdown" aria-haspopup="true"
                                    aria-expanded="false">
                                    Resolve Reimbursement
                                </button>
                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton"
                                    onclick="resolveReimbursement(event)">
                                    <a class="dropdown-item" type="button">Approve</a>
                                    <a class="dropdown-item" type="button">Deny</a>
                                </div>`
        }
        row.appendChild(data);

        data = document.createElement('td');
        data.setAttribute('colspan', '3');
        data.setAttribute('id', `row${i}`);
        data.setAttribute('class', 'collapse');
        data.innerHTML = `<p>Description: ${reimbursements[i].description}</p>`
        row.appendChild(data);
    }
}

function chooseStatus() {
    currentPage = 1;
    view = 5;
    status = 'Pending';
    sortByType = 'Status';
    event.target.parentElement.parentElement.setAttribute('class', 'btn-group button-group-sm mr-2');
    event.target.parentElement.setAttribute('class', 'dropdown-menu');
    const title = document.getElementById('reimbHeader');
    title.innerText = 'Reimbursements by Status';

    const main = document.getElementById('reimb-main');
    while (main.childElementCount > 1) {
        main.removeChild(main.children[1]);
    }

    const buttonToolbar = main.children[0];
    while (buttonToolbar.childElementCount > 1) {
        buttonToolbar.removeChild(buttonToolbar.children[1]);
    }

    {
        buttonToolbar.innerHTML += `<div class="btn-group button-group-sm mr-2">
                                    <div class="dropdown">
                                        <button class="btn btn-secondary dropdown-toggle" type="button"
                                            id="reimbursement-dropdown" data-toggle="dropdown" aria-haspopup="true"
                                            aria-expanded="false">
                                            Pending
                                        </button>
                                        <div class="dropdown-menu dropdown-menu-right"
                                            aria-labelledby="dropdownMenuButton" onclick="updateStatusDropdown(event)">
                                            <h6 class="dropdown-header">Status Type</h6>
                                            <a class="dropdown-item" type="button">Pending</a>
                                            <a class="dropdown-item" type="button">Approved</a>
                                            <a class="dropdown-item" type="button">Denied</a>
                                        </div>
                                    </div>
                                    <div class="dropdown">
                                        <button class="btn btn-secondary dropdown-toggle" type="button"
                                            id="paginate-dropdown" data-toggle="dropdown" aria-haspopup="true"
                                            aria-expanded="false">
                                            5
                                        </button>
                                        <div class="dropdown-menu dropdown-menu-right"
                                            aria-labelledby="dropdownMenuButton"
                                            onclick="updatePaginateDropdown(event)">
                                            <h6 class="dropdown-header">View per page</h6>
                                            <a class="dropdown-item" type="button">1</a>
                                            <a class="dropdown-item" type="button">3</a>
                                            <a class="dropdown-item" type="button">5</a>
                                            <a class="dropdown-item" type="button">10</a>
                                            <a class="dropdown-item" type="button">25</a>
                                            <a class="dropdown-item" type="button">50</a>
                                        </div>
                                    </div>
                                </div>`;
    }

    {
        main.innerHTML += ` <div class="table-responsive bg-transparent">
                            <table class="table table-striped table-sm 
                            table-hover text-light bg-light mb-0" id="accordionTable">
                                <thead>
                                    <tr>
                                        <th scope="col" class="d-none d-sm-table-cell">RID</th>
                                        <th>Author</th>
                                        <th>Date Submitted</th>
                                        <th>Amount</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>

                                <tbody id='reimbursement-table-body'>
                                    <tr>
                                        <td colspan="5">
                                            <p class="">Select options above</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div id="paginate-toolbar" class="btn-toolbar mt-2 d-flex justify-content-center">
                        </div>`
    }
    
    getReimbursementsByStatus(status, view, currentPage);
}

function chooseID() {
    view = 5;
    currentPage = 1;
    id = JSON.parse(atob(localStorage.tk.split('.')[1])).user.userId;
    sortByType = 'ID';
    event.target.parentElement.parentElement.setAttribute('class', 'btn-group button-group-sm mr-2');
    event.target.parentElement.setAttribute('class', 'dropdown-menu');
    const title = document.getElementById('reimbHeader');
    title.innerText = 'Reimbursements by Employee ID';

    const main = document.getElementById('reimb-main');
    while (main.childElementCount > 1) {
        main.removeChild(main.children[1]);
    }

    const buttonToolbar = main.children[0];
    while (buttonToolbar.childElementCount > 1) {
        buttonToolbar.removeChild(buttonToolbar.children[1]);
    }

    {
        buttonToolbar.innerHTML += `<div class="btn-group button-group-sm mr-2">
                                        <div class="input-group">
                                            <input id="reimbursement-id-input" type="number"
                                                class="form-control bg-dark text-light" aria-label="reimb-by-user-id" value="${id}">
                                            <div class="input-group-append" placehoder="Enter user ID">
                                                <button class="btn btn-secondary dropdown-toggle" type="button"
                                                    id="paginate-dropdown" data-toggle="dropdown" aria-haspopup="true"
                                                    aria-expanded="false">
                                                    5
                                                </button>
                                                <div class="dropdown-menu dropdown-menu-right"
                                                    aria-labelledby="dropdownMenuButton"
                                                    onclick="updatePaginateDropdown(event)">
                                                    <h6 class="dropdown-header">View per page</h6>
                                                    <a class="dropdown-item" type="button">1</a>
                                                    <a class="dropdown-item" type="button">3</a>
                                                    <a class="dropdown-item" type="button">5</a>
                                                    <a class="dropdown-item" type="button">10</a>
                                                    <a class="dropdown-item" type="button">25</a>
                                                    <a class="dropdown-item" type="button">50</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
    }

    {
        main.innerHTML += ` <div class="table-responsive bg-transparent">
                            <table class="table table-striped table-sm 
                            table-hover text-light bg-light mb-0" id="accordionTable">
                                <thead>
                                    <tr>
                                        <th scope="col" class="d-none d-sm-table-cell">RID</th>
                                        <th>Author</th>
                                        <th>Date Submitted</th>
                                        <th>Amount</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>

                                <tbody id='reimbursement-table-body'>
                                    <tr>
                                        <td colspan="5">
                                            <p class="">Select options above.</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div id="paginate-toolbar" class="btn-toolbar mt-2 d-flex justify-content-center">
                        </div>`
    }
    
    getReimbursementsByID(id, view, currentPage);
    document.getElementById("reimbursement-id-input").addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            updateIDInput();
        }
    });
}

function updateSearchByDropdown(event) {
    const searchByDropdown = document.getElementById('reimb-search-dropdown');
    const searchBy = event.target.innerText
    searchByDropdown.innerText = `Search by ${searchBy}`;
    switch (searchBy) {
        case 'Status':
            chooseStatus();
            break;
        case 'Employee ID':
            chooseID();
            break;
    }
}

function updateStatusDropdown(event) {
    const statusDropdown = document.getElementById('reimbursement-dropdown');
    status = event.target.innerText
    statusDropdown.innerText = status;
    view = +document.getElementById('paginate-dropdown').innerText;
    if (view && view !== 'View ') {

        currentPage = 1;
        getReimbursementsByStatus(status, +view, 1);
    }
}

function updatePaginateDropdown(event) {
    const paginateDropdown = document.getElementById('paginate-dropdown');
    view = +event.target.innerText
    paginateDropdown.innerText = view;
    if (sortByType === 'Status') {
        status = document.getElementById('reimbursement-dropdown').innerText;
        if (status && status !== 'Status ') {
            currentPage = 1;
            getReimbursementsByStatus(status, +view, currentPage);
        }
    } else if (sortByType === 'ID') {
        id = document.getElementById("reimbursement-id-input").value;
        currentPage = 1;
        getReimbursementsByID(id, view, currentPage);
    }
}

function updateIDInput() {
    id = document.getElementById("reimbursement-id-input").value;
    view = document.getElementById('paginate-dropdown').innerText;
    if (view && view !== 'View ') {
        currentPage = 1;
        getReimbursementsByID(id, view, currentPage);
    }
}

function nextPage() {
    if (currentPage === lastPage) {
        return;
    }
    currentPage++;
    getProperReimbursements()
}

function prevPage() {
    if (currentPage === 1) {
        return;
    }
    currentPage--;
    getProperReimbursements();
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
            if (i === lastButton) {
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
    getProperReimbursements();
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

function getProperReimbursements() {
    if (sortByType === 'Status') {
        getReimbursementsByStatus(status, +view, currentPage);
    } else if (sortByType === 'ID') {
        getReimbursementsByID(id, +view, currentPage);
    }
}


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