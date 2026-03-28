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
      id: 'hero_of_echohaven',
      name: 'Hero of Echohaven',
      description: 'Return to the village',
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
        if (event === 'defeat_boss') {
          completeQuest('defeat_shadow_lord');
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
