/* ========= TILE RENDERER ========= */
const Renderer = (() => {
  const tileCache = {};
  let animFrame = 0;
  let animTimer = 0;

  // Seeded random for deterministic tile variation
  function seededRand(x, y, seed) {
    let h = (x * 374761393 + y * 668265263 + seed * 1274126177) | 0;
    h = ((h ^ (h >> 13)) * 1274126177) | 0;
    return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
  }

  function getTileCanvas(type, x, y) {
    const variant = (x + y) % 3;
    const key = `${type}_${variant}_${animFrame}`;
    if (tileCache[key]) return tileCache[key];

    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const ctx = c.getContext('2d');

    switch (type) {
      case TILE_TYPES.GRASS:
        ctx.fillStyle = variant === 0 ? COLORS.grass1 : COLORS.grass2;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Dithered texture
        ctx.fillStyle = variant === 0 ? COLORS.grass2 : COLORS.grass1;
        ctx.fillRect(1, 1, 1, 1);
        ctx.fillRect(5, 3, 1, 1);
        ctx.fillRect(9, 1, 1, 1);
        ctx.fillRect(13, 5, 1, 1);
        ctx.fillRect(3, 7, 1, 1);
        ctx.fillRect(11, 9, 1, 1);
        ctx.fillRect(7, 11, 1, 1);
        ctx.fillRect(1, 13, 1, 1);
        ctx.fillRect(14, 12, 1, 1);
        // Grass blade details
        ctx.fillStyle = '#4a9a44';
        ctx.fillRect(3, 4, 1, 2);
        ctx.fillRect(10, 7, 1, 2);
        ctx.fillRect(7, 12, 1, 2);
        // Darker ground accents
        ctx.fillStyle = variant === 0 ? '#1e4a1a' : '#2a5a24';
        ctx.fillRect(6, 2, 2, 1);
        ctx.fillRect(12, 10, 2, 1);
        break;

      case TILE_TYPES.PATH:
        ctx.fillStyle = COLORS.path;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Pebble detail
        ctx.fillStyle = COLORS.pathEdge;
        ctx.fillRect(variant * 5, variant * 3, 3, 2);
        ctx.fillRect(8 + variant, 10 - variant, 2, 2);
        // Extra pebbles
        ctx.fillStyle = '#9b8365';
        ctx.fillRect(2, 6, 2, 1);
        ctx.fillRect(11, 3, 1, 1);
        ctx.fillRect(5, 12, 2, 1);
        // Darker dirt spots
        ctx.fillStyle = '#6b5335';
        ctx.fillRect(1, 1, 1, 1);
        ctx.fillRect(9, 7, 1, 1);
        ctx.fillRect(14, 13, 1, 1);
        // Edge highlight
        ctx.fillStyle = '#a08060';
        ctx.fillRect(0, 0, TILE_SIZE, 1);
        break;

      case TILE_TYPES.WATER:
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Deep water darker areas
        ctx.fillStyle = '#1a4488';
        ctx.fillRect(0, 6, TILE_SIZE, 4);
        // Animated wave crests
        ctx.fillStyle = COLORS.waterLight;
        const waveOff = animFrame * 3;
        ctx.fillRect((2 + waveOff) % TILE_SIZE, 3, 5, 1);
        ctx.fillRect((10 + waveOff) % TILE_SIZE, 9, 4, 1);
        ctx.fillRect((6 + waveOff) % TILE_SIZE, 13, 3, 1);
        // Bright highlights
        ctx.fillStyle = '#4488ee';
        ctx.fillRect((4 + waveOff) % TILE_SIZE, 2, 2, 1);
        ctx.fillRect((12 + waveOff) % TILE_SIZE, 8, 2, 1);
        // Foam/sparkle
        ctx.fillStyle = '#88bbff';
        ctx.fillRect((3 + waveOff * 2) % TILE_SIZE, 5 + (animFrame % 2), 1, 1);
        ctx.fillRect((11 + waveOff * 2) % TILE_SIZE, 11 + (animFrame % 2), 1, 1);
        break;

      case TILE_TYPES.WALL:
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Brick mortar lines
        ctx.fillStyle = COLORS.wallDark;
        ctx.fillRect(0, 0, TILE_SIZE, 1);
        ctx.fillRect(0, 7, TILE_SIZE, 1);
        ctx.fillRect(0, 14, TILE_SIZE, 1);
        ctx.fillRect(7, 0, 1, 8);
        ctx.fillRect(3, 7, 1, 8);
        ctx.fillRect(11, 7, 1, 8);
        // Brick highlights
        ctx.fillStyle = '#6a6a7a';
        ctx.fillRect(1, 1, 5, 1);
        ctx.fillRect(9, 1, 5, 1);
        ctx.fillRect(4, 8, 6, 1);
        // Edge shadow
        ctx.fillStyle = '#3a3a4a';
        ctx.fillRect(0, 0, 1, TILE_SIZE);
        ctx.fillRect(0, TILE_SIZE - 1, TILE_SIZE, 1);
        break;

      case TILE_TYPES.WALL_TOP:
        ctx.fillStyle = COLORS.roof;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Shingle rows
        ctx.fillStyle = COLORS.roofDark;
        ctx.fillRect(0, 0, TILE_SIZE, 2);
        ctx.fillRect(0, 5, TILE_SIZE, 1);
        ctx.fillRect(0, 10, TILE_SIZE, 1);
        for (let i = 0; i < TILE_SIZE; i += 4) {
          ctx.fillRect(i, 6 + (i % 8 === 0 ? 0 : 2), 2, 2);
        }
        // Roof highlights
        ctx.fillStyle = '#aa5533';
        ctx.fillRect(2, 2, 4, 1);
        ctx.fillRect(10, 7, 3, 1);
        ctx.fillRect(6, 12, 4, 1);
        break;

      case TILE_TYPES.TREE:
        ctx.fillStyle = COLORS.grass1;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Tree shadow on ground
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(3, 13, 11, 3);
        // Trunk with bark detail
        ctx.fillStyle = COLORS.trunk;
        ctx.fillRect(6, 9, 4, 7);
        ctx.fillStyle = '#4a2a0a';
        ctx.fillRect(7, 10, 1, 4);
        ctx.fillStyle = '#6a4a2a';
        ctx.fillRect(8, 11, 1, 3);
        // Canopy layers for depth
        ctx.fillStyle = COLORS.tree1;
        ctx.fillRect(1, 2, 14, 9);
        ctx.fillStyle = COLORS.tree2;
        ctx.fillRect(3, 1, 10, 8);
        ctx.fillRect(2, 3, 12, 6);
        // Canopy highlights
        ctx.fillStyle = '#3a8a34';
        ctx.fillRect(4, 2, 4, 3);
        ctx.fillRect(9, 4, 3, 2);
        // Light dapple
        ctx.fillStyle = '#4aaa44';
        ctx.fillRect(5, 3, 2, 1);
        ctx.fillRect(10, 5, 1, 1);
        // Canopy shadow edge
        ctx.fillStyle = '#0a3a08';
        ctx.fillRect(1, 10, 14, 1);
        ctx.fillRect(2, 9, 2, 1);
        ctx.fillRect(12, 9, 2, 1);
        break;

      case TILE_TYPES.DOOR:
        ctx.fillStyle = COLORS.path;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Door frame
        ctx.fillStyle = '#5a3216';
        ctx.fillRect(2, 0, 12, 15);
        // Door panels
        ctx.fillStyle = COLORS.door;
        ctx.fillRect(3, 1, 10, 13);
        ctx.fillStyle = '#8b5a36';
        ctx.fillRect(4, 2, 8, 10);
        // Panel detail
        ctx.fillStyle = '#7a4a26';
        ctx.fillRect(4, 6, 8, 1);
        ctx.fillRect(8, 2, 1, 10);
        // Door handle
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(10, 7, 2, 2);
        // Handle shine
        ctx.fillStyle = '#ffee66';
        ctx.fillRect(10, 7, 1, 1);
        // Threshold
        ctx.fillStyle = '#4a2a10';
        ctx.fillRect(2, 14, 12, 2);
        break;

      case TILE_TYPES.FLOOR:
        ctx.fillStyle = variant === 0 ? COLORS.woodFloor : COLORS.woodFloorLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Wood plank lines
        ctx.fillStyle = '#7a5f37';
        ctx.fillRect(0, 7, TILE_SIZE, 1);
        ctx.fillRect(0, 15, TILE_SIZE, 1);
        // Wood grain
        ctx.fillStyle = '#8a7047';
        ctx.fillRect(3, 2, 4, 1);
        ctx.fillRect(10, 10, 3, 1);
        // Knot
        ctx.fillStyle = '#6a4f27';
        ctx.fillRect(5 + variant * 3, 4, 2, 2);
        break;

      case TILE_TYPES.CHEST:
        ctx.fillStyle = COLORS.grass1;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Chest shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(4, 14, 9, 2);
        // Chest body
        ctx.fillStyle = COLORS.chest;
        ctx.fillRect(3, 6, 10, 8);
        // Chest lid
        ctx.fillStyle = '#bb8833';
        ctx.fillRect(3, 6, 10, 3);
        // Lid highlight
        ctx.fillStyle = '#cc9944';
        ctx.fillRect(4, 6, 8, 1);
        // Metal bands
        ctx.fillStyle = '#776622';
        ctx.fillRect(3, 9, 10, 1);
        ctx.fillRect(3, 13, 10, 1);
        // Latch
        ctx.fillStyle = COLORS.chestGold;
        ctx.fillRect(7, 8, 2, 3);
        // Latch shine
        ctx.fillStyle = '#ffee66';
        ctx.fillRect(7, 8, 1, 1);
        break;

      case TILE_TYPES.FLOWER:
        ctx.fillStyle = variant === 0 ? COLORS.grass1 : COLORS.grass2;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Grass texture underneath
        ctx.fillStyle = variant === 0 ? COLORS.grass2 : COLORS.grass1;
        ctx.fillRect(2, 2, 1, 1);
        ctx.fillRect(12, 8, 1, 1);
        // Stem
        ctx.fillStyle = '#2a5a1a';
        ctx.fillRect(7, 8, 1, 5);
        ctx.fillRect(8, 10, 1, 3);
        // Leaf
        ctx.fillStyle = '#3a7a2a';
        ctx.fillRect(9, 9, 2, 1);
        // Flower petals
        const flowerColors = [COLORS.flower1, COLORS.flower2, COLORS.flower3];
        ctx.fillStyle = flowerColors[variant];
        ctx.fillRect(6, 4, 1, 3);
        ctx.fillRect(9, 4, 1, 3);
        ctx.fillRect(5, 5, 1, 1);
        ctx.fillRect(10, 5, 1, 1);
        ctx.fillRect(7, 3, 2, 1);
        ctx.fillRect(7, 7, 2, 1);
        // Center
        ctx.fillStyle = '#ffff88';
        ctx.fillRect(7, 5, 2, 2);
        break;

      case TILE_TYPES.SAND:
        ctx.fillStyle = COLORS.sand;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Sand texture dithering
        ctx.fillStyle = '#b0a070';
        ctx.fillRect(variant * 4, variant * 5, 3, 2);
        ctx.fillRect(2, 10, 1, 1);
        ctx.fillRect(9, 3, 1, 1);
        ctx.fillRect(14, 12, 1, 1);
        // Lighter sand highlights
        ctx.fillStyle = '#d4c8a0';
        ctx.fillRect(5, 1, 2, 1);
        ctx.fillRect(12, 7, 2, 1);
        ctx.fillRect(3, 13, 1, 1);
        break;

      case TILE_TYPES.BRIDGE:
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Bridge planks
        ctx.fillStyle = COLORS.bridge;
        ctx.fillRect(0, 2, TILE_SIZE, 12);
        // Plank detail
        ctx.fillStyle = '#6a5a3a';
        ctx.fillRect(0, 5, TILE_SIZE, 1);
        ctx.fillRect(0, 9, TILE_SIZE, 1);
        // Railing
        ctx.fillStyle = '#5a4a2a';
        ctx.fillRect(0, 2, TILE_SIZE, 2);
        ctx.fillRect(0, 12, TILE_SIZE, 2);
        // Rail posts
        ctx.fillRect(3, 2, 2, 12);
        ctx.fillRect(11, 2, 2, 12);
        // Rail highlight
        ctx.fillStyle = '#8a7a5a';
        ctx.fillRect(1, 2, TILE_SIZE - 2, 1);
        break;

      case TILE_TYPES.SIGN:
        ctx.fillStyle = COLORS.grass2;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Sign post
        ctx.fillStyle = COLORS.trunk;
        ctx.fillRect(7, 8, 2, 7);
        // Sign board
        ctx.fillStyle = '#aa8844';
        ctx.fillRect(3, 3, 10, 6);
        // Board border
        ctx.fillStyle = '#886633';
        ctx.fillRect(3, 3, 10, 1);
        ctx.fillRect(3, 8, 10, 1);
        ctx.fillRect(3, 3, 1, 6);
        ctx.fillRect(12, 3, 1, 6);
        // Text marks
        ctx.fillStyle = '#664422';
        ctx.fillRect(5, 5, 6, 1);
        ctx.fillRect(5, 7, 4, 1);
        break;

      case TILE_TYPES.ICE:
        ctx.fillStyle = COLORS.ice;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.iceLight;
        ctx.fillRect(2 + variant * 3, 3, 4, 2);
        ctx.fillRect(9, 10 - variant, 3, 2);
        ctx.fillStyle = COLORS.iceDark;
        ctx.fillRect(variant * 4, variant * 5 + 6, 3, 1);
        // Ice shine
        ctx.fillStyle = '#ddeeff';
        ctx.fillRect(4, 2, 1, 1);
        ctx.fillRect(11, 8, 1, 1);
        // Crack detail
        ctx.fillStyle = '#88aacc';
        ctx.fillRect(6, 5, 1, 3);
        ctx.fillRect(7, 7, 2, 1);
        break;

      case TILE_TYPES.SNOW:
        ctx.fillStyle = COLORS.snow;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.snowLight;
        ctx.fillRect(3 + variant, 4, 3, 2);
        ctx.fillRect(10, 10 - variant, 2, 2);
        ctx.fillStyle = COLORS.snowDark;
        ctx.fillRect(variant * 5, 12, 2, 2);
        // Snow sparkle
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(5, 2, 1, 1);
        ctx.fillRect(12, 6, 1, 1);
        ctx.fillRect(2, 11, 1, 1);
        break;

      case TILE_TYPES.CLOUD:
        ctx.fillStyle = COLORS.cloud;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.cloudLight;
        ctx.fillRect(2 + variant * 3, 3, 5, 3);
        ctx.fillRect(8, 9 - variant, 4, 3);
        ctx.fillStyle = COLORS.cloudDark;
        ctx.fillRect(variant * 4, 12, 3, 2);
        // Cloud puff highlight
        ctx.fillStyle = '#f4faff';
        ctx.fillRect(4, 4, 2, 1);
        ctx.fillRect(10, 10, 1, 1);
        break;

      case TILE_TYPES.SKY_BRICK:
        ctx.fillStyle = COLORS.skyBrick;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.skyBrickLight;
        ctx.fillRect(1, 1, 6, 6);
        ctx.fillRect(9, 9, 6, 6);
        ctx.fillStyle = COLORS.skyBrickDark;
        ctx.fillRect(0, 7, TILE_SIZE, 1);
        ctx.fillRect(8, 0, 1, TILE_SIZE);
        // Brick highlight
        ctx.fillStyle = '#aabbdd';
        ctx.fillRect(2, 2, 3, 1);
        ctx.fillRect(10, 10, 3, 1);
        break;

      case TILE_TYPES.VOID:
        ctx.fillStyle = COLORS.void;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.voidLight;
        ctx.fillRect(3 + variant * 2, 2, 4, 3);
        ctx.fillRect(9, 10 - variant, 3, 2);
        ctx.fillStyle = COLORS.voidDark;
        ctx.fillRect(variant * 3, 13, 2, 2);
        ctx.fillRect(12 - variant, 6, 2, 2);
        // Void particle
        ctx.fillStyle = '#3a1166';
        ctx.fillRect(5 + animFrame, 7, 1, 1);
        break;

      case TILE_TYPES.OBSIDIAN:
        ctx.fillStyle = COLORS.obsidian;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.obsidianLight;
        ctx.fillRect(1, 1, 6, 6);
        ctx.fillRect(9, 9, 6, 6);
        ctx.fillStyle = COLORS.obsidianDark;
        ctx.fillRect(0, 7, TILE_SIZE, 1);
        ctx.fillRect(8, 0, 1, TILE_SIZE);
        // Glass-like shine
        ctx.fillStyle = '#4a4a5a';
        ctx.fillRect(3, 3, 1, 1);
        ctx.fillRect(12, 11, 1, 1);
        break;

      case TILE_TYPES.LAVA:
        ctx.fillStyle = COLORS.lava;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Animated lava flow
        ctx.fillStyle = COLORS.lavaLight;
        ctx.fillRect((3 + animFrame * 2) % TILE_SIZE, 2, 4, 3);
        ctx.fillRect((9 + animFrame * 3) % TILE_SIZE, 9, 3, 2);
        ctx.fillStyle = COLORS.lavaDark;
        ctx.fillRect(variant * 3, 13, 2, 2);
        ctx.fillRect(12 - variant, 6, 2, 2);
        // Lava bright spot
        ctx.fillStyle = '#ffaa44';
        ctx.fillRect((5 + animFrame * 2) % TILE_SIZE, 4, 2, 1);
        ctx.fillRect((11 + animFrame) % TILE_SIZE, 10, 1, 1);
        break;

      case TILE_TYPES.BASALT:
        ctx.fillStyle = COLORS.basalt;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.basaltLight;
        ctx.fillRect(1, 1, 6, 6);
        ctx.fillRect(9, 9, 6, 6);
        ctx.fillStyle = COLORS.basaltDark;
        ctx.fillRect(0, 7, TILE_SIZE, 1);
        ctx.fillRect(8, 0, 1, TILE_SIZE);
        // Crevice detail
        ctx.fillStyle = '#1a1012';
        ctx.fillRect(4, 4, 1, 2);
        ctx.fillRect(12, 12, 2, 1);
        break;

      case TILE_TYPES.ETHEREAL:
        ctx.fillStyle = variant === 0 ? COLORS.ethereal : COLORS.etherealLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.etherealDark;
        ctx.fillRect(3 + variant * 2, 4, 3, 2);
        ctx.fillRect(9, 10 - variant, 2, 2);
        // Magical sparkle pattern
        ctx.fillStyle = '#ddaaff';
        ctx.fillRect(5 + animFrame * 3, 2 + variant, 2, 2);
        ctx.fillStyle = '#eeccff';
        ctx.fillRect((8 + animFrame * 2) % 14, (7 + animFrame) % 12, 1, 1);
        ctx.fillRect((2 + animFrame * 3) % 14, (11 - animFrame) % 12, 1, 1);
        break;

      case TILE_TYPES.CRYSTAL:
        ctx.fillStyle = variant === 0 ? COLORS.crystal : COLORS.crystalLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.crystalDark;
        ctx.fillRect(2 + variant, 3, 4, 3);
        ctx.fillRect(10, 8 - variant, 3, 2);
        // Crystal facets
        ctx.fillStyle = '#bbddff';
        ctx.fillRect(5, 4, 2, 2);
        ctx.fillRect(11, 9, 1, 1);
        // Crystal shimmer
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6 + animFrame * 2, 5, 1, 1);
        ctx.fillRect((10 + animFrame * 3) % 14, 3, 1, 1);
        break;

      case TILE_TYPES.SHADOW_STONE:
        ctx.fillStyle = variant === 0 ? COLORS.shadowStone : COLORS.shadowStoneLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.shadowStoneDark;
        ctx.fillRect(2 + variant * 2, 3, 4, 3);
        ctx.fillRect(10, 9 - variant, 3, 2);
        // Rune glow
        ctx.fillStyle = '#8855cc';
        ctx.fillRect(4 + animFrame * 2, 7, 2, 2);
        // Additional rune marks
        ctx.fillStyle = '#6644aa';
        ctx.fillRect((9 + animFrame) % 14, 4, 1, 1);
        break;

      case TILE_TYPES.ARCANE_GLOW:
        ctx.fillStyle = variant === 0 ? COLORS.arcaneGlow : COLORS.arcaneGlowLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.arcaneGlowDark;
        ctx.fillRect(3 + variant, 4, 3, 2);
        ctx.fillRect(9, 10 - variant, 2, 2);
        // Arcane pulse
        ctx.fillStyle = '#bb88ff';
        ctx.fillRect(5 + animFrame * 3, 3 + variant, 2, 2);
        // Energy motes
        ctx.fillStyle = '#dd99ff';
        ctx.fillRect((2 + animFrame * 4) % 14, (8 + animFrame) % 12, 1, 1);
        break;

      case TILE_TYPES.STAR_STONE:
        ctx.fillStyle = variant === 0 ? COLORS.starStone : COLORS.starStoneLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.starStoneDark;
        ctx.fillRect(2 + variant, 2, 4, 3);
        ctx.fillRect(9, 8 - variant, 3, 2);
        // Star twinkle
        ctx.fillStyle = '#aaaaff';
        ctx.fillRect(6 + animFrame * 2, 6, 1, 1);
        // Extra stars
        ctx.fillStyle = '#8888dd';
        ctx.fillRect((3 + animFrame * 3) % 14, 10, 1, 1);
        ctx.fillRect((11 + animFrame) % 14, 3, 1, 1);
        break;

      case TILE_TYPES.NEBULA_GLOW:
        ctx.fillStyle = variant === 0 ? COLORS.nebulaGlow : COLORS.nebulaGlowLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.nebulaGlowDark;
        ctx.fillRect(3 + variant, 3, 3, 2);
        ctx.fillRect(8, 9 - variant, 2, 2);
        // Nebula shimmer
        ctx.fillStyle = '#cc88ff';
        ctx.fillRect(4 + animFrame * 3, 4 + variant, 2, 2);
        // Gas cloud effect
        ctx.fillStyle = '#aa66dd';
        ctx.fillRect((1 + animFrame * 2) % 13, (7 + animFrame) % 12, 2, 1);
        break;

      case TILE_TYPES.TEMPORAL_STONE:
        ctx.fillStyle = variant === 0 ? COLORS.temporalStone : COLORS.temporalStoneLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.temporalStoneDark;
        ctx.fillRect(1 + variant, 3, 4, 3);
        ctx.fillRect(10, 7 - variant, 3, 2);
        // Time shimmer
        ctx.fillStyle = '#55dddd';
        ctx.fillRect(5 + animFrame * 2, 5, 1, 1);
        // Clock-like marks
        ctx.fillStyle = '#44bbbb';
        ctx.fillRect((9 + animFrame * 3) % 14, 10, 1, 1);
        break;

      case TILE_TYPES.RIFT_GLOW:
        ctx.fillStyle = variant === 0 ? COLORS.riftGlow : COLORS.riftGlowLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.riftGlowDark;
        ctx.fillRect(2 + variant, 2, 3, 2);
        ctx.fillRect(9, 8 - variant, 2, 2);
        // Rift pulse
        ctx.fillStyle = '#88ffff';
        ctx.fillRect(3 + animFrame * 3, 3 + variant, 2, 2);
        // Rift crackle
        ctx.fillStyle = '#aaffff';
        ctx.fillRect((7 + animFrame * 2) % 14, (6 + animFrame) % 12, 1, 1);
        break;

      case TILE_TYPES.SHATTERED_STONE:
        ctx.fillStyle = variant === 0 ? COLORS.shatteredStone : COLORS.shatteredStoneLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.shatteredStoneDark;
        ctx.fillRect(1 + variant * 2, 2, 4, 3);
        ctx.fillRect(10, 8 - variant, 3, 2);
        // Fracture line
        ctx.fillStyle = '#cc66ee';
        ctx.fillRect(4 + animFrame * 2, 6, 1, 1);
        // Crack network
        ctx.fillStyle = '#bb55dd';
        ctx.fillRect(7, 4, 1, 3);
        ctx.fillRect(8, 6, 2, 1);
        break;

      case TILE_TYPES.FRACTURE_GLOW:
        ctx.fillStyle = variant === 0 ? COLORS.fractureGlow : COLORS.fractureGlowLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.fractureGlowDark;
        ctx.fillRect(2 + variant, 3, 3, 2);
        ctx.fillRect(8, 9 - variant, 2, 2);
        // Reality fracture pulse
        ctx.fillStyle = '#ee88ff';
        ctx.fillRect(3 + animFrame * 3, 2 + variant, 2, 2);
        // Reality tear
        ctx.fillStyle = '#ff99ff';
        ctx.fillRect((6 + animFrame * 2) % 14, (8 + animFrame) % 12, 1, 1);
        break;

      case TILE_TYPES.PRISMATIC_STONE:
        ctx.fillStyle = variant === 0 ? COLORS.prismaticStone : COLORS.prismaticStoneLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.prismaticStoneDark;
        ctx.fillRect(1 + variant * 2, 1, 4, 3);
        ctx.fillRect(9, 7 - variant, 3, 2);
        // Prismatic shimmer
        ctx.fillStyle = '#dd77ff';
        ctx.fillRect(5 + animFrame * 2, 5, 1, 1);
        // Color shift effect
        const prismColors = ['#ff88aa', '#88ffaa', '#88aaff', '#ffff88'];
        ctx.fillStyle = prismColors[animFrame];
        ctx.fillRect(8, 9, 1, 1);
        break;

      case TILE_TYPES.PRISMATIC_GLOW:
        ctx.fillStyle = variant === 0 ? COLORS.prismaticGlow : COLORS.prismaticGlowLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.prismaticGlowDark;
        ctx.fillRect(2 + variant, 2, 3, 2);
        ctx.fillRect(9, 8 - variant, 2, 2);
        // Prismatic pulse
        ctx.fillStyle = '#ff99ff';
        ctx.fillRect(2 + animFrame * 3, 3 + variant, 2, 2);
        // Rainbow motes
        const glowColors = ['#ff6688', '#66ff88', '#6688ff', '#ffcc44'];
        ctx.fillStyle = glowColors[animFrame];
        ctx.fillRect((7 + animFrame * 3) % 14, (5 + animFrame) % 12, 1, 1);
        break;

      case TILE_TYPES.ETHER_STONE:
        ctx.fillStyle = variant === 0 ? COLORS.etherStone : COLORS.etherStoneLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.etherStoneDark;
        ctx.fillRect(1 + variant * 2, 2, 4, 3);
        ctx.fillRect(10, 8 - variant, 3, 2);
        // Ether shimmer
        ctx.fillStyle = '#66bbee';
        ctx.fillRect(4 + animFrame * 2, 4, 1, 1);
        // Ether wisps
        ctx.fillStyle = '#55aadd';
        ctx.fillRect((8 + animFrame * 3) % 14, 10, 1, 1);
        break;

      case TILE_TYPES.ETHER_GLOW:
        ctx.fillStyle = variant === 0 ? COLORS.etherGlow : COLORS.etherGlowLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.etherGlowDark;
        ctx.fillRect(2 + variant, 2, 3, 2);
        ctx.fillRect(8, 9 - variant, 2, 2);
        // Ether pulse
        ctx.fillStyle = '#88ddff';
        ctx.fillRect(3 + animFrame * 3, 2 + variant, 2, 2);
        // Energy trail
        ctx.fillStyle = '#aaeeff';
        ctx.fillRect((6 + animFrame * 2) % 14, (7 + animFrame) % 12, 1, 1);
        break;

      default:
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    }

    tileCache[key] = c;
    return c;
  }

  function updateAnimation(dt) {
    animTimer += dt;
    if (animTimer > 500) {
      animFrame = (animFrame + 1) % 4;
      animTimer = 0;
      // Clear animated tile cache for animation
      for (const key in tileCache) {
        if (key.startsWith(`${TILE_TYPES.WATER}_`) ||
            key.startsWith(`${TILE_TYPES.LAVA}_`) ||
            key.startsWith(`${TILE_TYPES.ETHEREAL}_`) ||
            key.startsWith(`${TILE_TYPES.CRYSTAL}_`) ||
            key.startsWith(`${TILE_TYPES.SHADOW_STONE}_`) ||
            key.startsWith(`${TILE_TYPES.ARCANE_GLOW}_`) ||
            key.startsWith(`${TILE_TYPES.STAR_STONE}_`) ||
            key.startsWith(`${TILE_TYPES.NEBULA_GLOW}_`) ||
            key.startsWith(`${TILE_TYPES.TEMPORAL_STONE}_`) ||
            key.startsWith(`${TILE_TYPES.RIFT_GLOW}_`) ||
            key.startsWith(`${TILE_TYPES.SHATTERED_STONE}_`) ||
            key.startsWith(`${TILE_TYPES.FRACTURE_GLOW}_`) ||
            key.startsWith(`${TILE_TYPES.PRISMATIC_STONE}_`) ||
            key.startsWith(`${TILE_TYPES.PRISMATIC_GLOW}_`) ||
            key.startsWith(`${TILE_TYPES.ETHER_STONE}_`) ||
            key.startsWith(`${TILE_TYPES.ETHER_GLOW}_`) ||
            key.startsWith(`${TILE_TYPES.VOID}_`)) {
          delete tileCache[key];
        }
      }
    }
  }

  // Draw drop shadow under entities
  function drawEntityShadow(ctx, screenX, screenY, scaledTile) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    const shadowW = scaledTile * 0.7;
    const shadowH = scaledTile * 0.18;
    const shadowX = screenX + (scaledTile - shadowW) / 2;
    const shadowY = screenY + scaledTile - shadowH * 0.6;
    ctx.beginPath();
    ctx.ellipse(
      shadowX + shadowW / 2, shadowY + shadowH / 2,
      shadowW / 2, shadowH / 2,
      0, 0, Math.PI * 2
    );
    ctx.fill();
  }

  function renderMap(ctx, camX, camY, canvasW, canvasH) {
    const ps = Player.getState();
    const map = MapData.getMap(ps.currentMap);
    const scaledTile = TILE_SIZE * SCALE;

    const startCol = Math.max(0, Math.floor(camX / scaledTile));
    const startRow = Math.max(0, Math.floor(camY / scaledTile));
    const endCol = Math.min(map.width - 1, Math.ceil((camX + canvasW) / scaledTile));
    const endRow = Math.min(map.height - 1, Math.ceil((camY + canvasH) / scaledTile));

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const tile = map.tiles[row][col];
        const screenX = col * scaledTile - camX;
        const screenY = row * scaledTile - camY;

        // Check if chest is opened
        if (tile === TILE_TYPES.CHEST) {
          const chest = map.chests.find(c => c.x === col && c.y === row);
          if (chest && chest.opened) {
            // Draw open chest (just grass)
            const grassTile = getTileCanvas(TILE_TYPES.GRASS, col, row);
            ctx.drawImage(grassTile, screenX, screenY, scaledTile, scaledTile);
            continue;
          }
        }

        const tileCanvas = getTileCanvas(tile, col, row);
        ctx.drawImage(tileCanvas, screenX, screenY, scaledTile, scaledTile);
      }
    }
  }

  function renderNPCs(ctx, camX, camY) {
    const ps = Player.getState();
    const map = MapData.getMap(ps.currentMap);
    const scaledTile = TILE_SIZE * SCALE;

    for (const npc of map.npcs) {
      const sprite = SpriteEngine.generateNPC(npc.type);
      const screenX = npc.x * scaledTile - camX;
      const screenY = npc.y * scaledTile - camY;
      drawEntityShadow(ctx, screenX, screenY, scaledTile);
      ctx.drawImage(sprite, screenX, screenY, scaledTile, scaledTile);
    }
  }

  function renderPlayer(ctx, camX, camY) {
    const ps = Player.getState();
    const heroSprites = SpriteEngine.generateHero();
    const pos = Player.getRenderPos();
    const scaledTile = TILE_SIZE * SCALE;
    const screenX = pos.x * scaledTile - camX;
    const screenY = pos.y * scaledTile - camY;

    drawEntityShadow(ctx, screenX, screenY, scaledTile);
    const frame = heroSprites[ps.dir][ps.frame];
    ctx.drawImage(frame, screenX, screenY, scaledTile, scaledTile);
  }

  function renderMonsters(ctx, camX, camY) {
    const ps = Player.getState();
    const monsters = typeof MonsterSystem !== 'undefined' ? MonsterSystem.getMonsters(ps.currentMap) : [];
    const scaledTile = TILE_SIZE * SCALE;

    for (let i = 0; i < monsters.length; i++) {
      const m = monsters[i];
      if (!m.active) continue;

      const sprite = SpriteEngine.generateEnemy(m.type);
      if (!sprite) continue;

      let rx, ry;
      if (m.moving) {
        rx = m.prevX + (m.x - m.prevX) * m.moveProgress;
        ry = m.prevY + (m.y - m.prevY) * m.moveProgress;
      } else {
        rx = m.x;
        ry = m.y;
      }

      const screenX = rx * scaledTile - camX;
      const screenY = ry * scaledTile - camY;
      drawEntityShadow(ctx, screenX, screenY, scaledTile);
      ctx.drawImage(sprite, screenX, screenY, scaledTile, scaledTile);
    }
  }

  return { renderMap, renderNPCs, renderMonsters, renderPlayer, updateAnimation };
})();
