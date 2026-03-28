/* ========= PIXEL ART SPRITE GENERATOR ========= */
const SpriteEngine = (() => {
  const cache = {};

  function createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  function drawPixelArt(ctx, data, palette, px) {
    for (let y = 0; y < data.length; y++) {
      for (let x = 0; x < data[y].length; x++) {
        const colorKey = data[y][x];
        if (colorKey === 0 || colorKey === ' ') continue;
        ctx.fillStyle = palette[colorKey] || '#ff00ff';
        ctx.fillRect(x * px, y * px, px, px);
      }
    }
  }

  // Hero sprite (16x16 logical, 4 directions x 2 frames)
  function generateHero() {
    if (cache.hero) return cache.hero;
    const frames = {};
    const palette = {
      1: '#ffd5b0', // skin
      2: '#4444cc', // blue armor
      3: '#3333aa', // dark armor
      4: '#ffcc00', // hair
      5: '#aa2222', // cape
      6: '#222222', // eyes
      7: '#bb8844', // boots
      8: '#666688', // sword
      9: '#aaaacc', // blade
    };

    // Down-facing frames
    const downF1 = [
      '  0044440  0',
      '  0444444  0',
      '  0141614  0',
      '  0011110  0',
      '  0222222  0',
      '  5223322  0',
      '  5223322  0',
      '  0233332  0',
      '  0023320  0',
      '  0017710  0',
      '  0077770  0',
      '  0070070  0',
    ];
    const downF2 = [
      '  0044440  0',
      '  0444444  0',
      '  0141614  0',
      '  0011110  0',
      '  0222222  0',
      '  5223322  0',
      '  5223322  0',
      '  0233332  0',
      '  0023320  0',
      '  0017710  0',
      '  0077070  0',
      '  0070770  0',
    ];

    // Up-facing frames
    const upF1 = [
      '  0044440  0',
      '  0444444  0',
      '  0414414  0',
      '  0011110  0',
      '  0222222  0',
      '  0223325  0',
      '  0223325  0',
      '  0233332  0',
      '  0023320  0',
      '  0017710  0',
      '  0077770  0',
      '  0070070  0',
    ];
    const upF2 = [
      '  0044440  0',
      '  0444444  0',
      '  0414414  0',
      '  0011110  0',
      '  0222222  0',
      '  0223325  0',
      '  0223325  0',
      '  0233332  0',
      '  0023320  0',
      '  0017710  0',
      '  0070770  0',
      '  0077070  0',
    ];

    // Left-facing frames
    const leftF1 = [
      '  0044440  0',
      '  0444440  0',
      '  0161410  0',
      '  0011110  0',
      '  0222220  0',
      '  5222220  0',
      '  5233320  0',
      '  0233320  0',
      '  0023320  0',
      '  0017710  0',
      '  0077770  0',
      '  0070070  0',
    ];
    const leftF2 = [
      '  0044440  0',
      '  0444440  0',
      '  0161410  0',
      '  0011110  0',
      '  0222220  0',
      '  5222220  0',
      '  5233320  0',
      '  0233320  0',
      '  0023320  0',
      '  0017710  0',
      '  0077070  0',
      '  0070770  0',
    ];

    const rightF1 = leftF1.map(row => row.split('').reverse().join(''));
    const rightF2 = leftF2.map(row => row.split('').reverse().join(''));

    const dirFrames = {
      down: [downF1, downF2],
      up: [upF1, upF2],
      left: [leftF1, leftF2],
      right: [rightF1, rightF2],
    };

    for (const [dir, fArr] of Object.entries(dirFrames)) {
      frames[dir] = fArr.map(data => {
        const c = createCanvas(TILE_SIZE, TILE_SIZE);
        const ctx = c.getContext('2d');
        drawPixelArt(ctx, data.map(r => r.split('')), palette, 1);
        return c;
      });
    }
    cache.hero = frames;
    return frames;
  }

  // Generic NPC sprite
  function generateNPC(type) {
    const key = 'npc_' + type;
    if (cache[key]) return cache[key];

    const palettes = {
      elder: {
        1: '#ffd5b0', 2: '#884488', 3: '#663366', 4: '#cccccc',
        5: '#884488', 6: '#222222', 7: '#554433',
      },
      merchant: {
        1: '#ffd5b0', 2: '#228844', 3: '#116633', 4: '#884422',
        5: '#228844', 6: '#222222', 7: '#554433',
      },
      guard: {
        1: '#ffd5b0', 2: '#888888', 3: '#666666', 4: '#443322',
        5: '#aa3333', 6: '#222222', 7: '#554433',
      },
      healer: {
        1: '#ffd5b0', 2: '#ffffff', 3: '#dddddd', 4: '#ffcc66',
        5: '#ffffff', 6: '#222222', 7: '#554433',
      },
    };

    const pal = palettes[type] || palettes.elder;
    const data = [
      '  0044440  0',
      '  0444444  0',
      '  0141614  0',
      '  0011110  0',
      '  0222222  0',
      '  5223322  0',
      '  5223322  0',
      '  0233332  0',
      '  0023320  0',
      '  0017710  0',
      '  0077770  0',
      '  0070070  0',
    ];

    const c = createCanvas(TILE_SIZE, TILE_SIZE);
    const ctx = c.getContext('2d');
    drawPixelArt(ctx, data.map(r => r.split('')), pal, 1);
    cache[key] = c;
    return c;
  }

  // Enemy sprites for battle
  function generateEnemy(type) {
    const key = 'enemy_' + type;
    if (cache[key]) return cache[key];

    const enemies = {
      slime: {
        palette: { 1: '#44cc44', 2: '#33aa33', 3: '#228822', 4: '#ffffff', 5: '#111111' },
        data: [
          '  000000000000  ',
          '  000011110000  ',
          '  001111111100  ',
          '  011111111110  ',
          '  011451145110  ',
          '  011151115110  ',
          '  011111111110  ',
          '  011111111110  ',
          '  012111111210  ',
          '  001222222100  ',
          '  000122221000  ',
          '  000001100000  ',
        ],
      },
      goblin: {
        palette: { 1: '#66aa44', 2: '#558833', 3: '#447722', 4: '#ff4444', 5: '#ffffff', 6: '#111111', 7: '#884422', 8: '#aa8844' },
        data: [
          '  000088880000  ',
          '  008888888800  ',
          '  011111111110  ',
          '  011561156110  ',
          '  011161116110  ',
          '  011111111110  ',
          '  011144411110  ',
          '  022222222220  ',
          '  027222222720  ',
          '  022222222220  ',
          '  002277722200  ',
          '  000770077000  ',
        ],
      },
      skeleton: {
        palette: { 1: '#dddddd', 2: '#bbbbbb', 3: '#999999', 4: '#111111', 5: '#ff0000', 6: '#888888' },
        data: [
          '  000011110000  ',
          '  001111111100  ',
          '  011141114110  ',
          '  011111111110  ',
          '  001114411100  ',
          '  000111111000  ',
          '  000066660000  ',
          '  006666666600  ',
          '  000066660000  ',
          '  000066660000  ',
          '  000660066000  ',
          '  000660066000  ',
        ],
      },
      darkKnight: {
        palette: { 1: '#333344', 2: '#222233', 3: '#111122', 4: '#ff2222', 5: '#aa0000', 6: '#666688', 7: '#9999bb' },
        data: [
          '  000067760000  ',
          '  006677776600  ',
          '  011141114110  ',
          '  011111111110  ',
          '  012222222210  ',
          '  012222222210  ',
          '  012222222210  ',
          '  012222222210  ',
          '  001222222100  ',
          '  001222222100  ',
          '  002220022200  ',
          '  002220022200  ',
        ],
      },
      shadowLord: {
        palette: { 1: '#220022', 2: '#110011', 3: '#000000', 4: '#ff0044', 5: '#aa0033', 6: '#440044', 7: '#cc00cc', 8: '#9900cc', 9: '#ffcc00' },
        data: [
          '  000099990000  ',
          '  009999999900  ',
          '  011141114110  ',
          '  011444444110  ',
          '  012222222210  ',
          '  672222222276  ',
          '  672222222276  ',
          '  012222222210  ',
          '  012288822210  ',
          '  001222222100  ',
          '  001222222100  ',
          '  002220022200  ',
        ],
      },
    };

    const e = enemies[type] || enemies.slime;
    const c = createCanvas(TILE_SIZE, TILE_SIZE);
    const ctx = c.getContext('2d');
    drawPixelArt(ctx, e.data.map(r => r.split('')), e.palette, 1);
    cache[key] = c;
    return c;
  }

  return { generateHero, generateNPC, generateEnemy, drawPixelArt, createCanvas };
})();
