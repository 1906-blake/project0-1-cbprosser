const nav = document.getElementById('nav-bar');
nav.classList = 'navbar navbar-expand-sm navbar-dark bg-dark';
nav.innerHTML = `
<a class="navbar-brand" href="#">ERS System</a>
<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExample03" aria-controls="navbarsExample03" aria-expanded="true" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
</button>

<div class="navbar-collapse collapse show" id="navbarsExample03" style="">
    <ul class="navbar-nav mr-auto">
        <li class="nav-item active">
            <a class="nav-link" href="./users/users.html">Users</a>
        </li>
        <li class="nav-item active">
            <a class="nav-link" href="./reimbursements/reimbursements.html">Reimbursements</a>
        </li>
    </ul>
    <div class="login-navbar"></div>
</div>
`

function navGetLogin() {
    const token = localStorage.tk;
    if(token) {
        const user = JSON.parse(atob(localStorage.tk.split('.')[1])).user;
        let navLogin = document.getElementById('login-navbar');
        navLogin.innerHTML = '';
        navLogin.innerHTML = user.username;
    }
}

function navGetURL() {
    const currentURL = document.URL;
    
}

function navFunctions() {
    navGetLogin();
}