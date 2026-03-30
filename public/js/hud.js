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

  // Helper to draw rounded rectangle
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Draw a gradient health/mana bar with rounded corners
  function drawBar(ctx, x, y, w, h, ratio, color1, color2, r) {
    // Background
    ctx.fillStyle = '#181824';
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();

    // Fill with gradient
    if (ratio > 0) {
      const fillW = Math.max(r * 2, w * ratio);
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      roundRect(ctx, x, y, fillW, h, r);
      ctx.fill();

      // Shine highlight on top
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      roundRect(ctx, x, y, fillW, h / 2, r);
      ctx.fill();
    }

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, w, h, r);
    ctx.stroke();
  }

  function render(ctx, canvasW, canvasH = 0) {
    const ps = Player.getState();
    const map = MapData.getMap(ps.currentMap);

    // Top bar background with gradient
    const topGrad = ctx.createLinearGradient(0, 0, 0, 50);
    topGrad.addColorStop(0, 'rgba(0, 0, 30, 0.85)');
    topGrad.addColorStop(1, 'rgba(0, 0, 20, 0.6)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, canvasW, 50);

    // Subtle separator line
    ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
    ctx.fillRect(0, 49, canvasW, 1);

    // HP bar
    const hpBarX = 10;
    const hpBarY = 7;
    const hpBarW = 120;
    const hpBarH = 14;
    const hpRatio = ps.hp / ps.maxHp;
    const hpColor1 = hpRatio > 0.5 ? '#55ee55' : hpRatio > 0.2 ? '#eeee44' : '#ee4444';
    const hpColor2 = hpRatio > 0.5 ? '#228822' : hpRatio > 0.2 ? '#888822' : '#882222';
    drawBar(ctx, hpBarX, hpBarY, hpBarW, hpBarH, hpRatio, hpColor1, hpColor2, 3);

    ctx.fillStyle = '#fff';
    ctx.font = '11px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`HP ${ps.hp}/${ps.maxHp}`, hpBarX + 4, hpBarY + 11);

    // MP bar
    const mpBarY = hpBarY + hpBarH + 4;
    const mpRatio = ps.mp / ps.maxMp;
    drawBar(ctx, hpBarX, mpBarY, hpBarW, hpBarH, mpRatio, '#66aaff', '#224488', 3);

    ctx.fillStyle = '#fff';
    ctx.fillText(`MP ${ps.mp}/${ps.maxMp}`, hpBarX + 4, mpBarY + 11);

    // Level & Gold with icon-like styling
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'right';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText(`Lv.${ps.level}`, canvasW - 120, 18);
    ctx.fillStyle = '#ffcc00';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(`${ps.gold}G`, canvasW - 120, 36);

    // Map name with subtle glow
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.fillText(map.name, canvasW / 2, 15);
    ctx.fillStyle = '#ccc';
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText(map.name, canvasW / 2, 15);

    // Mini XP bar with gradient
    const xpBarW = 80;
    const xpBarH = 4;
    const xpBarX = canvasW / 2 - xpBarW / 2;
    const xpBarY = 22;
    const xpRatio = ps.xp / ps.xpToNext;
    drawBar(ctx, xpBarX, xpBarY, xpBarW, xpBarH, xpRatio, '#aa66ff', '#5522aa', 2);

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

    // Quest objective with styled background
    if (typeof QuestSystem !== 'undefined') {
      const quest = QuestSystem.getActiveQuest();
      if (quest && !quest.completed) {
        const questGrad = ctx.createLinearGradient(0, 50, 0, 70);
        questGrad.addColorStop(0, 'rgba(0, 0, 20, 0.7)');
        questGrad.addColorStop(1, 'rgba(0, 0, 20, 0.4)');
        ctx.fillStyle = questGrad;
        ctx.fillRect(0, 50, canvasW, 20);
        ctx.fillStyle = '#ffd700';
        ctx.font = '10px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`▸ ${quest.description}`, 10, 64);
      }
    }

    // Toast notifications
    if (toasts.length > 0 && canvasH) {
      const toastY = canvasH * 0.18;
      const toastW = Math.min(320, canvasW - 40);
      const toastH = 32;
      const toastX = canvasW / 2 - toastW / 2;
      const r = 8;

      toasts.forEach((t, i) => {
        const fadeIn = Math.min(1, (t.duration - t.timer) / 200);
        const fadeOut = Math.min(1, t.timer / 300);
        const alpha = Math.min(fadeIn, fadeOut);
        const floatY = toastY + i * (toastH + 6) + (1 - fadeIn) * 12;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Background with gradient
        const toastGrad = ctx.createLinearGradient(toastX, floatY, toastX, floatY + toastH);
        toastGrad.addColorStop(0, 'rgba(10, 10, 40, 0.92)');
        toastGrad.addColorStop(1, 'rgba(5, 5, 20, 0.92)');
        ctx.fillStyle = toastGrad;
        roundRect(ctx, toastX, floatY, toastW, toastH, r);
        ctx.fill();

        // Border with glow
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 1.5;
        roundRect(ctx, toastX, floatY, toastW, toastH, r);
        ctx.stroke();
        ctx.shadowBlur = 0;

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
