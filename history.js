function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getMonthDates(year, month) {
    const dates = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
        dates.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return dates;
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

    // Get current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const today = getTodayDate();
    const monthDates = getMonthDates(year, month);

    // Load history
    const { data: historyData, error: historyError } = await window.supabaseClient
        .from('daily_counts')
        .select('date, count')
        .eq('user_id', currentUser.id)
        .order('date', { ascending: true });

    const dateToCount = {};
    let monthTotal = 0;
    let todayCount = 0;
    if (Array.isArray(historyData)) {
        for (const row of historyData) {
            if (monthDates.includes(row.date)) {
                dateToCount[row.date] = row.count;
                monthTotal += row.count || 0;
            }
            if (row.date === today) {
                todayCount = row.count || 0;
            }
        }
    }

    // Render grid
    const historyGrid = document.getElementById('historyGrid');
    if (historyGrid) {
        historyGrid.innerHTML = '';
        monthDates.forEach((date, idx) => {
            const count = dateToCount[date] || 0;
            const dayDiv = document.createElement('div');
            dayDiv.className = 'history-day' + (count > 0 ? ' active' : '');
            dayDiv.title = `${date}: ${count}`;
            dayDiv.textContent = new Date(date).getDate();
            if (count > 0) {
                const countSpan = document.createElement('span');
                countSpan.className = 'day-count';
                countSpan.textContent = count;
                dayDiv.appendChild(countSpan);
            }
            historyGrid.appendChild(dayDiv);
        });
    }

    // Summary
    const historySummary = document.getElementById('historySummary');
    if (historySummary) {
        historySummary.textContent = `MONTH TOTAL : ${monthTotal} | TODAY : ${todayCount}`;
    }
});
