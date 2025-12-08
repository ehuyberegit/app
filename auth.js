document.addEventListener('DOMContentLoaded', () => {
    // Login logic
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email')?.value.trim();
            const password = document.getElementById('login-password')?.value;
            const errorDiv = document.getElementById('login-error');
            if (errorDiv) errorDiv.textContent = '';
            if (!email || !password) {
                if (errorDiv) errorDiv.textContent = 'Please enter email and password.';
                return;
            }
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
            if (error) {
                if (errorDiv) errorDiv.textContent = error.message || 'Login failed.';
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    // Signup logic
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email')?.value.trim();
            const password = document.getElementById('signup-password')?.value;
            const errorDiv = document.getElementById('signup-error');
            if (errorDiv) errorDiv.textContent = '';
            if (!email || !password) {
                if (errorDiv) errorDiv.textContent = 'Please enter email and password.';
                return;
            }
            const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
            if (error) {
                if (errorDiv) errorDiv.textContent = error.message || 'Sign up failed.';
            } else {
                window.location.href = 'index.html';
            }
        });
    }
});
