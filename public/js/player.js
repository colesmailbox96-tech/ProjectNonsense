/* ========= PLAYER CHARACTER ========= */
const Player = (() => {
  const state = {
    name: 'Hero',
    x: 15,
    y: 15,
    dir: 'down',
    frame: 0,
    frameTimer: 0,
    moving: false,
    moveProgress: 0,
    moveSpeed: 0.1,
    prevX: 15,
    prevY: 15,
    // Stats
    level: 1,
    xp: 0,
    xpToNext: 30,
    hp: 50,
    maxHp: 50,
    mp: 20,
    maxMp: 20,
    attack: 8,
    defense: 4,
    speed: 5,
    // Equipment
    weapon: null,
    armor: null,
    accessory: null,
    // Inventory: array of { id, qty }
    inventory: [
      { id: 'potion', qty: 3 },
    ],
    gold: 50,
    currentMap: 'village',
  };

  function getState() { return state; }

  function setPosition(x, y) {
    state.x = x;
    state.y = y;
    state.prevX = x;
    state.prevY = y;
    state.moveProgress = 0;
    state.moving = false;
  }

  function tryMove(dir) {
    if (state.moving) return false;

    state.dir = dir;
    const off = DIR_OFFSETS[dir];
    const newX = state.x + off.x;
    const newY = state.y + off.y;

    const map = MapData.getMap(state.currentMap);
    if (newX < 0 || newX >= map.width || newY < 0 || newY >= map.height) {
      return false;
    }

    const tile = map.tiles[newY][newX];
    if (!PASSABLE.has(tile)) {
      // Check for chest
      if (tile === TILE_TYPES.CHEST) {
        openChest(newX, newY, map);
      }
      return false;
    }

    // Check NPC collision
    for (const npc of map.npcs) {
      if (npc.x === newX && npc.y === newY) {
        return false;
      }
    }

    state.prevX = state.x;
    state.prevY = state.y;
    state.x = newX;
    state.y = newY;
    state.moving = true;
    state.moveProgress = 0;
    return true;
  }

  function openChest(cx, cy, map) {
    const chest = map.chests.find(c => c.x === cx && c.y === cy && !c.opened);
    if (!chest) return;
    chest.opened = true;
    const item = ItemDB.getItem(chest.item);
    addItem(chest.item, 1);
    DialogueSystem.showMessage('Chest', `Found ${item.name}!`);
    if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('chest');
  }

  function update(dt) {
    if (state.moving) {
      state.moveProgress += state.moveSpeed;
      state.frameTimer += dt;
      if (state.frameTimer > 200) {
        state.frame = (state.frame + 1) % 2;
        state.frameTimer = 0;
      }
      if (state.moveProgress >= 1) {
        state.moveProgress = 0;
        state.moving = false;
        state.prevX = state.x;
        state.prevY = state.y;
        checkWarps();
        checkEncounter();
      }
    }
  }

  function checkWarps() {
    const map = MapData.getMap(state.currentMap);
    for (const warp of map.warps) {
      if (state.x === warp.x && state.y === warp.y) {
        Game.warpTo(warp.toMap, warp.toX, warp.toY);
        return;
      }
    }
  }

  function checkEncounter() {
    const map = MapData.getMap(state.currentMap);
    if (map.encounterRate > 0 && Math.random() < map.encounterRate) {
      const pool = map.enemyPool || ['slime'];
      const enemyType = pool[Math.floor(Math.random() * pool.length)];
      BattleSystem.startBattle(enemyType);
    }
  }

  function getRenderPos() {
    if (state.moving) {
      const lerpX = state.prevX + (state.x - state.prevX) * state.moveProgress;
      const lerpY = state.prevY + (state.y - state.prevY) * state.moveProgress;
      return { x: lerpX, y: lerpY };
    }
    return { x: state.x, y: state.y };
  }

  function heal(amount) {
    state.hp = Math.min(state.maxHp, state.hp + amount);
  }

  function restoreMp(amount) {
    state.mp = Math.min(state.maxMp, state.mp + amount);
  }

  function takeDamage(amount) {
    const dmg = Math.max(1, amount - state.defense);
    state.hp = Math.max(0, state.hp - dmg);
    return dmg;
  }

  function gainXP(amount) {
    state.xp += amount;
    const leveledUp = [];
    while (state.xp >= state.xpToNext) {
      state.xp -= state.xpToNext;
      state.level++;
      state.xpToNext = Math.floor(state.xpToNext * 1.5);
      state.maxHp += 8;
      state.hp = state.maxHp;
      state.maxMp += 4;
      state.mp = state.maxMp;
      state.attack += 2;
      state.defense += 1;
      state.speed += 1;
      leveledUp.push(state.level);
    }
    return leveledUp;
  }

  function addItem(id, qty) {
    const existing = state.inventory.find(i => i.id === id);
    if (existing) {
      existing.qty += qty;
    } else {
      state.inventory.push({ id, qty });
    }
  }

  function removeItem(id, qty) {
    const idx = state.inventory.findIndex(i => i.id === id);
    if (idx === -1) return false;
    state.inventory[idx].qty -= qty;
    if (state.inventory[idx].qty <= 0) {
      state.inventory.splice(idx, 1);
    }
    return true;
  }

  function hasItem(id) {
    return state.inventory.find(i => i.id === id);
  }

  function equip(itemId) {
    const item = ItemDB.getItem(itemId);
    if (!item || !item.equipSlot) return false;

    // Unequip current
    const slot = item.equipSlot;
    if (state[slot]) {
      addItem(state[slot], 1);
      // Remove old stats
      const old = ItemDB.getItem(state[slot]);
      if (old.attack) state.attack -= old.attack;
      if (old.defense) state.defense -= old.defense;
      if (old.speed) state.speed -= old.speed;
    }

    removeItem(itemId, 1);
    state[slot] = itemId;

    // Apply stats
    if (item.attack) state.attack += item.attack;
    if (item.defense) state.defense += item.defense;
    if (item.speed) state.speed += item.speed;

    return true;
  }

  function fullHeal() {
    state.hp = state.maxHp;
    state.mp = state.maxMp;
  }

  function getCritChance() {
    let chance = 0.05 + state.speed * 0.01;
    // Lucky Ring crit bonus
    if (state.accessory) {
      const acc = ItemDB.getItem(state.accessory);
      if (acc && acc.critBonus) chance += acc.critBonus;
    }
    return Math.min(chance, 0.5);
  }

  return {
    getState, setPosition, tryMove, update, getRenderPos,
    heal, restoreMp, takeDamage, gainXP, addItem, removeItem,
    hasItem, equip, fullHeal, getCritChance,
  };
})();
