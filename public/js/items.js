/* ========= ITEM DATABASE ========= */
const ItemDB = (() => {
  const items = {
    potion: {
      name: 'Potion',
      type: 'consumable',
      description: 'Restores 30 HP',
      effect: (target) => { target.heal(30); },
      healAmount: 30,
      buyPrice: 20,
    },
    hiPotion: {
      name: 'Hi-Potion',
      type: 'consumable',
      description: 'Restores 80 HP',
      effect: (target) => { target.heal(80); },
      healAmount: 80,
      buyPrice: 60,
    },
    elixir: {
      name: 'Elixir',
      type: 'consumable',
      description: 'Fully restores HP and MP',
      effect: (target) => { target.fullHeal(); },
      healAmount: 999,
      buyPrice: 200,
    },
    ether: {
      name: 'Ether',
      type: 'consumable',
      description: 'Restores 15 MP',
      effect: (target) => { target.restoreMp(15); },
      mpAmount: 15,
      buyPrice: 30,
    },
    antidote: {
      name: 'Antidote',
      type: 'consumable',
      description: 'Cures poison',
      effect: () => { /* poison cured in battle logic */ },
      curesStatus: 'poison',
      buyPrice: 15,
    },
    smokeBomb: {
      name: 'Smoke Bomb',
      type: 'consumable',
      description: 'Guaranteed escape from battle',
      effect: () => { /* handled in battle logic */ },
      battleEscape: true,
      buyPrice: 40,
    },
    ironSword: {
      name: 'Iron Sword',
      type: 'equipment',
      equipSlot: 'weapon',
      description: 'ATK +6',
      attack: 6,
      buyPrice: 100,
    },
    steelSword: {
      name: 'Steel Sword',
      type: 'equipment',
      equipSlot: 'weapon',
      description: 'ATK +12',
      attack: 12,
      buyPrice: 250,
    },
    leatherArmor: {
      name: 'Leather Armor',
      type: 'equipment',
      equipSlot: 'armor',
      description: 'DEF +4',
      defense: 4,
      buyPrice: 80,
    },
    silverArmor: {
      name: 'Silver Armor',
      type: 'equipment',
      equipSlot: 'armor',
      description: 'DEF +10',
      defense: 10,
      buyPrice: 300,
    },
    luckyRing: {
      name: 'Lucky Ring',
      type: 'equipment',
      equipSlot: 'accessory',
      description: 'Crit +15%, SPD +2',
      critBonus: 0.15,
      speed: 2,
      buyPrice: 150,
    },
    // Crafting materials (dropped by enemies)
    slimeGel: {
      name: 'Slime Gel',
      type: 'material',
      description: 'Gooey residue from slimes',
    },
    goblinFang: {
      name: 'Goblin Fang',
      type: 'material',
      description: 'A sharp fang from a goblin',
    },
    boneShard: {
      name: 'Bone Shard',
      type: 'material',
      description: 'Fragment of an animated skeleton',
    },
    ironOre: {
      name: 'Iron Ore',
      type: 'material',
      description: 'Raw iron ore found in caverns',
    },
    darkPlate: {
      name: 'Dark Plate',
      type: 'material',
      description: 'Armor shard from a Dark Knight',
    },
    shadowDust: {
      name: 'Shadow Dust',
      type: 'material',
      description: 'Mysterious dust from shadow creatures',
    },
    shadowEssence: {
      name: 'Shadow Essence',
      type: 'material',
      description: 'Potent essence of the Shadow Lord',
    },
  };

  function getItem(id) {
    return items[id] ? { ...items[id], id } : null;
  }

  function getAllItems() {
    return Object.entries(items).map(([id, item]) => ({ ...item, id }));
  }

  return { getItem, getAllItems };
})();
