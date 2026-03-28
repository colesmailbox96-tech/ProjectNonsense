/* ========= HUD (Heads-Up Display) ========= */
const HUD = (() => {
  function render(ctx, canvasW) {
    const ps = Player.getState();
    const map = MapData.getMap(ps.currentMap);

    // Top bar background
    ctx.fillStyle = 'rgba(0, 0, 20, 0.75)';
    ctx.fillRect(0, 0, canvasW, 48);

    // HP bar
    const hpBarX = 10;
    const hpBarY = 8;
    const hpBarW = 120;
    const hpBarH = 14;
    ctx.fillStyle = '#222';
    ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
    const hpRatio = ps.hp / ps.maxHp;
    ctx.fillStyle = hpRatio > 0.5 ? '#44cc44' : hpRatio > 0.2 ? '#cccc44' : '#cc4444';
    ctx.fillRect(hpBarX, hpBarY, hpBarW * hpRatio, hpBarH);
    ctx.strokeStyle = '#555';
    ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);

    ctx.fillStyle = '#fff';
    ctx.font = '11px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`HP ${ps.hp}/${ps.maxHp}`, hpBarX + 4, hpBarY + 11);

    // MP bar
    const mpBarY = hpBarY + hpBarH + 4;
    ctx.fillStyle = '#222';
    ctx.fillRect(hpBarX, mpBarY, hpBarW, hpBarH);
    const mpRatio = ps.mp / ps.maxMp;
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(hpBarX, mpBarY, hpBarW * mpRatio, hpBarH);
    ctx.strokeStyle = '#555';
    ctx.strokeRect(hpBarX, mpBarY, hpBarW, hpBarH);

    ctx.fillStyle = '#fff';
    ctx.fillText(`MP ${ps.mp}/${ps.maxMp}`, hpBarX + 4, mpBarY + 11);

    // Level & Gold
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'right';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(`Lv.${ps.level}`, canvasW - 10, 18);
    ctx.fillStyle = '#ffcc00';
    ctx.fillText(`${ps.gold}G`, canvasW - 10, 36);

    // Map name
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'center';
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText(map.name, canvasW / 2, 16);

    // Mini XP bar
    const xpBarW = 80;
    const xpBarH = 4;
    const xpBarX = canvasW / 2 - xpBarW / 2;
    const xpBarY = 22;
    ctx.fillStyle = '#222';
    ctx.fillRect(xpBarX, xpBarY, xpBarW, xpBarH);
    ctx.fillStyle = '#8844ff';
    ctx.fillRect(xpBarX, xpBarY, xpBarW * (ps.xp / ps.xpToNext), xpBarH);
  }

  return { render };
})();
