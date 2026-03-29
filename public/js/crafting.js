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
    {
      id: 'craft_runeBlade',
      name: 'Forge Rune Blade',
      description: 'Combine 2 Rune Fragment + 1 Shadow Essence for a Rune Blade',
      ingredients: [{ id: 'runeFragment', qty: 2 }, { id: 'shadowEssence', qty: 1 }],
      result: { id: 'runeBlade', qty: 1 },
    },
    {
      id: 'craft_ancientArmor',
      name: 'Forge Ancient Armor',
      description: 'Combine 2 Ancient Core + 1 Dark Plate for Ancient Armor',
      ingredients: [{ id: 'ancientCore', qty: 2 }, { id: 'darkPlate', qty: 1 }],
      result: { id: 'ancientArmor', qty: 1 },
    },
    {
      id: 'craft_phoenixFeather',
      name: 'Craft Phoenix Feather',
      description: 'Combine 1 Ancient Core + 1 Spectral Dust + 1 Shadow Essence',
      ingredients: [{ id: 'ancientCore', qty: 1 }, { id: 'spectralDust', qty: 1 }, { id: 'shadowEssence', qty: 1 }],
      result: { id: 'phoenixFeather', qty: 1 },
    },
    {
      id: 'craft_frostBlade',
      name: 'Forge Frost Blade',
      description: 'Combine 3 Frost Fang + 2 Ice Core for a Frost Blade',
      ingredients: [{ id: 'frostFang', qty: 3 }, { id: 'iceCore', qty: 2 }],
      result: { id: 'frostBlade', qty: 1 },
    },
    {
      id: 'craft_crystalArmor',
      name: 'Forge Crystal Armor',
      description: 'Combine 3 Frozen Shard + 2 Ice Core + 1 Rune Fragment',
      ingredients: [{ id: 'frozenShard', qty: 3 }, { id: 'iceCore', qty: 2 }, { id: 'runeFragment', qty: 1 }],
      result: { id: 'crystalArmor', qty: 1 },
    },
    {
      id: 'craft_warmthAmulet',
      name: 'Craft Warmth Amulet',
      description: 'Combine 1 Drake Scale + 3 Ice Core + 2 Spectral Dust',
      ingredients: [{ id: 'drakeScale', qty: 1 }, { id: 'iceCore', qty: 3 }, { id: 'spectralDust', qty: 2 }],
      result: { id: 'warmthAmulet', qty: 1 },
    },
    {
      id: 'craft_thunderSpear',
      name: 'Forge Thunder Spear',
      description: 'Combine 3 Storm Feather + 2 Thunder Core for a Thunder Spear',
      ingredients: [{ id: 'stormFeather', qty: 3 }, { id: 'thunderCore', qty: 2 }],
      result: { id: 'thunderSpear', qty: 1 },
    },
    {
      id: 'craft_celestialPlate',
      name: 'Forge Celestial Plate',
      description: 'Combine 3 Lightning Shard + 2 Thunder Core + 1 Drake Scale',
      ingredients: [{ id: 'lightningShard', qty: 3 }, { id: 'thunderCore', qty: 2 }, { id: 'drakeScale', qty: 1 }],
      result: { id: 'celestialPlate', qty: 1 },
    },
    {
      id: 'craft_stormweaveRing',
      name: 'Craft Stormweave Ring',
      description: 'Combine 1 Wyrm Heart + 3 Thunder Core + 2 Storm Feather',
      ingredients: [{ id: 'wyrmHeart', qty: 1 }, { id: 'thunderCore', qty: 3 }, { id: 'stormFeather', qty: 2 }],
      result: { id: 'stormweaveRing', qty: 1 },
    },
    {
      id: 'craft_voidBlade',
      name: 'Forge Void Blade',
      description: 'Combine 3 Void Shard + 2 Abyssal Ore for a Void Blade',
      ingredients: [{ id: 'voidShard', qty: 3 }, { id: 'abyssalOre', qty: 2 }],
      result: { id: 'voidBlade', qty: 1 },
    },
    {
      id: 'craft_abyssalArmor',
      name: 'Forge Abyssal Armor',
      description: 'Combine 3 Abyssal Ore + 2 Void Shard + 1 Thunder Core',
      ingredients: [{ id: 'abyssalOre', qty: 3 }, { id: 'voidShard', qty: 2 }, { id: 'thunderCore', qty: 1 }],
      result: { id: 'abyssalArmor', qty: 1 },
    },
    {
      id: 'craft_chaosRing',
      name: 'Craft Chaos Ring',
      description: 'Combine 1 Chaos Gem + 1 Dragon Essence + 2 Wyrm Heart',
      ingredients: [{ id: 'chaosGem', qty: 1 }, { id: 'dragonEssence', qty: 1 }, { id: 'wyrmHeart', qty: 2 }],
      result: { id: 'chaosRing', qty: 1 },
    },
    {
      id: 'craft_infernoBlade',
      name: 'Forge Inferno Blade',
      description: 'Combine 3 Magma Core + 2 Forge Steel for an Inferno Blade',
      ingredients: [{ id: 'magmaCore', qty: 3 }, { id: 'forgeSteel', qty: 2 }],
      result: { id: 'infernoBlade', qty: 1 },
    },
    {
      id: 'craft_forgePlate',
      name: 'Forge Plate',
      description: 'Combine 3 Forge Steel + 2 Magma Core + 1 Abyssal Ore',
      ingredients: [{ id: 'forgeSteel', qty: 3 }, { id: 'magmaCore', qty: 2 }, { id: 'abyssalOre', qty: 1 }],
      result: { id: 'forgePlate', qty: 1 },
    },
    {
      id: 'craft_titanBand',
      name: "Craft Titan's Band",
      description: 'Combine 1 Inferno Gem + 1 Titan Shard + 2 Chaos Gem',
      ingredients: [{ id: 'infernoGem', qty: 1 }, { id: 'titanShard', qty: 1 }, { id: 'chaosGem', qty: 2 }],
      result: { id: 'titanBand', qty: 1 },
    },
    {
      id: 'craft_etherealBlade',
      name: 'Forge Ethereal Blade',
      description: 'Combine 3 Crystal Heart + 2 Fae Dust for an Ethereal Blade',
      ingredients: [{ id: 'crystalHeart', qty: 3 }, { id: 'faeDust', qty: 2 }],
      result: { id: 'etherealBlade', qty: 1 },
    },
    {
      id: 'craft_etherealPlate',
      name: 'Forge Ethereal Plate',
      description: 'Combine 3 Ethereal Shard + 2 Crystal Heart + 1 Forge Steel',
      ingredients: [{ id: 'etherealShard', qty: 3 }, { id: 'crystalHeart', qty: 2 }, { id: 'forgeSteel', qty: 1 }],
      result: { id: 'etherealPlate', qty: 1 },
    },
    {
      id: 'craft_etherealCrown',
      name: 'Craft Ethereal Crown',
      description: 'Combine 1 Phoenix Plume + 1 Eternal Flame + 2 Inferno Gem',
      ingredients: [{ id: 'phoenixPlume', qty: 1 }, { id: 'eternalFlame', qty: 1 }, { id: 'infernoGem', qty: 2 }],
      result: { id: 'etherealCrown', qty: 1 },
    },
    {
      id: 'craft_twilightBlade',
      name: 'Forge Twilight Blade',
      description: 'Combine 3 Twilight Shard + 2 Arcane Dust for a Twilight Blade',
      ingredients: [{ id: 'twilightShard', qty: 3 }, { id: 'arcaneDust', qty: 2 }],
      result: { id: 'twilightBlade', qty: 1 },
    },
    {
      id: 'craft_twilightArmor',
      name: 'Forge Twilight Armor',
      description: 'Combine 3 Arcane Dust + 2 Twilight Shard + 1 Crystal Heart',
      ingredients: [{ id: 'arcaneDust', qty: 3 }, { id: 'twilightShard', qty: 2 }, { id: 'crystalHeart', qty: 1 }],
      result: { id: 'twilightArmor', qty: 1 },
    },
    {
      id: 'craft_twilightSigil',
      name: 'Craft Twilight Sigil',
      description: "Combine 1 Void Crystal + 1 Emperor's Seal + 2 Phoenix Plume",
      ingredients: [{ id: 'voidCrystal', qty: 1 }, { id: 'emperorSeal', qty: 1 }, { id: 'phoenixPlume', qty: 2 }],
      result: { id: 'twilightSigil', qty: 1 },
    },
    {
      id: 'craft_astralBlade',
      name: 'Forge Astral Blade',
      description: 'Combine 3 Stardust Shard + 2 Twilight Shard for an Astral Blade',
      ingredients: [{ id: 'stardustShard', qty: 3 }, { id: 'twilightShard', qty: 2 }],
      result: { id: 'astralBlade', qty: 1 },
    },
    {
      id: 'craft_astralArmor',
      name: 'Forge Astral Armor',
      description: 'Combine 3 Stardust Shard + 2 Nexus Core + 1 Void Crystal',
      ingredients: [{ id: 'stardustShard', qty: 3 }, { id: 'nexusCore', qty: 2 }, { id: 'voidCrystal', qty: 1 }],
      result: { id: 'astralArmor', qty: 1 },
    },
    {
      id: 'craft_astralCrown',
      name: 'Craft Astral Crown',
      description: 'Combine 1 Nexus Core + 1 Stardust Shard + 2 Arcane Dust',
      ingredients: [{ id: 'nexusCore', qty: 1 }, { id: 'stardustShard', qty: 1 }, { id: 'arcaneDust', qty: 2 }],
      result: { id: 'astralCrown', qty: 1 },
    },
    {
      id: 'craft_temporalBlade',
      name: 'Forge Temporal Blade',
      description: 'Combine 3 Temporal Shard + 2 Stardust Shard for a Temporal Blade',
      ingredients: [{ id: 'temporalShard', qty: 3 }, { id: 'stardustShard', qty: 2 }],
      result: { id: 'temporalBlade', qty: 1 },
    },
    {
      id: 'craft_temporalArmor',
      name: 'Forge Temporal Armor',
      description: 'Combine 3 Temporal Shard + 2 Rift Essence + 1 Nexus Core',
      ingredients: [{ id: 'temporalShard', qty: 3 }, { id: 'riftEssence', qty: 2 }, { id: 'nexusCore', qty: 1 }],
      result: { id: 'temporalArmor', qty: 1 },
    },
    {
      id: 'craft_temporalCirclet',
      name: 'Craft Temporal Circlet',
      description: 'Combine 1 Rift Essence + 1 Temporal Shard + 2 Arcane Dust',
      ingredients: [{ id: 'riftEssence', qty: 1 }, { id: 'temporalShard', qty: 1 }, { id: 'arcaneDust', qty: 2 }],
      result: { id: 'temporalCirclet', qty: 1 },
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

    // Track achievement
    if (typeof Achievements !== 'undefined') Achievements.onCraft(recipeId);

    return true;
  }

  return { getRecipes, canCraft, craft };
})();
