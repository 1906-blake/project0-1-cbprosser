async function login(event) {
    event.preventDefault();
    const username = document.getElementById('inputUsername').value;
    const password = document.getElementById('inputPassword').value;
    const credentials = {
        username,
        password
    };
    try {
        const resp = await fetch(`${window.apiURLd}/login`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(credentials),
            headers: {
                'content-type': 'application/json'
            }
        });

        const user = await resp.json();
        localStorage.setItem('tk', user.token);
        window.location = '/html/index.html';
    } catch (err) {
        console.log(err);
        console.log('Invalid Credentials');
        const errorElement = document.getElementById('login-error')
        errorElement.innerText = 'Invalid Credentials';
        errorElement.style.color = 'red';
    }
}
