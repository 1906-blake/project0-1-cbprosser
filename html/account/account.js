let view = 0;
let currentPage = 1;
let lastPage = 1;
let fullCount = 0;
const id = JSON.parse(atob(localStorage.tk.split('.')[1])).user.userId;

async function updateUser(event) {
    event.preventDefault();
    const oldUser = JSON.parse(atob(localStorage.tk.split('.')[1])).user;
    const userId = oldUser.userId;
    let username = document.getElementById('updateUsername').value;
    let password = document.getElementById('updatePassword').value;
    let firstName = document.getElementById('updateFirstName').value;
    let lastName = document.getElementById('updateLastName').value;
    let email = document.getElementById('updateEmail').value;

    if (username === '') {
        username = oldUser.username;
    }
    if (firstName === '') {
        firstName = oldUser.firstName;
    }
    if (lastName === '') {
        lastName = oldUser.lastName;
    }
    if (email === '') {
        email = oldUser.email;
    }

    let newUser;
    if (password === '') {
        newUser = {
            userId,
            username,
            firstName,
            lastName,
            email
        }
    } else {
        newUser = {
            userId,
            username,
            password,
            firstName,
            lastName,
            email
        }
    }

    const respPatch = await fetch(`${window.apiURL}/users`, {
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify(newUser),
        headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + localStorage.tk,
        }
    });

    const returnedUser = await respPatch.json();

    if (returnedUser !== "That user id does not exist.") {
        const respToken = await fetch(`${window.apiURL}/login/check`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'content-type': 'application/json',
                'authorization': 'Bearer ' + localStorage.tk,
            }
        })
        const newToken = await respToken.json();
        localStorage.setItem('tk', newToken.token);
        navGetLogin();
        userUpdateFunctions();
        formReset('updateProfile');
    }
}

async function submitReimbursement(event) {
    event.preventDefault();

    const type = document.getElementById('reimbursementType').value;
    if (type === "Reimbursement Type") {
        return;
    }
    const amount = document.getElementById('reimbursementAmount').value;
    const description = document.getElementById('reimbursementDescription').value;

    const reimbursement = {
        reimbursementId: 0,
        amount,
        description,
        type: {
            type
        }
    }

    const resp = await fetch(`${window.apiURL}/reimbursements`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(reimbursement),
        headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + localStorage.tk,
        }
    });

    const newReimbursement = await resp.json();

    if (newReimbursement) {
        formReset('submitReimbursement');
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

function formReset(formID) {
    let form = document.getElementById(formID);
    form.reset();
}

function getUserInfo(user, field, ...usernameIDs) {
    let fieldValue;

    for (const key in user) {
        if (key === field) {
            fieldValue = user[key];
        }
    }

    if ((typeof fieldValue) === "object") {
        for (const key in fieldValue) {
            if (key === field) {
                fieldValue = fieldValue[key];
            }
        }
    }

    for (const location in usernameIDs) {
        const node = document.getElementById(usernameIDs[location]);
        if (node) {
            node.innerText = fieldValue;
        }
    }
}

function setUpdateProfileBoxes(user, placeholder, ...usernameIDs) {
    let placeholderValue;

    for (const key in user) {
        if (key === placeholder) {
            placeholderValue = user[key];
        }
    }

    if ((typeof placeholderValue) === "object") {
        for (const key in placeholderValue) {
            if (key === placeholder) {
                placeholderValue = placeholderValue[key];
            }
        }
    }

    for (const location in usernameIDs) {
        const node = document.getElementById(usernameIDs[location]);
        if (node) {
            node.setAttribute('aria-label', placeholderValue);
            node.setAttribute('placeholder', placeholderValue);
        }
    }
}

function userUpdateFunctions() {
    const user = JSON.parse(atob(localStorage.tk.split('.')[1])).user;
    // Role
    getUserInfo(user, 'role', 'userRole');

    // Username
    getUserInfo(user, 'username', 'userUsername');
    setUpdateProfileBoxes(user, 'username', 'updateUsername');

    // First Name
    getUserInfo(user, 'firstName', 'userFirstName');
    setUpdateProfileBoxes(user, 'firstName', 'updateFirstName');

    // Last Name
    getUserInfo(user, 'lastName', 'userLastName');
    setUpdateProfileBoxes(user, 'lastName', 'updateLastName');

    // Email
    setUpdateProfileBoxes(user, 'email', 'updateEmail')
}

function reimbursementDescriptionCounter(event) {
    let counter = document.getElementById('reimbursementTextboxCounter');
    let textbox = document.getElementById('reimbursementDescription');

    counter.innerHTML = `Reimbursement<br />Description<br />(${textbox.value.length}/300)`;
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
            data.innerHTML = `<p>Status: ${reimbursements[i].status.status}</p>`
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

function updatePaginateDropdown(event) {
    const paginateDropdown = document.getElementById('paginate-dropdown');
    view = +event.target.innerText
    paginateDropdown.innerText = view;
    currentPage = 1;
    getReimbursementsByID(id, +view, currentPage);
}

function nextPage() {
    if (currentPage === lastPage) {
        return;
    }
    currentPage++;
    getReimbursementsByID(id, +view, currentPage);
}

function prevPage() {
    if (currentPage === 1) {
        return;
    }
    currentPage--;
    getReimbursementsByID(id, +view, currentPage);
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
    getReimbursementsByID(id, +view, currentPage);
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