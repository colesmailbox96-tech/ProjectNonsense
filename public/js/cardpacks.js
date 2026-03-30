/* ========= CARD PACK SYSTEM ========= */
const CardPackSystem = (() => {
  // --- Pack rarity tiers ---
  const PACK_RARITIES = {
    common:    { name: 'Common Pack',    color: '#88aa88', glowColor: null,      border: '#66886a' },
    uncommon:  { name: 'Uncommon Pack',  color: '#5588cc', glowColor: null,      border: '#4477bb' },
    rare:      { name: 'Rare Pack',      color: '#aa55cc', glowColor: null,      border: '#9944bb' },
    epic:      { name: 'Epic Pack',      color: '#ff8833', glowColor: null,      border: '#ee7722' },
    legendary: { name: 'Legendary Pack', color: '#ffd700', glowColor: '#ffd700', border: '#ccaa00' },
    godpack:   { name: 'Godpack',        color: '#ffd700', glowColor: 'rainbow', border: '#ffee55' },
  };

  // --- Item pools by tier ---
  const ITEM_TIERS = {
    common: [
      'potion', 'ether', 'antidote', 'smokeBomb',
      'slimeGel', 'goblinFang', 'boneShard', 'ironOre',
      'darkPlate', 'shadowDust',
    ],
    uncommon: [
      'hiPotion', 'ether', 'antidote', 'phoenixFeather',
      'ironSword', 'leatherArmor', 'luckyRing',
      'spectralDust', 'runeFragment', 'frostFang', 'iceCore',
      'stormFeather', 'lightningShard',
    ],
    rare: [
      'hiPotion', 'phoenixFeather',
      'steelSword', 'silverArmor',
      'runeBlade', 'ancientArmor', 'warmthAmulet',
      'frozenShard', 'drakeScale', 'thunderCore', 'wyrmHeart',
      'frostBlade', 'crystalArmor',
    ],
    epic: [
      'elixir', 'phoenixFeather',
      'thunderSpear', 'celestialPlate', 'stormweaveRing',
      'voidBlade', 'abyssalArmor', 'chaosRing',
      'infernoBlade', 'forgePlate', 'titanBand',
      'voidShard', 'chaosGem', 'dragonEssence',
      'magmaCore', 'infernoGem', 'titanShard',
    ],
    legendary: [
      'elixir', 'phoenixFeather',
      'etherealBlade', 'etherealPlate', 'etherealCrown',
      'twilightBlade', 'twilightArmor', 'twilightSigil',
      'astralBlade', 'astralArmor', 'astralCrown',
      'temporalBlade', 'temporalArmor', 'temporalCirclet',
      'realmBlade', 'realmArmor', 'realmPendant',
      'prismBlade', 'prismArmor', 'prismCrown',
      'etherBlade', 'etherArmor', 'etherAmulet',
    ],
  };

  // --- Drop weights for each enemy type ---
  // Common mob: common-legendary (common most common)
  const COMMON_MOB_WEIGHTS = {
    common: 50, uncommon: 30, rare: 13, epic: 5, legendary: 2,
  };
  // Elite mob: uncommon-legendary
  const ELITE_MOB_WEIGHTS = {
    uncommon: 40, rare: 35, epic: 18, legendary: 7,
  };
  // Boss: rare-legendary (godpack)
  const BOSS_WEIGHTS = {
    rare: 35, epic: 35, legendary: 20, godpack: 10,
  };

  // --- Card pack inventory ---
  let packInventory = [];
  // Each entry: { rarity: string, qty: number }

  // --- Opening state ---
  let openingPack = null;   // { rarity, items[] }
  let openPhase = 'idle';   // 'idle', 'viewing', 'opening', 'revealing', 'done'
  let revealIndex = 0;
  let animTimer = 0;
  let rotationY = 0;
  let rotationX = 0;
  let isDragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let glowTimer = 0;
  let cardFlipProgress = 0;
  let overlayEl = null;
  let packCanvas = null;
  let packCtx = null;
  let animFrame = null;
  let sparkles = [];

  // --- Public API ---
  function addPack(rarity) {
    const entry = packInventory.find(p => p.rarity === rarity);
    if (entry) {
      entry.qty += 1;
    } else {
      packInventory.push({ rarity, qty: 1 });
    }
  }

  function removePack(rarity) {
    const idx = packInventory.findIndex(p => p.rarity === rarity);
    if (idx === -1) return false;
    packInventory[idx].qty -= 1;
    if (packInventory[idx].qty <= 0) {
      packInventory.splice(idx, 1);
    }
    return true;
  }

  function getInventory() {
    return packInventory;
  }

  function getTotalPacks() {
    return packInventory.reduce((sum, p) => sum + p.qty, 0);
  }

  function getState() {
    return packInventory.map(p => ({ rarity: p.rarity, qty: p.qty }));
  }

  function loadState(data) {
    if (Array.isArray(data)) {
      packInventory = data.map(p => ({ rarity: p.rarity, qty: p.qty }));
    }
  }

  // --- Pack generation ---
  function rollPackRarity(weights) {
    const entries = Object.entries(weights);
    const totalWeight = entries.reduce((s, e) => s + e[1], 0);
    let roll = Math.random() * totalWeight;
    for (const [rarity, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return rarity;
    }
    return entries[entries.length - 1][0];
  }

  function generatePackForEnemy(enemy) {
    let weights;
    if (enemy.isBoss) {
      weights = BOSS_WEIGHTS;
    } else if (enemy.isElite) {
      weights = ELITE_MOB_WEIGHTS;
    } else {
      weights = COMMON_MOB_WEIGHTS;
    }
    return rollPackRarity(weights);
  }

  function generatePackItems(rarity) {
    // Determine which item tiers to pull from
    let pool;
    if (rarity === 'godpack') {
      // Godpack: all legendary items
      pool = ITEM_TIERS.legendary;
    } else {
      pool = ITEM_TIERS[rarity] || ITEM_TIERS.common;
    }
    const items = [];
    for (let i = 0; i < 6; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      items.push(pool[idx]);
    }
    return items;
  }

  // --- Pack opening UI ---
  function ensureOverlay() {
    overlayEl = document.getElementById('cardpack-overlay');
    if (!overlayEl) return;
    packCanvas = document.getElementById('cardpack-canvas');
    if (packCanvas) {
      packCtx = packCanvas.getContext('2d');
    }
  }

  function openPack(rarity) {
    if (!removePack(rarity)) return;
    const items = generatePackItems(rarity);
    openingPack = { rarity, items };
    openPhase = 'viewing';
    revealIndex = 0;
    animTimer = 0;
    rotationY = 0;
    rotationX = 0;
    glowTimer = 0;
    cardFlipProgress = 0;
    sparkles = [];

    Game.setState(GAME_STATES.CARD_PACK);
    ensureOverlay();
    if (overlayEl) overlayEl.classList.remove('hidden');
    resizePackCanvas();
    bindEvents();
    renderLoop();
  }

  function resizePackCanvas() {
    if (!packCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    packCanvas.width = w * dpr;
    packCanvas.height = h * dpr;
    packCanvas.style.width = w + 'px';
    packCanvas.style.height = h + 'px';
    packCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function closePackUI() {
    openPhase = 'idle';
    openingPack = null;
    if (overlayEl) overlayEl.classList.add('hidden');
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
    unbindEvents();
    Game.setState(GAME_STATES.EXPLORE);
  }

  // --- Input handling for pack rotation ---
  function onPointerDown(e) {
    e.preventDefault();
    isDragging = true;
    const pos = getPointerPos(e);
    lastPointerX = pos.x;
    lastPointerY = pos.y;
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getPointerPos(e);
    const dx = pos.x - lastPointerX;
    const dy = pos.y - lastPointerY;
    rotationY += dx * 0.8;
    rotationX += dy * 0.5;
    rotationX = Math.max(-30, Math.min(30, rotationX));
    lastPointerX = pos.x;
    lastPointerY = pos.y;
  }

  function onPointerUp() {
    isDragging = false;
  }

  function getPointerPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function onClick(e) {
    if (openPhase === 'viewing') {
      openPhase = 'opening';
      animTimer = 0;
    } else if (openPhase === 'revealing') {
      if (cardFlipProgress >= 1) {
        revealIndex++;
        cardFlipProgress = 0;
        if (revealIndex >= 6) {
          openPhase = 'done';
        }
      }
    } else if (openPhase === 'done') {
      // Add items to player inventory
      if (openingPack) {
        for (const itemId of openingPack.items) {
          Player.addItem(itemId, 1);
        }
        if (typeof HUD !== 'undefined') {
          HUD.addToast('📦 Pack items added to inventory!', '#ffd700', 3000);
        }
      }
      closePackUI();
    }
  }

  let boundHandlers = null;
  function bindEvents() {
    if (!packCanvas) return;
    boundHandlers = {
      md: onPointerDown,
      mm: onPointerMove,
      mu: onPointerUp,
      ts: (e) => { e.preventDefault(); onPointerDown(e); },
      tm: (e) => { e.preventDefault(); onPointerMove(e); },
      te: onPointerUp,
      click: onClick,
    };
    packCanvas.addEventListener('mousedown', boundHandlers.md);
    window.addEventListener('mousemove', boundHandlers.mm);
    window.addEventListener('mouseup', boundHandlers.mu);
    packCanvas.addEventListener('touchstart', boundHandlers.ts, { passive: false });
    window.addEventListener('touchmove', boundHandlers.tm, { passive: false });
    window.addEventListener('touchend', boundHandlers.te);
    packCanvas.addEventListener('click', boundHandlers.click);
  }

  function unbindEvents() {
    if (!packCanvas || !boundHandlers) return;
    packCanvas.removeEventListener('mousedown', boundHandlers.md);
    window.removeEventListener('mousemove', boundHandlers.mm);
    window.removeEventListener('mouseup', boundHandlers.mu);
    packCanvas.removeEventListener('touchstart', boundHandlers.ts);
    window.removeEventListener('touchmove', boundHandlers.tm);
    window.removeEventListener('touchend', boundHandlers.te);
    packCanvas.removeEventListener('click', boundHandlers.click);
    boundHandlers = null;
  }

  // --- Render loop ---
  let lastFrameTime = 0;
  function renderLoop(timestamp) {
    if (openPhase === 'idle') return;
    if (!timestamp) timestamp = performance.now();
    const dt = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    glowTimer += dt;
    animTimer += dt;

    if (openPhase === 'opening') {
      if (animTimer > 800) {
        openPhase = 'revealing';
        animTimer = 0;
        cardFlipProgress = 0;
      }
    }

    if (openPhase === 'revealing') {
      cardFlipProgress = Math.min(1, cardFlipProgress + dt / 400);
    }

    // Auto-drift rotation when not dragging
    if (!isDragging && openPhase === 'viewing') {
      rotationY += dt * 0.02;
    }

    // Update sparkles
    updateSparkles(dt);

    drawPackScene();
    animFrame = requestAnimationFrame(renderLoop);
  }

  // --- Sparkle particles ---
  function spawnSparkles(cx, cy, w, h, count) {
    for (let i = 0; i < count; i++) {
      const duration = 600 + Math.random() * 600;
      sparkles.push({
        x: cx + (Math.random() - 0.5) * w,
        y: cy + (Math.random() - 0.5) * h,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 0.5,
        life: duration,
        maxLife: duration,
        size: 1 + Math.random() * 2,
      });
    }
  }

  function updateSparkles(dt) {
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.life -= dt;
      s.x += s.vx;
      s.y += s.vy;
      if (s.life <= 0) sparkles.splice(i, 1);
    }
  }

  // --- Drawing ---
  function drawPackScene() {
    if (!packCtx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ctx = packCtx;

    // Dark background
    ctx.fillStyle = 'rgba(5, 5, 15, 0.95)';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const packW = Math.min(200, w * 0.45);
    const packH = packW * 1.4;

    if (openPhase === 'viewing' || openPhase === 'opening') {
      drawPack3D(ctx, cx, cy, packW, packH);
      // Instructions
      ctx.fillStyle = '#aaa';
      ctx.font = '14px "Courier New", monospace';
      ctx.textAlign = 'center';
      if (openPhase === 'viewing') {
        ctx.fillText('Drag to rotate • Tap to open', cx, cy + packH / 2 + 40);
      } else {
        ctx.fillText('Opening...', cx, cy + packH / 2 + 40);
      }
    } else if (openPhase === 'revealing' || openPhase === 'done') {
      drawRevealedCards(ctx, cx, cy, packW);
    }

    // Title
    const rarity = openingPack ? openingPack.rarity : 'common';
    const info = PACK_RARITIES[rarity];
    ctx.fillStyle = info.color;
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(info.name, cx, 40);

    // Draw sparkles
    drawSparkles(ctx);
  }

  function drawPack3D(ctx, cx, cy, packW, packH) {
    const rarity = openingPack.rarity;
    const info = PACK_RARITIES[rarity];

    ctx.save();
    ctx.translate(cx, cy);

    // Simulate 3D rotation with skew
    const angleY = (rotationY % 360) * Math.PI / 180;
    const angleX = rotationX * Math.PI / 180;
    const scaleX = Math.cos(angleY);
    const skewY = Math.sin(angleX) * 0.3;

    ctx.transform(scaleX, skewY, 0, 1, 0, 0);

    const halfW = packW / 2;
    const halfH = packH / 2;

    // Draw glow effect
    if (info.glowColor === 'rainbow') {
      drawRainbowGlow(ctx, 0, 0, halfW + 20, halfH + 20);
    } else if (info.glowColor) {
      drawGoldGlow(ctx, 0, 0, halfW + 20, halfH + 20);
    }

    // Pack body
    const grad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    const baseColor = info.color;
    grad.addColorStop(0, lightenColor(baseColor, 30));
    grad.addColorStop(0.5, baseColor);
    grad.addColorStop(1, darkenColor(baseColor, 30));
    ctx.fillStyle = grad;
    roundRect(ctx, -halfW, -halfH, packW, packH, 12);
    ctx.fill();

    // Border
    ctx.strokeStyle = info.border;
    ctx.lineWidth = 3;
    roundRect(ctx, -halfW, -halfH, packW, packH, 12);
    ctx.stroke();

    // Inner design - card icon
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    roundRect(ctx, -halfW + 15, -halfH + 20, packW - 30, packH - 40, 8);
    ctx.fill();

    // Rarity symbol
    const symbols = {
      common: '★', uncommon: '★★', rare: '★★★',
      epic: '✦✦', legendary: '✧✧✧', godpack: '✦✧✦',
    };
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `bold ${packW * 0.18}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbols[rarity] || '★', 0, -halfH + packH * 0.35);

    // Pack name on pack
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = `bold ${Math.max(10, packW * 0.07)}px "Courier New", monospace`;
    ctx.fillText('CARD PACK', 0, halfH - 25);

    // Opening animation - crack effect
    if (openPhase === 'opening') {
      const progress = Math.min(1, animTimer / 800);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const crackLen = packH * progress;
      ctx.moveTo(0, -crackLen / 2);
      for (let i = 0; i < 8; i++) {
        const t = i / 8;
        const x = Math.sin(t * 12) * (5 + progress * 10);
        const y = -crackLen / 2 + crackLen * t;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Light burst
      if (progress > 0.5) {
        const burstAlpha = (progress - 0.5) * 2;
        ctx.fillStyle = `rgba(255, 255, 200, ${burstAlpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(0, 0, packW * progress, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spawn sparkles
      if (Math.random() < 0.4) {
        spawnSparkles(cx, cy, packW, packH, 3);
      }
    }

    ctx.restore();
  }

  function drawGoldGlow(ctx, cx, cy, hw, hh) {
    const pulse = 0.7 + 0.3 * Math.sin(glowTimer / 300);
    const glow = ctx.createRadialGradient(cx, cy, hw * 0.3, cx, cy, hw * 1.5);
    glow.addColorStop(0, `rgba(255, 215, 0, ${0.4 * pulse})`);
    glow.addColorStop(0.5, `rgba(255, 180, 0, ${0.2 * pulse})`);
    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-hw * 1.5, -hh * 1.5, hw * 3, hh * 3);
  }

  function drawRainbowGlow(ctx, cx, cy, hw, hh) {
    const pulse = 0.7 + 0.3 * Math.sin(glowTimer / 200);
    const hue = (glowTimer / 10) % 360;
    const colors = [
      `hsla(${hue}, 100%, 60%, ${0.35 * pulse})`,
      `hsla(${(hue + 60) % 360}, 100%, 60%, ${0.25 * pulse})`,
      `hsla(${(hue + 120) % 360}, 100%, 60%, ${0.15 * pulse})`,
    ];
    const glow = ctx.createRadialGradient(cx, cy, hw * 0.2, cx, cy, hw * 1.6);
    glow.addColorStop(0, colors[0]);
    glow.addColorStop(0.5, colors[1]);
    glow.addColorStop(1, colors[2]);
    ctx.fillStyle = glow;
    ctx.fillRect(-hw * 1.6, -hh * 1.6, hw * 3.2, hh * 3.2);
  }

  function drawRevealedCards(ctx, cx, cy, packW) {
    const items = openingPack.items;
    const cardW = Math.min(90, (window.innerWidth - 60) / 3.5);
    const cardH = cardW * 1.3;
    const gap = 8;
    const cols = 3;
    const rows = 2;
    const totalW = cols * cardW + (cols - 1) * gap;
    const totalH = rows * cardH + (rows - 1) * gap;
    const startX = cx - totalW / 2;
    const startY = cy - totalH / 2;

    for (let i = 0; i < 6; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gap);
      const y = startY + row * (cardH + gap);

      if (i < revealIndex || (i === revealIndex && openPhase === 'revealing')) {
        const flip = i < revealIndex ? 1 : cardFlipProgress;
        drawCard(ctx, x, y, cardW, cardH, items[i], flip, i === revealIndex);
      } else {
        // Face-down card
        drawCardBack(ctx, x, y, cardW, cardH);
      }
    }

    // Instructions
    ctx.fillStyle = '#aaa';
    ctx.font = '13px "Courier New", monospace';
    ctx.textAlign = 'center';
    if (openPhase === 'revealing') {
      ctx.fillText('Tap to reveal next card', cx, startY + totalH + 30);
    } else if (openPhase === 'done') {
      ctx.fillText('Tap to collect items', cx, startY + totalH + 30);
    }
  }

  function drawCard(ctx, x, y, w, h, itemId, flipProgress, isActive) {
    const scaleX = Math.abs(Math.cos(flipProgress * Math.PI));

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(flipProgress < 0.5 ? (1 - flipProgress * 2) : (flipProgress * 2 - 1), 1);
    ctx.translate(-w / 2, -h / 2);

    if (flipProgress < 0.5) {
      // Card back
      drawCardBackContent(ctx, 0, 0, w, h);
    } else {
      // Card front
      const item = ItemDB.getItem(itemId);
      const tierColor = getItemTierColor(itemId);

      // Card background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1a1a2e');
      grad.addColorStop(1, '#16213e');
      ctx.fillStyle = grad;
      roundRect(ctx, 0, 0, w, h, 6);
      ctx.fill();

      // Card border with tier color
      ctx.strokeStyle = tierColor;
      ctx.lineWidth = 2;
      roundRect(ctx, 0, 0, w, h, 6);
      ctx.stroke();

      // Item icon area
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      roundRect(ctx, 6, 6, w - 12, h * 0.5, 4);
      ctx.fill();

      // Item symbol
      const symbol = getItemSymbol(item);
      ctx.fillStyle = tierColor;
      ctx.font = `bold ${w * 0.3}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, w / 2, h * 0.3);

      // Item name
      if (item) {
        ctx.fillStyle = '#eee';
        ctx.font = `bold ${Math.max(8, w * 0.1)}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Word wrap
        const words = item.name.split(' ');
        let line = '';
        let ly = h * 0.6;
        const lineH = Math.max(10, w * 0.12);
        for (const word of words) {
          const test = line + (line ? ' ' : '') + word;
          if (ctx.measureText(test).width > w - 12 && line) {
            ctx.fillText(line, w / 2, ly);
            line = word;
            ly += lineH;
          } else {
            line = test;
          }
        }
        if (line) ctx.fillText(line, w / 2, ly);

        // Description
        ctx.fillStyle = '#888';
        ctx.font = `${Math.max(7, w * 0.08)}px "Courier New", monospace`;
        ly += lineH + 2;
        if (ly < h - 8 && item.description) {
          const desc = item.description.length > 20 ? item.description.slice(0, 18) + '..' : item.description;
          ctx.fillText(desc, w / 2, ly);
        }
      }

      // Active card glow
      if (isActive && flipProgress >= 1) {
        ctx.shadowColor = tierColor;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = tierColor;
        ctx.lineWidth = 2;
        roundRect(ctx, 0, 0, w, h, 6);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Spawn sparkles near card
        const cardCenterX = x + w / 2;
        const cardCenterY = y + h / 2;
        if (Math.random() < 0.3) {
          spawnSparkles(cardCenterX, cardCenterY, w, h, 1);
        }
      }
    }

    ctx.restore();
  }

  function drawCardBack(ctx, x, y, w, h) {
    ctx.save();
    drawCardBackContent(ctx, x, y, w, h);
    ctx.restore();
  }

  function drawCardBackContent(ctx, x, y, w, h) {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#2a2a4a');
    grad.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, w, h, 6);
    ctx.fill();

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, w, h, 6);
    ctx.stroke();

    // Diamond pattern
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    const ds = w * 0.3;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-ds / 2, -ds / 2, ds, ds);
    ctx.restore();

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = `bold ${w * 0.2}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x + w / 2, y + h / 2);
  }

  function drawSparkles(ctx) {
    for (const s of sparkles) {
      const alpha = s.life / s.maxLife;
      const hue = (glowTimer / 5 + s.x) % 360;
      ctx.fillStyle = openingPack && openingPack.rarity === 'godpack'
        ? `hsla(${hue}, 100%, 70%, ${alpha})`
        : `rgba(255, 215, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Helpers ---
  function getItemTierColor(itemId) {
    if (ITEM_TIERS.legendary.includes(itemId)) return '#ffd700';
    if (ITEM_TIERS.epic.includes(itemId)) return '#ff8833';
    if (ITEM_TIERS.rare.includes(itemId)) return '#aa55cc';
    if (ITEM_TIERS.uncommon.includes(itemId)) return '#5588cc';
    return '#88aa88';
  }

  function getItemSymbol(item) {
    if (!item) return '?';
    if (item.type === 'equipment') {
      if (item.equipSlot === 'weapon') return '⚔';
      if (item.equipSlot === 'armor') return '🛡';
      if (item.equipSlot === 'accessory') return '💍';
    }
    if (item.type === 'consumable') return '🧪';
    if (item.type === 'material') return '💎';
    return '📦';
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function lightenColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xFF) + amount);
    const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
    const b = Math.min(255, (num & 0xFF) + amount);
    return `rgb(${r},${g},${b})`;
  }

  function darkenColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, ((num >> 16) & 0xFF) - amount);
    const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
    const b = Math.max(0, (num & 0xFF) - amount);
    return `rgb(${r},${g},${b})`;
  }

  function getPackRarityInfo(rarity) {
    return PACK_RARITIES[rarity] || PACK_RARITIES.common;
  }

  return {
    addPack,
    removePack,
    getInventory,
    getTotalPacks,
    getState,
    loadState,
    generatePackForEnemy,
    openPack,
    getPackRarityInfo,
  };
})();
