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
    { id: 'sky_explorer', name: 'Sky Explorer', description: 'Enter the Celestial Sanctum', icon: '☁' },
    { id: 'wyrm_slayer', name: 'Wyrm Slayer', description: 'Defeat the Celestial Wyrm', icon: '🌟' },
    { id: 'storm_crafter', name: 'Storm Crafter', description: 'Craft a Celestial Sanctum item', icon: '⚡' },
    { id: 'world_explorer', name: 'World Explorer', description: 'Visit all 15 maps', icon: '🌍' },
    { id: 'abyss_explorer', name: 'Abyss Explorer', description: 'Enter the Abyssal Depths', icon: '🕳' },
    { id: 'chaos_slayer', name: 'Chaos Slayer', description: 'Defeat the Chaos Dragon', icon: '🐲' },
    { id: 'abyss_crafter', name: 'Abyss Crafter', description: 'Craft an Abyssal Depths item', icon: '🔮' },
    { id: 'volcano_explorer', name: 'Volcano Explorer', description: 'Enter the Volcanic Forge', icon: '🌋' },
    { id: 'titan_slayer', name: 'Titan Slayer', description: 'Defeat the Inferno Titan', icon: '👹' },
    { id: 'forge_crafter', name: 'Forge Master', description: 'Craft a Volcanic Forge item', icon: '⚒' },
    { id: 'gardens_explorer', name: 'Gardens Explorer', description: 'Enter the Ethereal Gardens', icon: '🌸' },
    { id: 'phoenix_slayer', name: 'Phoenix Slayer', description: 'Defeat the Eternal Phoenix', icon: '🦅' },
    { id: 'ethereal_crafter', name: 'Ethereal Crafter', description: 'Craft an Ethereal Gardens item', icon: '✨' },
    { id: 'citadel_explorer', name: 'Citadel Explorer', description: 'Enter the Twilight Citadel', icon: '🏰' },
    { id: 'void_conqueror', name: 'Void Conqueror', description: 'Defeat the Void Emperor', icon: '👁' },
    { id: 'twilight_crafter', name: 'Twilight Crafter', description: 'Craft a Twilight Citadel item', icon: '🌑' },
    { id: 'nexus_explorer', name: 'Nexus Explorer', description: 'Enter the Astral Nexus', icon: '🌌' },
    { id: 'star_conqueror', name: 'Star Conqueror', description: 'Defeat the Star Devourer', icon: '⭐' },
    { id: 'astral_crafter', name: 'Astral Crafter', description: 'Craft an Astral Nexus item', icon: '💫' },
    { id: 'rift_explorer', name: 'Rift Explorer', description: 'Enter the Temporal Rift', icon: '🕐' },
    { id: 'epoch_conqueror', name: 'Epoch Conqueror', description: 'Defeat the Epoch Weaver', icon: '⏳' },
    { id: 'temporal_crafter', name: 'Temporal Crafter', description: 'Craft a Temporal Rift item', icon: '🔮' },
    { id: 'realm_explorer', name: 'Realm Explorer', description: 'Enter the Shattered Realm', icon: '🔮' },
    { id: 'reality_conqueror', name: 'Reality Conqueror', description: 'Defeat the Reality Weaver', icon: '🌀' },
    { id: 'realm_crafter', name: 'Realm Crafter', description: 'Craft a Shattered Realm item', icon: '💎' },
    { id: 'prism_explorer', name: 'Prism Explorer', description: 'Enter the Prismatic Void', icon: '🔷' },
    { id: 'prism_conqueror', name: 'Prism Conqueror', description: 'Defeat the Prism Arbiter', icon: '💠' },
    { id: 'prism_crafter', name: 'Prism Crafter', description: 'Craft a Prismatic Void item', icon: '🌈' },
    { id: 'spire_explorer', name: 'Spire Explorer', description: 'Enter the Ethereal Spire', icon: '🗼' },
    { id: 'spire_conqueror', name: 'Spire Conqueror', description: 'Defeat the Astral Sovereign', icon: '👑' },
    { id: 'ether_crafter', name: 'Ether Crafter', description: 'Craft an Ethereal Spire item', icon: '💎' },
    { id: 'ultimate_champion', name: 'Ultimate Champion', description: 'Complete all quests and defeat all bosses', icon: '👑' },
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

    if (enemyType === 'celestialWyrm') {
      unlock('wyrm_slayer');
    }

    if (enemyType === 'chaosDragon') {
      unlock('chaos_slayer');
    }

    if (enemyType === 'infernoTitan') {
      unlock('titan_slayer');
    }
    if (enemyType === 'eternalPhoenix') {
      unlock('phoenix_slayer');
    }
    if (enemyType === 'voidEmperor') {
      unlock('void_conqueror');
    }
    if (enemyType === 'starDevourer') {
      unlock('star_conqueror');
    }
    if (enemyType === 'epochWeaver') {
      unlock('epoch_conqueror');
    }
    if (enemyType === 'realityWeaver') {
      unlock('reality_conqueror');
    }
    if (enemyType === 'prismArbiter') {
      unlock('prism_conqueror');
    }
    if (enemyType === 'astralSovereign') {
      unlock('spire_conqueror');
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
    if (recipeId === 'craft_thunderSpear' || recipeId === 'craft_celestialPlate' || recipeId === 'craft_stormweaveRing') {
      unlock('storm_crafter');
    }
    if (recipeId === 'craft_voidBlade' || recipeId === 'craft_abyssalArmor' || recipeId === 'craft_chaosRing') {
      unlock('abyss_crafter');
    }
    if (recipeId === 'craft_infernoBlade' || recipeId === 'craft_forgePlate' || recipeId === 'craft_titanBand') {
      unlock('forge_crafter');
    }
    if (recipeId === 'craft_etherealBlade' || recipeId === 'craft_etherealPlate' || recipeId === 'craft_etherealCrown') {
      unlock('ethereal_crafter');
    }
    if (recipeId === 'craft_twilightBlade' || recipeId === 'craft_twilightArmor' || recipeId === 'craft_twilightSigil') {
      unlock('twilight_crafter');
    }
    if (recipeId === 'craft_astralBlade' || recipeId === 'craft_astralArmor' || recipeId === 'craft_astralCrown') {
      unlock('astral_crafter');
    }
    if (recipeId === 'craft_temporalBlade' || recipeId === 'craft_temporalArmor' || recipeId === 'craft_temporalCirclet') {
      unlock('temporal_crafter');
    }
    if (recipeId === 'craft_realmBlade' || recipeId === 'craft_realmArmor' || recipeId === 'craft_realmPendant') {
      unlock('realm_crafter');
    }
    if (recipeId === 'craft_prismBlade' || recipeId === 'craft_prismArmor' || recipeId === 'craft_prismCrown') {
      unlock('prism_crafter');
    }
    if (recipeId === 'craft_etherBlade' || recipeId === 'craft_etherArmor' || recipeId === 'craft_etherAmulet') {
      unlock('ether_crafter');
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
      const totalEnemyTypes = 41; // 8 original + 3 frozen peaks + 3 celestial sanctum + 3 abyssal depths + 3 volcanic forge + 3 ethereal gardens + 3 twilight citadel + 3 astral nexus + 3 temporal rift + 3 shattered realm + 3 prismatic void + 3 ethereal spire
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
    if (mapName === 'Celestial Sanctum') {
      unlock('sky_explorer');
    }
    if (mapName === 'Abyssal Depths') {
      unlock('abyss_explorer');
    }
    if (mapName === 'Volcanic Forge') {
      unlock('volcano_explorer');
    }
    if (mapName === 'Ethereal Gardens') {
      unlock('gardens_explorer');
    }
    if (mapName === 'Twilight Citadel') {
      unlock('citadel_explorer');
    }
    if (mapName === 'Astral Nexus') {
      unlock('nexus_explorer');
    }
    if (mapName === 'Temporal Rift') {
      unlock('rift_explorer');
    }
    if (mapName === 'Shattered Realm') {
      unlock('realm_explorer');
    }
    if (mapName === 'Prismatic Void') {
      unlock('prism_explorer');
    }
    if (mapName === 'Ethereal Spire') {
      unlock('spire_explorer');
    }
    // Check world explorer (all 15 maps visited)
    // Village, Woods, and Cavern are required to reach later maps, so checking
    // only the optional-path achievements is sufficient
    const allMaps = ['ancient_explorer', 'frozen_explorer', 'sky_explorer', 'abyss_explorer', 'volcano_explorer', 'gardens_explorer', 'citadel_explorer', 'nexus_explorer', 'rift_explorer', 'realm_explorer', 'prism_explorer', 'spire_explorer'];
    if (allMaps.every(id => unlocked.has(id))) {
      unlock('world_explorer');
    }
    // Check ultimate champion (all bosses + world explorer)
    const allBosses = ['shadow_slayer', 'ancient_vanquisher', 'drake_slayer', 'wyrm_slayer', 'chaos_slayer', 'titan_slayer', 'phoenix_slayer', 'void_conqueror', 'star_conqueror', 'epoch_conqueror', 'reality_conqueror', 'prism_conqueror', 'spire_conqueror'];
    if (allBosses.every(id => unlocked.has(id)) && unlocked.has('world_explorer')) {
      unlock('ultimate_champion');
    }
  }

  // Called when a chest is opened
  function onChestOpen() {
    // Count all chests across all maps
    const mapNames = ['village', 'forest', 'dungeon', 'ruins', 'peaks', 'sanctum', 'abyss', 'volcano', 'gardens', 'citadel', 'nexus', 'rift', 'realm', 'prism', 'spire'];
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
