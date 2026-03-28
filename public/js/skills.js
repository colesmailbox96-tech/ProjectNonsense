/* ========= PLAYER SKILL SYSTEM ========= */
const SkillDB = (() => {
  const skills = {
    powerStrike: {
      name: 'Power Strike',
      description: 'Heavy blow dealing 1.5x damage',
      mpCost: 5,
      multiplier: 1.5,
      type: 'attack',
      unlockLevel: 1,
    },
    heal: {
      name: 'Heal',
      description: 'Restore HP based on level',
      mpCost: 8,
      type: 'heal',
      unlockLevel: 3,
    },
    flameStrike: {
      name: 'Flame Strike',
      description: 'Fiery slash dealing 1.8x damage',
      mpCost: 10,
      multiplier: 1.8,
      type: 'attack',
      unlockLevel: 5,
    },
    shieldBash: {
      name: 'Shield Bash',
      description: '1.2x damage with chance to stun',
      mpCost: 6,
      multiplier: 1.2,
      type: 'attack',
      statusEffect: 'stun',
      statusChance: 0.4,
      unlockLevel: 7,
    },
    wardingLight: {
      name: 'Warding Light',
      description: 'Raise DEF for 3 turns',
      mpCost: 7,
      type: 'buff',
      buffStat: 'defense',
      buffAmount: 0.4,
      buffDuration: 3,
      unlockLevel: 9,
    },
    holySmite: {
      name: 'Holy Smite',
      description: 'Radiant blast dealing 2.2x damage',
      mpCost: 15,
      multiplier: 2.2,
      type: 'attack',
      unlockLevel: 12,
    },
  };

  function getSkill(id) {
    return skills[id] ? { ...skills[id], id } : null;
  }

  function getLearnedSkills(level) {
    return Object.entries(skills)
      .filter(([, s]) => s.unlockLevel <= level)
      .map(([id, s]) => ({ ...s, id }));
  }

  function getNewSkillsAtLevel(level) {
    return Object.entries(skills)
      .filter(([, s]) => s.unlockLevel === level)
      .map(([id, s]) => ({ ...s, id }));
  }

  return { getSkill, getLearnedSkills, getNewSkillsAtLevel };
})();
