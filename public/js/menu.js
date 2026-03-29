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

      case 'skills':
        if (typeof SkillDB !== 'undefined') {
          const ps2 = Player.getState();
          const learned = SkillDB.getLearnedSkills(ps2.level);
          if (learned.length === 0) {
            html = '<p style="color:#888; text-align:center; padding:20px;">No skills yet</p>';
          } else {
            learned.forEach(s => {
              html += `
                <div class="stat-row" style="border-left: 3px solid #4488ff; padding-left: 8px;">
                  <span class="stat-label">${s.name}</span>
                  <span class="stat-value" style="font-size:0.75em; color:#4488ff">${s.mpCost} MP</span>
                </div>
                <div style="color:#888; font-size:0.75em; padding: 2px 0 8px 12px;">${s.description}</div>
              `;
            });
          }
          // Show next skill to learn
          const allSkills = SkillDB.getLearnedSkills(99);
          const nextSkill = allSkills.find(s => s.unlockLevel > ps2.level);
          if (nextSkill) {
            html += `<div style="color:#555; font-size:0.75em; padding:12px 0 0; text-align:center;">Next: ${nextSkill.name} at Lv.${nextSkill.unlockLevel}</div>`;
          }
        } else {
          html = '<p style="color:#888; text-align:center; padding:20px;">No skills</p>';
        }
        break;

      case 'save':
        html = `
          <div style="text-align:center; padding:20px;">
            <button class="save-action-btn" id="menu-save-btn" style="width:100%;padding:12px;margin-bottom:12px;background:#1a3a1a;border:1px solid #44cc44;border-radius:6px;color:#44cc44;font-family:monospace;font-size:0.9em;cursor:pointer;">💾 Save Game</button>
            <button class="save-action-btn" id="menu-load-btn" style="width:100%;padding:12px;margin-bottom:12px;background:#1a1a3a;border:1px solid #4488ff;border-radius:6px;color:#4488ff;font-family:monospace;font-size:0.9em;cursor:pointer;">📂 Load Game</button>
            <button class="save-action-btn" id="menu-delete-save-btn" style="width:100%;padding:12px;margin-bottom:16px;background:#3a1a1a;border:1px solid #cc4444;border-radius:6px;color:#cc4444;font-family:monospace;font-size:0.9em;cursor:pointer;">🗑 Delete Save</button>
          </div>
        `;
        if (typeof AudioSystem !== 'undefined') {
          const muted = AudioSystem.isMuted();
          const musicVol = Math.round(AudioSystem.getMusicVolume() * 100);
          const sfxVol = Math.round(AudioSystem.getSFXVolume() * 100);
          html += `
            <div style="border-top:1px solid #333; padding-top:12px;">
              <div class="stat-row"><span class="stat-label">🔊 Audio</span><span class="stat-value"><button id="mute-toggle-btn" style="background:none;border:1px solid #888;color:#ddd;border-radius:4px;padding:4px 10px;font-family:monospace;font-size:0.8em;cursor:pointer;">${muted ? 'Unmute' : 'Mute'}</button></span></div>
              <div class="stat-row" style="margin-top:8px;">
                <span class="stat-label" style="font-size:0.8em;">🎵 Music</span>
                <span class="stat-value" style="display:flex;align-items:center;gap:6px;">
                  <input type="range" id="music-vol-slider" min="0" max="100" value="${musicVol}" style="width:90px;cursor:pointer;" />
                  <span id="music-vol-label" style="font-size:0.75em;color:#aaa;min-width:28px;">${musicVol}%</span>
                </span>
              </div>
              <div class="stat-row" style="margin-top:4px;">
                <span class="stat-label" style="font-size:0.8em;">🔔 SFX</span>
                <span class="stat-value" style="display:flex;align-items:center;gap:6px;">
                  <input type="range" id="sfx-vol-slider" min="0" max="100" value="${sfxVol}" style="width:90px;cursor:pointer;" />
                  <span id="sfx-vol-label" style="font-size:0.75em;color:#aaa;min-width:28px;">${sfxVol}%</span>
                </span>
              </div>
            </div>
          `;
        }
        break;

      case 'bestiary':
        if (typeof Bestiary !== 'undefined') {
          const allEnemyTypes = ['slime', 'goblin', 'skeleton', 'darkKnight', 'shadowLord', 'wraith', 'stoneGolem', 'ancientGuardian'];
          const discovered = Bestiary.getDiscoveredCount();
          html += `<div style="color:#ff8844; font-size:0.8em; text-align:center; margin-bottom:10px;">Discovered: ${discovered} / ${allEnemyTypes.length}</div>`;
          allEnemyTypes.forEach(type => {
            const entry = Bestiary.getEntry(type);
            const template = EnemyDB.create(type);
            if (entry && entry.seen) {
              const dropsStr = (template.drops || []).map(d => {
                const it = ItemDB.getItem(d.id);
                return it ? `${it.name} (${Math.round(d.chance * 100)}%)` : d.id;
              }).join(', ');
              html += `
                <div class="stat-row" style="border-left: 3px solid #ff8844; padding-left: 8px;">
                  <span class="stat-label">${template.name}</span>
                  <span class="stat-value" style="font-size:0.75em; color:#ff8844">×${entry.defeated}</span>
                </div>
                <div style="color:#888; font-size:0.7em; padding: 2px 0 2px 12px;">HP: ${template.maxHp} | ATK: ${template.attack} | DEF: ${template.defense}</div>
                ${dropsStr ? `<div style="color:#aaa; font-size:0.7em; padding: 0 0 8px 12px;">Drops: ${dropsStr}</div>` : '<div style="padding-bottom:8px;"></div>'}
              `;
            } else {
              html += `
                <div class="stat-row" style="border-left: 3px solid #333; padding-left: 8px; opacity: 0.4;">
                  <span class="stat-label">???</span>
                  <span class="stat-value" style="font-size:0.75em; color:#555">Not discovered</span>
                </div>
                <div style="padding-bottom:8px;"></div>
              `;
            }
          });
        } else {
          html = '<p style="color:#888; text-align:center; padding:20px;">No bestiary</p>';
        }
        break;

      case 'crafting':
        if (typeof CraftingSystem !== 'undefined') {
          const allRecipes = CraftingSystem.getRecipes();
          html += `<div style="color:#44ddaa; font-size:0.8em; text-align:center; margin-bottom:10px;">\u{1F528} Crafting Recipes</div>`;
          allRecipes.forEach(recipe => {
            const craftable = CraftingSystem.canCraft(recipe.id);
            const ingredientStr = recipe.ingredients.map(ing => {
              const it = ItemDB.getItem(ing.id);
              const held = Player.hasItem(ing.id);
              const heldQty = held ? held.qty : 0;
              const color = heldQty >= ing.qty ? '#44cc44' : '#cc4444';
              return `<span style="color:${color}">${it ? it.name : ing.id} ${heldQty}/${ing.qty}</span>`;
            }).join(' + ');
            const resultItem = ItemDB.getItem(recipe.result.id);
            html += `
              <div class="item-row craft-row${craftable ? '' : ' craft-disabled'}" data-recipe="${recipe.id}" style="cursor:${craftable ? 'pointer' : 'default'}; opacity:${craftable ? '1' : '0.6'}; border-left: 3px solid ${craftable ? '#44ddaa' : '#555'}; padding-left: 8px; margin-bottom: 6px;">
                <div>
                  <div class="item-name" style="color:${craftable ? '#44ddaa' : '#888'}">${resultItem ? resultItem.name : recipe.name}</div>
                  <div style="font-size:0.7em; color:#888; margin-top:2px;">${ingredientStr}</div>
                </div>
                <span style="font-size:0.75em; color:${craftable ? '#44ddaa' : '#555'}">${craftable ? 'CRAFT' : '\u{2014}'}</span>
              </div>
            `;
          });
        } else {
          html = '<p style="color:#888; text-align:center; padding:20px;">No crafting</p>';
        }
        break;

      case 'achievements':
        if (typeof Achievements !== 'undefined') {
          const defs = Achievements.getDefinitions();
          const count = Achievements.getUnlockedCount();
          const total = Achievements.getTotalCount();
          html += `<div style="color:#ffaa00; font-size:0.8em; text-align:center; margin-bottom:10px;">\u{1F3C6} Achievements: ${count} / ${total}</div>`;
          defs.forEach(def => {
            const done = Achievements.isUnlocked(def.id);
            const borderColor = done ? '#ffaa00' : '#333';
            const opacity = done ? '1' : '0.5';
            html += `
              <div class="stat-row" style="border-left: 3px solid ${borderColor}; padding-left: 8px; opacity: ${opacity};">
                <span class="stat-label">${def.icon} ${def.name}</span>
                <span class="stat-value" style="font-size:0.75em; color:${done ? '#ffaa00' : '#555'}">${done ? '\u2713' : '\u{1F512}'}</span>
              </div>
              <div style="color:#888; font-size:0.7em; padding: 2px 0 8px 12px;">${def.description}</div>
            `;
          });
        } else {
          html = '<p style="color:#888; text-align:center; padding:20px;">No achievements</p>';
        }
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

    // Bind mute toggle and volume sliders
    if (activeTab === 'save' && typeof AudioSystem !== 'undefined') {
      const muteBtn = document.getElementById('mute-toggle-btn');
      if (muteBtn) muteBtn.onclick = () => { AudioSystem.toggleMute(); renderTab(); };

      const musicSlider = document.getElementById('music-vol-slider');
      const musicLabel = document.getElementById('music-vol-label');
      if (musicSlider) {
        musicSlider.oninput = () => {
          const v = musicSlider.value / 100;
          AudioSystem.setMusicVolume(v);
          if (musicLabel) musicLabel.textContent = `${musicSlider.value}%`;
        };
      }

      const sfxSlider = document.getElementById('sfx-vol-slider');
      const sfxLabel = document.getElementById('sfx-vol-label');
      if (sfxSlider) {
        sfxSlider.oninput = () => {
          const v = sfxSlider.value / 100;
          AudioSystem.setSFXVolume(v);
          if (sfxLabel) sfxLabel.textContent = `${sfxSlider.value}%`;
        };
      }
    }

    // Bind crafting actions
    if (activeTab === 'crafting' && typeof CraftingSystem !== 'undefined') {
      el.querySelectorAll('.craft-row:not(.craft-disabled)').forEach(row => {
        row.onclick = () => {
          const recipeId = row.dataset.recipe;
          if (CraftingSystem.craft(recipeId)) {
            renderTab();
          }
        };
      });
    }
  }

  function isOpen() {
    return !overlay().classList.contains('hidden');
  }

  return { open, close, isOpen };
})();
