/* ========= CAMERA SYSTEM ========= */
const Camera = (() => {
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  const smoothing = 0.12;

  function update(playerX, playerY, canvasW, canvasH, mapW, mapH) {
    const scaledTile = TILE_SIZE * SCALE;
    targetX = playerX * scaledTile - canvasW / 2 + scaledTile / 2;
    targetY = playerY * scaledTile - canvasH / 2 + scaledTile / 2;

    // Clamp to map bounds
    const maxX = mapW * scaledTile - canvasW;
    const maxY = mapH * scaledTile - canvasH;
    targetX = Math.max(0, Math.min(targetX, maxX));
    targetY = Math.max(0, Math.min(targetY, maxY));

    // Smooth follow
    x += (targetX - x) * smoothing;
    y += (targetY - y) * smoothing;
  }

  function snapTo(playerX, playerY, canvasW, canvasH, mapW, mapH) {
    const scaledTile = TILE_SIZE * SCALE;
    x = playerX * scaledTile - canvasW / 2 + scaledTile / 2;
    y = playerY * scaledTile - canvasH / 2 + scaledTile / 2;
    const maxX = mapW * scaledTile - canvasW;
    const maxY = mapH * scaledTile - canvasH;
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    targetX = x;
    targetY = y;
  }

  function getX() { return Math.round(x); }
  function getY() { return Math.round(y); }

  return { update, snapTo, getX, getY };
})();
