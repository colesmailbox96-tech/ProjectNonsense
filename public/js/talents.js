/* ========= TALENT SYSTEM ========= */
const TalentSystem = (() => {
  const paths = {
    might: [
      { id: 'iron_will', name: 'Iron Will', description: '+10% Max HP', cost: 1, icon: '❤' },
      { id: 'heavy_strikes', name: 'Heavy Strikes', description: '+15% ATK', cost: 2, icon: '⚔' },
      { id: 'critical_edge', name: 'Critical Edge', description: '+10% Crit Chance', cost: 3, icon: '⚡' },
      { id: 'berserker', name: 'Berserker', description: '+25% DMG when HP < 30%', cost: 4, icon: '🔥' },
    ],
    arcane: [
      { id: 'mana_well', name: 'Mana Well', description: '+20% Max MP', cost: 1, icon: '💧' },
      { id: 'efficiency', name: 'Efficiency', description: '-20% MP costs', cost: 2, icon: '✨' },
      { id: 'healing_touch', name: 'Healing Touch', description: '+30% healing power', cost: 3, icon: '💚' },
      { id: 'arcane_mastery', name: 'Arcane Mastery', description: '+20% skill damage', cost: 4, icon: '🌟' },
    ],
    survival: [
      { id: 'thick_skin', name: 'Thick Skin', description: '+15% DEF', cost: 1, icon: '🛡' },
      { id: 'fortune', name: 'Fortune', description: '+25% gold from battles', cost: 2, icon: '💰' },
      { id: 'quick_feet', name: 'Quick Feet', description: '+15% flee chance', cost: 3, icon: '👟' },
      { id: 'second_wind', name: 'Second Wind', description: 'Regen 5% HP per battle turn', cost: 4, icon: '💨' },
    ],
  };

  // Unlocked talents: { might: [false,false,false,false], arcane: [...], survival: [...] }
  const unlocked = {
    might: [false, false, false, false],
    arcane: [false, false, false, false],
    survival: [false, false, false, false],
  };

  function getPointsSpent() {
    let total = 0;
    for (const path of Object.keys(paths)) {
      for (let i = 0; i < unlocked[path].length; i++) {
        if (unlocked[path][i]) total += paths[path][i].cost;
      }
    }
    return total;
  }

  function getAvailablePoints() {
    const ps = Player.getState();
    return Math.max(0, ps.level - 1) - getPointsSpent();
  }

  function canUnlock(pathName, tierIndex) {
    if (!paths[pathName] || tierIndex < 0 || tierIndex >= paths[pathName].length) return false;
    if (unlocked[pathName][tierIndex]) return false;
    // Must have previous tier unlocked (except tier 0)
    if (tierIndex > 0 && !unlocked[pathName][tierIndex - 1]) return false;
    // Must have enough points
    return getAvailablePoints() >= paths[pathName][tierIndex].cost;
  }

  function unlock(pathName, tierIndex) {
    if (!canUnlock(pathName, tierIndex)) return false;
    unlocked[pathName][tierIndex] = true;
    if (typeof Achievements !== 'undefined') Achievements.onTalentUnlock();
    return true;
  }

  function hasTalent(talentId) {
    for (const path of Object.keys(paths)) {
      for (let i = 0; i < paths[path].length; i++) {
        if (paths[path][i].id === talentId && unlocked[path][i]) return true;
      }
    }
    return false;
  }

  function getPaths() {
    return paths;
  }

  function getUnlocked() {
    return unlocked;
  }

  // Bonus calculators for battle integration
  function getMaxHpBonus() {
    return hasTalent('iron_will') ? 0.10 : 0;
  }

  function getAtkBonus() {
    return hasTalent('heavy_strikes') ? 0.15 : 0;
  }

  function getCritBonus() {
    return hasTalent('critical_edge') ? 0.10 : 0;
  }

  function getBerserkerBonus(currentHp, maxHp) {
    if (hasTalent('berserker') && currentHp < maxHp * 0.3) return 0.25;
    return 0;
  }

  function getMaxMpBonus() {
    return hasTalent('mana_well') ? 0.20 : 0;
  }

  function getMpCostReduction() {
    return hasTalent('efficiency') ? 0.20 : 0;
  }

  function getHealBonus() {
    return hasTalent('healing_touch') ? 0.30 : 0;
  }

  function getSkillDmgBonus() {
    return hasTalent('arcane_mastery') ? 0.20 : 0;
  }

  function getDefBonus() {
    return hasTalent('thick_skin') ? 0.15 : 0;
  }

  function getGoldBonus() {
    return hasTalent('fortune') ? 0.25 : 0;
  }

  function getFleeBonus() {
    return hasTalent('quick_feet') ? 0.15 : 0;
  }

  function getRegenPerTurn() {
    if (!hasTalent('second_wind')) return 0;
    const ps = Player.getState();
    return Math.max(1, Math.floor(ps.maxHp * 0.05));
  }

  // Save/Load
  function getState() {
    return {
      might: [...unlocked.might],
      arcane: [...unlocked.arcane],
      survival: [...unlocked.survival],
    };
  }

  function loadState(state) {
    if (!state || typeof state !== 'object') return;
    for (const path of ['might', 'arcane', 'survival']) {
      if (Array.isArray(state[path])) {
        for (let i = 0; i < 4; i++) {
          unlocked[path][i] = !!state[path][i];
        }
      }
    }
  }

  return {
    getPaths, getUnlocked, getAvailablePoints, getPointsSpent,
    canUnlock, unlock, hasTalent,
    getMaxHpBonus, getAtkBonus, getCritBonus, getBerserkerBonus,
    getMaxMpBonus, getMpCostReduction, getHealBonus, getSkillDmgBonus,
    getDefBonus, getGoldBonus, getFleeBonus, getRegenPerTurn,
    getState, loadState,
  };
})();
