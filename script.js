// --- Helpers ---

// Get current date in YYYY-MM-DD format
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const countValueElement = document.getElementById('countValue');
  const incrementBtn = document.getElementById('incrementBtn');
  const undoBtn = document.getElementById('undoBtn');

  if (!window.supabaseClient) {
    console.error('Supabase client not found');
    return;
  }

  // --- 1. Auth check ---

  let currentUser = null;
  try {
    const { data, error } = await window.supabaseClient.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
    }
    if (!data || !data.user) {
      // Not logged in -> go to landing
      window.location.href = 'landing.html';
      return;
    }
    currentUser = data.user;
  } catch (e) {
    console.error('Auth check failed:', e);
    window.location.href = 'landing.html';
    return;
  }

  // --- 2. State for today ---

  const today = getTodayDate();
  let currentRowId = null;
  let currentCount = 0;

  async function loadDailyCount() {
    try {
      const { data, error } = await window.supabaseClient
        .from('daily_counts')
        .select('id, count')
        .eq('user_id', currentUser.id)
        .eq('date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows, with maybeSingle => treat as no data
        console.error('Error loading daily count:', error);
      }

      if (!data) {
        // No row for today -> start at 0
        currentRowId = null;
        currentCount = 0;
      } else {
        currentRowId = data.id;
        currentCount = data.count || 0;
      }

      if (countValueElement) {
        countValueElement.textContent = String(currentCount);
      }
    } catch (e) {
      console.error('Exception while loading daily count:', e);
      currentRowId = null;
      currentCount = 0;
      if (countValueElement) {
        countValueElement.textContent = '0';
      }
    }
  }

  async function saveDailyCount() {
    try {
      if (currentRowId === null) {
        // First time today -> insert
        const { data, error } = await window.supabaseClient
          .from('daily_counts')
          .insert({
            user_id: currentUser.id,
            date: today,
            count: currentCount,
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting daily count:', error);
          return;
        }
        currentRowId = data.id;
      } else {
        // Row already exists -> update
        const { error } = await window.supabaseClient
          .from('daily_counts')
          .update({ count: currentCount })
          .eq('id', currentRowId);

        if (error) {
          console.error('Error updating daily count:', error);
        }
      }
    } catch (e) {
      console.error('Exception while saving daily count:', e);
    }
  }

  // --- 3. UI helpers ---

  function updateUI() {
    if (countValueElement) {
      countValueElement.textContent = String(currentCount);
    }
  }

  function addClickAnimation() {
    if (!incrementBtn) return;
    incrementBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      incrementBtn.style.transform = '';
    }, 150);
  }

  // --- 4. Button handlers ---

  async function handleIncrement() {
    currentCount += 1;
    updateUI();
    addClickAnimation();
    await saveDailyCount();
  }

  async function handleUndo() {
    if (currentCount <= 0) return;
    currentCount -= 1;
    updateUI();
    await saveDailyCount();
  }

  // --- 5. Init ---

  await loadDailyCount();

  if (incrementBtn) {
    incrementBtn.addEventListener('click', handleIncrement);
  }
  if (undoBtn) {
    undoBtn.addEventListener('click', handleUndo);
  }
});
