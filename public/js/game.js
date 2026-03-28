/* ========= MAIN GAME ENGINE ========= */
const Game = (() => {
  let canvas, ctx;
  let gameState = GAME_STATES.TITLE;
  let lastTime = 0;
  let moveTimer = 0;
  const MOVE_INTERVAL = 150; // ms between moves when holding direction
  let transitionAlpha = 0;
  let transitionCallback = null;
  let bossDefeated = false;

  function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => {
      setTimeout(resizeCanvas, 100);
    });

    Input.init();

    // Title screen
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', startGame);
    startBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startGame();
    }, { passive: false });

    // Show "Continue" on title if save exists
    if (typeof SaveSystem !== 'undefined' && SaveSystem.hasSave()) {
      startBtn.textContent = 'Tap to Continue';
    }
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function startGame() {
    document.getElementById('title-screen').classList.add('hidden');
    gameState = GAME_STATES.EXPLORE;

    // Reset play time tracker
    if (typeof VictoryScreen !== 'undefined') VictoryScreen.resetTimer();

    // Try loading save
    if (typeof SaveSystem !== 'undefined' && SaveSystem.hasSave()) {
      SaveSystem.load();
      const ps = Player.getState();
      Player.setPosition(ps.x, ps.y);
      bossDefeated = false;
      const map = MapData.getMap(ps.currentMap);
      Camera.snapTo(
        ps.x, ps.y,
        canvas.width / (window.devicePixelRatio || 1),
        canvas.height / (window.devicePixelRatio || 1),
        map.width, map.height
      );
      // Start map music
      if (typeof AudioSystem !== 'undefined') AudioSystem.playMapMusic(ps.currentMap);
    } else {
      const map = MapData.getMap('village');
      Player.setPosition(map.playerStart.x, map.playerStart.y);
      Camera.snapTo(
        map.playerStart.x, map.playerStart.y,
        canvas.width / (window.devicePixelRatio || 1),
        canvas.height / (window.devicePixelRatio || 1),
        map.width, map.height
      );
      // Start village music
      if (typeof AudioSystem !== 'undefined') AudioSystem.playMapMusic('village');
    }

    requestAnimationFrame(gameLoop);
  }

  function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
  }

  function update(dt) {
    if (gameState === GAME_STATES.TRANSITION) {
      updateTransition(dt);
      return;
    }

    if (typeof Particles !== 'undefined') Particles.update(dt);
    if (typeof WeatherSystem !== 'undefined') WeatherSystem.update(dt);

    if (gameState === GAME_STATES.EXPLORE) {
      // Handle movement
      const dir = Input.getDirection();
      if (dir) {
        moveTimer += dt;
        if (moveTimer >= MOVE_INTERVAL || !Player.getState().moving) {
          if (!Player.getState().moving) {
            Player.tryMove(dir);
            moveTimer = 0;
          }
        }
      } else {
        moveTimer = MOVE_INTERVAL; // Allow immediate move on next press
      }

      Player.update(dt);
      Renderer.updateAnimation(dt);

      const ps = Player.getState();
      const map = MapData.getMap(ps.currentMap);
      const pos = Player.getRenderPos();
      const displayW = canvas.width / (window.devicePixelRatio || 1);
      const displayH = canvas.height / (window.devicePixelRatio || 1);
      Camera.update(pos.x, pos.y, displayW, displayH, map.width, map.height);

      // Check for boss encounter in dungeon
      checkBossEncounter();
    }
  }

  function checkBossEncounter() {
    if (bossDefeated) return;
    const ps = Player.getState();
    const map = MapData.getMap(ps.currentMap);
    if (map.bossSpawn && ps.x === map.bossSpawn.x && ps.y === map.bossSpawn.y) {
      bossDefeated = true;
      BattleSystem.startBattle('shadowLord');
    }
  }

  function render() {
    const displayW = canvas.width / (window.devicePixelRatio || 1);
    const displayH = canvas.height / (window.devicePixelRatio || 1);

    // Clear
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, displayW, displayH);

    if (gameState === GAME_STATES.BATTLE) return; // Battle has its own canvas

    const camX = Camera.getX();
    const camY = Camera.getY();

    // Render map layers
    Renderer.renderMap(ctx, camX, camY, displayW, displayH);
    Renderer.renderNPCs(ctx, camX, camY);
    Renderer.renderPlayer(ctx, camX, camY);

    // Particles
    if (typeof Particles !== 'undefined') Particles.render(ctx);

    // HUD
    HUD.render(ctx, displayW);

    // Minimap
    if (typeof Minimap !== 'undefined') Minimap.render(ctx, displayW, displayH);

    // Weather & Day-Night overlay
    if (typeof WeatherSystem !== 'undefined') WeatherSystem.renderOverlay(ctx, displayW, displayH);

    // Transition overlay
    if (transitionAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${transitionAlpha})`;
      ctx.fillRect(0, 0, displayW, displayH);
    }
  }

  function warpTo(mapName, x, y) {
    transitionAlpha = 0;
    transitionCallback = () => {
      const ps = Player.getState();
      ps.currentMap = mapName;
      Player.setPosition(x, y);
      const map = MapData.getMap(mapName);
      const displayW = canvas.width / (window.devicePixelRatio || 1);
      const displayH = canvas.height / (window.devicePixelRatio || 1);
      Camera.snapTo(x, y, displayW, displayH, map.width, map.height);

      // Play map music
      if (typeof AudioSystem !== 'undefined') AudioSystem.playMapMusic(mapName);

      // Quest progress on map enter
      if (typeof QuestSystem !== 'undefined') {
        QuestSystem.checkProgress('enter_map', { mapName: map.name });

        // Check if final quest completed
        const active = QuestSystem.getActiveQuest();
        if (!active) {
          const log = QuestSystem.getQuestLog();
          const allDone = log.every(q => q.completed);
          if (allDone && typeof VictoryScreen !== 'undefined') {
            setTimeout(() => VictoryScreen.show(), 500);
          }
        }
      }

      // Auto-save on map change
      if (typeof SaveSystem !== 'undefined') SaveSystem.autoSave();
    };
    gameState = GAME_STATES.TRANSITION;
  }

  let transitionPhase = 'fadeOut';
  function updateTransition(dt) {
    if (transitionPhase === 'fadeOut') {
      transitionAlpha += dt / 500;
      if (transitionAlpha >= 1) {
        transitionAlpha = 1;
        if (transitionCallback) {
          transitionCallback();
          transitionCallback = null;
        }
        transitionPhase = 'fadeIn';
      }
    } else {
      transitionAlpha -= dt / 500;
      if (transitionAlpha <= 0) {
        transitionAlpha = 0;
        transitionPhase = 'fadeOut';
        gameState = GAME_STATES.EXPLORE;
      }
    }
    render();
  }

  function setState(s) { gameState = s; }
  function getState() { return gameState; }
  function setBossDefeated(val) { bossDefeated = val; }

  // Initialize on load
  window.addEventListener('DOMContentLoaded', init);

  return { init, setState, getState, warpTo, setBossDefeated };
})();
