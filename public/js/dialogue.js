/* ========= DIALOGUE SYSTEM ========= */
const DialogueSystem = (() => {
  let active = false;
  let queue = [];
  let currentLine = 0;

  const dialogues = {
    elder_intro: [
      { speaker: 'Village Elder', text: 'Welcome, young hero. I am the Elder of Echohaven.' },
      { speaker: 'Village Elder', text: 'Dark forces stir in the Shadow Cavern to the south. Monsters have been appearing in the Whispering Woods.' },
      { speaker: 'Village Elder', text: 'We need someone brave to investigate. Will you help us?' },
      { speaker: 'Village Elder', text: 'Head south through the woods. Be careful, and visit the merchant and healer before you go!' },
    ],
    merchant_intro: [
      { speaker: 'Merchant', text: 'Welcome to my shop! I sell potions and equipment.' },
      { speaker: 'Merchant', text: 'Here, take this leather armor as a gift for the hero who will save us!' },
    ],
    healer_intro: [
      { speaker: 'Healer Aria', text: 'Oh, you must be the hero the Elder spoke of!' },
      { speaker: 'Healer Aria', text: 'Let me heal your wounds. There... all better!' },
      { speaker: 'Healer Aria', text: 'Come back anytime you need healing. Stay safe out there!' },
    ],
    guard_intro: [
      { speaker: 'Guard', text: 'The path south leads to the Whispering Woods.' },
      { speaker: 'Guard', text: 'I\'ve heard strange sounds from there lately. Monsters are getting bolder.' },
      { speaker: 'Guard', text: 'Make sure you\'re well-equipped before venturing out!' },
    ],
  };

  const box = () => document.getElementById('dialogue-box');
  const speakerEl = () => document.getElementById('dialogue-speaker');
  const textEl = () => document.getElementById('dialogue-text');

  function startDialogue(id) {
    const lines = dialogues[id];
    if (!lines) return;

    queue = [...lines];
    currentLine = 0;
    active = true;
    Game.setState(GAME_STATES.DIALOGUE);
    showLine();
    box().classList.remove('hidden');

    // Special effects
    if (id === 'merchant_intro') {
      if (!Player.hasItem('leatherArmor')) {
        Player.addItem('leatherArmor', 1);
      }
    }
    if (id === 'healer_intro') {
      Player.fullHeal();
    }
  }

  function showMessage(speaker, text) {
    queue = [{ speaker, text }];
    currentLine = 0;
    active = true;
    Game.setState(GAME_STATES.DIALOGUE);
    showLine();
    box().classList.remove('hidden');
  }

  function showLine() {
    if (currentLine >= queue.length) {
      close();
      return;
    }
    const line = queue[currentLine];
    speakerEl().textContent = line.speaker;
    textEl().textContent = line.text;
  }

  function advance() {
    if (!active) return;
    currentLine++;
    if (currentLine >= queue.length) {
      close();
    } else {
      showLine();
    }
  }

  function close() {
    active = false;
    queue = [];
    currentLine = 0;
    box().classList.add('hidden');
    Game.setState(GAME_STATES.EXPLORE);
  }

  function isActive() { return active; }

  return { startDialogue, showMessage, advance, close, isActive };
})();
