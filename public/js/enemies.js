/* ========= ENEMY DEFINITIONS ========= */
const EnemyDB = (() => {
  const templates = {
    slime: {
      name: 'Green Slime',
      hp: 20, maxHp: 20,
      attack: 5, defense: 2, speed: 3,
      xp: 10, gold: 5,
      sprite: 'slime',
      skills: [],
    },
    goblin: {
      name: 'Forest Goblin',
      hp: 35, maxHp: 35,
      attack: 9, defense: 3, speed: 6,
      xp: 20, gold: 12,
      sprite: 'goblin',
      skills: ['powerStrike'],
    },
    skeleton: {
      name: 'Skeleton Warrior',
      hp: 50, maxHp: 50,
      attack: 14, defense: 6, speed: 4,
      xp: 35, gold: 20,
      sprite: 'skeleton',
      skills: ['boneThrow'],
    },
    darkKnight: {
      name: 'Dark Knight',
      hp: 80, maxHp: 80,
      attack: 20, defense: 12, speed: 5,
      xp: 60, gold: 40,
      sprite: 'darkKnight',
      skills: ['darkSlash', 'powerStrike'],
    },
  };

  const skills = {
    powerStrike: { name: 'Power Strike', multiplier: 1.5 },
    boneThrow: { name: 'Bone Throw', multiplier: 1.3 },
    darkSlash: { name: 'Dark Slash', multiplier: 1.8 },
  };

  function create(type) {
    const tmpl = templates[type];
    if (!tmpl) return null;
    return { ...tmpl, type };
  }

  function getSkill(id) {
    return skills[id];
  }

  return { create, getSkill };
})();
