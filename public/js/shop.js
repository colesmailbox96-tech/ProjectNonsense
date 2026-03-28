/* ========= SHOP SYSTEM ========= */
const ShopSystem = (() => {
  let open = false;

  const shopItems = [
    'potion', 'hiPotion', 'antidote', 'ironSword',
    'steelSword', 'leatherArmor', 'silverArmor', 'luckyRing',
  ];

  function createOverlay() {
    if (document.getElementById('shop-overlay')) return;

    const div = document.createElement('div');
    div.id = 'shop-overlay';
    div.className = 'hidden';
    div.innerHTML = `
      <div id="shop-panel">
        <div id="shop-header">
          <span id="shop-title">⚔ Merchant Shop</span>
          <span id="shop-gold"></span>
        </div>
        <div id="shop-items"></div>
        <button id="shop-close">Close</button>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #shop-overlay {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        font-family: 'Courier New', monospace;
      }
      #shop-overlay.hidden { display: none; }
      #shop-panel {
        background: #1a1a2e;
        border: 2px solid #ffd700;
        border-radius: 8px;
        padding: 16px;
        width: 90%;
        max-width: 360px;
        max-height: 80%;
        display: flex;
        flex-direction: column;
      }
      #shop-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #ffd700;
      }
      #shop-title {
        color: #ffd700;
        font-size: 1.1em;
        font-weight: bold;
      }
      #shop-gold {
        color: #ffd700;
        font-size: 0.95em;
      }
      #shop-items {
        overflow-y: auto;
        flex: 1;
      }
      .shop-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        margin-bottom: 4px;
        background: #16213e;
        border: 1px solid #333;
        border-radius: 4px;
        cursor: pointer;
        color: #ccc;
        transition: border-color 0.15s;
      }
      .shop-item:hover { border-color: #ffd700; }
      .shop-item-info { flex: 1; }
      .shop-item-name {
        color: #eee;
        font-size: 0.9em;
      }
      .shop-item-desc {
        color: #888;
        font-size: 0.75em;
      }
      .shop-item-price {
        color: #ffd700;
        font-size: 0.85em;
        white-space: nowrap;
        margin-left: 12px;
      }
      .shop-item.too-expensive {
        opacity: 0.45;
        cursor: default;
      }
      #shop-close {
        margin-top: 12px;
        padding: 8px;
        background: #1a1a2e;
        color: #ffd700;
        border: 1px solid #ffd700;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
        cursor: pointer;
      }
      #shop-close:hover { background: #16213e; }
    `;

    document.head.appendChild(style);
    document.getElementById('game-container').appendChild(div);
  }

  function render() {
    const ps = Player.getState();
    document.getElementById('shop-gold').textContent = `Gold: ${ps.gold}G`;

    const list = document.getElementById('shop-items');
    let html = '';

    shopItems.forEach(id => {
      const item = ItemDB.getItem(id);
      if (!item) return;
      const canAfford = ps.gold >= item.buyPrice;
      html += `
        <div class="shop-item${canAfford ? '' : ' too-expensive'}" data-id="${id}">
          <div class="shop-item-info">
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-desc">${item.description}</div>
          </div>
          <div class="shop-item-price">${item.buyPrice}G</div>
        </div>
      `;
    });

    list.innerHTML = html;

    list.querySelectorAll('.shop-item').forEach(row => {
      row.onclick = () => buyItem(row.dataset.id);
    });
  }

  function buyItem(id) {
    const ps = Player.getState();
    const item = ItemDB.getItem(id);
    if (!item) return;
    if (ps.gold < item.buyPrice) return;

    ps.gold -= item.buyPrice;
    Player.addItem(id, 1);
    render();
    showPurchaseToast(`Bought ${item.name}!`);
  }

  function showPurchaseToast(msg) {
    let toast = document.getElementById('shop-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'shop-toast';
      Object.assign(toast.style, {
        position: 'absolute',
        bottom: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.85)',
        color: '#44cc44',
        padding: '8px 18px',
        borderRadius: '6px',
        fontFamily: 'monospace',
        fontSize: '13px',
        zIndex: '200',
        opacity: '0',
        transition: 'opacity 0.3s',
        pointerEvents: 'none',
      });
      document.getElementById('game-container').appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 1200);
  }

  function openShop() {
    createOverlay();
    open = true;
    document.getElementById('shop-overlay').classList.remove('hidden');
    Game.setState(GAME_STATES.MENU);
    render();
    document.getElementById('shop-close').onclick = closeShop;
  }

  function closeShop() {
    open = false;
    document.getElementById('shop-overlay').classList.add('hidden');
    Game.setState(GAME_STATES.EXPLORE);
  }

  function isOpen() {
    return open;
  }

  return { open: openShop, close: closeShop, isOpen };
})();
