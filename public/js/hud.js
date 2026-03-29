/* ========= HUD (Heads-Up Display) ========= */
const HUD = (() => {
  const toasts = [];

  function addToast(message, color = '#ffd700', duration = 3000) {
    toasts.push({ message, color, duration, timer: duration });
  }

  function update(dt) {
    for (let i = toasts.length - 1; i >= 0; i--) {
      toasts[i].timer -= dt;
      if (toasts[i].timer <= 0) toasts.splice(i, 1);
    }
  }

  function render(ctx, canvasW, canvasH = 0) {
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
    ctx.fillText(`Lv.${ps.level}`, canvasW - 120, 18);
    ctx.fillStyle = '#ffcc00';
    ctx.fillText(`${ps.gold}G`, canvasW - 120, 36);

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

    // Time & Weather indicator
    if (typeof WeatherSystem !== 'undefined') {
      const weatherIcons = { clear: '☀', rain: '🌧', fog: '🌫', storm: '⛈' };
      const icon = weatherIcons[WeatherSystem.getWeather()] || '☀';
      const timeStr = WeatherSystem.getTimeString();
      ctx.fillStyle = '#ddd';
      ctx.textAlign = 'center';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText(`${icon} ${timeStr}`, canvasW / 2, 40);
    }

    // Quest objective
    if (typeof QuestSystem !== 'undefined') {
      const quest = QuestSystem.getActiveQuest();
      if (quest && !quest.completed) {
        ctx.fillStyle = 'rgba(0, 0, 20, 0.65)';
        ctx.fillRect(0, 48, canvasW, 20);
        ctx.fillStyle = '#ffd700';
        ctx.font = '10px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`▸ ${quest.description}`, 10, 62);
      }
    }

    // Toast notifications
    if (toasts.length > 0 && canvasH) {
      const toastY = canvasH * 0.18;
      const toastW = Math.min(320, canvasW - 40);
      const toastH = 32;
      const toastX = canvasW / 2 - toastW / 2;
      const r = 6;

      toasts.forEach((t, i) => {
        const fadeIn = Math.min(1, (t.duration - t.timer) / 200);
        const fadeOut = Math.min(1, t.timer / 300);
        const alpha = Math.min(fadeIn, fadeOut);
        const floatY = toastY + i * (toastH + 6) + (1 - fadeIn) * 12;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Background rounded rect
        ctx.fillStyle = 'rgba(0, 0, 20, 0.88)';
        ctx.beginPath();
        ctx.moveTo(toastX + r, floatY);
        ctx.arcTo(toastX + toastW, floatY, toastX + toastW, floatY + toastH, r);
        ctx.arcTo(toastX + toastW, floatY + toastH, toastX, floatY + toastH, r);
        ctx.arcTo(toastX, floatY + toastH, toastX, floatY, r);
        ctx.arcTo(toastX, floatY, toastX + toastW, floatY, r);
        ctx.closePath();
        ctx.fill();

        // Border
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(toastX + r, floatY);
        ctx.arcTo(toastX + toastW, floatY, toastX + toastW, floatY + toastH, r);
        ctx.arcTo(toastX + toastW, floatY + toastH, toastX, floatY + toastH, r);
        ctx.arcTo(toastX, floatY + toastH, toastX, floatY, r);
        ctx.arcTo(toastX, floatY, toastX + toastW, floatY, r);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = t.color;
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(t.message, canvasW / 2, floatY + toastH / 2 + 4);
        ctx.restore();
      });
    }
  }

  return { render, addToast, update };
})();
