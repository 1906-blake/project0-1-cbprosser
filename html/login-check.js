if (!localStorage.tk) {
    if (!window.location.toString().includes('index.html')) {
        window.location = '/html/login/login.html';
    }
}