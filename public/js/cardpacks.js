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

  // --- Enhanced animation state ---
  let shakeIntensity = 0;
  let flashAlpha = 0;
  let collectTimer = 0;
  let collectIndex = -1;
  let flyingCards = [];
  let inventoryPopups = [];
  let bannerAlpha = 0;
  let bannerTimer = 0;

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
    shakeIntensity = 0;
    flashAlpha = 0;
    collectTimer = 0;
    collectIndex = -1;
    flyingCards = [];
    inventoryPopups = [];
    bannerAlpha = 0;
    bannerTimer = 0;

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
      // Start collecting animation
      openPhase = 'collecting';
      collectTimer = 0;
      collectIndex = -1;
      flyingCards = [];
      inventoryPopups = [];
      bannerAlpha = 0;
      bannerTimer = 0;

      // Pre-calculate card positions for flying animation
      if (openingPack) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cxPos = w / 2;
        const cyPos = h / 2;
        const cardW = Math.min(90, (w - 60) / 3.5);
        const cardH = cardW * 1.3;
        const gap = 8;
        const cols = 3;
        const totalW = cols * cardW + (cols - 1) * gap;
        const totalH = 2 * cardH + gap;
        const sx = cxPos - totalW / 2;
        const sy = cyPos - totalH / 2;

        for (let i = 0; i < 6; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          flyingCards.push({
            startX: sx + col * (cardW + gap),
            startY: sy + row * (cardH + gap),
            x: sx + col * (cardW + gap),
            y: sy + row * (cardH + gap),
            targetX: cxPos - cardW / 2,
            targetY: -cardH,
            itemId: openingPack.items[i],
            progress: 0,
            collected: false,
            scale: 1,
            alpha: 1,
            cardW,
            cardH,
            delay: i * 250,
          });
        }
      }
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
      // Enhanced opening: 1500ms with shake and flash
      const progress = Math.min(1, animTimer / 1500);
      if (progress < 0.4) {
        shakeIntensity = progress * 15;
      } else if (progress < 0.85) {
        shakeIntensity = 6 + Math.sin(animTimer * 0.05) * 4;
      } else {
        shakeIntensity = (1 - progress) * 40;
      }
      // Flash at climax
      if (progress > 0.8 && progress < 1) {
        flashAlpha = Math.max(flashAlpha, (progress - 0.8) * 5);
      }
      // Spawn extra sparkles
      if (progress > 0.3 && Math.random() < 0.6) {
        const sCx = window.innerWidth / 2;
        const sCy = window.innerHeight / 2;
        const sPw = Math.min(200, window.innerWidth * 0.45);
        spawnSparkles(sCx, sCy, sPw * 1.5, sPw * 2, 4);
      }
      // Big burst near end
      if (animTimer > 1200 && animTimer < 1250) {
        const bCx = window.innerWidth / 2;
        const bCy = window.innerHeight / 2;
        spawnSparkles(bCx, bCy, 300, 300, 30);
      }
      if (animTimer > 1500) {
        openPhase = 'revealing';
        animTimer = 0;
        cardFlipProgress = 0;
        shakeIntensity = 0;
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

    // Fade flash
    if (flashAlpha > 0) {
      flashAlpha = Math.max(0, flashAlpha - dt / 300);
    }

    // Collecting phase logic
    if (openPhase === 'collecting') {
      collectTimer += dt;

      // Animate each card flying away
      for (let i = 0; i < flyingCards.length; i++) {
        const card = flyingCards[i];
        if (collectTimer > card.delay && !card.collected) {
          card.progress = Math.min(1, (collectTimer - card.delay) / 600);
          // Ease out cubic
          const ease = 1 - Math.pow(1 - card.progress, 3);
          card.x = card.startX + (card.targetX - card.startX) * ease;
          card.y = card.startY + (card.targetY - card.startY) * ease;
          card.scale = 1 - ease * 0.7;
          card.alpha = 1 - ease;

          if (card.progress >= 1 && !card.collected) {
            card.collected = true;
            collectIndex = i;
            // Add item to inventory
            Player.addItem(card.itemId, 1);
            // Spawn popup
            const item = typeof ItemDB !== 'undefined' ? ItemDB.getItem(card.itemId) : null;
            const itemName = item ? item.name : card.itemId;
            inventoryPopups.push({
              text: '+ ' + itemName,
              x: window.innerWidth / 2,
              y: 70 + inventoryPopups.length * 22,
              alpha: 1,
              color: getItemTierColor(card.itemId),
            });
            // Sparkles at collection point
            spawnSparkles(window.innerWidth / 2, 30, 100, 30, 8);
          }
        }
      }

      // Fade popups after all collected
      const allCollected = flyingCards.length > 0 && flyingCards.every(c => c.collected);
      if (allCollected) {
        bannerTimer += dt;
        bannerAlpha = Math.min(1, bannerTimer / 500);

        // Fade popups slowly
        for (let i = inventoryPopups.length - 1; i >= 0; i--) {
          if (bannerTimer > 800) {
            inventoryPopups[i].alpha = Math.max(0, inventoryPopups[i].alpha - dt / 1500);
          }
        }

        // Auto-close after banner shown
        if (bannerTimer > 2500) {
          if (typeof HUD !== 'undefined') {
            HUD.addToast('📦 Pack items added to inventory!', '#ffd700', 3000);
          }
          closePackUI();
          return;
        }
      }
    }

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

    // Apply screen shake
    ctx.save();
    if (shakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * shakeIntensity * 2;
      const sy = (Math.random() - 0.5) * shakeIntensity * 2;
      ctx.translate(sx, sy);
    }

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
    } else if (openPhase === 'collecting') {
      drawCollectingPhase(ctx, w, h);
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

    // Flash overlay
    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 240, ${Math.min(1, flashAlpha)})`;
      ctx.fillRect(-20, -20, w + 40, h + 40);
    }

    ctx.restore();
  }

  function drawCollectingPhase(ctx, w, h) {
    const cx = w / 2;

    // "Adding to Inventory" header
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('\u2728 Adding to Inventory \u2728', cx, 55);

    // Draw flying cards
    for (const card of flyingCards) {
      if (card.progress <= 0) {
        // Not started - draw in original position
        drawCard(ctx, card.startX, card.startY, card.cardW, card.cardH, card.itemId, 1, false);
      } else if (!card.collected) {
        // Flying animation
        ctx.save();
        ctx.globalAlpha = card.alpha;
        const s = card.scale;
        ctx.translate(card.x + card.cardW / 2 * s, card.y + card.cardH / 2 * s);
        ctx.scale(s, s);
        ctx.translate(-card.cardW / 2, -card.cardH / 2);
        drawCard(ctx, 0, 0, card.cardW, card.cardH, card.itemId, 1, false);
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    // Draw inventory popup text
    for (const p of inventoryPopups) {
      if (p.alpha <= 0) continue;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.font = 'bold 14px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    }

    // Draw "Items Added!" banner
    if (bannerAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = bannerAlpha;
      const bannerW = Math.min(320, w * 0.8);
      const bannerH = 50;
      const bannerX = cx - bannerW / 2;
      const bannerY = h / 2 - bannerH / 2;
      const bGrad = ctx.createLinearGradient(bannerX, bannerY, bannerX, bannerY + bannerH);
      bGrad.addColorStop(0, 'rgba(30, 30, 60, 0.95)');
      bGrad.addColorStop(1, 'rgba(20, 20, 50, 0.95)');
      ctx.fillStyle = bGrad;
      roundRect(ctx, bannerX, bannerY, bannerW, bannerH, 10);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      roundRect(ctx, bannerX, bannerY, bannerW, bannerH, 10);
      ctx.stroke();

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\uD83D\uDCE6 Items Added to Inventory!', cx, h / 2);
      ctx.textBaseline = 'alphabetic';
      ctx.restore();
    }
  }

  function drawPack3D(ctx, cx, cy, packW, packH) {
    const rarity = openingPack.rarity;
    const info = PACK_RARITIES[rarity];

    ctx.save();
    ctx.translate(cx, cy);

    // Wobble during opening animation
    if (openPhase === 'opening') {
      const progress = Math.min(1, animTimer / 1500);
      if (progress < 0.5) {
        const wobbleAngle = Math.sin(animTimer * 0.03) * progress * 6;
        ctx.rotate(wobbleAngle * Math.PI / 180);
      }
      // Pulse scale near climax
      if (progress > 0.6 && progress < 0.85) {
        const pulse = 1 + Math.sin((progress - 0.6) * 40) * 0.04;
        ctx.scale(pulse, pulse);
      }
    }

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

    // Enhanced opening animation
    if (openPhase === 'opening') {
      const progress = Math.min(1, animTimer / 1500);

      // Phase 1: Cracks appear (30%+)
      if (progress > 0.3) {
        const crackProgress = Math.min(1, (progress - 0.3) / 0.4);
        ctx.strokeStyle = `rgba(255, 255, 220, ${0.6 + crackProgress * 0.4})`;
        ctx.lineWidth = 1.5 + crackProgress * 1.5;

        // Center crack
        ctx.beginPath();
        const crackLen = packH * crackProgress;
        ctx.moveTo(0, -crackLen / 2);
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          const crX = Math.sin(t * 15 + 1) * (3 + crackProgress * 12);
          const crY = -crackLen / 2 + crackLen * t;
          ctx.lineTo(crX, crY);
        }
        ctx.stroke();

        // Left crack
        if (crackProgress > 0.3) {
          const lp = (crackProgress - 0.3) / 0.7;
          ctx.beginPath();
          ctx.moveTo(-5, 0);
          for (let i = 0; i <= 6; i++) {
            const t = i / 6;
            const crX = -5 - halfW * 0.6 * t * lp;
            const crY = Math.sin(t * 10 + 2) * (2 + lp * 8);
            ctx.lineTo(crX, crY);
          }
          ctx.stroke();
        }

        // Right crack
        if (crackProgress > 0.5) {
          const rp = (crackProgress - 0.5) / 0.5;
          ctx.beginPath();
          ctx.moveTo(5, -10);
          for (let i = 0; i <= 6; i++) {
            const t = i / 6;
            const crX = 5 + halfW * 0.5 * t * rp;
            const crY = -10 + Math.sin(t * 8 + 3) * (2 + rp * 6);
            ctx.lineTo(crX, crY);
          }
          ctx.stroke();
        }

        // Light beams through cracks
        if (crackProgress > 0.4) {
          const beamAlpha = (crackProgress - 0.4) * 1.5;
          const beamGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, packW * 0.8);
          beamGrad.addColorStop(0, `rgba(255, 255, 200, ${beamAlpha * 0.6})`);
          beamGrad.addColorStop(0.5, `rgba(255, 240, 150, ${beamAlpha * 0.3})`);
          beamGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');
          ctx.fillStyle = beamGrad;
          ctx.fillRect(-packW, -packH, packW * 2, packH * 2);
        }
      }

      // Phase 2: Burst (80%+)
      if (progress > 0.8) {
        const burstProgress = (progress - 0.8) / 0.2;
        const burstRadius = packW * (0.5 + burstProgress * 2);
        const burstAlpha = (1 - burstProgress) * 0.7;
        const burstGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, burstRadius);
        burstGrad.addColorStop(0, `rgba(255, 255, 240, ${burstAlpha})`);
        burstGrad.addColorStop(0.3, `rgba(255, 220, 100, ${burstAlpha * 0.6})`);
        burstGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
        ctx.fillStyle = burstGrad;
        ctx.beginPath();
        ctx.arc(0, 0, burstRadius, 0, Math.PI * 2);
        ctx.fill();

        // Light rays
        ctx.save();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + animTimer * 0.002;
          ctx.save();
          ctx.rotate(angle);
          ctx.fillStyle = `rgba(255, 255, 200, ${burstAlpha * 0.4})`;
          ctx.fillRect(-2, 0, 4, burstRadius * 0.8);
          ctx.restore();
        }
        ctx.restore();
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
