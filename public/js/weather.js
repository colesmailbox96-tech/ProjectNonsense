/* ========= WEATHER & DAY-NIGHT SYSTEM ========= */
const WeatherSystem = (() => {
  // Time of day: 0–1440 game-minutes (24 in-game hours × 60 min each)
  // 1 player step ≈ 2 game-minutes, so ~720 steps = full cycle
  const MINUTES_PER_DAY = 1440;
  const STEP_MINUTES = 2;

  let timeOfDay = 480; // Start at 8:00 AM

  // Weather states: clear, rain, fog, storm
  let currentWeather = 'clear';
  let weatherTimer = 0;          // ms until next weather roll
  let weatherDuration = 60000;   // ms for current weather
  let transitionAlpha = 0;       // smooth weather change

  // Rain particles
  const MAX_RAIN = 120;
  const rainDrops = [];

  // Lightning
  let lightningTimer = 0;
  let lightningFlash = 0;

  function getTimeOfDay() { return timeOfDay; }

  function getHour() { return Math.floor(timeOfDay / 60); }

  function getMinute() { return Math.floor(timeOfDay % 60); }

  function getTimeString() {
    const h = getHour();
    const m = getMinute();
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  }

  function getPeriod() {
    const h = getHour();
    if (h >= 6 && h < 10) return 'dawn';
    if (h >= 10 && h < 17) return 'day';
    if (h >= 17 && h < 20) return 'dusk';
    return 'night';
  }

  function isNight() {
    const h = getHour();
    return h >= 20 || h < 6;
  }

  function getWeather() { return currentWeather; }

  function advanceTime(steps) {
    timeOfDay = (timeOfDay + steps * STEP_MINUTES) % MINUTES_PER_DAY;
  }

  function setTime(minutes) {
    timeOfDay = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  }

  function update(dt) {
    // Weather timer
    weatherTimer += dt;
    if (weatherTimer >= weatherDuration) {
      weatherTimer = 0;
      rollWeather();
    }

    // Rain particles
    if (currentWeather === 'rain' || currentWeather === 'storm') {
      updateRain(dt);
    }

    // Lightning in storms
    if (currentWeather === 'storm') {
      lightningTimer -= dt;
      if (lightningTimer <= 0) {
        lightningFlash = 200;
        lightningTimer = 3000 + Math.random() * 8000;
        if (typeof AudioSystem !== 'undefined') AudioSystem.playSFX('hit');
      }
      if (lightningFlash > 0) lightningFlash -= dt;
    }
  }

  function rollWeather() {
    const period = getPeriod();
    const roll = Math.random();
    // Storms only at night / dusk; rain more common in forest
    if (period === 'night' || period === 'dusk') {
      if (roll < 0.15) currentWeather = 'storm';
      else if (roll < 0.40) currentWeather = 'rain';
      else if (roll < 0.55) currentWeather = 'fog';
      else currentWeather = 'clear';
    } else {
      if (roll < 0.05) currentWeather = 'storm';
      else if (roll < 0.25) currentWeather = 'rain';
      else if (roll < 0.35) currentWeather = 'fog';
      else currentWeather = 'clear';
    }
    weatherDuration = 30000 + Math.random() * 60000;
    rainDrops.length = 0;
  }

  function updateRain(dt) {
    const target = currentWeather === 'storm' ? MAX_RAIN : Math.floor(MAX_RAIN * 0.6);
    // Spawn new drops
    while (rainDrops.length < target) {
      rainDrops.push({
        x: Math.random() * (window.innerWidth + 100) - 50,
        y: -10 - Math.random() * 40,
        speed: 300 + Math.random() * 200,
        length: 8 + Math.random() * 12,
        opacity: 0.2 + Math.random() * 0.4,
      });
    }
    // Update
    const dtSec = dt / 1000;
    for (let i = rainDrops.length - 1; i >= 0; i--) {
      const d = rainDrops[i];
      d.y += d.speed * dtSec;
      d.x -= 30 * dtSec; // slight wind
      if (d.y > window.innerHeight + 20) {
        rainDrops.splice(i, 1);
      }
    }
  }

  // Get the overlay tint for current time of day
  function getDayNightTint() {
    const h = getHour();
    const m = getMinute();
    const t = h + m / 60; // fractional hour

    // Gradual tinting
    if (t >= 6 && t < 7) {
      // Dawn transition (6–7)
      const f = t - 6;
      return { r: 40, g: 30, b: 60, a: 0.35 * (1 - f) };
    }
    if (t >= 7 && t < 10) {
      // Morning warm tint (7–10)
      const f = (t - 7) / 3;
      return { r: 255, g: 200, b: 100, a: 0.06 * (1 - f) };
    }
    if (t >= 10 && t < 16) {
      // Clear day — no tint
      return { r: 0, g: 0, b: 0, a: 0 };
    }
    if (t >= 16 && t < 18) {
      // Sunset warm (16–18)
      const f = (t - 16) / 2;
      return { r: 255, g: 130, b: 50, a: 0.08 + f * 0.12 };
    }
    if (t >= 18 && t < 20) {
      // Dusk to dark (18–20)
      const f = (t - 18) / 2;
      return { r: 20, g: 15, b: 50, a: 0.2 + f * 0.25 };
    }
    // Night (20–6)
    return { r: 10, g: 10, b: 40, a: 0.45 };
  }

  function renderOverlay(ctx, w, h) {
    // Day/night tint
    const tint = getDayNightTint();
    if (tint.a > 0) {
      ctx.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${tint.a})`;
      ctx.fillRect(0, 0, w, h);
    }

    // Fog overlay
    if (currentWeather === 'fog') {
      ctx.fillStyle = 'rgba(180, 180, 200, 0.25)';
      ctx.fillRect(0, 0, w, h);
    }

    // Rain rendering
    if (currentWeather === 'rain' || currentWeather === 'storm') {
      ctx.strokeStyle = '#aabbdd';
      ctx.lineWidth = 1;
      for (let i = 0; i < rainDrops.length; i++) {
        const d = rainDrops[i];
        ctx.globalAlpha = d.opacity;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.length);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Lightning flash
    if (currentWeather === 'storm' && lightningFlash > 0) {
      const alpha = Math.min(0.4, lightningFlash / 200 * 0.4);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // Encounter rate modifier for night
  function getEncounterMultiplier() {
    if (isNight()) return 1.5;
    if (currentWeather === 'storm') return 1.3;
    return 1.0;
  }

  // For save/load
  function getState() {
    return {
      timeOfDay,
      currentWeather,
      weatherTimer,
      weatherDuration,
    };
  }

  function loadState(state) {
    if (!state) return;
    if (typeof state.timeOfDay === 'number') timeOfDay = state.timeOfDay;
    if (state.currentWeather) currentWeather = state.currentWeather;
    if (typeof state.weatherTimer === 'number') weatherTimer = state.weatherTimer;
    if (typeof state.weatherDuration === 'number') weatherDuration = state.weatherDuration;
  }

  return {
    getTimeOfDay, getHour, getMinute, getTimeString, getPeriod,
    isNight, getWeather, advanceTime, setTime,
    update, renderOverlay, getEncounterMultiplier,
    getState, loadState,
  };
})();
