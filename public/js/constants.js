/* ========= GAME CONSTANTS ========= */
const TILE_SIZE = 16;
const SCALE = 3;
const SCALED_TILE = TILE_SIZE * SCALE;

const DIRECTIONS = { up: 0, down: 1, left: 2, right: 3 };
const DIR_OFFSETS = {
  up:    { x:  0, y: -1 },
  down:  { x:  0, y:  1 },
  left:  { x: -1, y:  0 },
  right: { x:  1, y:  0 },
};

const GAME_STATES = {
  TITLE: 'title',
  EXPLORE: 'explore',
  DIALOGUE: 'dialogue',
  BATTLE: 'battle',
  MENU: 'menu',
  TRANSITION: 'transition',
};

const COLORS = {
  grass1: '#2d5a27',
  grass2: '#3a7a34',
  path: '#8b7355',
  pathEdge: '#6b5335',
  water: '#2255aa',
  waterLight: '#3366cc',
  wall: '#555566',
  wallTop: '#777788',
  wallDark: '#333344',
  woodFloor: '#8b6f47',
  woodFloorLight: '#9b7f57',
  door: '#6b4226',
  roof: '#884422',
  roofDark: '#663311',
  tree1: '#1a4a14',
  tree2: '#2a6a24',
  trunk: '#5a3a1a',
  flower1: '#ff6688',
  flower2: '#ffcc44',
  flower3: '#88aaff',
  sand: '#c2b280',
  bridge: '#7a5a2a',
  chest: '#aa7733',
  chestGold: '#ffd700',
  ice: '#99ccee',
  iceLight: '#bbddff',
  iceDark: '#6699bb',
  snow: '#ddeeff',
  snowLight: '#eef4ff',
  frost: '#aaddff',
  snowDark: '#ccdde8',
  cloud: '#d8e8f8',
  cloudLight: '#eef4ff',
  cloudDark: '#b0c8e0',
  skyBrick: '#8899bb',
  skyBrickLight: '#99aacc',
  skyBrickDark: '#667799',
};

const TILE_TYPES = {
  GRASS: 0,
  PATH: 1,
  WATER: 2,
  WALL: 3,
  TREE: 4,
  DOOR: 5,
  FLOOR: 6,
  CHEST: 7,
  FLOWER: 8,
  SAND: 9,
  BRIDGE: 10,
  WALL_TOP: 11,
  SIGN: 12,
  ICE: 13,
  SNOW: 14,
  CLOUD: 15,
  SKY_BRICK: 16,
};

const PASSABLE = new Set([
  TILE_TYPES.GRASS,
  TILE_TYPES.PATH,
  TILE_TYPES.FLOOR,
  TILE_TYPES.DOOR,
  TILE_TYPES.FLOWER,
  TILE_TYPES.SAND,
  TILE_TYPES.BRIDGE,
  TILE_TYPES.SIGN,
  TILE_TYPES.ICE,
  TILE_TYPES.SNOW,
  TILE_TYPES.CLOUD,
  TILE_TYPES.SKY_BRICK,
]);
