/* ========= BESTIARY (Monster Journal) ========= */
const Bestiary = (() => {
  // entries: { [enemyType]: { seen: bool, defeated: int } }
  const entries = {};

  function recordSeen(type) {
    if (!entries[type]) entries[type] = { seen: true, defeated: 0 };
    entries[type].seen = true;
  }

  function recordDefeat(type) {
    if (!entries[type]) entries[type] = { seen: true, defeated: 0 };
    entries[type].defeated++;
  }

  function getEntry(type) {
    return entries[type] || null;
  }

  function getAllEntries() {
    return { ...entries };
  }

  function getDiscoveredCount() {
    return Object.keys(entries).length;
  }

  function getTotalDefeated() {
    let total = 0;
    for (const key in entries) {
      total += entries[key].defeated;
    }
    return total;
  }

  // For save/load
  function getState() {
    const state = {};
    for (const key in entries) {
      state[key] = { seen: entries[key].seen, defeated: entries[key].defeated };
    }
    return state;
  }

  function loadState(state) {
    if (!state || typeof state !== 'object') return;
    // Clear and reload
    for (const key in entries) delete entries[key];
    for (const key in state) {
      entries[key] = { seen: !!state[key].seen, defeated: state[key].defeated || 0 };
    }
  }

  return {
    recordSeen, recordDefeat, getEntry, getAllEntries,
    getDiscoveredCount, getTotalDefeated,
    getState, loadState,
  };
})();
