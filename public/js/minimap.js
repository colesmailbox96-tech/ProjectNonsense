/* ========= MINIMAP OVERLAY ========= */
const Minimap = (() => {
  const SIZE = 100;
  const PADDING = 10;
  const BG_ALPHA = 0.6;
  const DOT_SIZE = 3;

  const tileColors = {
    [TILE_TYPES.GRASS]: '#2d5a27',
    [TILE_TYPES.PATH]: '#8b7355',
    [TILE_TYPES.WATER]: '#2255aa',
    [TILE_TYPES.WALL]: '#555566',
    [TILE_TYPES.TREE]: '#444455',
    [TILE_TYPES.DOOR]: '#6b4226',
    [TILE_TYPES.FLOOR]: '#8b6f47',
    [TILE_TYPES.CHEST]: '#8b6f47',
    [TILE_TYPES.FLOWER]: '#3a7a34',
    [TILE_TYPES.SAND]: '#c2b280',
    [TILE_TYPES.BRIDGE]: '#7a5a2a',
    [TILE_TYPES.WALL_TOP]: '#555566',
    [TILE_TYPES.SIGN]: '#8b7355',
  };

  // Helper for rounded rect
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function render(ctx, canvasW, canvasH) {
    const ps = Player.getState();
    const map = MapData.getMap(ps.currentMap);
    if (!map) return;

    const mapX = canvasW - SIZE - PADDING;
    const mapY = PADDING;
    const tileW = SIZE / map.width;
    const tileH = SIZE / map.height;

    // Semi-transparent background with rounded corners
    ctx.globalAlpha = BG_ALPHA;
    ctx.fillStyle = '#000000';
    roundRect(ctx, mapX - 2, mapY - 2, SIZE + 4, SIZE + 4, 6);
    ctx.fill();

    // Draw tiles
    ctx.globalAlpha = 0.85;
    // Clip to rounded rect for cleaner edges
    ctx.save();
    roundRect(ctx, mapX, mapY, SIZE, SIZE, 4);
    ctx.clip();
    for (let row = 0; row < map.height; row++) {
      for (let col = 0; col < map.width; col++) {
        const tile = map.tiles[row][col];
        ctx.fillStyle = tileColors[tile] || '#000000';
        ctx.fillRect(
          Math.floor(mapX + col * tileW),
          Math.floor(mapY + row * tileH),
          Math.ceil(tileW),
          Math.ceil(tileH)
        );
      }
    }
    ctx.restore();

    ctx.globalAlpha = 1;

    // Draw chests (brown dots, skip opened)
    if (map.chests) {
      ctx.fillStyle = '#aa7733';
      for (let i = 0; i < map.chests.length; i++) {
        const c = map.chests[i];
        if (c.opened) continue;
        ctx.fillRect(
          Math.floor(mapX + c.x * tileW) - 1,
          Math.floor(mapY + c.y * tileH) - 1,
          DOT_SIZE,
          DOT_SIZE
        );
      }
    }

    // Draw NPCs (yellow dots)
    if (map.npcs) {
      ctx.fillStyle = '#ffdd44';
      for (let i = 0; i < map.npcs.length; i++) {
        const n = map.npcs[i];
        ctx.fillRect(
          Math.floor(mapX + n.x * tileW) - 1,
          Math.floor(mapY + n.y * tileH) - 1,
          DOT_SIZE,
          DOT_SIZE
        );
      }
    }

    // Draw player (white dot with glow)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(
      Math.floor(mapX + ps.x * tileW) - 1,
      Math.floor(mapY + ps.y * tileH) - 1,
      DOT_SIZE,
      DOT_SIZE
    );
    // Subtle glow around player dot
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(
      Math.floor(mapX + ps.x * tileW) - 2,
      Math.floor(mapY + ps.y * tileH) - 2,
      DOT_SIZE + 2,
      DOT_SIZE + 2
    );

    // Border with rounded corners
    ctx.strokeStyle = 'rgba(200, 200, 220, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.8;
    roundRect(ctx, mapX - 2, mapY - 2, SIZE + 4, SIZE + 4, 6);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  return { render };
})();
