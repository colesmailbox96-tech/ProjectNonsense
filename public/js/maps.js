/* ========= MAP DEFINITIONS ========= */
const MapData = (() => {
  const T = TILE_TYPES;

  // Village map (30x25)
  const village = {
    name: 'Echohaven Village',
    width: 30,
    height: 25,
    encounterRate: 0,
    tiles: [],
    npcs: [
      { id: 'elder', type: 'elder', x: 14, y: 6, dialogue: 'elder_intro' },
      { id: 'merchant', type: 'merchant', x: 22, y: 12, dialogue: 'merchant_intro' },
      { id: 'healer', type: 'healer', x: 7, y: 12, dialogue: 'healer_intro' },
      { id: 'guard', type: 'guard', x: 15, y: 20, dialogue: 'guard_intro' },
    ],
    warps: [
      { x: 15, y: 24, toMap: 'forest', toX: 15, toY: 1 },
      { x: 14, y: 24, toMap: 'forest', toX: 14, toY: 1 },
    ],
    chests: [
      { x: 4, y: 4, item: 'potion', opened: false },
    ],
    playerStart: { x: 15, y: 15 },
  };

  // Generate village tiles
  (function buildVillage() {
    const m = [];
    for (let y = 0; y < village.height; y++) {
      m[y] = [];
      for (let x = 0; x < village.width; x++) {
        // Default grass
        let t = T.GRASS;

        // Water pond (top-right)
        if (x >= 23 && x <= 28 && y >= 2 && y <= 6) t = T.WATER;

        // Flowers
        if ((x + y) % 7 === 0 && t === T.GRASS && y > 1 && y < 23 && x > 1 && x < 28) t = T.FLOWER;

        // Trees border
        if (y === 0 || x === 0 || x === 29) t = T.TREE;
        if (y === 0 && x >= 13 && x <= 16) t = T.GRASS; // gap at top

        // Elder's house (top center)
        if (x >= 12 && x <= 17 && y >= 3 && y <= 5) t = T.WALL;
        if (x >= 12 && x <= 17 && y === 3) t = T.WALL_TOP;
        if (x >= 13 && x <= 16 && y >= 4 && y <= 5) t = T.FLOOR;
        if (x === 14 && y === 6) t = T.DOOR;
        if (x === 15 && y === 6) t = T.DOOR;

        // Merchant's shop (right side)
        if (x >= 20 && x <= 25 && y >= 10 && y <= 12) t = T.WALL;
        if (x >= 20 && x <= 25 && y === 10) t = T.WALL_TOP;
        if (x >= 21 && x <= 24 && y >= 11 && y <= 12) t = T.FLOOR;
        if (x === 22 && y === 13) t = T.DOOR;

        // Healer's hut (left side)
        if (x >= 5 && x <= 10 && y >= 10 && y <= 12) t = T.WALL;
        if (x >= 5 && x <= 10 && y === 10) t = T.WALL_TOP;
        if (x >= 6 && x <= 9 && y >= 11 && y <= 12) t = T.FLOOR;
        if (x === 7 && y === 13) t = T.DOOR;

        // Main path (vertical center)
        if (x >= 14 && x <= 15 && y >= 6 && y <= 24) t = T.PATH;

        // Cross path
        if (y >= 13 && y <= 14 && x >= 5 && x <= 25) t = T.PATH;

        // Entrance sign
        if (x === 16 && y === 20) t = T.SIGN;

        // Chest area
        if (x === 4 && y === 4) t = T.CHEST;

        // South exit
        if (y === 24 && (x === 14 || x === 15)) t = T.PATH;

        m[y][x] = t;
      }
    }
    village.tiles = m;
  })();

  // Forest map (30x30)
  const forest = {
    name: 'Whispering Woods',
    width: 30,
    height: 30,
    encounterRate: 0.06,
    enemyPool: ['slime', 'goblin'],
    tiles: [],
    npcs: [],
    warps: [
      { x: 15, y: 0, toMap: 'village', toX: 15, toY: 23 },
      { x: 14, y: 0, toMap: 'village', toX: 14, toY: 23 },
      { x: 15, y: 29, toMap: 'dungeon', toX: 5, toY: 1 },
      { x: 14, y: 29, toMap: 'dungeon', toX: 4, toY: 1 },
    ],
    chests: [
      { x: 25, y: 15, item: 'ironSword', opened: false },
      { x: 5, y: 25, item: 'potion', opened: false },
    ],
    playerStart: { x: 15, y: 1 },
  };

  (function buildForest() {
    const m = [];
    // seeded pseudo-random for consistent forest
    let seed = 42;
    function rand() { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; }

    for (let y = 0; y < forest.height; y++) {
      m[y] = [];
      for (let x = 0; x < forest.width; x++) {
        let t = T.GRASS;

        // Dense trees
        if (rand() < 0.25) t = T.TREE;

        // Main path through the forest
        if (x >= 14 && x <= 15) t = T.PATH;

        // Side path
        if (y >= 14 && y <= 15 && x >= 10 && x <= 25) t = T.PATH;

        // Stream
        if (x >= 7 && x <= 8 && y >= 5 && y <= 20) t = T.WATER;
        if (x === 9 && y >= 14 && y <= 15) t = T.BRIDGE;

        // Borders
        if (x === 0 || x === 29) t = T.TREE;
        if (y === 0 && (x < 13 || x > 16)) t = T.TREE;
        if (y === 29 && (x < 13 || x > 16)) t = T.TREE;

        // Clearings
        if (x >= 22 && x <= 27 && y >= 13 && y <= 17) t = T.GRASS;
        if ((x + y) % 11 === 0 && t === T.GRASS) t = T.FLOWER;

        // Chests
        if (x === 25 && y === 15) t = T.CHEST;
        if (x === 5 && y === 25) t = T.CHEST;

        // Ensure path entrance/exit is clear
        if (y <= 1 && x >= 13 && x <= 16) t = T.PATH;
        if (y >= 28 && x >= 13 && x <= 16) t = T.PATH;

        m[y][x] = t;
      }
    }
    forest.tiles = m;
  })();

  // Dungeon map (20x20)
  const dungeon = {
    name: 'Shadow Cavern',
    width: 20,
    height: 20,
    encounterRate: 0.1,
    enemyPool: ['skeleton', 'darkKnight'],
    tiles: [],
    npcs: [],
    warps: [
      { x: 5, y: 0, toMap: 'forest', toX: 15, toY: 28 },
      { x: 4, y: 0, toMap: 'forest', toX: 14, toY: 28 },
      { x: 10, y: 19, toMap: 'ruins', toX: 12, toY: 1 },
      { x: 9, y: 19, toMap: 'ruins', toX: 11, toY: 1 },
    ],
    chests: [
      { x: 15, y: 15, item: 'silverArmor', opened: false },
      { x: 3, y: 17, item: 'elixir', opened: false },
    ],
    bossSpawn: { x: 10, y: 11 },
    playerStart: { x: 5, y: 1 },
  };

  (function buildDungeon() {
    const m = [];
    for (let y = 0; y < dungeon.height; y++) {
      m[y] = [];
      for (let x = 0; x < dungeon.width; x++) {
        let t = T.WALL;

        // Main corridor
        if (x >= 4 && x <= 6 && y >= 0 && y <= 10) t = T.FLOOR;
        // Branch right
        if (y >= 5 && y <= 6 && x >= 4 && x <= 16) t = T.FLOOR;
        // Right corridor down
        if (x >= 14 && x <= 16 && y >= 5 && y <= 17) t = T.FLOOR;
        // Bottom corridor
        if (y >= 15 && y <= 17 && x >= 2 && x <= 16) t = T.FLOOR;
        // Left corridor down
        if (x >= 2 && x <= 4 && y >= 10 && y <= 17) t = T.FLOOR;
        // Center room
        if (x >= 8 && x <= 12 && y >= 9 && y <= 13) t = T.FLOOR;
        if (y >= 6 && y <= 9 && x === 10) t = T.FLOOR;
        if (y >= 13 && y <= 15 && x === 10) t = T.FLOOR;

        // Passage to Ancient Ruins (center bottom)
        if (x >= 9 && x <= 11 && y >= 17 && y <= 19) t = T.FLOOR;

        // Borders stay as wall
        if (y === 0 && (x < 3 || x > 7)) t = T.WALL;

        // Entrance
        if (y === 0 && x >= 4 && x <= 5) t = T.FLOOR;

        // Chests
        if (x === 15 && y === 15) t = T.CHEST;
        if (x === 3 && y === 17) t = T.CHEST;

        m[y][x] = t;
      }
    }
    dungeon.tiles = m;
  })();

  // Ancient Ruins map (25x25)
  const ruins = {
    name: 'Ancient Ruins',
    width: 25,
    height: 25,
    encounterRate: 0.12,
    enemyPool: ['wraith', 'stoneGolem'],
    tiles: [],
    npcs: [],
    warps: [
      { x: 12, y: 0, toMap: 'dungeon', toX: 10, toY: 18 },
      { x: 11, y: 0, toMap: 'dungeon', toX: 9, toY: 18 },
    ],
    chests: [
      { x: 20, y: 10, item: 'runeBlade', opened: false },
      { x: 4, y: 20, item: 'phoenixFeather', opened: false },
    ],
    bossSpawn: { x: 12, y: 18 },
    playerStart: { x: 12, y: 1 },
  };

  (function buildRuins() {
    const m = [];
    for (let y = 0; y < ruins.height; y++) {
      m[y] = [];
      for (let x = 0; x < ruins.width; x++) {
        let t = T.WALL;

        // North entrance corridor
        if (x >= 11 && x <= 13 && y >= 0 && y <= 4) t = T.FLOOR;

        // Main north-south hall
        if (x >= 10 && x <= 14 && y >= 4 && y <= 20) t = T.FLOOR;

        // East wing corridor
        if (y >= 8 && y <= 10 && x >= 14 && x <= 22) t = T.FLOOR;
        // East wing room
        if (x >= 18 && x <= 22 && y >= 7 && y <= 12) t = T.FLOOR;

        // West wing corridor
        if (y >= 8 && y <= 10 && x >= 2 && x <= 10) t = T.FLOOR;
        // West wing room
        if (x >= 2 && x <= 6 && y >= 7 && y <= 12) t = T.FLOOR;

        // South chamber (boss room)
        if (x >= 8 && x <= 16 && y >= 16 && y <= 22) t = T.FLOOR;

        // Small side alcoves
        if (x >= 2 && x <= 6 && y >= 18 && y <= 22) t = T.FLOOR;
        if (x >= 18 && x <= 22 && y >= 18 && y <= 22) t = T.FLOOR;

        // Connect side alcoves to boss room
        if (y >= 19 && y <= 21 && x >= 6 && x <= 8) t = T.FLOOR;
        if (y >= 19 && y <= 21 && x >= 16 && x <= 18) t = T.FLOOR;

        // Ancient pools (water features)
        if (x >= 3 && x <= 5 && y >= 9 && y <= 10) t = T.WATER;
        if (x >= 19 && x <= 21 && y >= 9 && y <= 10) t = T.WATER;

        // Sandy areas (weathered sections)
        if (t === T.FLOOR && ((x + y) % 9 === 0)) t = T.SAND;

        // Entrance sign
        if (x === 14 && y === 4) t = T.SIGN;

        // Chests
        if (x === 20 && y === 10) t = T.CHEST;
        if (x === 4 && y === 20) t = T.CHEST;

        // Ensure entrance is clear
        if (y === 0 && x >= 11 && x <= 12) t = T.FLOOR;

        m[y][x] = t;
      }
    }
    ruins.tiles = m;
  })();

  const maps = { village, forest, dungeon, ruins };

  function getMap(name) {
    return maps[name];
  }

  return { getMap, maps };
})();
