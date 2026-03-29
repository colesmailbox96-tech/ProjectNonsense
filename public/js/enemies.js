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
      drops: [{ id: 'slimeGel', chance: 0.5 }],
    },
    goblin: {
      name: 'Forest Goblin',
      hp: 35, maxHp: 35,
      attack: 9, defense: 3, speed: 6,
      xp: 20, gold: 12,
      sprite: 'goblin',
      skills: ['powerStrike'],
      drops: [{ id: 'goblinFang', chance: 0.4 }, { id: 'ironOre', chance: 0.2 }],
    },
    skeleton: {
      name: 'Skeleton Warrior',
      hp: 50, maxHp: 50,
      attack: 14, defense: 6, speed: 4,
      xp: 35, gold: 20,
      sprite: 'skeleton',
      skills: ['boneThrow'],
      drops: [{ id: 'boneShard', chance: 0.5 }, { id: 'shadowDust', chance: 0.2 }],
    },
    darkKnight: {
      name: 'Dark Knight',
      hp: 80, maxHp: 80,
      attack: 20, defense: 12, speed: 5,
      xp: 60, gold: 40,
      sprite: 'darkKnight',
      skills: ['darkSlash', 'powerStrike'],
      drops: [{ id: 'darkPlate', chance: 0.4 }, { id: 'ironOre', chance: 0.3 }],
    },
    shadowLord: {
      name: 'Shadow Lord',
      hp: 200, maxHp: 200,
      attack: 28, defense: 16, speed: 7,
      xp: 150, gold: 100,
      sprite: 'shadowLord',
      skills: ['darkSlash', 'shadowBlast', 'powerStrike'],
      isBoss: true,
      drops: [{ id: 'shadowEssence', chance: 1.0 }, { id: 'shadowDust', chance: 1.0 }],
    },
    wraith: {
      name: 'Wraith',
      hp: 65, maxHp: 65,
      attack: 18, defense: 5, speed: 9,
      xp: 50, gold: 30,
      sprite: 'wraith',
      skills: ['spectralTouch', 'darkSlash'],
      drops: [{ id: 'spectralDust', chance: 0.5 }, { id: 'shadowDust', chance: 0.3 }],
    },
    stoneGolem: {
      name: 'Stone Golem',
      hp: 120, maxHp: 120,
      attack: 22, defense: 20, speed: 2,
      xp: 70, gold: 50,
      sprite: 'stoneGolem',
      skills: ['rockSmash', 'powerStrike'],
      drops: [{ id: 'runeFragment', chance: 0.5 }, { id: 'ironOre', chance: 0.4 }],
    },
    ancientGuardian: {
      name: 'Ancient Guardian',
      hp: 350, maxHp: 350,
      attack: 35, defense: 22, speed: 6,
      xp: 250, gold: 200,
      sprite: 'ancientGuardian',
      skills: ['rockSmash', 'ancientBeam', 'powerStrike'],
      isBoss: true,
      drops: [{ id: 'ancientCore', chance: 1.0 }, { id: 'runeFragment', chance: 1.0 }],
    },
  };

  const skills = {
    powerStrike: { name: 'Power Strike', multiplier: 1.5 },
    boneThrow: { name: 'Bone Throw', multiplier: 1.3 },
    darkSlash: { name: 'Dark Slash', multiplier: 1.8 },
    shadowBlast: { name: 'Shadow Blast', multiplier: 2.0 },
    spectralTouch: { name: 'Spectral Touch', multiplier: 1.6 },
    rockSmash: { name: 'Rock Smash', multiplier: 1.7 },
    ancientBeam: { name: 'Ancient Beam', multiplier: 2.2 },
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
