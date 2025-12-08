document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const signupBtn = document.getElementById('signupBtn');
    const loginBtn = document.getElementById('loginBtn');
    const loginMessage = document.getElementById('loginMessage');

    async function signUp() {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if (!email || !password) {
            showMessage('Please enter email and password.');
            return;
        }
        const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
        if (error) {
            showMessage(error.message);
        } else {
            showMessage('Sign up successful! Please check your email to confirm.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1200);
        }
    }

    async function signIn() {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if (!email || !password) {
            showMessage('Please enter email and password.');
            return;
        }
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            showMessage(error.message);
        } else {
            window.location.href = 'index.html';
        }
    }

    function showMessage(msg) {
        loginMessage.textContent = msg;
        loginMessage.style.display = 'block';
    }

    signupBtn.addEventListener('click', signUp);
    loginBtn.addEventListener('click', signIn);
});
