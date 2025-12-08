window.initMenu = function() {
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuToggle = document.getElementById('menuToggle');
    const logoutLink = document.getElementById('logoutLink');

    function openMenu() {
        sideMenu.classList.add('open');
        menuOverlay.classList.add('open');
    }
    function closeMenu() {
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('open');
    }
    if (menuToggle) {
        menuToggle.addEventListener('click', openMenu);
    }
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.supabaseClient) {
                await window.supabaseClient.auth.signOut();
            }
            window.location.href = 'landing.html';
        });
    }
};
