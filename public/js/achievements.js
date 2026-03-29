/* ========= ACHIEVEMENTS SYSTEM ========= */
const Achievements = (() => {
  const definitions = [
    { id: 'first_blood', name: 'First Blood', description: 'Win your first battle', icon: '⚔' },
    { id: 'slime_slayer', name: 'Slime Slayer', description: 'Defeat 10 slimes', icon: '🟢' },
    { id: 'monster_hunter', name: 'Monster Hunter', description: 'Defeat 50 enemies total', icon: '💀' },
    { id: 'zoologist', name: 'Zoologist', description: 'Discover all enemy types', icon: '📖' },
    { id: 'quest_master', name: 'Quest Master', description: 'Complete all story quests', icon: '📜' },
    { id: 'shadow_slayer', name: 'Shadow Slayer', description: 'Defeat the Shadow Lord', icon: '👑' },
    { id: 'treasure_hunter', name: 'Treasure Hunter', description: 'Open all treasure chests', icon: '🗝' },
    { id: 'first_craft', name: 'Crafty', description: 'Craft your first item', icon: '🔨' },
    { id: 'master_crafter', name: 'Master Crafter', description: 'Craft 5 different recipes', icon: '⚒' },
    { id: 'wealthy', name: 'Wealthy', description: 'Accumulate 500 gold', icon: '💰' },
    { id: 'level_10', name: 'Veteran', description: 'Reach level 10', icon: '⭐' },
    { id: 'fully_equipped', name: 'Fully Equipped', description: 'Fill all 3 equipment slots', icon: '🛡' },
    { id: 'ancient_explorer', name: 'Ancient Explorer', description: 'Enter the Ancient Ruins', icon: '🏛' },
    { id: 'ancient_vanquisher', name: 'Ancient Vanquisher', description: 'Defeat the Ancient Guardian', icon: '🏆' },
    { id: 'phoenix_rise', name: 'Phoenix Rise', description: 'Revive with a Phoenix Feather', icon: '🔥' },
    { id: 'frozen_explorer', name: 'Frozen Explorer', description: 'Enter the Frozen Peaks', icon: '❄' },
    { id: 'drake_slayer', name: 'Drake Slayer', description: 'Defeat the Crystal Drake', icon: '🐉' },
    { id: 'frost_crafter', name: 'Frost Crafter', description: 'Craft a Frozen Peaks item', icon: '🧊' },
    { id: 'talent_apprentice', name: 'Talent Apprentice', description: 'Unlock your first talent', icon: '💎' },
  ];

  // Unlocked achievements: Set of ids
  const unlocked = new Set();
  // Counters for progressive achievements
  const counters = {
    battlesWon: 0,
    slimesDefeated: 0,
    totalDefeated: 0,
    craftCount: 0,
    uniqueCrafts: new Set(),
  };

  function getDefinitions() {
    return definitions.map(d => ({ ...d }));
  }

  function isUnlocked(id) {
    return unlocked.has(id);
  }

  function unlock(id) {
    if (unlocked.has(id)) return false;
    const def = definitions.find(d => d.id === id);
    if (!def) return false;
    unlocked.add(id);
    // Show toast notification
    if (typeof HUD !== 'undefined') {
      HUD.addToast(`${def.icon} Achievement: ${def.name}!`, '#ffaa00', 4500);
    }
    if (typeof AudioSystem !== 'undefined') {
      AudioSystem.playSFX('achievement');
    }
    return true;
  }

  function getUnlockedCount() {
    return unlocked.size;
  }

  function getTotalCount() {
    return definitions.length;
  }

  // Called after a battle victory
  function onBattleVictory(enemyType) {
    counters.battlesWon++;
    counters.totalDefeated++;

    if (counters.battlesWon === 1) {
      unlock('first_blood');
    }

    if (enemyType === 'slime') {
      counters.slimesDefeated++;
      if (counters.slimesDefeated >= 10) {
        unlock('slime_slayer');
      }
    }

    if (counters.totalDefeated >= 50) {
      unlock('monster_hunter');
    }

    if (enemyType === 'shadowLord') {
      unlock('shadow_slayer');
    }

    if (enemyType === 'ancientGuardian') {
      unlock('ancient_vanquisher');
    }

    if (enemyType === 'crystalDrake') {
      unlock('drake_slayer');
    }
  }

  // Called after crafting
  function onCraft(recipeId) {
    counters.craftCount++;
    counters.uniqueCrafts.add(recipeId);

    if (counters.craftCount === 1) {
      unlock('first_craft');
    }
    if (counters.uniqueCrafts.size >= 5) {
      unlock('master_crafter');
    }
    if (recipeId === 'craft_frostBlade' || recipeId === 'craft_crystalArmor' || recipeId === 'craft_warmthAmulet') {
      unlock('frost_crafter');
    }
  }

  // Called periodically to check passive achievements
  function checkPassive() {
    const ps = Player.getState();

    if (ps.gold >= 500) {
      unlock('wealthy');
    }

    if (ps.level >= 10) {
      unlock('level_10');
    }

    if (ps.weapon && ps.armor && ps.accessory) {
      unlock('fully_equipped');
    }

    // Check bestiary completion
    if (typeof Bestiary !== 'undefined') {
      const totalEnemyTypes = 11; // 8 original + 3 frozen peaks
      if (Bestiary.getDiscoveredCount() >= totalEnemyTypes) {
        unlock('zoologist');
      }
    }

    // Check quest completion
    if (typeof QuestSystem !== 'undefined') {
      const log = QuestSystem.getQuestLog();
      if (log.length > 0 && log.every(q => q.completed)) {
        unlock('quest_master');
      }
    }
  }

  // Called on map enter
  function onMapEnter(mapName) {
    if (mapName === 'Ancient Ruins') {
      unlock('ancient_explorer');
    }
    if (mapName === 'Frozen Peaks') {
      unlock('frozen_explorer');
    }
  }

  // Called when a chest is opened
  function onChestOpen() {
    // Count all chests across all maps
    const mapNames = ['village', 'forest', 'dungeon', 'ruins', 'peaks'];
    let totalChests = 0;
    let openedChests = 0;
    for (const name of mapNames) {
      const map = MapData.getMap(name);
      if (!map || !map.chests) continue;
      totalChests += map.chests.length;
      openedChests += map.chests.filter(c => c.opened).length;
    }
    if (totalChests > 0 && openedChests >= totalChests) {
      unlock('treasure_hunter');
    }
  }

  // Called on phoenix feather revive
  function onPhoenixRevive() {
    unlock('phoenix_rise');
  }

  // Called on talent unlock
  function onTalentUnlock() {
    unlock('talent_apprentice');
  }

  // Save/Load
  function getState() {
    return {
      unlocked: Array.from(unlocked),
      counters: {
        battlesWon: counters.battlesWon,
        slimesDefeated: counters.slimesDefeated,
        totalDefeated: counters.totalDefeated,
        craftCount: counters.craftCount,
        uniqueCrafts: Array.from(counters.uniqueCrafts),
      },
    };
  }

  function loadState(state) {
    if (!state || typeof state !== 'object') return;
    unlocked.clear();
    if (Array.isArray(state.unlocked)) {
      for (const id of state.unlocked) unlocked.add(id);
    }
    if (state.counters) {
      counters.battlesWon = state.counters.battlesWon || 0;
      counters.slimesDefeated = state.counters.slimesDefeated || 0;
      counters.totalDefeated = state.counters.totalDefeated || 0;
      counters.craftCount = state.counters.craftCount || 0;
      counters.uniqueCrafts = new Set(state.counters.uniqueCrafts || []);
    }
  }

  return {
    getDefinitions, isUnlocked, unlock, getUnlockedCount, getTotalCount,
    onBattleVictory, onCraft, checkPassive, onMapEnter, onChestOpen, onPhoenixRevive, onTalentUnlock,
    getState, loadState,
  };
})();
