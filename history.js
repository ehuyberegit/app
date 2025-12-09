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
function formatDisplayDate(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
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
    let currentYear = now.getFullYear();
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
                if (!days[d]) days[d] = { countC: 0, countJ: 0, total: 0 };
                const cid = row.consumable_id;
                const value = row.count || 0;
                if (cid === 'C') days[d].countC += value;
                if (cid === 'J') days[d].countJ += value;
                days[d].total = days[d].countC + days[d].countJ;
            }
        }
        return days;
    }

    function renderHistoryGrid(days, year, monthIndex) {
        if (!historyGrid) return;
        historyGrid.innerHTML = '';

        const daysInMonth = getDaysInMonth(year, monthIndex);
        const firstDayOffset = new Date(year, monthIndex, 1).getDay(); // 0 (Sun) - 6 (Sat)

        // Pad empty cells before the first day to align the grid
        for (let i = 0; i < firstDayOffset; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell';
            historyGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDate(year, monthIndex, day);
            const stats = days[dateStr] || { countC: 0, countJ: 0, total: 0 };

            const cell = document.createElement('div');
            cell.className = 'day-cell';

            const circle = document.createElement('div');
            circle.className = 'day-circle' + (stats.total > 0 ? ' day-circle--active' : '');
            circle.textContent = day;

            const statsRow = document.createElement('div');
            statsRow.className = 'day-stats-mini';
            statsRow.innerHTML = `
                <span class="day-total">T=${stats.total}</span>
                <span class="day-c">C=${stats.countC}</span>
                <span class="day-j">J=${stats.countJ}</span>
            `;

            cell.appendChild(circle);
            cell.appendChild(statsRow);
            historyGrid.appendChild(cell);
        }
    }

    async function updateHistory(monthIndex) {
        currentMonthLabel.textContent = `${MONTHS[monthIndex]} ${currentYear}`;
        const days = await loadHistoryForMonth(currentYear, monthIndex);
        renderHistoryGrid(days, currentYear, monthIndex);
        // Calcul du total du mois
        let monthTotal = 0;
        let todayTotal = 0;
        const todayStr = getTodayDate();
        Object.entries(days).forEach(([date, counts]) => {
            monthTotal += (counts.total || 0);
            if (date === todayStr) {
                todayTotal = (counts.total || 0);
            }
        });
        if (historySummary) {
            historySummary.textContent = `MONTH TOTAL : ${monthTotal}` + (monthIndex === (new Date()).getMonth() ? ` | TODAY : ${todayTotal}` : '');
        }
    }

    // Initial load
    await updateHistory(currentMonthIndex);

    monthSelect.addEventListener('change', async (e) => {
        const selectedMonth = parseInt(monthSelect.value, 10);
        await updateHistory(selectedMonth);
    });
});
