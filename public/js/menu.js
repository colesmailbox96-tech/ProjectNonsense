/* ========= MENU SYSTEM ========= */
const MenuSystem = (() => {
  let activeTab = 'stats';

  const overlay = () => document.getElementById('menu-overlay');
  const content = () => document.getElementById('menu-content');

  function open() {
    activeTab = 'stats';
    overlay().classList.remove('hidden');
    Game.setState(GAME_STATES.MENU);
    renderTab();
    setupTabs();

    document.getElementById('menu-close').onclick = close;
  }

  function close() {
    overlay().classList.add('hidden');
    Game.setState(GAME_STATES.EXPLORE);
  }

  function setupTabs() {
    document.querySelectorAll('.menu-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        renderTab();
      };
    });
  }

  function renderTab() {
    const ps = Player.getState();
    const el = content();
    let html = '';

    switch (activeTab) {
      case 'stats':
        html = `
          <div class="stat-row"><span class="stat-label">Name</span><span class="stat-value">${ps.name}</span></div>
          <div class="stat-row"><span class="stat-label">Level</span><span class="stat-value">${ps.level}</span></div>
          <div class="stat-row"><span class="stat-label">XP</span><span class="stat-value">${ps.xp} / ${ps.xpToNext}</span></div>
          <div class="xp-bar-container"><div class="xp-bar-fill" style="width:${(ps.xp / ps.xpToNext * 100)}%"></div></div>
          <div class="stat-row"><span class="stat-label">HP</span><span class="stat-value">${ps.hp} / ${ps.maxHp}</span></div>
          <div class="stat-row"><span class="stat-label">MP</span><span class="stat-value">${ps.mp} / ${ps.maxMp}</span></div>
          <div class="stat-row"><span class="stat-label">Attack</span><span class="stat-value">${ps.attack}</span></div>
          <div class="stat-row"><span class="stat-label">Defense</span><span class="stat-value">${ps.defense}</span></div>
          <div class="stat-row"><span class="stat-label">Speed</span><span class="stat-value">${ps.speed}</span></div>
          <div class="stat-row"><span class="stat-label">Gold</span><span class="stat-value">${ps.gold}G</span></div>
        `;
        break;

      case 'inventory':
        if (ps.inventory.length === 0) {
          html = '<p style="color:#888; text-align:center; padding:20px;">No items</p>';
        } else {
          ps.inventory.forEach(entry => {
            const item = ItemDB.getItem(entry.id);
            if (!item) return;
            html += `
              <div class="item-row" data-item="${entry.id}">
                <div>
                  <span class="item-name">${item.name}</span>
                  <br><small style="color:#888">${item.description}</small>
                </div>
                <span class="item-qty">x${entry.qty}</span>
              </div>
            `;
          });
        }
        break;

      case 'equipment':
        const slots = [
          { key: 'weapon', label: 'Weapon' },
          { key: 'armor', label: 'Armor' },
          { key: 'accessory', label: 'Accessory' },
        ];
        slots.forEach(slot => {
          const equipped = ps[slot.key];
          const item = equipped ? ItemDB.getItem(equipped) : null;
          html += `
            <div class="equip-slot">
              <div class="equip-slot-name">${slot.label}</div>
              <div class="equip-item-name">${item ? item.name : '-- None --'}</div>
              ${item ? `<small style="color:#888">${item.description}</small>` : ''}
            </div>
          `;
        });

        // Equippable items in inventory
        const equipItems = ps.inventory.filter(e => {
          const it = ItemDB.getItem(e.id);
          return it && it.type === 'equipment';
        });
        if (equipItems.length > 0) {
          html += '<div style="margin-top:16px; color:#ffd700; font-size:0.85em;">Tap item to equip:</div>';
          equipItems.forEach(entry => {
            const item = ItemDB.getItem(entry.id);
            html += `
              <div class="item-row equip-action" data-equip="${entry.id}">
                <span class="item-name">${item.name}</span>
                <small style="color:#888">${item.description}</small>
              </div>
            `;
          });
        }
        break;

      case 'quests':
        if (typeof QuestSystem !== 'undefined') {
          const questLog = QuestSystem.getQuestLog();
          questLog.forEach(q => {
            const status = q.completed ? '✓' : q.active ? '▸' : '·';
            const color = q.completed ? '#44cc44' : q.active ? '#ffd700' : '#555';
            html += `
              <div class="stat-row" style="border-left: 3px solid ${color}; padding-left: 8px;">
                <span class="stat-label">${status} ${q.name}</span>
                <span class="stat-value" style="font-size:0.75em; color:${color}">${q.completed ? 'Done' : q.active ? 'Active' : ''}</span>
              </div>
              <div style="color:#888; font-size:0.75em; padding: 2px 0 8px 12px;">${q.description}</div>
            `;
          });
        } else {
          html = '<p style="color:#888; text-align:center; padding:20px;">No quests</p>';
        }
        break;

      case 'save':
        html = `
          <div style="text-align:center; padding:20px;">
            <button class="save-action-btn" id="menu-save-btn" style="width:100%;padding:12px;margin-bottom:12px;background:#1a3a1a;border:1px solid #44cc44;border-radius:6px;color:#44cc44;font-family:monospace;font-size:0.9em;cursor:pointer;">💾 Save Game</button>
            <button class="save-action-btn" id="menu-load-btn" style="width:100%;padding:12px;margin-bottom:12px;background:#1a1a3a;border:1px solid #4488ff;border-radius:6px;color:#4488ff;font-family:monospace;font-size:0.9em;cursor:pointer;">📂 Load Game</button>
            <button class="save-action-btn" id="menu-delete-save-btn" style="width:100%;padding:12px;background:#3a1a1a;border:1px solid #cc4444;border-radius:6px;color:#cc4444;font-family:monospace;font-size:0.9em;cursor:pointer;">🗑 Delete Save</button>
          </div>
        `;
        break;
    }

    el.innerHTML = html;

    // Bind equip actions
    el.querySelectorAll('.equip-action').forEach(row => {
      row.onclick = () => {
        Player.equip(row.dataset.equip);
        renderTab();
      };
    });

    // Bind item use (consumables in inventory tab)
    if (activeTab === 'inventory') {
      el.querySelectorAll('.item-row').forEach(row => {
        row.onclick = () => {
          const itemId = row.dataset.item;
          const item = ItemDB.getItem(itemId);
          if (item && item.type === 'consumable') {
            item.effect(Player);
            Player.removeItem(itemId, 1);
            renderTab();
          }
        };
      });
    }

    // Bind save/load actions
    if (activeTab === 'save' && typeof SaveSystem !== 'undefined') {
      const saveBtn = document.getElementById('menu-save-btn');
      const loadBtn = document.getElementById('menu-load-btn');
      const deleteBtn = document.getElementById('menu-delete-save-btn');
      if (saveBtn) saveBtn.onclick = () => { SaveSystem.save(); close(); };
      if (loadBtn) loadBtn.onclick = () => {
        if (SaveSystem.hasSave()) {
          SaveSystem.load();
          const map = MapData.getMap(Player.getState().currentMap);
          const ps = Player.getState();
          Player.setPosition(ps.x, ps.y);
          close();
        }
      };
      if (deleteBtn) deleteBtn.onclick = () => { SaveSystem.deleteSave(); renderTab(); };
    }
  }

  function isOpen() {
    return !overlay().classList.contains('hidden');
  }

  return { open, close, isOpen };
})();
