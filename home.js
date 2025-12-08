document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu logic
    if (window.initMenu) window.initMenu();

    // Theme switch logic
    let isJoinMode = false;
    const body = document.body;
    const themeSwitch = document.getElementById('themeSwitch');
    const mainTitle = document.getElementById('mainTitle');

    function applyTheme() {
        if (isJoinMode) {
            body.classList.remove('theme-standard');
            body.classList.add('theme-join');
            themeSwitch.textContent = 'J';
            mainTitle.innerHTML = 'ONE<br />MORE<br />JOIN ?';
        } else {
            body.classList.remove('theme-join');
            body.classList.add('theme-standard');
            themeSwitch.textContent = 'S';
            mainTitle.innerHTML = 'ONE<br />MORE<br />CIGGY ?';
        }
    }

    if (themeSwitch) {
        themeSwitch.addEventListener('click', () => {
            isJoinMode = !isJoinMode;
            applyTheme();
        });
    }

    // Initial theme
    applyTheme();
});
