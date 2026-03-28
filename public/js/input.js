/* ========= INPUT HANDLING (Mobile + Keyboard) ========= */
const Input = (() => {
  const held = { up: false, down: false, left: false, right: false };
  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;

    // ---- Keyboard ----
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':    case 'w': held.up = true; e.preventDefault(); break;
        case 'ArrowDown':  case 's': held.down = true; e.preventDefault(); break;
        case 'ArrowLeft':  case 'a': held.left = true; e.preventDefault(); break;
        case 'ArrowRight': case 'd': held.right = true; e.preventDefault(); break;
        case ' ': case 'Enter': case 'z': handleAction(); e.preventDefault(); break;
        case 'x': handleAttack(); e.preventDefault(); break;
        case 'Escape': case 'm': handleMenu(); e.preventDefault(); break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'ArrowUp':    case 'w': held.up = false; break;
        case 'ArrowDown':  case 's': held.down = false; break;
        case 'ArrowLeft':  case 'a': held.left = false; break;
        case 'ArrowRight': case 'd': held.right = false; break;
      }
    });

    // ---- D-Pad touch ----
    const dpadBtns = document.querySelectorAll('.dpad-btn');
    dpadBtns.forEach(btn => {
      const dir = btn.dataset.dir;

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        held[dir] = true;
      }, { passive: false });

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        held[dir] = false;
      }, { passive: false });

      btn.addEventListener('touchcancel', (e) => {
        held[dir] = false;
      });

      // Mouse fallback
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        held[dir] = true;
      });

      btn.addEventListener('mouseup', (e) => {
        held[dir] = false;
      });

      btn.addEventListener('mouseleave', (e) => {
        held[dir] = false;
      });
    });

    // ---- Action buttons ----
    const btnAction = document.getElementById('btn-action');
    const btnAttack = document.getElementById('btn-attack');
    const btnMenu = document.getElementById('btn-menu');

    function addTouchAndClick(el, fn) {
      el.addEventListener('touchstart', (e) => { e.preventDefault(); fn(); }, { passive: false });
      el.addEventListener('click', fn);
    }

    addTouchAndClick(btnAction, handleAction);
    addTouchAndClick(btnAttack, handleAttack);
    addTouchAndClick(btnMenu, handleMenu);

    // ---- Dialogue tap to advance ----
    const dialogueBox = document.getElementById('dialogue-box');
    addTouchAndClick(dialogueBox, () => {
      if (DialogueSystem.isActive()) {
        DialogueSystem.advance();
      }
    });
  }

  function handleAction() {
    const state = Game.getState();
    if (state === GAME_STATES.DIALOGUE) {
      DialogueSystem.advance();
    } else if (state === GAME_STATES.EXPLORE) {
      NPCSystem.interactFacing();
    }
  }

  function handleAttack() {
    const state = Game.getState();
    if (state === GAME_STATES.EXPLORE) {
      // Attack in explore mode - interact too
      NPCSystem.interactFacing();
    }
  }

  function handleMenu() {
    const state = Game.getState();
    if (state === GAME_STATES.EXPLORE) {
      MenuSystem.open();
    } else if (state === GAME_STATES.MENU) {
      MenuSystem.close();
    }
  }

  function getHeld() { return held; }

  function getDirection() {
    if (held.up) return 'up';
    if (held.down) return 'down';
    if (held.left) return 'left';
    if (held.right) return 'right';
    return null;
  }

  return { init, getHeld, getDirection };
})();
