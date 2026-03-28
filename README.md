# Realm of Echoes — A Pixel RPG

A browser-based pixel RPG game built with HTML5 Canvas, fully optimized for mobile play.

## Quick Start

```bash
npm install
npm start
```

Then open `http://localhost:3000` in your browser (Safari, Chrome, etc.).

## Features

- **Tile-based exploration** across 3 unique maps: Echohaven Village, Whispering Woods, and Shadow Cavern
- **Turn-based combat** with attack, skills, items, and flee options
- **Boss fight** — face the Shadow Lord in the depths of the Shadow Cavern
- **Quest system** — 7-part story chain tracking your journey from village to boss
- **Character progression** — gain XP, level up, increase stats
- **NPC dialogue system** — talk to the Village Elder, Merchant, Healer, and Guard
- **Merchant shop** — buy potions, weapons, and armor from the Merchant
- **Inventory & equipment** — collect items, equip weapons and armor
- **Treasure chests** hidden across every map
- **Save/Load system** — auto-saves on map transitions and victories; manual save from menu
- **Minimap** — see the full map layout in the corner during exploration
- **Particle effects** — visual feedback for damage, healing, and leveling
- **Victory screen** — complete the quest chain to become the Hero of Echohaven
- **Mobile-first touch controls** — virtual D-pad + action buttons, safe-area support for notched phones
- **Keyboard support** — arrow keys / WASD + Z/X/M for desktop play
- **Pixel art** — all sprites and tiles are procedurally generated

## Controls

| Action | Mobile | Keyboard |
|--------|--------|----------|
| Move | D-pad (bottom-left) | Arrow keys / WASD |
| Interact / Confirm | A button | Z / Enter / Space |
| Attack / Interact | B button | X |
| Open Menu | ☰ button | M / Escape |

## Quest Chain

1. **The Elder's Request** — Speak with the Village Elder
2. **Prepare for Journey** — Visit the Merchant and Healer
3. **Enter the Woods** — Travel to the Whispering Woods
4. **Forest Exploration** — Defeat 3 enemies in the forest
5. **Into the Darkness** — Enter the Shadow Cavern
6. **Defeat the Shadow Lord** — Defeat the boss
7. **Hero of Echohaven** — Return to the village

## Tech Stack

- Pure HTML5 / CSS3 / JavaScript (no frameworks)
- Node.js + Express for serving
- HTML5 Canvas API for rendering