# Realm of Echoes — A Pixel RPG

A browser-based pixel RPG game built with HTML5 Canvas, fully optimized for mobile play.

## Quick Start

```bash
npm install
npm start
```

Then open `http://localhost:3000` in your browser (Safari, Chrome, etc.).

## Features

- **Tile-based exploration** across 10 unique maps: Echohaven Village, Whispering Woods, Shadow Cavern, Ancient Ruins, Frozen Peaks, Celestial Sanctum, Abyssal Depths, Volcanic Forge, Ethereal Gardens, and Twilight Citadel
- **Turn-based combat** with attack, skills, items, and flee options
- **Skill system** — learn 6 unique skills as you level up (Power Strike, Heal, Flame Strike, Shield Bash, Warding Light, Holy Smite)
- **Talent system** — 3 talent paths (Might, Arcane, Survival) with 4 tiers each
- **Status effects** — poison, stun, ATK/DEF buffs affect both player and enemies in combat
- **Critical hits** — SPD-based crit chance with 1.5x damage multiplier
- **8 Boss fights** — Shadow Lord, Ancient Guardian, Crystal Drake, Celestial Wyrm, Chaos Dragon, Inferno Titan, Eternal Phoenix, and Void Emperor
- **Quest system** — 21-part story chain tracking your journey across all areas
- **Character progression** — gain XP, level up, increase stats, unlock new skills
- **NPC dialogue system** — talk to the Village Elder, Merchant, Healer, and Guard
- **Merchant shop** — buy potions, ethers, weapons, armor, and accessories
- **Inventory & equipment** — collect items, equip weapons, armor, and accessories with real stat effects
- **Crafting system** — 29 recipes to forge equipment and brew consumables from enemy drops
- **Treasure chests** hidden across every map
- **Bestiary** — track all 26 enemy types you've encountered
- **36 Achievements** — unlock rewards for combat, crafting, exploration, and more
- **Save/Load system** — auto-saves on map transitions and victories; manual save from menu
- **Minimap** — see the full map layout in the corner during exploration
- **Particle effects** — visual feedback for damage, healing, and leveling
- **Procedural chiptune audio** — background music for each map and battle, plus sound effects
- **Weather & day/night cycle** — rain, fog, storms, and time-of-day lighting
- **Screen shake** — visual impact on critical hits and heavy damage
- **Victory screen** — complete the quest chain to become the Legend of Echohaven
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

## Maps

| # | Name | Size | Enemies | Boss |
|---|------|------|---------|------|
| 1 | Echohaven Village | 30×25 | None | — |
| 2 | Whispering Woods | 30×30 | Green Slime, Forest Goblin | — |
| 3 | Shadow Cavern | 20×20 | Skeleton Warrior, Dark Knight | Shadow Lord |
| 4 | Ancient Ruins | 25×25 | Wraith, Stone Golem | Ancient Guardian |
| 5 | Frozen Peaks | 30×25 | Frost Wolf, Ice Elemental | Crystal Drake |
| 6 | Celestial Sanctum | 25×20 | Storm Hawk, Thunder Golem | Celestial Wyrm |
| 7 | Abyssal Depths | 20×20 | Void Wraith, Abyssal Knight | Chaos Dragon |
| 8 | Volcanic Forge | 22×20 | Magma Elemental, Forge Sentinel | Inferno Titan |
| 9 | Ethereal Gardens | 24×22 | Fae Guardian, Crystal Golem | Eternal Phoenix |
| 10 | Twilight Citadel | 25×20 | Twilight Sentinel, Shadow Mage | Void Emperor |

## Quest Chain

1. **The Elder's Request** — Speak with the Village Elder
2. **Prepare for Journey** — Visit the Merchant and Healer
3. **Enter the Woods** — Travel to the Whispering Woods
4. **Forest Exploration** — Defeat 3 enemies in the forest
5. **Into the Darkness** — Enter the Shadow Cavern
6. **Defeat the Shadow Lord** — Defeat the boss
7. **Explore the Ruins** — Enter the Ancient Ruins
8. **Defeat the Ancient Guardian** — Defeat the ruins boss
9. **Brave the Peaks** — Enter the Frozen Peaks
10. **Defeat the Crystal Drake** — Defeat the peaks boss
11. **Reach the Sanctum** — Enter the Celestial Sanctum
12. **Defeat the Celestial Wyrm** — Defeat the final boss
13. **Descend to the Abyss** — Enter the Abyssal Depths
14. **Defeat the Chaos Dragon** — Defeat the abyss boss
15. **Enter the Volcanic Forge** — Enter the Volcanic Forge
16. **Defeat the Inferno Titan** — Defeat the volcano boss
17. **Enter the Ethereal Gardens** — Enter the Ethereal Gardens
18. **Defeat the Eternal Phoenix** — Defeat the gardens boss
19. **Enter the Twilight Citadel** — Enter the Twilight Citadel
20. **Defeat the Void Emperor** — Defeat the citadel boss
21. **Legend of Echohaven** — Return to the village

## Player Skills

| Skill | Level | MP Cost | Effect |
|-------|-------|---------|--------|
| Power Strike | 1 | 5 | 1.5x ATK damage |
| Heal | 3 | 8 | Restore HP based on level |
| Flame Strike | 5 | 10 | 1.8x ATK fire damage |
| Shield Bash | 7 | 6 | 1.2x ATK + 40% stun chance |
| Warding Light | 9 | 7 | +40% DEF for 3 turns |
| Holy Smite | 12 | 15 | 2.2x ATK radiant damage |

## Talent Paths

| Path | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| Might | +10% MaxHP | +15% ATK | +10% Crit | +25% DMG when HP < 30% |
| Arcane | +20% MaxMP | −20% MP costs | +30% heal power | +20% skill DMG |
| Survival | +15% DEF | +25% gold | +15% flee | 5% HP regen/turn |

## Tech Stack

- Pure HTML5 / CSS3 / JavaScript (no frameworks)
- Node.js + Express for serving
- HTML5 Canvas API for rendering
- Web Audio API for procedural chiptune music and sound effects
