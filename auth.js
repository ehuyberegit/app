document.addEventListener('DOMContentLoaded', () => {
    // Login logic
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', signIn);
    }

    // Signup logic
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', signUp);
    }

    async function signIn() {
        const email = document.getElementById('login-email')?.value.trim();
        const password = document.getElementById('login-password')?.value;
        const messageDiv = document.getElementById('loginMessage');
        if (!email || !password) {
            showMessage(messageDiv, 'Please enter email and password.');
            return;
        }
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            showMessage(messageDiv, error.message);
        } else {
            window.location.href = 'index.html';
        }
    }

    async function signUp() {
        const email = document.getElementById('signup-email')?.value.trim();
        const password = document.getElementById('signup-password')?.value;
        const messageDiv = document.getElementById('signupMessage');
        if (!email || !password) {
            showMessage(messageDiv, 'Please enter email and password.');
            return;
        }
        const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
        if (error) {
            showMessage(messageDiv, error.message);
        } else {
            // On success, redirect to index.html (user may need to confirm email)
            showMessage(messageDiv, 'Sign up successful! Please check your email to confirm.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1200);
        }
    }

    function showMessage(div, msg) {
        if (div) {
            div.textContent = msg;
            div.style.display = 'block';
        } else {
            alert(msg);
        }
    }
});
