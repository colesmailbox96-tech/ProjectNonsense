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
      { x: 12, y: 24, toMap: 'peaks', toX: 15, toY: 1 },
      { x: 11, y: 24, toMap: 'peaks', toX: 14, toY: 1 },
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

        // South passage to Frozen Peaks
        if (x >= 11 && x <= 13 && y >= 22 && y <= 24) t = T.FLOOR;
        if (y === 24 && (x === 11 || x === 12)) t = T.FLOOR;

        m[y][x] = t;
      }
    }
    ruins.tiles = m;
  })();

  // Frozen Peaks map (30x25)
  const peaks = {
    name: 'Frozen Peaks',
    width: 30,
    height: 25,
    encounterRate: 0.1,
    enemyPool: ['frostWolf', 'iceElemental'],
    tiles: [],
    npcs: [],
    warps: [
      { x: 15, y: 0, toMap: 'ruins', toX: 12, toY: 23 },
      { x: 14, y: 0, toMap: 'ruins', toX: 11, toY: 23 },
      { x: 15, y: 24, toMap: 'sanctum', toX: 12, toY: 1 },
      { x: 14, y: 24, toMap: 'sanctum', toX: 11, toY: 1 },
    ],
    chests: [
      { x: 25, y: 10, item: 'frostBlade', opened: false },
      { x: 5, y: 18, item: 'warmthAmulet', opened: false },
    ],
    bossSpawn: { x: 15, y: 20 },
    playerStart: { x: 15, y: 1 },
  };

  (function buildPeaks() {
    const m = [];
    let seed = 77;
    function rand() { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; }

    for (let y = 0; y < peaks.height; y++) {
      m[y] = [];
      for (let x = 0; x < peaks.width; x++) {
        let t = T.SNOW;

        // Ice patches
        if (rand() < 0.12) t = T.ICE;

        // Mountain walls (borders)
        if (x === 0 || x === 29) t = T.WALL;
        if (y === 0 && (x < 13 || x > 16)) t = T.WALL;
        if (y === 24 && (x < 13 || x > 16)) t = T.WALL;

        // Central ice path (main north-south)
        if (x >= 14 && x <= 15 && y >= 0 && y <= 24) t = T.ICE;

        // East-west crossing path
        if (y >= 10 && y <= 11 && x >= 3 && x <= 27) t = T.ICE;

        // Frozen lake (east)
        if (x >= 20 && x <= 26 && y >= 4 && y <= 8) t = T.WATER;

        // Crystal cave (west alcove)
        if (x >= 2 && x <= 8 && y >= 14 && y <= 20) t = T.FLOOR;
        if (x >= 1 && x <= 9 && y >= 14 && y <= 14) t = T.WALL;
        if (x >= 1 && x <= 9 && y >= 21 && y <= 21) t = T.WALL;
        if (x === 1 && y >= 14 && y <= 21) t = T.WALL;
        if (x === 9 && y >= 14 && y <= 21 && y !== 17) t = T.WALL;
        if (x === 9 && y === 17) t = T.ICE; // entrance

        // Boss chamber (south)
        if (x >= 10 && x <= 20 && y >= 18 && y <= 23) t = T.ICE;
        if (x >= 10 && x <= 20 && y === 17) t = T.WALL;
        if ((x === 10 || x === 20) && y >= 17 && y <= 23) t = T.WALL;
        if (x >= 14 && x <= 16 && y === 17) t = T.ICE; // entrance

        // Snow mounds (scattered)
        if (t === T.SNOW && (x + y) % 9 === 0 && x > 1 && x < 28) t = T.TREE;

        // Entrance/exit paths
        if (y <= 1 && x >= 13 && x <= 16) t = T.ICE;
        if (y >= 23 && x >= 13 && x <= 16) t = T.ICE;

        // Chests
        if (x === 25 && y === 10) t = T.CHEST;
        if (x === 5 && y === 18) t = T.CHEST;

        // Entrance sign
        if (x === 16 && y === 2) t = T.SIGN;

        m[y][x] = t;
      }
    }
    peaks.tiles = m;
  })();

  // Celestial Sanctum map (25x20)
  const sanctum = {
    name: 'Celestial Sanctum',
    width: 25,
    height: 20,
    encounterRate: 0.1,
    enemyPool: ['stormHawk', 'thunderGolem'],
    tiles: [],
    npcs: [],
    warps: [
      { x: 12, y: 0, toMap: 'peaks', toX: 15, toY: 23 },
      { x: 11, y: 0, toMap: 'peaks', toX: 14, toY: 23 },
      { x: 12, y: 19, toMap: 'abyss', toX: 10, toY: 1 },
    ],
    chests: [
      { x: 21, y: 8, item: 'thunderSpear', opened: false },
      { x: 3, y: 15, item: 'stormweaveRing', opened: false },
    ],
    bossSpawn: { x: 12, y: 16 },
    playerStart: { x: 12, y: 1 },
  };

  (function buildSanctum() {
    const m = [];
    for (let y = 0; y < sanctum.height; y++) {
      m[y] = [];
      for (let x = 0; x < sanctum.width; x++) {
        let t = T.CLOUD;

        // Sky brick borders
        if (x === 0 || x === 24) t = T.WALL;
        if (y === 0 && (x < 10 || x > 13)) t = T.WALL;
        if (y === 19) t = T.WALL;

        // Main north-south corridor
        if (x >= 11 && x <= 13 && y >= 0 && y <= 16) t = T.SKY_BRICK;

        // East wing corridor
        if (y >= 6 && y <= 8 && x >= 13 && x <= 22) t = T.SKY_BRICK;
        // East wing chamber
        if (x >= 18 && x <= 22 && y >= 5 && y <= 10) t = T.SKY_BRICK;

        // West wing corridor
        if (y >= 6 && y <= 8 && x >= 2 && x <= 11) t = T.SKY_BRICK;
        // West wing chamber
        if (x >= 2 && x <= 6 && y >= 5 && y <= 10) t = T.SKY_BRICK;

        // Boss chamber (south)
        if (x >= 7 && x <= 17 && y >= 14 && y <= 18) t = T.SKY_BRICK;
        if (x >= 7 && x <= 17 && y === 13) t = T.WALL;
        if ((x === 7 || x === 17) && y >= 13 && y <= 18) t = T.WALL;
        if (x >= 11 && x <= 13 && y === 13) t = T.SKY_BRICK; // entrance

        // Cloud patches (decorative)
        if (t === T.SKY_BRICK && ((x + y) % 11 === 0)) t = T.CLOUD;

        // Small water features (sky pools)
        if (x >= 3 && x <= 5 && y >= 7 && y <= 8) t = T.WATER;
        if (x >= 19 && x <= 21 && y >= 7 && y <= 8) t = T.WATER;

        // Entrance sign
        if (x === 14 && y === 2) t = T.SIGN;

        // Chests
        if (x === 21 && y === 8) t = T.CHEST;
        if (x === 3 && y === 15) t = T.CHEST;

        // Ensure entrance is clear
        if (y === 0 && x >= 11 && x <= 12) t = T.SKY_BRICK;
        if (y === 1 && x >= 10 && x <= 13) t = T.SKY_BRICK;

        // South exit to Abyssal Depths
        if (y >= 18 && y <= 19 && x >= 11 && x <= 13) t = T.SKY_BRICK;

        m[y][x] = t;
      }
    }
    sanctum.tiles = m;
  })();

  // Abyssal Depths map (20x20)
  const abyss = {
    name: 'Abyssal Depths',
    width: 20,
    height: 20,
    encounterRate: 0.12,
    enemyPool: ['voidWraith', 'abyssalKnight'],
    tiles: [],
    npcs: [],
    warps: [
      { x: 10, y: 0, toMap: 'sanctum', toX: 12, toY: 18 },
      { x: 10, y: 19, toMap: 'volcano', toX: 11, toY: 1 },
    ],
    chests: [
      { x: 16, y: 8, item: 'voidBlade', opened: false },
      { x: 3, y: 15, item: 'abyssalArmor', opened: false },
    ],
    bossSpawn: { x: 10, y: 16 },
    playerStart: { x: 10, y: 1 },
  };

  (function buildAbyss() {
    const m = [];
    for (let y = 0; y < abyss.height; y++) {
      m[y] = [];
      for (let x = 0; x < abyss.width; x++) {
        let t = T.VOID;

        // Wall borders
        if (x === 0 || x === 19) t = T.WALL;
        if (y === 0 && (x < 9 || x > 11)) t = T.WALL;
        if (y === 19) t = T.WALL;

        // Main north-south corridor
        if (x >= 9 && x <= 11 && y >= 0 && y <= 14) t = T.OBSIDIAN;

        // East wing corridor
        if (y >= 6 && y <= 8 && x >= 11 && x <= 18) t = T.OBSIDIAN;
        // East wing chamber
        if (x >= 14 && x <= 18 && y >= 5 && y <= 10) t = T.OBSIDIAN;

        // West wing corridor
        if (y >= 6 && y <= 8 && x >= 1 && x <= 9) t = T.OBSIDIAN;
        // West wing chamber
        if (x >= 1 && x <= 5 && y >= 5 && y <= 10) t = T.OBSIDIAN;

        // Boss chamber (south)
        if (x >= 5 && x <= 15 && y >= 13 && y <= 18) t = T.OBSIDIAN;
        if (x >= 5 && x <= 15 && y === 12) t = T.WALL;
        if ((x === 5 || x === 15) && y >= 12 && y <= 18) t = T.WALL;
        if (x >= 9 && x <= 11 && y === 12) t = T.OBSIDIAN; // entrance

        // Floor rooms (inner areas)
        if (x >= 7 && x <= 13 && y >= 14 && y <= 17) t = T.FLOOR;
        if (x >= 2 && x <= 4 && y >= 6 && y <= 9) t = T.FLOOR;
        if (x >= 15 && x <= 17 && y >= 6 && y <= 9) t = T.FLOOR;

        // Dark pools (water features)
        if (x >= 2 && x <= 3 && y >= 7 && y <= 8) t = T.WATER;
        if (x >= 16 && x <= 17 && y >= 7 && y <= 8) t = T.WATER;

        // Chests
        if (x === 16 && y === 8) t = T.CHEST;
        if (x === 3 && y === 15) t = T.CHEST;

        // Ensure entrance is clear
        if (y === 0 && x >= 9 && x <= 10) t = T.OBSIDIAN;
        if (y === 1 && x >= 9 && x <= 11) t = T.OBSIDIAN;

        // South exit to Volcanic Forge
        if (y >= 18 && y <= 19 && x >= 9 && x <= 11) t = T.OBSIDIAN;

        m[y][x] = t;
      }
    }
    abyss.tiles = m;
  })();

  // Volcanic Forge map (22x20)
  const volcano = {
    name: 'Volcanic Forge',
    width: 22,
    height: 20,
    encounterRate: 0.13,
    enemyPool: ['magmaElemental', 'forgeSentinel'],
    tiles: [],
    npcs: [],
    warps: [
      { x: 11, y: 0, toMap: 'abyss', toX: 10, toY: 18 },
      { x: 11, y: 19, toMap: 'gardens', toX: 12, toY: 1 },
    ],
    chests: [
      { x: 18, y: 8, item: 'infernoBlade', opened: false },
      { x: 8, y: 15, item: 'forgePlate', opened: false },
    ],
    bossSpawn: { x: 11, y: 16 },
    playerStart: { x: 11, y: 1 },
  };

  (function buildVolcano() {
    const m = [];
    for (let y = 0; y < volcano.height; y++) {
      m[y] = [];
      for (let x = 0; x < volcano.width; x++) {
        let t = T.LAVA;

        // Wall borders
        if (x === 0 || x === 21) t = T.WALL;
        if (y === 0 && (x < 10 || x > 12)) t = T.WALL;
        if (y === 19) t = T.WALL;

        // Main north-south corridor
        if (x >= 10 && x <= 12 && y >= 0 && y <= 14) t = T.BASALT;

        // East wing corridor
        if (y >= 6 && y <= 8 && x >= 12 && x <= 20) t = T.BASALT;
        // East wing chamber
        if (x >= 16 && x <= 20 && y >= 5 && y <= 10) t = T.BASALT;

        // West wing corridor
        if (y >= 6 && y <= 8 && x >= 1 && x <= 10) t = T.BASALT;
        // West wing chamber
        if (x >= 1 && x <= 5 && y >= 5 && y <= 10) t = T.BASALT;

        // Boss chamber (south)
        if (x >= 6 && x <= 16 && y >= 13 && y <= 18) t = T.BASALT;
        if (x >= 6 && x <= 16 && y === 12) t = T.WALL;
        if ((x === 6 || x === 16) && y >= 12 && y <= 18) t = T.WALL;
        if (x >= 10 && x <= 12 && y === 12) t = T.BASALT; // entrance

        // Floor rooms (inner areas)
        if (x >= 8 && x <= 14 && y >= 14 && y <= 17) t = T.FLOOR;
        if (x >= 2 && x <= 4 && y >= 6 && y <= 9) t = T.FLOOR;
        if (x >= 17 && x <= 19 && y >= 6 && y <= 9) t = T.FLOOR;

        // Lava pools (decorative)
        if (x >= 2 && x <= 3 && y >= 7 && y <= 8) t = T.LAVA;
        if (x >= 18 && x <= 19 && y >= 7 && y <= 8) t = T.LAVA;

        // Chests
        if (x === 18 && y === 8) t = T.CHEST;
        if (x === 8 && y === 15) t = T.CHEST;

        // Ensure entrance is clear
        if (y === 0 && x >= 10 && x <= 11) t = T.BASALT;
        if (y === 1 && x >= 10 && x <= 12) t = T.BASALT;

        // South exit to gardens
        if (y === 19 && x >= 10 && x <= 12) t = T.BASALT;

        m[y][x] = t;
      }
    }
    volcano.tiles = m;
  })();

  // Ethereal Gardens map (24x22)
  const gardens = {
    name: 'Ethereal Gardens',
    width: 24,
    height: 22,
    encounterRate: 0.12,
    enemyPool: ['faeGuardian', 'crystalGolem'],
    tiles: [],
    npcs: [],
    warps: [
      { x: 12, y: 0, toMap: 'volcano', toX: 11, toY: 18 },
      { x: 12, y: 21, toMap: 'citadel', toX: 12, toY: 1 },
    ],
    chests: [
      { x: 20, y: 8, item: 'etherealBlade', opened: false },
      { x: 6, y: 16, item: 'etherealPlate', opened: false },
    ],
    bossSpawn: { x: 12, y: 18 },
    playerStart: { x: 12, y: 1 },
  };

  (function buildGardens() {
    const m = [];
    for (let y = 0; y < gardens.height; y++) {
      m[y] = [];
      for (let x = 0; x < gardens.width; x++) {
        let t = T.ETHEREAL;

        // Wall borders
        if (x === 0 || x === 23) t = T.WALL;
        if (y === 0 && (x < 11 || x > 13)) t = T.WALL;
        if (y === 21 && x !== 12) t = T.WALL;

        // Main north-south corridor
        if (x >= 11 && x <= 13 && y >= 0 && y <= 14) t = T.CRYSTAL;

        // East wing corridor
        if (y >= 6 && y <= 8 && x >= 13 && x <= 22) t = T.CRYSTAL;
        // East wing chamber
        if (x >= 18 && x <= 22 && y >= 5 && y <= 10) t = T.CRYSTAL;

        // West wing corridor
        if (y >= 6 && y <= 8 && x >= 1 && x <= 11) t = T.CRYSTAL;
        // West wing chamber
        if (x >= 1 && x <= 6 && y >= 5 && y <= 10) t = T.CRYSTAL;

        // Boss chamber (south)
        if (x >= 6 && x <= 18 && y >= 13 && y <= 20) t = T.CRYSTAL;
        if (x >= 6 && x <= 18 && y === 12) t = T.WALL;
        if ((x === 6 || x === 18) && y >= 12 && y <= 20) t = T.WALL;
        if (x >= 11 && x <= 13 && y === 12) t = T.CRYSTAL; // entrance

        // Inner boss floor
        if (x >= 8 && x <= 16 && y >= 14 && y <= 19) t = T.FLOOR;

        // Flower patches in wings
        if (x >= 2 && x <= 4 && y >= 6 && y <= 9) t = T.FLOWER;
        if (x >= 19 && x <= 21 && y >= 6 && y <= 9) t = T.FLOWER;

        // Water features
        if (x >= 3 && x <= 4 && y >= 7 && y <= 8) t = T.WATER;
        if (x >= 19 && x <= 20 && y >= 7 && y <= 8) t = T.WATER;

        // Chests
        if (x === 20 && y === 8) t = T.CHEST;
        if (x === 6 && y === 16) t = T.CHEST;

        // Ensure entrance is clear
        if (y === 0 && x >= 11 && x <= 12) t = T.CRYSTAL;
        if (y === 1 && x >= 11 && x <= 13) t = T.CRYSTAL;

        m[y][x] = t;
      }
    }
    gardens.tiles = m;
  })();

  // Twilight Citadel map (25x20)
  const citadel = {
    name: 'Twilight Citadel',
    width: 25,
    height: 20,
    encounterRate: 0.13,
    enemyPool: ['twilightSentinel', 'shadowMage'],
    tiles: [],
    npcs: [],
    warps: [
      { x: 12, y: 0, toMap: 'gardens', toX: 12, toY: 20 },
    ],
    chests: [
      { x: 4, y: 8, item: 'twilightBlade', opened: false },
      { x: 20, y: 8, item: 'twilightArmor', opened: false },
    ],
    bossSpawn: { x: 12, y: 16 },
    playerStart: { x: 12, y: 1 },
  };

  (function buildCitadel() {
    const m = [];
    for (let y = 0; y < citadel.height; y++) {
      m[y] = [];
      for (let x = 0; x < citadel.width; x++) {
        let t = T.SHADOW_STONE;

        // Wall borders
        if (x === 0 || x === 24) t = T.WALL;
        if (y === 0 && (x < 11 || x > 13)) t = T.WALL;
        if (y === 19) t = T.WALL;

        // Main north-south corridor
        if (x >= 11 && x <= 13 && y >= 0 && y <= 12) t = T.ARCANE_GLOW;

        // West wing corridor
        if (y >= 6 && y <= 8 && x >= 1 && x <= 11) t = T.ARCANE_GLOW;
        // West wing chamber
        if (x >= 1 && x <= 6 && y >= 5 && y <= 10) t = T.ARCANE_GLOW;

        // East wing corridor
        if (y >= 6 && y <= 8 && x >= 13 && x <= 23) t = T.ARCANE_GLOW;
        // East wing chamber
        if (x >= 18 && x <= 23 && y >= 5 && y <= 10) t = T.ARCANE_GLOW;

        // Dark pools in wings
        if (x >= 2 && x <= 3 && y >= 6 && y <= 7) t = T.WATER;
        if (x >= 21 && x <= 22 && y >= 6 && y <= 7) t = T.WATER;

        // Boss chamber (south)
        if (x >= 5 && x <= 19 && y >= 12 && y <= 18) t = T.ARCANE_GLOW;
        if (x >= 5 && x <= 19 && y === 11) t = T.WALL;
        if ((x === 5 || x === 19) && y >= 11 && y <= 18) t = T.WALL;
        if (x >= 11 && x <= 13 && y === 11) t = T.ARCANE_GLOW; // entrance

        // Inner boss floor
        if (x >= 7 && x <= 17 && y >= 13 && y <= 17) t = T.FLOOR;

        // Chests
        if (x === 4 && y === 8) t = T.CHEST;
        if (x === 20 && y === 8) t = T.CHEST;

        // Ensure entrance is clear
        if (y === 0 && x >= 11 && x <= 13) t = T.ARCANE_GLOW;
        if (y === 1 && x >= 11 && x <= 13) t = T.ARCANE_GLOW;

        m[y][x] = t;
      }
    }
    citadel.tiles = m;
  })();

  const maps = { village, forest, dungeon, ruins, peaks, sanctum, abyss, volcano, gardens, citadel };

  function getMap(name) {
    return maps[name];
  }

  return { getMap, maps };
})();
