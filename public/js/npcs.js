/* ========= NPC SYSTEM ========= */
const NPCSystem = (() => {
  function getNPCAt(map, x, y) {
    return map.npcs.find(n => n.x === x && n.y === y);
  }

  function interactFacing() {
    const ps = Player.getState();
    const off = DIR_OFFSETS[ps.dir];
    const tx = ps.x + off.x;
    const ty = ps.y + off.y;
    const map = MapData.getMap(ps.currentMap);

    // Check NPC
    const npc = getNPCAt(map, tx, ty);
    if (npc) {
      DialogueSystem.startDialogue(npc.dialogue);
      return true;
    }

    // Check sign
    if (map.tiles[ty] && map.tiles[ty][tx] === TILE_TYPES.SIGN) {
      DialogueSystem.showMessage('Sign', 'Southern exit leads to the Whispering Woods.\nBeware of monsters!');
      return true;
    }

    // Check chest
    const chest = map.chests.find(c => c.x === tx && c.y === ty && !c.opened);
    if (chest) {
      chest.opened = true;
      const item = ItemDB.getItem(chest.item);
      Player.addItem(chest.item, 1);
      DialogueSystem.showMessage('Chest', `Found ${item.name}!`);
      return true;
    }

    return false;
  }

  return { getNPCAt, interactFacing };
})();
