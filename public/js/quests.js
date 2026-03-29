/* ========= QUEST SYSTEM ========= */
const QuestSystem = (() => {
  const quests = [
    {
      id: 'elder_request',
      name: "The Elder's Request",
      description: 'Speak with the Village Elder',
      completed: false,
      active: true,
    },
    {
      id: 'prepare_journey',
      name: 'Prepare for Journey',
      description: 'Visit the Merchant and Healer before setting out',
      completed: false,
      active: false,
      progress: { merchant: false, healer: false },
    },
    {
      id: 'enter_woods',
      name: 'Enter the Woods',
      description: 'Travel to the Whispering Woods',
      completed: false,
      active: false,
    },
    {
      id: 'forest_exploration',
      name: 'Forest Exploration',
      description: 'Defeat 3 enemies in the Whispering Woods',
      completed: false,
      active: false,
      progress: { defeated: 0, required: 3 },
    },
    {
      id: 'into_darkness',
      name: 'Into the Darkness',
      description: 'Enter the Shadow Cavern',
      completed: false,
      active: false,
    },
    {
      id: 'defeat_shadow_lord',
      name: 'Defeat the Shadow Lord',
      description: 'Defeat the boss in the Shadow Cavern',
      completed: false,
      active: false,
    },
    {
      id: 'explore_ruins',
      name: 'Explore the Ruins',
      description: 'Enter the Ancient Ruins',
      completed: false,
      active: false,
    },
    {
      id: 'defeat_ancient_guardian',
      name: 'Defeat the Ancient Guardian',
      description: 'Defeat the boss in the Ancient Ruins',
      completed: false,
      active: false,
    },
    {
      id: 'brave_the_peaks',
      name: 'Brave the Peaks',
      description: 'Enter the Frozen Peaks',
      completed: false,
      active: false,
    },
    {
      id: 'defeat_crystal_drake',
      name: 'Defeat the Crystal Drake',
      description: 'Defeat the boss in the Frozen Peaks',
      completed: false,
      active: false,
    },
    {
      id: 'reach_the_sanctum',
      name: 'Reach the Sanctum',
      description: 'Enter the Celestial Sanctum',
      completed: false,
      active: false,
    },
    {
      id: 'defeat_celestial_wyrm',
      name: 'Defeat the Celestial Wyrm',
      description: 'Defeat the boss in the Celestial Sanctum',
      completed: false,
      active: false,
    },
    {
      id: 'descend_to_abyss',
      name: 'Descend to the Abyss',
      description: 'Enter the Abyssal Depths',
      completed: false,
      active: false,
    },
    {
      id: 'defeat_chaos_dragon',
      name: 'Defeat the Chaos Dragon',
      description: 'Defeat the boss in the Abyssal Depths',
      completed: false,
      active: false,
    },
    {
      id: 'enter_volcanic_forge',
      name: 'Enter the Volcanic Forge',
      description: 'Enter the Volcanic Forge',
      completed: false,
      active: false,
    },
    {
      id: 'defeat_inferno_titan',
      name: 'Defeat the Inferno Titan',
      description: 'Defeat the boss in the Volcanic Forge',
      completed: false,
      active: false,
    },
    {
      id: 'hero_of_echohaven',
      name: 'Legend of Echohaven',
      description: 'Return to the village as a legend',
      completed: false,
      active: false,
    },
  ];

  function getActiveQuest() {
    const quest = quests.find((q) => q.active && !q.completed);
    if (!quest) return null;
    const result = { id: quest.id, name: quest.name, description: quest.description, completed: quest.completed };
    if (quest.progress) result.progress = JSON.parse(JSON.stringify(quest.progress));
    return result;
  }

  function completeQuest(id) {
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.completed) return false;

    quest.completed = true;
    quest.active = false;

    // Notify player
    if (typeof HUD !== 'undefined') {
      HUD.addToast(`✓ Quest Complete: ${quest.name}`, '#44ff88', 4000);
    }
    if (typeof AudioSystem !== 'undefined') {
      AudioSystem.playSFX('questComplete');
    }

    // Activate the next quest in the chain
    const idx = quests.indexOf(quest);
    if (idx < quests.length - 1) {
      quests[idx + 1].active = true;
    }
    return true;
  }

  function checkProgress(event, data) {
    const active = quests.find((q) => q.active && !q.completed);
    if (!active) return false;

    switch (active.id) {
      case 'elder_request':
        if (event === 'talk_npc' && data && data.npcId === 'elder') {
          completeQuest('elder_request');
          return true;
        }
        break;

      case 'prepare_journey':
        if (event === 'talk_npc' && data) {
          if (data.npcId === 'merchant') active.progress.merchant = true;
          if (data.npcId === 'healer') active.progress.healer = true;
          if (active.progress.merchant && active.progress.healer) {
            completeQuest('prepare_journey');
            return true;
          }
        }
        break;

      case 'enter_woods':
        if (event === 'enter_map' && data && data.mapName === 'Whispering Woods') {
          completeQuest('enter_woods');
          return true;
        }
        break;

      case 'forest_exploration':
        if (event === 'defeat_enemy' && data) {
          active.progress.defeated++;
          if (active.progress.defeated >= active.progress.required) {
            completeQuest('forest_exploration');
            return true;
          }
        }
        break;

      case 'into_darkness':
        if (event === 'enter_map' && data && data.mapName === 'Shadow Cavern') {
          completeQuest('into_darkness');
          return true;
        }
        break;

      case 'defeat_shadow_lord':
        if (event === 'defeat_boss' && data && data.bossType === 'shadowLord') {
          completeQuest('defeat_shadow_lord');
          return true;
        }
        break;

      case 'explore_ruins':
        if (event === 'enter_map' && data && data.mapName === 'Ancient Ruins') {
          completeQuest('explore_ruins');
          return true;
        }
        break;

      case 'defeat_ancient_guardian':
        if (event === 'defeat_boss' && data && data.bossType === 'ancientGuardian') {
          completeQuest('defeat_ancient_guardian');
          return true;
        }
        break;

      case 'brave_the_peaks':
        if (event === 'enter_map' && data && data.mapName === 'Frozen Peaks') {
          completeQuest('brave_the_peaks');
          return true;
        }
        break;

      case 'defeat_crystal_drake':
        if (event === 'defeat_boss' && data && data.bossType === 'crystalDrake') {
          completeQuest('defeat_crystal_drake');
          return true;
        }
        break;

      case 'reach_the_sanctum':
        if (event === 'enter_map' && data && data.mapName === 'Celestial Sanctum') {
          completeQuest('reach_the_sanctum');
          return true;
        }
        break;

      case 'defeat_celestial_wyrm':
        if (event === 'defeat_boss' && data && data.bossType === 'celestialWyrm') {
          completeQuest('defeat_celestial_wyrm');
          return true;
        }
        break;

      case 'descend_to_abyss':
        if (event === 'enter_map' && data && data.mapName === 'Abyssal Depths') {
          completeQuest('descend_to_abyss');
          return true;
        }
        break;

      case 'defeat_chaos_dragon':
        if (event === 'defeat_boss' && data && data.bossType === 'chaosDragon') {
          completeQuest('defeat_chaos_dragon');
          return true;
        }
        break;

      case 'enter_volcanic_forge':
        if (event === 'enter_map' && data && data.mapName === 'Volcanic Forge') {
          completeQuest('enter_volcanic_forge');
          return true;
        }
        break;

      case 'defeat_inferno_titan':
        if (event === 'defeat_boss' && data && data.bossType === 'infernoTitan') {
          completeQuest('defeat_inferno_titan');
          return true;
        }
        break;

      case 'hero_of_echohaven':
        if (event === 'enter_map' && data && data.mapName === 'Echohaven Village') {
          completeQuest('hero_of_echohaven');
          return true;
        }
        break;
    }

    return false;
  }

  function getQuestLog() {
    return quests.map((q) => {
      const entry = { id: q.id, name: q.name, description: q.description, completed: q.completed, active: q.active };
      if (q.progress) entry.progress = JSON.parse(JSON.stringify(q.progress));
      return entry;
    });
  }

  function getState() {
    return quests.map((q) => {
      const s = { id: q.id, completed: q.completed, active: q.active };
      if (q.progress) s.progress = JSON.parse(JSON.stringify(q.progress));
      return s;
    });
  }

  function loadState(state) {
    if (!Array.isArray(state)) return;
    for (const saved of state) {
      const quest = quests.find((q) => q.id === saved.id);
      if (!quest) continue;
      quest.completed = saved.completed;
      quest.active = saved.active;
      if (saved.progress && quest.progress) {
        Object.assign(quest.progress, saved.progress);
      }
    }
  }

  return { getActiveQuest, completeQuest, checkProgress, getQuestLog, getState, loadState };
})();
