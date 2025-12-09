function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function getDaysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
}
function formatDate(year, monthIndex, day) {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

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

    // DOM elements
    const monthSelect = document.getElementById('monthSelect');
    const currentMonthLabel = document.getElementById('currentMonthLabel');
    const historyGrid = document.getElementById('historyGrid');
    const historySummary = document.getElementById('historySummary');

    // Setup month select
    const now = new Date();
    const currentYear = now.getFullYear();
    let currentMonthIndex = now.getMonth();

    MONTHS.forEach((name, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = name;
        if (idx === currentMonthIndex) opt.selected = true;
        monthSelect.appendChild(opt);
    });

    async function loadHistoryForMonth(year, monthIndex) {
        const daysInMonth = getDaysInMonth(year, monthIndex);
        const startDate = formatDate(year, monthIndex, 1);
        const endDate = formatDate(year, monthIndex, daysInMonth);

        const { data, error } = await window.supabaseClient
            .from('daily_counts')
            .select('date, count, consumable_id')
            .eq('user_id', currentUser.id)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) {
            console.error('Error loading history:', error);
        }
        if (!Array.isArray(data)) {
            console.warn('No history data found for this month.');
        }

        // Grouper par date
        const days = {};
        if (Array.isArray(data)) {
            for (const row of data) {
                const d = row.date;
                if (!days[d]) days[d] = { C: 0, J: 0 };
                days[d][row.consumable_id] = row.count || 0;
            }
        }
        return days;
    }

    function renderHistoryGrid(days) {
        historyGrid.innerHTML = '';
        Object.entries(days).forEach(([date, counts]) => {
            const total = (counts.C || 0) + (counts.J || 0);
            const card = document.createElement('div');
            card.className = 'history-card';
            card.innerHTML = `
                <div class="history-date">${date}</div>
                <div class="history-counts-col">
                    <div class="count-c">Cigarettes : ${counts.C || 0}</div>
                    <div class="count-j">Joints : ${counts.J || 0}</div>
                    <div class="count-total">Total jour : ${total}</div>
                </div>
            `;
            historyGrid.appendChild(card);
        });
    }

    async function updateHistory(monthIndex) {
        currentMonthLabel.textContent = `${MONTHS[monthIndex]} ${currentYear}`;
        const days = await loadHistoryForMonth(currentYear, monthIndex);
        renderHistoryGrid(days);
        // Calcul du total du mois
        let monthTotal = 0;
        let todayTotal = 0;
        const todayStr = getTodayDate();
        Object.entries(days).forEach(([date, counts]) => {
            monthTotal += (counts.C || 0) + (counts.J || 0);
            if (date === todayStr) {
                todayTotal = (counts.C || 0) + (counts.J || 0);
            }
        });
        historySummary.textContent = `MONTH TOTAL : ${monthTotal}` + (monthIndex === (new Date()).getMonth() ? ` | TODAY : ${todayTotal}` : '');
    }

    // Initial load
    await updateHistory(currentMonthIndex);

    monthSelect.addEventListener('change', async (e) => {
        const selectedMonth = parseInt(monthSelect.value, 10);
        await updateHistory(selectedMonth);
    });
});
