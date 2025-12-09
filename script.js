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
  // Hamburger menu logic (shared)
  if (window.initMenu) window.initMenu();

  // Elements
  const countValueElement = document.getElementById('countValue');
  const countValueJElement = document.getElementById('countValueJ');
  const totalValueElement = document.getElementById('totalValue');
  const incrementBtn = document.getElementById('incrementBtn');
  const undoBtn = document.getElementById('undoBtn');
  const btnC = document.getElementById('btnC');
  const btnJ = document.getElementById('btnJ');

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
  const consumableIds = ['C', 'J'];
  let activeConsumable = 'C';
  let currentCounts = { C: 0, J: 0 };
  let currentRowIds = { C: null, J: null };

  async function loadDailyCounts() {
    try {
      const { data, error } = await window.supabaseClient
        .from('daily_counts')
        .select('id, count, consumable_id')
        .eq('user_id', currentUser.id)
        .eq('date', today);

      if (error) {
        console.error('Error loading daily counts:', error);
      }

      currentCounts = { C: 0, J: 0 };
      currentRowIds = { C: null, J: null };

      if (Array.isArray(data)) {
        for (const row of data) {
          const cid = row.consumable_id;
          if (consumableIds.includes(cid)) {
            currentCounts[cid] = row.count || 0;
            currentRowIds[cid] = row.id;
          }
        }
      }
      updateUI();
    } catch (e) {
      console.error('Exception while loading daily counts:', e);
    }
  }

  async function saveDailyCount(consumableId) {
    try {
      if (currentRowIds[consumableId] === null) {
        // Insert
        const { data, error } = await window.supabaseClient
          .from('daily_counts')
          .insert({
            user_id: currentUser.id,
            date: today,
            consumable_id: consumableId,
            count: currentCounts[consumableId],
          })
          .select()
          .single();
        if (error) {
          console.error('Error inserting daily count:', error);
          return;
        }
        currentRowIds[consumableId] = data.id;
      } else {
        // Update
        const { error } = await window.supabaseClient
          .from('daily_counts')
          .update({ count: currentCounts[consumableId] })
          .eq('id', currentRowIds[consumableId]);
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
    if (countValueElement) countValueElement.textContent = String(currentCounts['C']);
    if (countValueJElement) countValueJElement.textContent = String(currentCounts['J']);
    if (totalValueElement) totalValueElement.textContent = String(currentCounts['C'] + currentCounts['J']);
    // Style toggle
    if (btnC && btnJ) {
      btnC.classList.toggle('active', activeConsumable === 'C');
      btnJ.classList.toggle('active', activeConsumable === 'J');
    }
    document.body.classList.toggle('theme-standard', activeConsumable === 'C');
    document.body.classList.toggle('theme-join', activeConsumable === 'J');
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
    currentCounts[activeConsumable] += 1;
    updateUI();
    addClickAnimation();
    await saveDailyCount(activeConsumable);
  }

  async function handleUndo() {
    if (currentCounts[activeConsumable] <= 0) return;
    currentCounts[activeConsumable] -= 1;
    updateUI();
    await saveDailyCount(activeConsumable);
  }

  function setActiveConsumable(cid) {
    activeConsumable = cid;
    updateUI();
  }

  if (btnC) btnC.addEventListener('click', () => setActiveConsumable('C'));
  if (btnJ) btnJ.addEventListener('click', () => setActiveConsumable('J'));

  // --- 5. Init ---

  await loadDailyCounts();

  if (incrementBtn) {
    incrementBtn.addEventListener('click', handleIncrement);
  }
  if (undoBtn) {
    undoBtn.addEventListener('click', handleUndo);
  }
});
