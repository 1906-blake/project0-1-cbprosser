const nav = document.getElementById('nav-bar');
nav.classList = 'navbar navbar-expand-sm fixed-top navbar-dark bg-dark flex-md-nowrap p-0 shadow';
nav.innerHTML = `
<div class="navbar-brand col-sm-3 col-md-2 mr-0 text-center">
    <a href="/html/index.html"><img src="/html/Images/logo-bw.png" alt="ERS System" width="73" height="23"></a>
    <button id="nav-button" class="navbar-toggler float-right pt-0 pb-0" type="button" data-toggle="collapse" data-target="#navbarsExample03"
        aria-controls="navbarsExample03" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
</div>

<div class="navbar-collapse collapse" id="navbarsExample03">
    <ul id="active-page" class="navbar-nav mr-auto text-light px-3">
        <li class="nav-item">
            <a class="nav-link" href="/html/users/users.html">Users</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="/html/reimbursements/reimbursements.html">Reimbursements</a>
        </li>
    </ul>
    <ul class="navbar-nav text-light px-3">
        <li id="login-navbar" class="nav-item active">
            <a class="nav-link" href="/html/Login/login.html">Login/Sign up</a>
        </li>
    </ul>
</div>
`

function navGetLogin() {
    const token = localStorage.tk;
    if (token) {
        const user = JSON.parse(atob(localStorage.tk.split('.')[1])).user;
        let navLogin = document.getElementById('login-navbar');
        navLogin.innerHTML = null;
        navLogin.innerHTML = `<div class="dropdown">
        <button class="nav-link dropdown-toggle" type="button" id="dropdownMenuNavButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          ${user.username}
        </button>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
          <a class="dropdown-item" href="/html/account/account.html">View Profile</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#" onclick='logout()'>Logout</a>
        </div>
      </div>`;
    }
}

function navGetURL() {
    const splitURL = document.URL.split('/');
    const currentURL = splitURL[splitURL.length - 1];
    const items = document.getElementById('active-page').children;
    let testURL;
    for (let i = 0; i < items.length; i++) {
        testURL = items[i].children[0].attributes[1].value;
        if (testURL.includes(currentURL)) {
            items[i].setAttribute('class', 'nav-item active');
            return;
        }
    }
}

function navFunctions() {
    navGetLogin();
    navGetURL()
}

function logout() {
    localStorage.removeItem('tk');
    window.location = '/html/index.html';
}