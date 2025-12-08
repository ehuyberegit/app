// Constants
const DAILY_COUNT_KEY = 'dailyCount';
const LAST_DATE_KEY = 'lastDate';

// Get current date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Initialize the counter on page load
function initializeCounter() {
    const today = getTodayDate();
    const lastDate = localStorage.getItem(LAST_DATE_KEY);
    const countValueElement = document.getElementById('countValue');

    // If the last saved date is not today, reset counter to 0
    if (lastDate !== today) {
        localStorage.setItem(DAILY_COUNT_KEY, '0');
        localStorage.setItem(LAST_DATE_KEY, today);
        countValueElement.textContent = '0';
    } else {
        // Load the saved count from today
        const savedCount = localStorage.getItem(DAILY_COUNT_KEY) || '0';
        countValueElement.textContent = savedCount;
    }
}

// Increment counter and save to localStorage
function incrementCounter() {
    const countValueElement = document.getElementById('countValue');
    let currentCount = parseInt(countValueElement.textContent, 10);
    currentCount++;

    countValueElement.textContent = currentCount;
    localStorage.setItem(DAILY_COUNT_KEY, currentCount.toString());

    // Optional: Add a visual feedback animation
    addClickAnimation();
}

// Add click animation to the button
function addClickAnimation() {
    const button = document.getElementById('incrementBtn');
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
}

// Decrement counter and save to localStorage
function undoCounter() {
    const countValueElement = document.getElementById('countValue');
    let currentCount = parseInt(countValueElement.textContent, 10);
    
    if (currentCount > 0) {
        currentCount--;
        countValueElement.textContent = currentCount;
        localStorage.setItem(DAILY_COUNT_KEY, currentCount.toString());
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Supabase auth check
    if (window.supabaseClient) {
        try {
            const { data, error } = await window.supabaseClient.auth.getUser();
            if (!data || !data.user) {
                window.location.href = 'login.html';
                return;
            }
        } catch (e) {
            window.location.href = 'login.html';
            return;
        }
    }
    initializeCounter();

    const incrementBtn = document.getElementById('incrementBtn');
    incrementBtn.addEventListener('click', incrementCounter);

    const undoBtn = document.getElementById('undoBtn');
    undoBtn.addEventListener('click', undoCounter);
});
