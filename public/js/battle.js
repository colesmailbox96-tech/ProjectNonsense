/* ========= BATTLE SYSTEM ========= */
const BattleSystem = (() => {
  let active = false;
  let enemy = null;
  let playerTurn = true;
  let animating = false;
  let shakeTimer = 0;
  let shakeIntensity = 0;
  let flashTimer = 0;
  let flashTarget = null; // 'enemy' or 'player'
  let subMenu = null; // null, 'skill', 'item'
  const log = [];
  const battleTexts = []; // floating damage/heal numbers
  const BATTLE_TEXT_LIFE = 1100; // ms for floating text animation

  // Status effects: { type, turns, value? }
  let playerEffects = [];
  let enemyEffects = [];

  const overlay = () => document.getElementById('battle-overlay');
  const logEl = () => document.getElementById('battle-log');
  const actionsEl = () => document.getElementById('battle-actions');
  const canvas = () => document.getElementById('battle-canvas');

  function startBattle(enemyType) {
    enemy = EnemyDB.create(enemyType);
    if (!enemy) return;
    active = true;
    playerTurn = true;
    animating = false;
    shakeTimer = 0;
    shakeIntensity = 0;
    flashTimer = 0;
    flashTarget = null;
    subMenu = null;
    log.length = 0;
    playerEffects = [];
    enemyEffects = [];
    battleTexts.length = 0;

    if (typeof Bestiary !== 'undefined') Bestiary.recordSeen(enemy.type);

    if (enemy.isBoss) {
      addLog(`⚔ BOSS: ${enemy.name} blocks the way!`);
    } else {
      addLog(`A wild ${enemy.name} appears!`);
    }

    overlay().classList.remove('hidden');
    Game.setState(GAME_STATES.BATTLE);

    if (typeof AudioSystem !== 'undefined') {
      AudioSystem.playBattleMusic(!!enemy.isBoss);
    }

    renderBattle();
    renderActions();
  }

  function renderActions() {
    const el = actionsEl();
    if (!el) return;

    if (subMenu === 'skill') {
      renderSkillMenu(el);
    } else if (subMenu === 'item') {
      renderItemMenu(el);
    } else {
      el.innerHTML = `
        <button class="battle-btn" data-action="attack">Attack</button>
        <button class="battle-btn" data-action="skill">Skill</button>
        <button class="battle-btn" data-action="item">Item</button>
        <button class="battle-btn" data-action="flee">Flee</button>
      `;
    }

    el.querySelectorAll('.battle-btn').forEach(btn => {
      btn.onclick = () => {
        if (!playerTurn || animating) return;
        const action = btn.dataset.action;
        if (action === 'use-skill' && btn.dataset.skill) {
          useSkill(btn.dataset.skill);
        } else if (action === 'use-item' && btn.dataset.item) {
          useItem(btn.dataset.item);
        } else {
          handlePlayerAction(action);
        }
      };
    });
  }

  function renderSkillMenu(el) {
    const ps = Player.getState();
    const skills = typeof SkillDB !== 'undefined'
      ? SkillDB.getLearnedSkills(ps.level)
      : [{ id: 'powerStrike', name: 'Power Strike', mpCost: 5, type: 'attack', multiplier: 1.5 }];

    let html = '';
    skills.forEach(s => {
      const canUse = ps.mp >= s.mpCost;
      html += `<button class="battle-btn${canUse ? '' : ' btn-disabled'}" data-action="use-skill" data-skill="${s.id}">${s.name} <small>${s.mpCost}MP</small></button>`;
    });
    html += `<button class="battle-btn btn-back" data-action="back">← Back</button>`;
    el.innerHTML = html;
  }

  function renderItemMenu(el) {
    const ps = Player.getState();
    const usable = ps.inventory.filter(e => {
      const it = ItemDB.getItem(e.id);
      return it && it.type === 'consumable';
    });

    let html = '';
    if (usable.length === 0) {
      html += `<div style="color:#888;text-align:center;grid-column:1/-1;padding:8px;">No usable items</div>`;
    } else {
      usable.forEach(entry => {
        const it = ItemDB.getItem(entry.id);
        html += `<button class="battle-btn" data-action="use-item" data-item="${entry.id}">${it.name} <small>x${entry.qty}</small></button>`;
      });
    }
    html += `<button class="battle-btn btn-back" data-action="back">← Back</button>`;
    el.innerHTML = html;
  }

  function handlePlayerAction(action) {
    if (!active || !playerTurn || animating) return;

    switch (action) {
      case 'attack':
        playerAttack();
        break;
      case 'skill':
        subMenu = 'skill';
        renderActions();
        break;
      case 'item':
        subMenu = 'item';
        renderActions();
        break;
      case 'flee':
        attemptFlee();
        break;
      case 'back':
        subMenu = null;
        renderActions();
        break;
    }
  }

  // Override onclick for skill/item buttons via renderActions
  // The real handlers are bound in renderActions via btn.onclick

  function calcCrit() {
    const chance = Player.getCritChance();
    return Math.random() < chance;
  }

  function playerAttack() {
    subMenu = null;
    const ps = Player.getState();
    const atkPower = getEffectiveStat(ps.attack, playerEffects, 'atkUp', 'atkDown');
    const defPower = getEffectiveStat(enemy.defense, enemyEffects, 'defUp', 'defDown');
    let dmg = Math.max(1, atkPower - defPower + Math.floor(Math.random() * 4));
    const isCrit = calcCrit();
    if (isCrit) {
      dmg = Math.floor(dmg * 1.5);
      addLog(`⚡ CRITICAL HIT! You deal ${dmg} damage!`);
      addBattleText(`CRIT! -${dmg}`, 'enemy', '#ffdd00');
      triggerShake(6);
      if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('crit');
    } else {
      addLog(`You deal ${dmg} damage!`);
      addBattleText(`-${dmg}`, 'enemy', '#ff6644');
      if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('hit');
    }
    enemy.hp = Math.max(0, enemy.hp - dmg);
    triggerFlash('enemy');

    if (enemy.hp <= 0) {
      victory();
    } else {
      endPlayerTurn();
    }
    renderBattle();
    renderActions();
  }

  function useSkill(skillId) {
    subMenu = null;
    const ps = Player.getState();
    const skill = typeof SkillDB !== 'undefined' ? SkillDB.getSkill(skillId) : null;
    if (!skill) return;

    if (ps.mp < skill.mpCost) {
      addLog('Not enough MP!');
      renderBattle();
      renderActions();
      return;
    }
    ps.mp -= skill.mpCost;

    if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('skill');

    if (skill.type === 'heal') {
      const healAmt = 20 + ps.level * 5;
      Player.heal(healAmt);
      addLog(`${skill.name} restores ${healAmt} HP!`);
      addBattleText(`+${healAmt} HP`, 'player', '#33ff88');
      if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('heal');
      triggerFlash('player');
      endPlayerTurn();
    } else if (skill.type === 'buff') {
      const effectType = skill.buffStat === 'defense' ? 'defUp' : 'atkUp';
      addEffect(playerEffects, effectType, skill.buffDuration);
      addLog(`${skill.name}! ${skill.buffStat === 'defense' ? 'DEF' : 'ATK'} up for ${skill.buffDuration} turns!`);
      addBattleText(skill.buffStat === 'defense' ? '⬆DEF' : '⬆ATK', 'player', '#88ccff');
      triggerFlash('player');
      endPlayerTurn();
    } else {
      // Attack skill
      const atkPower = getEffectiveStat(ps.attack, playerEffects, 'atkUp', 'atkDown');
      const defPower = getEffectiveStat(enemy.defense, enemyEffects, 'defUp', 'defDown');
      let dmg = Math.max(1, Math.floor(atkPower * skill.multiplier) - defPower + Math.floor(Math.random() * 6));
      const isCrit = calcCrit();
      if (isCrit) {
        dmg = Math.floor(dmg * 1.5);
        addLog(`⚡ CRIT! ${skill.name} deals ${dmg} damage!`);
        addBattleText(`CRIT! -${dmg}`, 'enemy', '#ffdd00');
        triggerShake(6);
      } else {
        addLog(`${skill.name} deals ${dmg} damage!`);
        addBattleText(`-${dmg}`, 'enemy', '#ff8844');
      }
      enemy.hp = Math.max(0, enemy.hp - dmg);
      triggerFlash('enemy');

      // Status effect from skill
      if (skill.statusEffect && Math.random() < (skill.statusChance || 0.3)) {
        addEffect(enemyEffects, skill.statusEffect, 2);
        addLog(`${enemy.name} is ${skill.statusEffect === 'stun' ? 'stunned' : skill.statusEffect}!`);
      }

      if (enemy.hp <= 0) {
        victory();
      } else {
        endPlayerTurn();
      }
    }
    renderBattle();
    renderActions();
  }

  function useItem(itemId) {
    subMenu = null;
    const item = ItemDB.getItem(itemId);
    if (!item) return;

    // Smoke Bomb — guaranteed escape
    if (item.battleEscape) {
      Player.removeItem(itemId, 1);
      addLog(`Used ${item.name}! Got away safely!`);
      if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('flee');
      renderBattle();
      renderActions();
      setTimeout(() => endBattle(), 600);
      return;
    }

    // Antidote — cure poison
    if (item.curesStatus) {
      Player.removeItem(itemId, 1);
      playerEffects = playerEffects.filter(e => e.type !== item.curesStatus);
      addLog(`Used ${item.name}! Poison cured!`);
      if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('heal');
      triggerFlash('player');
      endPlayerTurn();
      renderBattle();
      renderActions();
      return;
    }

    // Consumable (HP/MP)
    Player.removeItem(itemId, 1);
    item.effect(Player);
    const restoreMsg = item.mpAmount ? 'MP restored.' : 'HP restored.';
    addLog(`Used ${item.name}! ${restoreMsg}`);
    if (item.mpAmount) {
      addBattleText(`+${item.mpAmount} MP`, 'player', '#88aaff');
    } else if (item.healAmount) {
      addBattleText(`+${item.healAmount} HP`, 'player', '#33ff88');
    }
    if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('heal');
    triggerFlash('player');
    endPlayerTurn();
    renderBattle();
    renderActions();
  }

  function attemptFlee() {
    subMenu = null;
    const ps = Player.getState();
    if (enemy.isBoss) {
      addLog('Cannot flee from a boss!');
      renderBattle();
      renderActions();
      return;
    }
    if (Math.random() < 0.4 + (ps.speed - (enemy.speed || 0)) * 0.05) {
      addLog('Got away safely!');
      if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('flee');
      renderBattle();
      setTimeout(() => endBattle(), 600);
    } else {
      addLog('Cannot escape!');
      endPlayerTurn();
      renderBattle();
      renderActions();
    }
  }

  function endPlayerTurn() {
    playerTurn = false;
    setTimeout(() => enemyTurn(), 800);
  }

  function enemyTurn() {
    if (!active) return;

    // Tick enemy status effects first
    tickEffects(enemyEffects, enemy.name);

    // Check stun
    if (hasEffect(enemyEffects, 'stun')) {
      addLog(`${enemy.name} is stunned and cannot move!`);
      removeEffect(enemyEffects, 'stun');
      playerTurn = true;
      renderBattle();
      renderActions();
      return;
    }

    const atkPower = getEffectiveStat(enemy.attack, enemyEffects, 'atkUp', 'atkDown');

    let dmg;
    let appliedPoison = false;

    // Enemy might use skill (40% chance)
    if (enemy.skills.length > 0 && Math.random() < 0.4) {
      const skillId = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
      const skill = EnemyDB.getSkill(skillId);
      dmg = Player.takeDamage(Math.floor(atkPower * skill.multiplier));
      addLog(`${enemy.name} uses ${skill.name}! ${dmg} damage!`);
      addBattleText(`-${dmg}`, 'player', '#ff4444');
      if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('hit');

      // Boss/strong enemies can inflict poison (20% chance on dark skills)
      if ((skillId === 'darkSlash' || skillId === 'shadowBlast') && Math.random() < 0.2) {
        if (!hasEffect(playerEffects, 'poison')) {
          addEffect(playerEffects, 'poison', 3);
          addLog(`You are poisoned!`);
          addBattleText('☠ POISON', 'player', '#aa44aa');
          appliedPoison = true;
        }
      }
    } else {
      dmg = Player.takeDamage(atkPower);
      addLog(`${enemy.name} attacks! ${dmg} damage!`);
      addBattleText(`-${dmg}`, 'player', '#ff4444');
      if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('hit');
    }
    triggerFlash('player');
    if (dmg >= 15) triggerShake(4);

    // Tick player poison
    tickPlayerPoison();

    const ps = Player.getState();
    if (ps.hp <= 0) {
      defeat();
    } else {
      playerTurn = true;
    }
    renderBattle();
    renderActions();
  }

  // --- Status effect helpers ---
  function addEffect(list, type, turns) {
    const existing = list.find(e => e.type === type);
    if (existing) {
      existing.turns = Math.max(existing.turns, turns);
    } else {
      list.push({ type, turns });
    }
  }

  function hasEffect(list, type) {
    return list.some(e => e.type === type && e.turns > 0);
  }

  function removeEffect(list, type) {
    const idx = list.findIndex(e => e.type === type);
    if (idx !== -1) list.splice(idx, 1);
  }

  function tickEffects(list) {
    for (let i = list.length - 1; i >= 0; i--) {
      list[i].turns--;
      if (list[i].turns <= 0) {
        list.splice(i, 1);
      }
    }
  }

  function tickPlayerPoison() {
    if (hasEffect(playerEffects, 'poison')) {
      const ps = Player.getState();
      const poisonDmg = Math.max(1, Math.floor(ps.maxHp * 0.05));
      ps.hp = Math.max(0, ps.hp - poisonDmg);
      addLog(`☠ Poison deals ${poisonDmg} damage!`);
      addBattleText(`☠ -${poisonDmg}`, 'player', '#aa44aa');
    }
  }

  function getEffectiveStat(base, effects, upType, downType) {
    let stat = base;
    if (hasEffect(effects, upType)) stat = Math.floor(stat * 1.4);
    if (hasEffect(effects, downType)) stat = Math.floor(stat * 0.7);
    return stat;
  }

  function victory() {
    const isBoss = enemy && enemy.isBoss;
    addLog(`Defeated ${enemy.name}!`);
    addLog(`Gained ${enemy.xp} XP and ${enemy.gold} gold!`);

    // Bestiary tracking
    if (typeof Bestiary !== 'undefined') Bestiary.recordDefeat(enemy.type);

    // Loot drops
    if (enemy.drops) {
      for (const drop of enemy.drops) {
        if (Math.random() < drop.chance) {
          Player.addItem(drop.id, 1);
          const item = ItemDB.getItem(drop.id);
          if (item) addLog(`💎 Dropped: ${item.name}`);
        }
      }
    }

    const ps = Player.getState();
    ps.gold += enemy.gold;
    const prevLevel = ps.level;
    const levels = Player.gainXP(enemy.xp);
    if (levels.length > 0) {
      addLog(`LEVEL UP! Now level ${levels[levels.length - 1]}!`);
      if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('levelup');

      // Check for new skills learned
      if (typeof SkillDB !== 'undefined') {
        for (const lv of levels) {
          const newSkills = SkillDB.getNewSkillsAtLevel(lv);
          for (const s of newSkills) {
            addLog(`✨ Learned ${s.name}!`);
            if (typeof HUD !== 'undefined') {
              HUD.addToast(`✨ New Skill: ${s.name}!`, '#88aaff', 4000);
            }
          }
        }
      }
    }

    if (typeof QuestSystem !== 'undefined') {
      QuestSystem.checkProgress('defeat_enemy', { enemyType: enemy.type });
      if (isBoss) {
        QuestSystem.checkProgress('defeat_boss', {});
      }
    }

    // Clear status effects
    playerEffects = [];
    enemyEffects = [];

    renderBattle();
    setTimeout(() => {
      endBattle();
      if (typeof SaveSystem !== 'undefined') SaveSystem.autoSave();
    }, 1500);
  }

  function defeat() {
    addLog('You were defeated...');
    if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('defeat');
    playerEffects = [];
    enemyEffects = [];
    renderBattle();
    setTimeout(() => {
      endBattle();
      // Revive at village with half HP
      Player.getState().hp = Math.floor(Player.getState().maxHp / 2);
      Player.getState().mp = Math.floor(Player.getState().maxMp / 4);
      Game.warpTo('village', 15, 15);
      DialogueSystem.showMessage('', 'You wake up back in the village...');
    }, 1500);
  }

  function endBattle() {
    active = false;
    enemy = null;
    subMenu = null;
    overlay().classList.add('hidden');
    Game.setState(GAME_STATES.EXPLORE);

    // Resume map music
    if (typeof AudioSystem !== 'undefined') {
      AudioSystem.playMapMusic(Player.getState().currentMap);
    }
  }

  function triggerFlash(target) {
    flashTarget = target;
    flashTimer = 300;
  }

  function triggerShake(intensity) {
    shakeTimer = 300;
    shakeIntensity = intensity;
  }

  function addLog(msg) {
    log.push(msg);
    if (log.length > 30) log.shift();
  }

  function renderBattle() {
    const c = canvas();
    if (!c) return;
    const rect = c.parentElement.getBoundingClientRect();
    c.width = rect.width;
    c.height = rect.height - 200;
    const ctx = c.getContext('2d');

    // Screen shake offset
    let shakeX = 0, shakeY = 0;
    if (shakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * shakeIntensity;
      shakeY = (Math.random() - 0.5) * shakeIntensity;
      shakeTimer -= 16;
    }
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Background
    ctx.fillStyle = '#0a0a2a';
    ctx.fillRect(-5, -5, c.width + 10, c.height + 10);

    // Ground
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(-5, c.height * 0.6, c.width + 10, c.height * 0.4 + 5);

    if (enemy) {
      // Draw enemy sprite (scaled up)
      const eSprite = SpriteEngine.generateEnemy(enemy.type);
      const eScale = 6;
      const eW = TILE_SIZE * eScale;
      const eH = TILE_SIZE * eScale;
      const eX = c.width / 2 - eW / 2;
      const eY = c.height * 0.15;

      if (flashTarget === 'enemy' && flashTimer > 0) {
        ctx.globalAlpha = 0.5;
      }
      ctx.drawImage(eSprite, eX, eY, eW, eH);
      ctx.globalAlpha = 1;

      // Enemy HP bar
      const barW = 160;
      const barH = 12;
      const barX = c.width / 2 - barW / 2;
      const barY = eY + eH + 12;
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);
      const hpRatio = enemy.hp / enemy.maxHp;
      ctx.fillStyle = hpRatio > 0.5 ? '#44cc44' : hpRatio > 0.2 ? '#cccc44' : '#cc4444';
      ctx.fillRect(barX, barY, barW * hpRatio, barH);
      ctx.strokeStyle = '#666';
      ctx.strokeRect(barX, barY, barW, barH);

      // Enemy name + status
      ctx.fillStyle = '#fff';
      ctx.font = '14px "Courier New", monospace';
      ctx.textAlign = 'center';
      let enemyLabel = `${enemy.name}  HP: ${enemy.hp}/${enemy.maxHp}`;
      const eStatusStr = statusString(enemyEffects);
      if (eStatusStr) enemyLabel += `  ${eStatusStr}`;
      ctx.fillText(enemyLabel, c.width / 2, barY + barH + 18);
    }

    // Player stats in battle
    const ps = Player.getState();
    ctx.fillStyle = 'rgba(0,0,20,0.7)';
    ctx.fillRect(8, c.height - 64, 220, 56);
    ctx.strokeStyle = '#556';
    ctx.strokeRect(8, c.height - 64, 220, 56);

    if (flashTarget === 'player' && flashTimer > 0) {
      ctx.fillStyle = '#ff4444';
    } else {
      ctx.fillStyle = '#fff';
    }
    ctx.textAlign = 'left';
    ctx.font = '13px "Courier New", monospace';
    ctx.fillText(`${ps.name}  Lv.${ps.level}`, 16, c.height - 46);
    ctx.fillText(`HP: ${ps.hp}/${ps.maxHp}  MP: ${ps.mp}/${ps.maxMp}`, 16, c.height - 28);

    // Player status effects
    const pStatusStr = statusString(playerEffects);
    if (pStatusStr) {
      ctx.fillStyle = '#ff8888';
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText(pStatusStr, 16, c.height - 12);
    }

    // Update flash timer
    if (flashTimer > 0) flashTimer -= 16;

    ctx.restore();

    // Render floating battle texts (outside shake transform)
    const now = Date.now();
    for (let i = battleTexts.length - 1; i >= 0; i--) {
      const t = battleTexts[i];
      const elapsed = now - t.startTime;
      if (elapsed >= t.life) {
        battleTexts.splice(i, 1);
        continue;
      }
      const progress = elapsed / t.life;
      const fadeIn = Math.min(1, progress / 0.1);
      const fadeOut = Math.max(0, 1 - (progress - 0.15) / 0.85);
      const alpha = Math.min(fadeIn, fadeOut);
      const floatY = t.y - progress * 55;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x, floatY);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, floatY);
      ctx.restore();
    }

    // Update log display
    const logDisplay = logEl();
    if (logDisplay) {
      logDisplay.innerHTML = log.slice(-4).join('<br>');
      logDisplay.scrollTop = logDisplay.scrollHeight;
    }
  }

  function statusString(effects) {
    const icons = [];
    for (const e of effects) {
      if (e.type === 'poison') icons.push(`☠${e.turns}`);
      else if (e.type === 'stun') icons.push(`💫${e.turns}`);
      else if (e.type === 'atkUp') icons.push(`⬆ATK${e.turns}`);
      else if (e.type === 'defUp') icons.push(`⬆DEF${e.turns}`);
      else if (e.type === 'atkDown') icons.push(`⬇ATK${e.turns}`);
      else if (e.type === 'defDown') icons.push(`⬇DEF${e.turns}`);
    }
    return icons.join(' ');
  }

  function addBattleText(text, target, color) {
    const c = canvas();
    if (!c) return;
    const eScale = 6;
    const eW = TILE_SIZE * eScale;
    const eH = TILE_SIZE * eScale;
    let x, y;
    if (target === 'enemy') {
      x = c.width / 2 + (Math.random() - 0.5) * 40;
      y = c.height * 0.15 + eH * 0.4;
    } else {
      x = 120 + (Math.random() - 0.5) * 30;
      y = c.height - 68;
    }
    battleTexts.push({ text, x, y, color: color || '#ffffff', startTime: Date.now(), life: BATTLE_TEXT_LIFE });
  }

  function isActive() { return active; }

  return {
    startBattle,
    isActive,
    renderBattle,
    handlePlayerAction,
  };
})();
