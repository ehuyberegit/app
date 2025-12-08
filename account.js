document.addEventListener('DOMContentLoaded', async () => {
    if (window.initMenu) window.initMenu();

    if (!window.supabaseClient) {
        window.location.href = 'landing.html';
        return;
    }
    const { data, error } = await window.supabaseClient.auth.getUser();
    if (!data || !data.user) {
        window.location.href = 'landing.html';
        return;
    }
    const currentUser = data.user;
    const userEmailDiv = document.getElementById('userEmail');
    if (userEmailDiv) {
        userEmailDiv.textContent = currentUser.email || '(unknown)';
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await window.supabaseClient.auth.signOut();
            window.location.href = 'landing.html';
        });
    }
});
