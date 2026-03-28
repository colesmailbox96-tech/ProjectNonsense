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
    antidote: {
      name: 'Antidote',
      type: 'consumable',
      description: 'Cures poison',
      effect: () => {},
      buyPrice: 15,
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
      description: 'Increases luck',
      buyPrice: 150,
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
