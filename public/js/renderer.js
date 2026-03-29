/* ========= TILE RENDERER ========= */
const Renderer = (() => {
  const tileCache = {};
  let animFrame = 0;
  let animTimer = 0;

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
        // Grass details
        ctx.fillStyle = variant === 0 ? COLORS.grass2 : COLORS.grass1;
        ctx.fillRect(3, 4, 2, 2);
        ctx.fillRect(10, 8, 2, 2);
        ctx.fillRect(7, 12, 2, 2);
        break;

      case TILE_TYPES.PATH:
        ctx.fillStyle = COLORS.path;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.pathEdge;
        ctx.fillRect(variant * 5, variant * 3, 3, 2);
        ctx.fillRect(8 + variant, 10 - variant, 2, 2);
        break;

      case TILE_TYPES.WATER:
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.waterLight;
        const waveOff = animFrame * 3;
        ctx.fillRect((2 + waveOff) % TILE_SIZE, 4, 4, 2);
        ctx.fillRect((10 + waveOff) % TILE_SIZE, 10, 3, 2);
        break;

      case TILE_TYPES.WALL:
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.wallDark;
        ctx.fillRect(0, 0, TILE_SIZE, 2);
        ctx.fillRect(7, 0, 2, TILE_SIZE);
        ctx.strokeStyle = COLORS.wallDark;
        ctx.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
        break;

      case TILE_TYPES.WALL_TOP:
        ctx.fillStyle = COLORS.roof;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.roofDark;
        ctx.fillRect(0, 0, TILE_SIZE, 4);
        for (let i = 0; i < TILE_SIZE; i += 4) {
          ctx.fillRect(i, 6 + (i % 8 === 0 ? 0 : 2), 2, 2);
        }
        break;

      case TILE_TYPES.TREE:
        ctx.fillStyle = COLORS.grass1;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Trunk
        ctx.fillStyle = COLORS.trunk;
        ctx.fillRect(6, 10, 4, 6);
        // Canopy
        ctx.fillStyle = COLORS.tree1;
        ctx.fillRect(2, 2, 12, 10);
        ctx.fillStyle = COLORS.tree2;
        ctx.fillRect(4, 1, 8, 8);
        ctx.fillRect(3, 3, 10, 6);
        // Highlights
        ctx.fillStyle = '#3a8a34';
        ctx.fillRect(5, 3, 3, 3);
        break;

      case TILE_TYPES.DOOR:
        ctx.fillStyle = COLORS.path;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.door;
        ctx.fillRect(2, 0, 12, 14);
        ctx.fillStyle = '#8b5a36';
        ctx.fillRect(4, 2, 8, 10);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(10, 7, 2, 2);
        break;

      case TILE_TYPES.FLOOR:
        ctx.fillStyle = variant === 0 ? COLORS.woodFloor : COLORS.woodFloorLight;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#7a5f37';
        ctx.fillRect(0, 7, TILE_SIZE, 1);
        break;

      case TILE_TYPES.CHEST:
        ctx.fillStyle = COLORS.grass1;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        // Chest body
        ctx.fillStyle = COLORS.chest;
        ctx.fillRect(3, 6, 10, 8);
        ctx.fillStyle = '#886622';
        ctx.fillRect(3, 6, 10, 3);
        // Latch
        ctx.fillStyle = COLORS.chestGold;
        ctx.fillRect(7, 8, 2, 3);
        break;

      case TILE_TYPES.FLOWER:
        ctx.fillStyle = variant === 0 ? COLORS.grass1 : COLORS.grass2;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        const flowerColors = [COLORS.flower1, COLORS.flower2, COLORS.flower3];
        ctx.fillStyle = flowerColors[variant];
        ctx.fillRect(6, 5, 4, 4);
        ctx.fillStyle = '#ffff88';
        ctx.fillRect(7, 6, 2, 2);
        ctx.fillStyle = '#2a5a1a';
        ctx.fillRect(7, 9, 2, 4);
        break;

      case TILE_TYPES.SAND:
        ctx.fillStyle = COLORS.sand;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#b0a070';
        ctx.fillRect(variant * 4, variant * 5, 3, 2);
        break;

      case TILE_TYPES.BRIDGE:
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.bridge;
        ctx.fillRect(0, 2, TILE_SIZE, 12);
        ctx.fillStyle = '#5a4a2a';
        ctx.fillRect(0, 2, TILE_SIZE, 2);
        ctx.fillRect(0, 12, TILE_SIZE, 2);
        ctx.fillRect(3, 2, 2, 12);
        ctx.fillRect(11, 2, 2, 12);
        break;

      case TILE_TYPES.SIGN:
        ctx.fillStyle = COLORS.grass2;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.trunk;
        ctx.fillRect(7, 8, 2, 6);
        ctx.fillStyle = '#aa8844';
        ctx.fillRect(3, 3, 10, 6);
        ctx.fillStyle = '#886633';
        ctx.strokeStyle = '#664422';
        ctx.strokeRect(3, 3, 10, 6);
        break;

      case TILE_TYPES.ICE:
        ctx.fillStyle = COLORS.ice;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.iceLight;
        ctx.fillRect(2 + variant * 3, 3, 4, 2);
        ctx.fillRect(9, 10 - variant, 3, 2);
        ctx.fillStyle = COLORS.iceDark;
        ctx.fillRect(variant * 4, variant * 5 + 6, 3, 1);
        break;

      case TILE_TYPES.SNOW:
        ctx.fillStyle = COLORS.snow;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.snowLight;
        ctx.fillRect(3 + variant, 4, 3, 2);
        ctx.fillRect(10, 10 - variant, 2, 2);
        ctx.fillStyle = COLORS.snowDark;
        ctx.fillRect(variant * 5, 12, 2, 2);
        break;

      case TILE_TYPES.CLOUD:
        ctx.fillStyle = COLORS.cloud;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.cloudLight;
        ctx.fillRect(2 + variant * 3, 3, 5, 3);
        ctx.fillRect(8, 9 - variant, 4, 3);
        ctx.fillStyle = COLORS.cloudDark;
        ctx.fillRect(variant * 4, 12, 3, 2);
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
      // Clear water cache for animation
      for (const key in tileCache) {
        if (key.startsWith(`${TILE_TYPES.WATER}_`)) {
          delete tileCache[key];
        }
      }
    }
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

    const frame = heroSprites[ps.dir][ps.frame];
    ctx.drawImage(frame, screenX, screenY, scaledTile, scaledTile);
  }

  return { renderMap, renderNPCs, renderPlayer, updateAnimation };
})();
