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

    const respPatch = await fetch(`${window.apiURLd}/users`, {
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
        const respToken = await fetch(`${window.apiURLd}/login/check`, {
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

function formReset(formID){
    let form = document.getElementById(formID);
    form.reset();
}

function getUserInfo(user, field, ...usernameIDs) {
    let fieldValue;

    for(const key in user) {
        if(key === field) {
            fieldValue = user[key];
        }
    }

    if((typeof fieldValue) === "object") {
        for(const key in fieldValue) {
            if(key === field) {
                fieldValue = fieldValue[key];
            }
        }
    }

    for (const location in usernameIDs) {
        const node = document.getElementById(usernameIDs[location]);
        if(node){
            node.innerText=fieldValue;
        }
    }
}

function setUpdateProfileBoxes(user, placeholder, ...usernameIDs) {
    let placeholderValue;

    for(const key in user) {
        if(key === placeholder) {
            placeholderValue = user[key];
        }
    }
    
    if((typeof placeholderValue) === "object") {
        for(const key in placeholderValue) {
            if(key === placeholder) {
                placeholderValue = placeholderValue[key];
            }
        }
    }

    for (const location in usernameIDs) {
        const node = document.getElementById(usernameIDs[location]);
        if(node){
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