/* ========= CRAFTING SYSTEM ========= */
const CraftingSystem = (() => {
  // Recipes: { id, name, description, ingredients: [{id, qty}], result: {id, qty} }
  const recipes = [
    {
      id: 'craft_hiPotion',
      name: 'Brew Hi-Potion',
      description: 'Combine 2 Potions + 1 Slime Gel for a Hi-Potion',
      ingredients: [{ id: 'potion', qty: 2 }, { id: 'slimeGel', qty: 1 }],
      result: { id: 'hiPotion', qty: 1 },
    },
    {
      id: 'craft_ether',
      name: 'Brew Ether',
      description: 'Combine 1 Slime Gel + 1 Shadow Dust into an Ether',
      ingredients: [{ id: 'slimeGel', qty: 1 }, { id: 'shadowDust', qty: 1 }],
      result: { id: 'ether', qty: 1 },
    },
    {
      id: 'craft_steelSword',
      name: 'Forge Steel Sword',
      description: 'Forge 2 Iron Ore + 1 Bone Shard into a Steel Sword',
      ingredients: [{ id: 'ironOre', qty: 2 }, { id: 'boneShard', qty: 1 }],
      result: { id: 'steelSword', qty: 1 },
    },
    {
      id: 'craft_silverArmor',
      name: 'Forge Silver Armor',
      description: 'Forge 2 Iron Ore + 1 Dark Plate for Silver Armor',
      ingredients: [{ id: 'ironOre', qty: 2 }, { id: 'darkPlate', qty: 1 }],
      result: { id: 'silverArmor', qty: 1 },
    },
    {
      id: 'craft_elixir',
      name: 'Brew Elixir',
      description: 'Combine 1 Hi-Potion + 1 Shadow Essence for an Elixir',
      ingredients: [{ id: 'hiPotion', qty: 1 }, { id: 'shadowEssence', qty: 1 }],
      result: { id: 'elixir', qty: 1 },
    },
    {
      id: 'craft_smokeBomb',
      name: 'Craft Smoke Bomb',
      description: 'Combine 1 Goblin Fang + 1 Slime Gel for a Smoke Bomb',
      ingredients: [{ id: 'goblinFang', qty: 1 }, { id: 'slimeGel', qty: 1 }],
      result: { id: 'smokeBomb', qty: 1 },
    },
    {
      id: 'craft_antidote',
      name: 'Brew Antidote',
      description: 'Combine 2 Slime Gel into an Antidote',
      ingredients: [{ id: 'slimeGel', qty: 2 }],
      result: { id: 'antidote', qty: 1 },
    },
    {
      id: 'craft_luckyRing',
      name: 'Forge Lucky Ring',
      description: 'Combine 1 Shadow Essence + 2 Bone Shard for a Lucky Ring',
      ingredients: [{ id: 'shadowEssence', qty: 1 }, { id: 'boneShard', qty: 2 }],
      result: { id: 'luckyRing', qty: 1 },
    },
  ];

  function getRecipes() {
    return recipes.map(r => ({ ...r }));
  }

  function canCraft(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return false;
    for (const ing of recipe.ingredients) {
      const held = Player.hasItem(ing.id);
      if (!held || held.qty < ing.qty) return false;
    }
    return true;
  }

  function craft(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return false;
    if (!canCraft(recipeId)) return false;

    // Remove ingredients
    for (const ing of recipe.ingredients) {
      Player.removeItem(ing.id, ing.qty);
    }

    // Add result
    Player.addItem(recipe.result.id, recipe.result.qty);

    if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('chest');
    return true;
  }

  return { getRecipes, canCraft, craft };
})();
