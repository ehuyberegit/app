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
            .select('date, count')
            .eq('user_id', currentUser.id)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        const countsByDay = {};
        let monthTotal = 0;
        let todayCount = 0;
        if (Array.isArray(data)) {
            for (const row of data) {
                const d = new Date(row.date).getDate();
                countsByDay[d] = row.count;
                monthTotal += row.count || 0;
                // Today count
                const today = new Date();
                if (
                    today.getFullYear() === year &&
                    today.getMonth() === monthIndex &&
                    today.getDate() === d
                ) {
                    todayCount = row.count || 0;
                }
            }
        }
        return { countsByDay, monthTotal, todayCount };
    }

    function renderHistoryGrid(year, monthIndex, countsByDay) {
        const daysInMonth = getDaysInMonth(year, monthIndex);
        historyGrid.innerHTML = '';
        for (let d = 1; d <= daysInMonth; d++) {
            const count = countsByDay[d] || 0;
            const cell = document.createElement('div');
            cell.className = 'day-cell';

            const circle = document.createElement('div');
            circle.className = 'day-circle' + (count > 0 ? ' day-circle--active' : '');
            circle.textContent = d;

            cell.appendChild(circle);

            if (count > 0) {
                const countDiv = document.createElement('div');
                countDiv.className = 'day-count';
                countDiv.textContent = count;
                cell.appendChild(countDiv);
            }
            historyGrid.appendChild(cell);
        }
    }

    async function updateHistory(monthIndex) {
        currentMonthLabel.textContent = `${MONTHS[monthIndex]} ${currentYear}`;
        const { countsByDay, monthTotal, todayCount } = await loadHistoryForMonth(currentYear, monthIndex);
        renderHistoryGrid(currentYear, monthIndex, countsByDay);
        historySummary.textContent = `MONTH TOTAL : ${monthTotal}` + (monthIndex === (new Date()).getMonth() ? ` | TODAY : ${todayCount}` : '');
    }

    // Initial load
    await updateHistory(currentMonthIndex);

    monthSelect.addEventListener('change', async (e) => {
        const selectedMonth = parseInt(monthSelect.value, 10);
        await updateHistory(selectedMonth);
    });
});
