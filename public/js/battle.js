/* ========= BATTLE SYSTEM ========= */
const BattleSystem = (() => {
  let active = false;
  let enemy = null;
  let playerTurn = true;
  let animating = false;
  let shakeTimer = 0;
  let flashTimer = 0;
  let flashTarget = null; // 'enemy' or 'player'
  const log = [];

  const overlay = () => document.getElementById('battle-overlay');
  const logEl = () => document.getElementById('battle-log');
  const canvas = () => document.getElementById('battle-canvas');

  function startBattle(enemyType) {
    enemy = EnemyDB.create(enemyType);
    if (!enemy) return;
    active = true;
    playerTurn = true;
    animating = false;
    shakeTimer = 0;
    flashTimer = 0;
    flashTarget = null;
    log.length = 0;

    if (enemy.isBoss) {
      addLog(`⚔ BOSS: ${enemy.name} blocks the way!`);
    } else {
      addLog(`A wild ${enemy.name} appears!`);
    }

    overlay().classList.remove('hidden');
    Game.setState(GAME_STATES.BATTLE);
    renderBattle();
    setupBattleButtons();
  }

  function setupBattleButtons() {
    document.querySelectorAll('.battle-btn').forEach(btn => {
      btn.onclick = () => {
        if (!playerTurn || animating) return;
        const action = btn.dataset.action;
        handlePlayerAction(action);
      };
    });
  }

  function handlePlayerAction(action) {
    if (!active || !playerTurn || animating) return;

    switch (action) {
      case 'attack':
        playerAttack();
        break;
      case 'skill':
        playerSkillAttack();
        break;
      case 'item':
        useItemInBattle();
        break;
      case 'flee':
        attemptFlee();
        break;
    }
  }

  function playerAttack() {
    const ps = Player.getState();
    const dmg = Math.max(1, ps.attack - enemy.defense + Math.floor(Math.random() * 4));
    enemy.hp = Math.max(0, enemy.hp - dmg);
    addLog(`You deal ${dmg} damage!`);
    triggerFlash('enemy');

    if (enemy.hp <= 0) {
      victory();
    } else {
      playerTurn = false;
      setTimeout(() => enemyTurn(), 800);
    }
    renderBattle();
  }

  function playerSkillAttack() {
    const ps = Player.getState();
    if (ps.mp < 5) {
      addLog('Not enough MP!');
      renderBattle();
      return;
    }
    ps.mp -= 5;
    const dmg = Math.max(1, Math.floor(ps.attack * 1.5) - enemy.defense + Math.floor(Math.random() * 6));
    enemy.hp = Math.max(0, enemy.hp - dmg);
    addLog(`Power Strike deals ${dmg} damage!`);
    triggerFlash('enemy');

    if (enemy.hp <= 0) {
      victory();
    } else {
      playerTurn = false;
      setTimeout(() => enemyTurn(), 800);
    }
    renderBattle();
  }

  function useItemInBattle() {
    const potionEntry = Player.hasItem('potion') || Player.hasItem('hiPotion') || Player.hasItem('elixir');
    if (!potionEntry) {
      addLog('No healing items!');
      renderBattle();
      return;
    }

    const item = ItemDB.getItem(potionEntry.id);
    Player.removeItem(potionEntry.id, 1);
    item.effect(Player);
    addLog(`Used ${item.name}! HP restored.`);
    triggerFlash('player');

    playerTurn = false;
    setTimeout(() => enemyTurn(), 800);
    renderBattle();
  }

  function attemptFlee() {
    const ps = Player.getState();
    if (Math.random() < 0.4 + (ps.speed - enemy.speed) * 0.05) {
      addLog('Got away safely!');
      renderBattle();
      setTimeout(() => endBattle(), 600);
    } else {
      addLog('Cannot escape!');
      playerTurn = false;
      setTimeout(() => enemyTurn(), 800);
      renderBattle();
    }
  }

  function enemyTurn() {
    if (!active) return;

    let dmg;
    // Enemy might use skill
    if (enemy.skills.length > 0 && Math.random() < 0.3) {
      const skillId = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
      const skill = EnemyDB.getSkill(skillId);
      dmg = Player.takeDamage(Math.floor(enemy.attack * skill.multiplier));
      addLog(`${enemy.name} uses ${skill.name}! ${dmg} damage!`);
    } else {
      dmg = Player.takeDamage(enemy.attack);
      addLog(`${enemy.name} attacks! ${dmg} damage!`);
    }
    triggerFlash('player');

    const ps = Player.getState();
    if (ps.hp <= 0) {
      defeat();
    } else {
      playerTurn = true;
    }
    renderBattle();
  }

  function victory() {
    const isBoss = enemy && enemy.isBoss;
    addLog(`Defeated ${enemy.name}!`);
    addLog(`Gained ${enemy.xp} XP and ${enemy.gold} gold!`);

    const ps = Player.getState();
    ps.gold += enemy.gold;
    const levels = Player.gainXP(enemy.xp);
    if (levels.length > 0) {
      addLog(`LEVEL UP! Now level ${levels[levels.length - 1]}!`);
    }

    if (typeof QuestSystem !== 'undefined') {
      QuestSystem.checkProgress('defeat_enemy', { enemyType: enemy.type });
      if (isBoss) {
        QuestSystem.checkProgress('defeat_boss', {});
      }
    }

    renderBattle();
    setTimeout(() => {
      endBattle();
      if (typeof SaveSystem !== 'undefined') SaveSystem.autoSave();
    }, 1500);
  }

  function defeat() {
    addLog('You were defeated...');
    renderBattle();
    setTimeout(() => {
      endBattle();
      // Revive at village with half HP
      Player.getState().hp = Math.floor(Player.getState().maxHp / 2);
      Game.warpTo('village', 15, 15);
      DialogueSystem.showMessage('', 'You wake up back in the village...');
    }, 1500);
  }

  function endBattle() {
    active = false;
    enemy = null;
    overlay().classList.add('hidden');
    Game.setState(GAME_STATES.EXPLORE);
  }

  function triggerFlash(target) {
    flashTarget = target;
    flashTimer = 300;
  }

  function addLog(msg) {
    log.push(msg);
    if (log.length > 20) log.shift();
  }

  function renderBattle() {
    const c = canvas();
    if (!c) return;
    const rect = c.parentElement.getBoundingClientRect();
    c.width = rect.width;
    c.height = rect.height - 200;
    const ctx = c.getContext('2d');

    // Background
    ctx.fillStyle = '#0a0a2a';
    ctx.fillRect(0, 0, c.width, c.height);

    // Ground
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(0, c.height * 0.6, c.width, c.height * 0.4);

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

      // Enemy name
      ctx.fillStyle = '#fff';
      ctx.font = '14px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${enemy.name}  HP: ${enemy.hp}/${enemy.maxHp}`, c.width / 2, barY + barH + 18);
    }

    // Player stats in battle
    const ps = Player.getState();
    ctx.fillStyle = 'rgba(0,0,20,0.7)';
    ctx.fillRect(8, c.height - 56, 200, 48);
    ctx.strokeStyle = '#556';
    ctx.strokeRect(8, c.height - 56, 200, 48);

    if (flashTarget === 'player' && flashTimer > 0) {
      ctx.fillStyle = '#ff4444';
    } else {
      ctx.fillStyle = '#fff';
    }
    ctx.textAlign = 'left';
    ctx.font = '13px "Courier New", monospace';
    ctx.fillText(`${ps.name}  Lv.${ps.level}`, 16, c.height - 38);
    ctx.fillText(`HP: ${ps.hp}/${ps.maxHp}  MP: ${ps.mp}/${ps.maxMp}`, 16, c.height - 20);

    // Update flash timer
    if (flashTimer > 0) flashTimer -= 16;

    // Update log display
    const logDisplay = logEl();
    if (logDisplay) {
      logDisplay.innerHTML = log.slice(-3).join('<br>');
      logDisplay.scrollTop = logDisplay.scrollHeight;
    }
  }

  function isActive() { return active; }

  return { startBattle, isActive, renderBattle, handlePlayerAction };
})();
