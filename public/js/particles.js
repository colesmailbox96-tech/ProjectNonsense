/* ========= PARTICLE EFFECTS ========= */
const Particles = (() => {
  const MAX_PARTICLES = 200;
  const particles = [];

  const typeConfigs = {
    damage: {
      count: [10, 15],
      color: ['#ff3333', '#ff6644', '#ff2200', '#cc1100'],
      speed: [40, 100],
      size: [2, 5],
      life: [300, 600],
      gravity: 60,
    },
    heal: {
      count: [8, 12],
      color: ['#33ff66', '#66ffaa', '#22cc44', '#aaffcc'],
      speed: [20, 50],
      size: [3, 6],
      life: [500, 900],
      gravity: -30,
    },
    levelup: {
      count: [12, 15],
      color: ['#ffd700', '#ffaa00', '#ffee55', '#ffffff'],
      speed: [60, 120],
      size: [3, 7],
      life: [600, 1000],
      gravity: -20,
    },
    xp: {
      count: [8, 12],
      color: ['#aa44ff', '#cc66ff', '#8822dd', '#dd88ff'],
      speed: [30, 70],
      size: [2, 4],
      life: [400, 700],
      gravity: -15,
    },
  };

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function spawn(x, y, type) {
    const cfg = typeConfigs[type];
    if (!cfg) return;

    const count = Math.floor(rand(cfg.count[0], cfg.count[1] + 1));
    for (let i = 0; i < count; i++) {
      if (particles.length >= MAX_PARTICLES) {
        particles.shift();
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = rand(cfg.speed[0], cfg.speed[1]);

      const life = rand(cfg.life[0], cfg.life[1]);
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: life,
        maxLife: life,
        color: pick(cfg.color),
        size: rand(cfg.size[0], cfg.size[1]),
        gravity: cfg.gravity,
      });
    }
  }

  function update(dt) {
    const dtSec = dt / 1000;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.gravity * dtSec;
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.life -= dt;

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function render(ctx) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(
        Math.round(p.x - p.size / 2),
        Math.round(p.y - p.size / 2),
        Math.ceil(p.size),
        Math.ceil(p.size)
      );
    }
    ctx.globalAlpha = 1;
  }

  return { spawn, update, render };
})();
