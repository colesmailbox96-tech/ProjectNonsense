const SaveSystem = (() => {
  const SAVE_KEY = 'realm_of_echoes_save';
  const MAP_NAMES = ['village', 'forest', 'dungeon'];

  let notifEl = null;
  let notifTimer = null;

  function createNotification() {
    if (notifEl) return;
    notifEl = document.createElement('div');
    notifEl.id = 'save-notification';
    notifEl.textContent = 'Game Saved';
    Object.assign(notifEl.style, {
      position: 'fixed',
      top: '18px',
      right: '18px',
      background: 'rgba(0,0,0,0.78)',
      color: '#7eff6a',
      padding: '8px 18px',
      borderRadius: '6px',
      fontFamily: 'monospace',
      fontSize: '14px',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity 0.3s',
      pointerEvents: 'none',
    });
    document.body.appendChild(notifEl);
  }

  function showNotification() {
    createNotification();
    if (notifTimer) clearTimeout(notifTimer);
    notifEl.style.opacity = '1';
    notifTimer = setTimeout(() => {
      notifEl.style.opacity = '0';
      notifTimer = null;
    }, 1200);
  }

  function gatherChestState() {
    const chests = {};
    for (const name of MAP_NAMES) {
      const map = MapData.getMap(name);
      if (!map || !map.chests) continue;
      chests[name] = map.chests.map(c => ({
        x: c.x,
        y: c.y,
        opened: !!c.opened,
      }));
    }
    return chests;
  }

  function applyChestState(chests) {
    if (!chests) return;
    for (const name of MAP_NAMES) {
      const map = MapData.getMap(name);
      if (!map || !map.chests || !chests[name]) continue;
      for (const saved of chests[name]) {
        const chest = map.chests.find(c => c.x === saved.x && c.y === saved.y);
        if (chest) chest.opened = saved.opened;
      }
    }
  }

  function buildSaveData() {
    const ps = Player.getState();
    const data = {
      version: 1,
      timestamp: Date.now(),
      player: {
        level: ps.level,
        xp: ps.xp,
        xpToNext: ps.xpToNext,
        hp: ps.hp,
        maxHp: ps.maxHp,
        mp: ps.mp,
        maxMp: ps.maxMp,
        attack: ps.attack,
        defense: ps.defense,
        speed: ps.speed,
        weapon: ps.weapon,
        armor: ps.armor,
        accessory: ps.accessory,
        inventory: ps.inventory.map(i => ({ id: i.id, qty: i.qty })),
        gold: ps.gold,
        currentMap: ps.currentMap,
        x: ps.x,
        y: ps.y,
      },
      chests: gatherChestState(),
      quests: typeof QuestSystem !== 'undefined' ? QuestSystem.getState() : {},
      weather: typeof WeatherSystem !== 'undefined' ? WeatherSystem.getState() : {},
      bestiary: typeof Bestiary !== 'undefined' ? Bestiary.getState() : {},
    };
    return data;
  }

  function applySaveData(data) {
    const ps = Player.getState();
    const p = data.player;

    ps.level = p.level;
    ps.xp = p.xp;
    ps.xpToNext = p.xpToNext;
    ps.hp = p.hp;
    ps.maxHp = p.maxHp;
    ps.mp = p.mp;
    ps.maxMp = p.maxMp;
    ps.attack = p.attack;
    ps.defense = p.defense;
    ps.speed = p.speed;
    ps.weapon = p.weapon;
    ps.armor = p.armor;
    ps.accessory = p.accessory;
    ps.inventory = p.inventory.map(i => ({ id: i.id, qty: i.qty }));
    ps.gold = p.gold;
    ps.currentMap = p.currentMap;
    ps.x = p.x;
    ps.y = p.y;

    applyChestState(data.chests);

    if (data.quests && typeof QuestSystem !== 'undefined') {
      QuestSystem.loadState(data.quests);
    }

    if (data.weather && typeof WeatherSystem !== 'undefined') {
      WeatherSystem.loadState(data.weather);
    }

    if (data.bestiary && typeof Bestiary !== 'undefined') {
      Bestiary.loadState(data.bestiary);
    }
  }

  function save() {
    const data = buildSaveData();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    showNotification();
  }

  function autoSave() {
    const data = buildSaveData();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  function load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      applySaveData(data);
      return true;
    } catch (e) {
      console.warn('SaveSystem: failed to parse save data', e);
      return false;
    }
  }

  function hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
  }

  return {
    save,
    load,
    hasSave,
    deleteSave,
    autoSave,
  };
})();
