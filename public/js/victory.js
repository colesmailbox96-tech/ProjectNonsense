/* ========= VICTORY SCREEN ========= */
const VictoryScreen = (() => {
  let created = false;
  let startTime = Date.now();

  function resetTimer() {
    startTime = Date.now();
  }

  function getPlayTime() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hrs = Math.floor(elapsed / 3600);
    const mins = Math.floor((elapsed % 3600) / 60);
    const secs = elapsed % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return hrs > 0
      ? `${hrs}:${pad(mins)}:${pad(secs)}`
      : `${pad(mins)}:${pad(secs)}`;
  }

  function createOverlay() {
    if (created) return;
    created = true;

    const style = document.createElement('style');
    style.textContent = `
      #victory-overlay {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,20,0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 200;
        overflow: hidden;
      }
      #victory-overlay.hidden { display: none; }

      /* Sparkle field */
      #victory-stars {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
      }
      .victory-star {
        position: absolute;
        width: 4px; height: 4px;
        background: #ffd700;
        border-radius: 50%;
        animation: starTwinkle 2s ease-in-out infinite;
        box-shadow: 0 0 6px 1px rgba(255,215,0,0.6);
      }
      @keyframes starTwinkle {
        0%, 100% { opacity: 0.2; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.4); }
      }
      @keyframes starDrift {
        0% { transform: translateY(0); }
        100% { transform: translateY(-30px); }
      }

      /* Panel */
      #victory-panel {
        position: relative;
        text-align: center;
        font-family: monospace;
        color: #e0e0e0;
        max-width: 360px;
        width: 90%;
        z-index: 1;
        animation: victoryFadeIn 0.8s ease-out;
      }
      @keyframes victoryFadeIn {
        0% { opacity: 0; transform: translateY(24px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      /* Title */
      #victory-title {
        font-size: 26px;
        color: #ffd700;
        text-shadow: 0 0 20px rgba(255,215,0,0.5), 2px 2px 0 #8b6914;
        margin-bottom: 6px;
        animation: victoryGlow 2s ease-in-out infinite;
      }
      @keyframes victoryGlow {
        0%, 100% { text-shadow: 0 0 20px rgba(255,215,0,0.5), 2px 2px 0 #8b6914; }
        50% { text-shadow: 0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.3), 2px 2px 0 #8b6914; }
      }
      #victory-subtitle {
        font-size: 13px;
        color: #b8a040;
        margin-bottom: 22px;
      }

      /* Stats */
      #victory-stats {
        background: rgba(255,215,0,0.06);
        border: 1px solid rgba(255,215,0,0.25);
        border-radius: 6px;
        padding: 14px 18px;
        margin-bottom: 22px;
        text-align: left;
      }
      #victory-stats h3 {
        color: #ffd700;
        font-size: 14px;
        margin: 0 0 10px 0;
        text-align: center;
        border-bottom: 1px solid rgba(255,215,0,0.2);
        padding-bottom: 8px;
      }
      .victory-stat-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        font-size: 13px;
      }
      .victory-stat-label { color: #a0a0b8; }
      .victory-stat-value { color: #ffd700; }

      /* Buttons */
      .victory-btn {
        display: block;
        width: 100%;
        padding: 10px 0;
        margin-bottom: 10px;
        background: transparent;
        color: #ffd700;
        border: 2px solid #ffd700;
        border-radius: 4px;
        font-family: monospace;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }
      .victory-btn:hover,
      .victory-btn:active {
        background: rgba(255,215,0,0.15);
      }
      .victory-btn-secondary {
        color: #a0a0b8;
        border-color: #a0a0b8;
      }
      .victory-btn-secondary:hover,
      .victory-btn-secondary:active {
        color: #ffd700;
        border-color: #ffd700;
        background: rgba(255,215,0,0.08);
      }
    `;
    document.head.appendChild(style);

    const div = document.createElement('div');
    div.id = 'victory-overlay';
    div.className = 'hidden';
    const container = document.getElementById('game-container');
    if (!container) return;
    container.appendChild(div);
  }

  function buildStars() {
    let html = '<div id="victory-stars">';
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = 2 + Math.random() * 3;
      const delay = (Math.random() * 3).toFixed(2);
      const dur = (1.5 + Math.random() * 2).toFixed(2);
      html += `<div class="victory-star" style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${dur}s"></div>`;
    }
    html += '</div>';
    return html;
  }

  function show() {
    createOverlay();
    const el = document.getElementById('victory-overlay');
    const ps = Player.getState();
    const playTime = getPlayTime();

    const questLog = QuestSystem.getQuestLog();
    const completed = questLog.filter((q) => q.completed).length;

    el.innerHTML =
      buildStars() +
      `<div id="victory-panel">
        <div id="victory-title">\u2728 Congratulations! \u2728</div>
        <div id="victory-subtitle">You have become the Hero of Echohaven</div>

        <div id="victory-stats">
          <h3>\u2694 Final Stats</h3>
          <div class="victory-stat-row">
            <span class="victory-stat-label">Level</span>
            <span class="victory-stat-value">${ps.level}</span>
          </div>
          <div class="victory-stat-row">
            <span class="victory-stat-label">HP</span>
            <span class="victory-stat-value">${ps.hp} / ${ps.maxHp}</span>
          </div>
          <div class="victory-stat-row">
            <span class="victory-stat-label">Attack</span>
            <span class="victory-stat-value">${ps.attack}</span>
          </div>
          <div class="victory-stat-row">
            <span class="victory-stat-label">Defense</span>
            <span class="victory-stat-value">${ps.defense}</span>
          </div>
          <div class="victory-stat-row">
            <span class="victory-stat-label">Gold</span>
            <span class="victory-stat-value">${ps.gold}G</span>
          </div>
          <div class="victory-stat-row">
            <span class="victory-stat-label">Quests Completed</span>
            <span class="victory-stat-value">${completed} / ${questLog.length}</span>
          </div>
          <div class="victory-stat-row">
            <span class="victory-stat-label">Play Time</span>
            <span class="victory-stat-value">${playTime}</span>
          </div>
        </div>

        <button class="victory-btn" id="victory-newgame-btn">\u2605 New Game+</button>
        <button class="victory-btn victory-btn-secondary" id="victory-title-btn">Return to Title</button>
      </div>`;

    el.classList.remove('hidden');

    document.getElementById('victory-newgame-btn').onclick = handleNewGamePlus;
    document.getElementById('victory-title-btn').onclick = handleReturnToTitle;
  }

  function hide() {
    if (!created) return;
    document.getElementById('victory-overlay').classList.add('hidden');
  }

  function buildFreshQuests() {
    return QuestSystem.getQuestLog().map((q) => {
      const entry = { id: q.id, completed: false, active: q.id === 'elder_request' };
      if (q.progress) {
        entry.progress = Object.fromEntries(
          Object.keys(q.progress).map((k) => [k, typeof q.progress[k] === 'boolean' ? false : 0])
        );
      }
      return entry;
    });
  }

  function handleNewGamePlus() {
    QuestSystem.loadState(buildFreshQuests());
    resetTimer();

    hide();
    Game.setBossDefeated(false);
    Game.setState(GAME_STATES.EXPLORE);
  }

  function handleReturnToTitle() {
    hide();
    Game.setState(GAME_STATES.TITLE);
  }

  return { show, hide, resetTimer };
})();
