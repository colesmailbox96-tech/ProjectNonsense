/* ========= MAP MONSTER SYSTEM ========= */
const MonsterSystem = (() => {
  const mapMonsters = {};
  let currentBattle = null;
  let fleeCooldown = 0;
  const defeatedBosses = new Set();
  let respawnTimers = {};

  const bossMap = {
    dungeon: 'shadowLord',
    ruins: 'ancientGuardian',
    peaks: 'crystalDrake',
    sanctum: 'celestialWyrm',
    abyss: 'chaosDragon',
    volcano: 'infernoTitan',
    gardens: 'eternalPhoenix',
    citadel: 'voidEmperor',
    nexus: 'starDevourer',
    rift: 'epochWeaver',
    realm: 'realityWeaver',
    prism: 'prismArbiter',
    spire: 'astralSovereign',
  };

  function getMaxCount(map) {
    const area = map.width * map.height;
    return Math.max(3, Math.min(8, Math.round(area * map.encounterRate * 0.4)));
  }

  function findSpawnPos(map, existing, mapName) {
    const ps = Player.getState();
    for (let attempts = 0; attempts < 50; attempts++) {
      const x = Math.floor(Math.random() * map.width);
      const y = Math.floor(Math.random() * map.height);

      if (!PASSABLE.has(map.tiles[y][x])) continue;
      if (ps.currentMap === mapName && x === ps.x && y === ps.y) continue;
      if (ps.currentMap === mapName && Math.abs(x - ps.x) + Math.abs(y - ps.y) < 3) continue;

      let blocked = false;
      for (const npc of map.npcs) { if (npc.x === x && npc.y === y) { blocked = true; break; } }
      if (blocked) continue;
      for (const warp of map.warps) { if (warp.x === x && warp.y === y) { blocked = true; break; } }
      if (blocked) continue;
      for (const m of existing) { if (m.x === x && m.y === y) { blocked = true; break; } }
      if (blocked) continue;
      if (map.bossSpawn && x === map.bossSpawn.x && y === map.bossSpawn.y) continue;

      return { x, y };
    }
    return null;
  }

  function spawnForMap(mapName) {
    const map = MapData.getMap(mapName);
    if (!map || !map.enemyPool || map.enemyPool.length === 0) {
      mapMonsters[mapName] = [];
      return;
    }

    const count = getMaxCount(map);
    const monsters = [];

    for (let i = 0; i < count; i++) {
      const type = map.enemyPool[Math.floor(Math.random() * map.enemyPool.length)];
      const pos = findSpawnPos(map, monsters, mapName);
      if (pos) {
        monsters.push({
          id: mapName + '_' + Date.now() + '_' + i,
          type: type,
          x: pos.x,
          y: pos.y,
          prevX: pos.x,
          prevY: pos.y,
          moving: false,
          moveProgress: 0,
          moveTimer: Math.random() * 2000,
          dir: 'down',
          active: true,
          isBoss: false,
        });
      }
    }

    // Add boss if applicable and not yet defeated
    if (map.bossSpawn && bossMap[mapName] && !defeatedBosses.has(mapName)) {
      monsters.push({
        id: mapName + '_boss',
        type: bossMap[mapName],
        x: map.bossSpawn.x,
        y: map.bossSpawn.y,
        prevX: map.bossSpawn.x,
        prevY: map.bossSpawn.y,
        moving: false,
        moveProgress: 0,
        moveTimer: 0,
        dir: 'down',
        active: true,
        isBoss: true,
      });
    }

    mapMonsters[mapName] = monsters;
    respawnTimers[mapName] = 0;
  }

  function tryMonsterMove(monster, dir, map, allMonsters) {
    const off = DIR_OFFSETS[dir];
    const nx = monster.x + off.x;
    const ny = monster.y + off.y;

    if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) return false;
    if (!PASSABLE.has(map.tiles[ny][nx])) return false;

    // Don't step on NPCs
    for (const npc of map.npcs) { if (npc.x === nx && npc.y === ny) return false; }
    // Don't step on warps
    for (const warp of map.warps) { if (warp.x === nx && warp.y === ny) return false; }
    // Don't step on other monsters
    for (const m of allMonsters) {
      if (m !== monster && m.active && m.x === nx && m.y === ny) return false;
    }

    monster.dir = dir;
    monster.prevX = monster.x;
    monster.prevY = monster.y;
    monster.x = nx;
    monster.y = ny;
    monster.moving = true;
    monster.moveProgress = 0;
    return true;
  }

  function update(dt) {
    if (fleeCooldown > 0) fleeCooldown -= dt;

    const mapName = Player.getState().currentMap;
    const monsters = mapMonsters[mapName];
    if (!monsters) return;

    const map = MapData.getMap(mapName);
    if (!map) return;

    const dirs = ['up', 'down', 'left', 'right'];

    for (let i = 0; i < monsters.length; i++) {
      const m = monsters[i];
      if (!m.active) continue;

      if (m.moving) {
        m.moveProgress += 0.04;
        if (m.moveProgress >= 1) {
          m.moveProgress = 1;
          m.moving = false;
          m.prevX = m.x;
          m.prevY = m.y;

          // Check if monster walked into the player
          if (fleeCooldown <= 0) {
            const ps = Player.getState();
            if (m.x === ps.x && m.y === ps.y) {
              currentBattle = { mapName: mapName, monsterId: m.id };
              m.active = false;
              BattleSystem.startBattle(m.type);
              return;
            }
          }
        }
      } else if (!m.isBoss) {
        // Wander AI — bosses stay still
        m.moveTimer += dt;
        if (m.moveTimer > 1500 + Math.random() * 2000) {
          m.moveTimer = 0;
          const dir = dirs[Math.floor(Math.random() * dirs.length)];
          tryMonsterMove(m, dir, map, monsters);
        }
      }
    }

    // Respawn logic: add one monster every 30 seconds if below max
    if (respawnTimers[mapName] !== undefined) {
      respawnTimers[mapName] += dt;
      if (respawnTimers[mapName] > 30000) {
        respawnTimers[mapName] = 0;
        const activeCount = monsters.filter(m => m.active && !m.isBoss).length;
        const maxCount = getMaxCount(map);
        if (activeCount < maxCount && map.enemyPool && map.enemyPool.length > 0) {
          const type = map.enemyPool[Math.floor(Math.random() * map.enemyPool.length)];
          const pos = findSpawnPos(map, monsters, mapName);
          if (pos) {
            monsters.push({
              id: mapName + '_' + Date.now() + '_r',
              type: type,
              x: pos.x,
              y: pos.y,
              prevX: pos.x,
              prevY: pos.y,
              moving: false,
              moveProgress: 0,
              moveTimer: Math.random() * 2000,
              dir: 'down',
              active: true,
              isBoss: false,
            });
          }
        }
      }
    }
  }

  function checkPlayerCollision() {
    if (fleeCooldown > 0) return;
    const ps = Player.getState();
    const monsters = mapMonsters[ps.currentMap];
    if (!monsters) return;

    for (let i = 0; i < monsters.length; i++) {
      const m = monsters[i];
      if (!m.active) continue;
      if (m.x === ps.x && m.y === ps.y) {
        currentBattle = { mapName: ps.currentMap, monsterId: m.id };
        m.active = false;
        BattleSystem.startBattle(m.type);
        return;
      }
    }
  }

  function onVictory() {
    if (!currentBattle) return;
    const { mapName, monsterId } = currentBattle;
    const monsters = mapMonsters[mapName];
    if (monsters) {
      const idx = monsters.findIndex(m => m.id === monsterId);
      if (idx !== -1) {
        if (monsters[idx].isBoss) {
          defeatedBosses.add(mapName);
        }
        monsters.splice(idx, 1);
      }
    }
    currentBattle = null;
  }

  function onDefeat() {
    if (!currentBattle) return;
    const { mapName, monsterId } = currentBattle;
    const monsters = mapMonsters[mapName];
    if (monsters) {
      const m = monsters.find(mon => mon.id === monsterId);
      if (m) m.active = true;
    }
    currentBattle = null;
  }

  function onFlee() {
    if (!currentBattle) return;
    const { mapName, monsterId } = currentBattle;
    const monsters = mapMonsters[mapName];
    if (monsters) {
      const m = monsters.find(mon => mon.id === monsterId);
      if (m) m.active = true;
    }
    fleeCooldown = 2000;
    currentBattle = null;
  }

  function getMonsters(mapName) {
    return mapMonsters[mapName] || [];
  }

  function getDefeatedBosses() {
    return Array.from(defeatedBosses);
  }

  function loadDefeatedBosses(arr) {
    defeatedBosses.clear();
    if (arr) arr.forEach(b => defeatedBosses.add(b));
  }

  return {
    spawnForMap,
    update,
    checkPlayerCollision,
    onVictory,
    onDefeat,
    onFlee,
    getMonsters,
    getDefeatedBosses,
    loadDefeatedBosses,
  };
})();
