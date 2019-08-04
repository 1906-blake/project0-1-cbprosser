let view = 5;
let currentPage = 1;
let lastPage = 1;
let fullCount = 0;

async function getAllUsers(limit, page) {
    try {
        const resp = await fetch(`${window.apiURL}/users?count=${limit}&page=${page}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'authorization': 'Bearer ' + localStorage.tk,
            }
        });
        const users = await resp.json();
        buildTable(users);
        if(fullCount === 0) {
            return;
        }
        buildPaginationToolbar();
        setPage();
    } catch (err) {
        console.log(err);
    }
}

function buildTable(users) {
    let tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = null;
    let row, data;
    if ((typeof users) === 'string') {
        row = document.createElement('tr');
        tableBody.appendChild(row);
        data = document.createElement('td');
        data.setAttribute('colspan', '5');
        data.innerHTML = users;
        row.appendChild(data);
        return;
    }
    if (users[0].userId === null) {
        row = document.createElement('tr');
        tableBody.appendChild(row);
        data = document.createElement('td');
        data.setAttribute('colspan', '5');
        data.innerHTML = `<p>Oops! Ran out of data to show!</p>`
        row.appendChild(data);
        return;
    }
    lastPage = Math.ceil(+users[users.length - 1] / view);
    fullCount = +users[users.length - 1];
    for (let i = 0; i < users.length - 1; i++) {
        /** Create visible row */
        row = document.createElement('tr');
        row.setAttribute('data-toggle', 'collapse');
        row.setAttribute('data-target', `#row${i}`);
        tableBody.appendChild(row);

        /** Create columns */
        data = document.createElement('td');
        // data.setAttribute('scope', 'col');
        // data.setAttribute('class', 'd-none d-sm-table-cell');
        data.innerText = users[i].userId;
        row.appendChild(data);

        data = document.createElement('td');
        data.innerText = users[i].username;
        row.appendChild(data);

        data = document.createElement('td');
        data.setAttribute('class', 'text-capitalize');
        data.innerText = `${users[i].firstName} ${users[i].lastName}`
        row.appendChild(data);

        /** Create hidden row */
        row = document.createElement('tr');
        tableBody.appendChild(row);

        data = document.createElement('td');
        data.setAttribute('colspan', '5');
        data.setAttribute('id', `row${i}`);
        data.setAttribute('class', 'collapse');
        data.innerHTML = `<p>Email: ${users[i].email}</p>
        <p>Employee Role: ${users[i].role.role}</p>`;
        row.appendChild(data);
    }
}

function initialize() {
    getAllUsers(view, currentPage);
}

function nextPage() {
    if (currentPage === lastPage) {
        return;
    }
    currentPage++;
    getAllUsers(view, currentPage);
}

function prevPage() {
    if (currentPage === 1) {
        return;
    }
    currentPage--;
    getAllUsers(view, currentPage);
}

function selectPage(event) {
    currentPage = +event.target.childNodes[0].data;
    getAllUsers(view, currentPage);
}

function updatePaginateDropdown(event) {
    const paginateDropdown = document.getElementById('paginate-dropdown');
    view = +event.target.innerText
    paginateDropdown.innerText = view;
    currentPage = 1;
    getAllUsers(view, currentPage);
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