/* ============================================================
   RunnerCat — Core Game Engine (HTML5 Canvas)
   Supports: Runner, Swim (Diving), Plane (Shooter), and Boss
   ============================================================ */
(function (RC) {
  const WIDTH = 960;
  const HEIGHT = 360;
  const GROUND_Y = 296;
  const CAT_X = 112;

  // Physics constants
  const GRAVITY = 2150;
  const JUMP_VEL = -710;
  const DOUBLE_JUMP_VEL = -635;
  const FAST_FALL_GRAVITY = 4200;
  const SPACE_GRAVITY = 720;
  const SPACE_JUMP_VEL = -540;
  const SPACE_DOUBLE_JUMP_VEL = -450;
  const SPACE_FAST_FALL_GRAVITY = 2100;
  const COYOTE_TIME = 0.085;
  const JUMP_BUFFER_TIME = 0.1;

  // Claw / Special attack constants
  const CLAW_DURATION = 0.24;
  const CLAW_COOLDOWN = 0.44;
  const PLANE_FIRE_COOLDOWN = 0.19;

  // Slow-motion constants
  const SLOW_TIME_SCALE = 0.44;
  const SLOW_DRAIN_PER_SEC = 34;
  const SLOW_REGEN_PER_SEC = 14;
  const SLOW_MIN_TO_START = 12;

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  function lerpColor(hexA, hexB, t) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    const r = Math.round(a[0] + (b[0] - a[0]) * t);
    const g = Math.round(a[1] + (b[1] - a[1]) * t);
    const bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  class RunnerGame {
    constructor(canvas, callbacks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.ctx.imageSmoothingEnabled = false;
      this.callbacks = callbacks || {};

      this.mode = "menu"; // "menu" | "playing" | "paused" | "gameover" | "victory"
      this.level = RC.Levels.getLevelById(RC.Storage.getState().selectedLevel);
      this.skinId = RC.Storage.getState().selectedCat;

      this.keys = {
        jumpHeld: false,
        upHeld: false,
        duckHeld: false,
        slowHeld: false,
        fireHeld: false
      };

      this.time = 0;
      this.groundOffset = 0;
      this.farBgOffset = 0;
      this.nearBgOffset = 0;
      this.stars = this.createStars(42);
      this.clouds = this.createClouds(6);
      this.bubbles = this.createBubbles(22);
      this.bgBuildings = this.createBgShapes(18);
      this.groundPebbles = this.createGroundPebbles(28);

      this.resetRunState();

      this.lastFrame = performance.now();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    createStars(count) {
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          x: Math.random() * WIDTH,
          y: 16 + Math.random() * 140,
          size: Math.random() > 0.7 ? 3 : 2,
          phase: Math.random() * Math.PI * 2
        });
      }
      return arr;
    }

    createClouds(count) {
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          x: (WIDTH / count) * i + Math.random() * 80,
          y: 34 + Math.random() * 92,
          w: 44 + Math.floor(Math.random() * 34),
          speed: 18 + Math.random() * 18
        });
      }
      return arr;
    }

    createBubbles(count) {
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          x: Math.random() * WIDTH,
          y: 30 + Math.random() * (GROUND_Y - 40),
          size: 3 + Math.floor(Math.random() * 5),
          speedY: 22 + Math.random() * 35,
          phase: Math.random() * Math.PI * 2
        });
      }
      return arr;
    }

    createBgShapes(count) {
      const arr = [];
      let cursor = 0;
      for (let i = 0; i < count; i++) {
        const w = 44 + Math.floor(Math.random() * 58);
        const h = 42 + Math.floor(Math.random() * 88);
        arr.push({
          x: cursor,
          w,
          h,
          hasWindows: Math.random() > 0.35
        });
        cursor += w + 8 + Math.floor(Math.random() * 22);
      }
      this.bgTotalWidth = cursor;
      return arr;
    }

    createGroundPebbles(count) {
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          x: Math.random() * WIDTH,
          y: GROUND_Y + 8 + Math.floor(Math.random() * 44),
          w: 4 + Math.floor(Math.random() * 10),
          h: 2 + Math.floor(Math.random() * 3)
        });
      }
      return arr;
    }

    isSwimMode(lvlMode) {
      const m = lvlMode || this.level.mode || "runner";
      return m === "swim" || m === "swimBoss";
    }

    isPlaneMode(lvlMode) {
      const m = lvlMode || this.level.mode || "runner";
      return m === "plane" || m === "planeBoss";
    }

    isSpaceMode(lvlMode) {
      const m = lvlMode || this.level.mode || "runner";
      return m === "space" || m === "spaceBoss";
    }

    isBatMode(lvlMode) {
      const m = lvlMode || this.level.mode || "runner";
      return m === "bat" || m === "batBoss";
    }

    isSnowMode(lvlMode) {
      const m = lvlMode || this.level.mode || "runner";
      return m === "snow" || m === "snowBoss";
    }

    isJungleMode(lvlMode) {
      const m = lvlMode || this.level.mode || "runner";
      return m === "jungle" || m === "jungleBoss";
    }

    setPreviewConfig(levelId, skinId) {
      this.level = RC.Levels.getLevelById(levelId);
      this.skinId = skinId;
    }

    resetRunState() {
      const lvl = this.level;
      const lvlMode = lvl.mode || "runner";
      const insane = RC.Storage && RC.Storage.isInsanityMode();
      this.insaneMult = insane ? 1.35 : 1.0;
      this.speed = lvl.baseSpeed * this.insaneMult;
      const hasExtraLife = RC.Storage && RC.Storage.hasUpgrade("extra_life");
      const hasStartShield = RC.Storage && RC.Storage.hasUpgrade("start_shield");
      this.lives = hasExtraLife ? 4 : 3;
      this.maxLives = 5;
      this.hitsTaken = 0;
      this.runElapsedSec = 0;
      this.timeScale = 1;
      this.slowActive = false;
      this.slowEnergy = 100;
      this.slowLockout = false;

      this.distanceMeters = 0;
      this.lastMilestone = 0;
      this.fishCount = 0;
      this.itemScore = 0;
      this.killCount = 0;
      this.killScore = 0;
      this.comboCount = 0;
      this.comboTimer = 0;

      this.nightFactor = 0;
      this.shakeTimer = 0;
      this.shakeIntensity = 0;
      this.hitstopTimer = 0;

      const startY =
        this.isSwimMode(lvlMode) || this.isPlaneMode(lvlMode)
          ? Math.floor(GROUND_Y * 0.45)
          : GROUND_Y - 42;
      const startW = this.isSwimMode(lvlMode) ? 54 : this.isPlaneMode(lvlMode) ? 54 : 48;
      const startH = this.isSwimMode(lvlMode) ? 36 : this.isPlaneMode(lvlMode) ? 27 : 42;

      this.cat = {
        x: CAT_X,
        y: startY,
        w: startW,
        h: startH,
        vy: 0,
        onGround: lvlMode === "runner" || lvlMode === "boss",
        ducking: false,
        jumpsUsed: 0,
        maxJumps: 2,
        coyoteTimer: 0,
        jumpBufferTimer: 0,
        runAnimTimer: 0,
        clawTimer: 0,
        clawCooldown: 0,
        fireCooldown: 0,
        dashTimer: 0,
        dashCooldown: 0,
        invulnTimer: 0,
        shield: hasStartShield,
        magnetTimer: 0,
        milkTimer: 0,
        afterimages: []
      };

      this.obstacles = [];
      this.collectibles = [];
      this.projectiles = []; // plane bullets & missiles
      this.launchedMines = []; // scratched proximity mines flying forward
      this.bossEggs = [];    // giant chicken eggs
      this.bossPiranhas = []; // giant squid piranhas
      this.bossTrash = [];   // boss plane trash bags
      this.alienShots = [];  // space alien plasma shots
      this.spookyShots = []; // zombie vomit, spider drops, crow eggs, skeleton bones
      this.catMissiles = 0;
      this.laserLevel = 1;
      this.lightningCharge = 0;
      this.lightningTimer = 0;
      this.endingTimer = 0;
      this.endingFromBoss = false;
      this.introTimer = 0;
      this.particles = [];
      this.floatingTexts = [];

      this.spawnTimer = 1.05;
      this.collectibleTimer = 1.4;
      this.powerupTimer = 7.0;
      this.movingCrateTimer = 7.0 + Math.random() * 4.5;
      this.zoneHazardTimer = 5.5 + Math.random() * 3.5;
      this.pits = [];
      this.vines = [];
      this.branches = [];
      this.hazardEvent = null;
      this.snowBoostTimer = 0;
      this.blizzardTimer = 0;
      this.blizzardCooldown = 7.5;
      this.bossFishAmmo = 0;
      this.mudAmmo = 0;
      this.cat.onVine = null;
      this.secretBossItem = null;
      this.playSecondsAccum = 0;
      this.zoneDemoData = null;
      this.zoneDemoStep = 0;
      this.finishGateSpawned = false;
      this.finishGateX = null;
      this.isDemo = false;

      // Boss state (Level 4: Giant Chicken, Level 8: Giant Squid)
      if (lvlMode === "boss") {
        const maxHp = lvl.bossMaxHp || 10;
        this.boss = {
          kind: "chicken",
          active: true,
          hp: maxHp,
          maxHp,
          state: "aerial", // "aerial" | "telegraph" | "side" | "retreat"
          stateTimer: 6.5,
          x: WIDTH * 0.55,
          y: 34,
          targetX: WIDTH * 0.55,
          w: 84,
          h: 84,
          dir: 1,
          eggTimer: 1.05,
          hurtTimer: 0,
          hitThisWindow: false,
          animTimer: 0
        };
      } else if (lvlMode === "swimBoss") {
        const maxHp = lvl.bossMaxHp || 8;
        this.boss = {
          kind: "squid",
          active: true,
          hp: maxHp,
          maxHp,
          x: WIDTH - 148,
          y: 110,
          w: 96,
          h: 72,
          dir: 1,
          piranhaTimer: 1.15,
          hurtTimer: 0,
          animTimer: 0
        };
      } else if (lvlMode === "planeBoss") {
        const maxHp = lvl.bossMaxHp || 8;
        this.boss = {
          kind: "plane",
          active: true,
          hp: maxHp,
          maxHp,
          x: WIDTH - 156,
          y: 96,
          w: 120,
          h: 54,
          dir: 1,
          trashTimer: 0.9,
          bagCount: 0,
          hurtTimer: 0,
          animTimer: 0
        };
      } else if (lvlMode === "batBoss") {
        const maxHp = lvl.bossMaxHp || 5;
        this.boss = {
          kind: "skeleton",
          active: true,
          hp: maxHp,
          maxHp,
          x: WIDTH - 148,
          y: GROUND_Y - 78,
          w: 96,
          h: 78,
          boneTimer: 1.0,
          minionTimer: 2.3,
          hurtTimer: 0,
          animTimer: 0
        };
      } else if (lvlMode === "snowBoss") {
        const maxHp = lvl.bossMaxHp || 8;
        this.boss = {
          kind: "penguin",
          active: true,
          hp: maxHp,
          maxHp,
          x: WIDTH - 152,
          y: GROUND_Y - 72,
          w: 84,
          h: 66,
          snowTimer: 1.1,
          fishTimer: 1.5,
          hurtTimer: 0,
          animTimer: 0
        };
      } else if (lvlMode === "jungleBoss") {
        const maxHp = lvl.bossMaxHp || 8;
        this.boss = {
          kind: "snake",
          active: true,
          hp: maxHp,
          maxHp,
          x: WIDTH - 152,
          y: GROUND_Y - 64,
          w: 96,
          h: 60,
          venomTimer: 1.05,
          mudTimer: 1.6,
          hurtTimer: 0,
          animTimer: 0
        };
      } else if (lvlMode === "spaceBoss") {
        const maxHp = lvl.bossMaxHp || 24;
        this.boss = {
          kind: "ufo",
          active: true,
          hp: maxHp,
          maxHp,
          x: WIDTH - 165,
          y: 72,
          w: 120,
          h: 54,
          dir: 1,
          shipTimer: 1.35,
          hazardTimer: 1.75,
          hurtTimer: 0,
          animTimer: 0
        };
      } else {
        this.boss = null;
      }

      if (this.boss && insane) {
        this.boss.hp = Math.ceil(this.boss.hp * 1.5);
        this.boss.maxHp = this.boss.hp;
      }
    }

    getMusicThemeForLevel(lvl) {
      const m = (lvl && lvl.mode) || "runner";
      if (m === "boss" || m === "swimBoss" || m === "planeBoss" || m === "batBoss" || m === "spaceBoss" || m === "snowBoss" || m === "jungleBoss") {
        return "boss";
      }
      if (m === "swim") return "ocean";
      if (m === "plane") return "sky";
      if (m === "bat") return "spooky";
      if (m === "space") return "space";
      if (m === "snow") return "snow";
      if (m === "jungle") return "jungle";
      return "city";
    }

    startLevel(levelId, skinId) {
      this.isBossRush = false;
      this.isTimeAttack = false;
      this.isDaily = false;
      this.level = RC.Levels.getLevelById(levelId);
      this.skinId = skinId || this.skinId;
      this.resetRunState();
      this.mode = "playing";
      this.keys.jumpHeld = false;
      this.keys.upHeld = false;
      this.keys.duckHeld = false;
      this.keys.slowHeld = false;
      this.keys.fireHeld = false;
      if (this.boss && RC.Storage) {
        RC.Storage.discoverEntry(`boss_${this.boss.kind}`);
      }
      RC.Audio.startMusic(this.getMusicThemeForLevel(this.level));
      this.notifyHud();
    }

    startBossRush(skinId) {
      const order = ["boss", "squidBoss", "planeBoss", "spookyBoss", "spaceBoss", "snowBoss", "jungleBoss"];
      this.bossRushOrder = order;
      this.bossRushIndex = 0;
      this.isBossRush = true;
      this.isTimeAttack = false;
      this.isDaily = false;
      this.level = RC.Levels.getLevelById(order[0]);
      this.skinId = skinId || this.skinId;
      this.resetRunState();
      this.mode = "playing";
      RC.Audio.startMusic("boss");
      this.addFloatingText("👑 BOSS RUSH 1/7!", WIDTH / 2 - 70, 90, "#ffd32a", 16);
      this.notifyHud();
    }

    startDailyChallenge(skinId) {
      this.isBossRush = false;
      this.isTimeAttack = false;
      this.isDaily = true;
      this.level = RC.Levels.getDailyLevelConfig();
      this.skinId = skinId || this.skinId;
      this.resetRunState();
      this.mode = "playing";
      RC.Audio.startMusic(this.getMusicThemeForLevel(this.level));
      this.notifyHud();
    }

    startTimeAttack(skinId) {
      const base = RC.Levels.getLevelById("rooftops");
      this.isBossRush = false;
      this.isTimeAttack = true;
      this.isDaily = false;
      this.level = {
        ...base,
        id: "timeAttack",
        name: "Contrarreloj 900m",
        shortName: "⏱ CONTRARRELOJ",
        targetDistance: 900,
        baseSpeed: 440,
        maxSpeed: 850
      };
      this.skinId = skinId || this.skinId;
      this.resetRunState();
      this.mode = "playing";
      RC.Audio.startMusic("city");
      this.notifyHud();
    }

    startDemo(skinId) {
      this.level = RC.Levels.getLevelById("alley");
      this.skinId = skinId || this.skinId;
      this.resetRunState();
      this.isDemo = true;
      this.speed = 310;
      this.mode = "playing";
      this.keys.jumpHeld = false;
      this.keys.upHeld = false;
      this.keys.duckHeld = false;
      this.keys.slowHeld = false;
      this.keys.fireHeld = false;
      if (this.boss && RC.Storage) {
        RC.Storage.discoverEntry(`boss_${this.boss.kind}`);
      }
      this.notifyHud();
    }

    startEnding(skinId, fromBoss) {
      this.skinId = skinId || this.skinId;
      this.mode = "ending";
      this.endingTimer = 0;
      this.endingFromBoss = Boolean(fromBoss);
      this.particles = [];
      this.floatingTexts = [];
      RC.Audio.victory();
    }

    startSecretEnding(skinId, fromBoss) {
      const souvenirs = [
        "un Huevo Dorado 🥚",
        "un Tentáculo de Calamar 🦑",
        "chatarra del Avión ⚙",
        "un Hueso Mágico 🦴",
        "un Cristal Alien 🛸",
        "un Salmón Ártico 🐟"
      ];
      this.skinId = skinId || this.skinId;
      this.mode = "secretEnding";
      this.endingTimer = 0;
      this.endingFromBoss = Boolean(fromBoss);
      this.secretBossItem = souvenirs[Math.floor(Math.random() * souvenirs.length)];
      this.particles = [];
      this.floatingTexts = [];
      RC.Audio.victory();
    }

    startIntro(skinId) {
      this.skinId = skinId || this.skinId;
      this.mode = "intro";
      this.introTimer = 0;
      this.particles = [];
      this.floatingTexts = [];
    }

    startZoneDemo(zoneId, skinId) {
      this.skinId = skinId || this.skinId;
      this.zoneDemoData = RC.Levels.ZONE_TUTORIALS[zoneId] || RC.Levels.ZONE_TUTORIALS.city;
      this.zoneDemoZoneId = zoneId;
      this.zoneDemoStep = 0;
      this.mode = "zoneDemo";
    }

    advanceZoneDemo() {
      if (this.mode !== "zoneDemo" || !this.zoneDemoData) return true;
      this.zoneDemoStep += 1;
      return this.zoneDemoStep >= this.zoneDemoData.steps.length;
    }

    pressDash() {
      if (this.mode !== "playing") return;
      const m = this.level.mode || "runner";
      if (this.isPlaneMode(m) || this.isSwimMode(m)) return;
      const cat = this.cat;
      if (cat.dashCooldown > 0) return;
      cat.dashTimer = 0.24;
      cat.dashCooldown = 1.1;
      cat.invulnTimer = Math.max(cat.invulnTimer, 0.22);
      RC.Audio.doubleJump();
      this.spawnDust(cat.x, cat.y + cat.h, 8, "#48dbfb");
      this.addFloatingText("💨 DASH!", cat.x, cat.y - 10, "#48dbfb", 11);
    }

    flushPlayTime() {
      if (this.playSecondsAccum > 0 && RC.Storage) {
        RC.Storage.addPlayTime(this.playSecondsAccum);
        this.playSecondsAccum = 0;
      }
    }

    pause() {
      if (this.mode !== "playing") return;
      this.flushPlayTime();
      this.mode = "paused";
      if (this.callbacks.onPauseChange) this.callbacks.onPauseChange(true);
    }

    resume() {
      if (this.mode !== "paused") return;
      this.mode = "playing";
      this.lastFrame = performance.now();
      if (this.callbacks.onPauseChange) this.callbacks.onPauseChange(false);
    }

    returnToMenu() {
      this.flushPlayTime();
      this.isBossRush = false;
      this.isTimeAttack = false;
      this.isDaily = false;
      this.mode = "menu";
      this.resetRunState();
      RC.Audio.startMusic("menu");
    }

    // ---- Input Handlers ----
    pressJump() {
      if (this.mode !== "playing") return;
      const lvlMode = this.level.mode || "runner";
      this.keys.jumpHeld = true;

      if (this.isSwimMode(lvlMode)) {
        this.keys.upHeld = true;
        this.cat.vy = Math.min(this.cat.vy, -240);
        RC.Audio.swim();
        this.spawnDust(this.cat.x + 12, this.cat.y + 24, 4, "#81ecec");
        return;
      }

      if (this.isPlaneMode(lvlMode)) {
        // Space/Click fires in plane mode, ArrowUp/W sets upHeld via setUp()
        this.firePlaneBullet();
        return;
      }

      this.cat.jumpBufferTimer = JUMP_BUFFER_TIME;
      this.tryExecuteJump();
    }

    releaseJump() {
      this.keys.jumpHeld = false;
      const lvlMode = this.level.mode || "runner";
      if (this.isSwimMode(lvlMode)) {
        this.keys.upHeld = false;
        return;
      }
      if (this.isPlaneMode(lvlMode)) return;

      if (this.mode === "playing" && !this.isSpaceMode(lvlMode) && this.cat.vy < -260) {
        this.cat.vy *= 0.58;
      }
    }

    setUp(active) {
      this.keys.upHeld = Boolean(active);
    }

    setDuck(active) {
      this.keys.duckHeld = Boolean(active);
    }

    setSlow(active) {
      this.keys.slowHeld = Boolean(active);
    }

    setFire(active) {
      this.keys.fireHeld = Boolean(active);
    }

    pressClaw() {
      if (this.mode !== "playing") return;
      const lvlMode = this.level.mode || "runner";

      if (this.isPlaneMode(lvlMode)) {
        this.firePlaneBullet();
        return;
      }

      if (this.isSpaceMode(lvlMode)) {
        this.fireSpaceLaser();
        return;
      }

      if (lvlMode === "snowBoss" && this.bossFishAmmo > 0) {
        this.bossFishAmmo -= 1;
        RC.Audio.shoot();
        this.projectiles.push({
          x: cat.x + cat.w + 4,
          y: cat.y + Math.floor(cat.h * 0.4),
          w: 32,
          h: 22,
          vx: 760,
          isThrownFish: true
        });
        return;
      }

      if (lvlMode === "jungleBoss" && this.mudAmmo > 0) {
        this.mudAmmo -= 1;
        RC.Audio.shoot();
        this.projectiles.push({
          x: cat.x + cat.w + 4,
          y: cat.y + Math.floor(cat.h * 0.4),
          w: 24,
          h: 18,
          vx: 760,
          isMud: true
        });
        return;
      }

      const cat = this.cat;
      if (cat.clawCooldown > 0) return;

      cat.clawTimer = CLAW_DURATION;
      cat.clawCooldown = CLAW_COOLDOWN;
      if (this.isSwimMode(lvlMode)) {
        RC.Audio.swim();
      } else {
        RC.Audio.claw();
      }

      const sparkColor = this.isSwimMode(lvlMode) ? "#48dbfb" : "#ff6b81";
      for (let i = 0; i < 7; i++) {
        this.spawnParticle(
          cat.x + cat.w + 10,
          cat.y + cat.h * 0.45 + (Math.random() - 0.5) * 24,
          100 + Math.random() * 150,
          (Math.random() - 0.5) * 100,
          i % 2 === 0 ? "#ffd32a" : sparkColor,
          4,
          0.22
        );
      }
    }

    firePlaneBullet() {
      const cat = this.cat;
      if (cat.fireCooldown > 0) return;
      cat.fireCooldown = PLANE_FIRE_COOLDOWN;

      if (this.catMissiles > 0) {
        this.catMissiles -= 1;
        RC.Audio.wallSmash();
        this.projectiles.push({
          x: cat.x + cat.w + 4,
          y: cat.y + Math.floor(cat.h * 0.4),
          w: 36,
          h: 16,
          vx: 820,
          isMissile: true
        });
        this.spawnBurst(cat.x + cat.w + 4, cat.y + cat.h * 0.5, "#ff4757", 6);
        return;
      }

      RC.Audio.shoot();
      this.projectiles.push({
        x: cat.x + cat.w + 4,
        y: cat.y + Math.floor(cat.h * 0.52),
        w: 16,
        h: 6,
        vx: 760,
        isMissile: false
      });

      this.spawnParticle(cat.x + cat.w + 4, cat.y + cat.h * 0.52, 160, 0, "#ffd32a", 4, 0.08);
    }

    fireSpaceLaser() {
      const cat = this.cat;
      if (cat.fireCooldown > 0) return;
      cat.fireCooldown = 0.22;
      RC.Audio.shoot();

      const lvl = this.laserLevel || 1;
      const w = lvl === 1 ? 22 : lvl === 2 ? 28 : 34;
      const h = lvl === 1 ? 5 : lvl === 2 ? 7 : 10;
      this.projectiles.push({
        x: cat.x + cat.w + 2,
        y: cat.y + Math.floor(cat.h * 0.45),
        w,
        h,
        vx: 840,
        isLaser: true,
        laserLevel: lvl,
        damage: lvl
      });
      this.spawnParticle(cat.x + cat.w + 4, cat.y + cat.h * 0.45, 160, 0, "#48dbfb", 4, 0.08);
    }

    tryExecuteJump() {
      const cat = this.cat;
      const isSpace = this.isSpaceMode();
      const isBat = this.isBatMode();
      if (cat.onVine) {
        cat.onVine = null;
        cat.vy = JUMP_VEL;
        cat.onGround = false;
        cat.jumpsUsed = 1;
        RC.Audio.jump();
        this.addFloatingText("¡SALTO!", cat.x, cat.y - 10, "#2ed573", 11);
        return true;
      }
      const canGroundJump = cat.onGround || cat.coyoteTimer > 0;

      if (canGroundJump) {
        cat.vy = isSpace ? SPACE_JUMP_VEL : JUMP_VEL;
        cat.onGround = false;
        cat.coyoteTimer = 0;
        cat.jumpBufferTimer = 0;
        cat.jumpsUsed = 1;
        cat.ducking = false;
        RC.Audio.jump();
        this.spawnDust(cat.x + 18, GROUND_Y - 2, 7, isSpace ? "#70a1ff" : "#d9ccb4");
        return true;
      }

      if (isBat) {
        // Transform into Vampire Bat & flap/fly in mid-air!
        cat.vy = -480;
        cat.jumpsUsed += 1;
        cat.jumpBufferTimer = 0;
        cat.ducking = false;
        RC.Audio.doubleJump();
        this.spawnDust(cat.x + 22, cat.y + cat.h, 8, "#a55eea");
        if (cat.jumpsUsed === 2) {
          this.addFloatingText("🦇 ¡MURCIÉLAGO!", cat.x + 4, cat.y - 6, "#a55eea", 11);
        }
        return true;
      }

      if (cat.jumpsUsed < cat.maxJumps) {
        cat.vy = isSpace ? SPACE_DOUBLE_JUMP_VEL : DOUBLE_JUMP_VEL;
        cat.jumpsUsed += 1;
        cat.jumpBufferTimer = 0;
        cat.ducking = false;
        RC.Audio.doubleJump();
        this.spawnDust(cat.x + 22, cat.y + cat.h, 10, "#48dbfb");
        this.addFloatingText(isSpace ? "FLOTAR!" : "DOUBLE!", cat.x + 12, cat.y - 6, "#48dbfb", 11);
        return true;
      }

      return false;
    }

    // ---- Main Loop ----
    loop(now) {
      const rawDt = Math.min(0.05, Math.max(0, (now - this.lastFrame) / 1000));
      this.lastFrame = now;

      if (this.mode === "menu") {
        this.updateMenuPreview(rawDt);
      } else if (this.mode === "playing") {
        this.updatePlaying(rawDt);
      } else if (this.mode === "hazardEvent") {
        this.updateHazardEvent(rawDt);
      } else if (this.mode === "intro") {
        this.updateIntro(rawDt);
      } else if (this.mode === "zoneDemo") {
        this.time += rawDt;
      } else if (this.mode === "ending" || this.mode === "secretEnding") {
        this.updateEnding(rawDt);
      } else if (this.mode === "victory" || this.mode === "gameover") {
        this.updateParticlesOnly(rawDt);
      }

      this.render();
      requestAnimationFrame(this.loop);
    }

    updateMenuPreview(dt) {
      this.time += dt;
      const previewSpeed = 160;
      this.groundOffset = (this.groundOffset + previewSpeed * dt) % 48;
      this.farBgOffset = (this.farBgOffset + previewSpeed * 0.18 * dt) % this.bgTotalWidth;
      this.nearBgOffset = (this.nearBgOffset + previewSpeed * 0.36 * dt) % this.bgTotalWidth;
      this.cat.runAnimTimer += dt * 7;

      const lvlMode = this.level.mode || "runner";
      if (this.isSwimMode(lvlMode) || this.isPlaneMode(lvlMode)) {
        this.cat.y = Math.floor(GROUND_Y * 0.45 + Math.sin(this.time * 3) * 14);
        this.cat.onGround = false;
      } else {
        this.cat.y = GROUND_Y - 42;
        this.cat.onGround = true;
      }
      this.cat.ducking = false;
      this.nightFactor = (Math.sin(this.time * 0.25) + 1) * 0.5 * 0.6;

      this.clouds.forEach((c) => {
        c.x -= c.speed * dt;
        if (c.x + c.w < -20) c.x = WIDTH + 30;
      });
    }

    updateParticlesOnly(dt) {
      this.time += dt;
      this.updateParticles(dt);
      this.updateFloatingTexts(dt);
      if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    }

    updatePlaying(rawDt) {
      this.time += rawDt;
      this.runElapsedSec += rawDt;
      this.playSecondsAccum += rawDt;
      if (this.playSecondsAccum >= 5) {
        this.flushPlayTime();
      }

      if (this.hitstopTimer > 0) {
        this.hitstopTimer = Math.max(0, this.hitstopTimer - rawDt);
        this.updateParticles(rawDt);
        this.updateFloatingTexts(rawDt);
        return;
      }

      // ---- Slow-Motion ----
      const wantsSlow = this.keys.slowHeld && !this.slowLockout;
      if (wantsSlow && this.slowEnergy > 0) {
        if (!this.slowActive) {
          this.slowActive = true;
          RC.Audio.slowOn();
        }
        this.slowEnergy = Math.max(0, this.slowEnergy - SLOW_DRAIN_PER_SEC * rawDt);
        if (this.slowEnergy <= 0) {
          this.slowLockout = true;
          this.slowActive = false;
          RC.Audio.slowOff();
        }
      } else {
        if (this.slowActive) {
          this.slowActive = false;
          RC.Audio.slowOff();
        }
        const regenRate =
          RC.Storage && RC.Storage.hasUpgrade("slow_regen")
            ? SLOW_REGEN_PER_SEC * 1.35
            : SLOW_REGEN_PER_SEC;
        this.slowEnergy = Math.min(100, this.slowEnergy + regenRate * rawDt);
        if (this.slowLockout && this.slowEnergy >= SLOW_MIN_TO_START) {
          this.slowLockout = false;
        }
      }

      const targetScale = this.slowActive ? SLOW_TIME_SCALE : 1.0;
      this.timeScale += (targetScale - this.timeScale) * Math.min(1, rawDt * 14);
      const worldDt = rawDt * this.timeScale;

      const boostMult = this.snowBoostTimer > 0 ? 1.32 : 1.0;
      const blizzardMult = this.blizzardTimer > 0 ? 0.72 : 1.0;
      this.speed = Math.min(
        this.level.maxSpeed * this.insaneMult * boostMult,
        this.speed + this.level.accelPerSec * this.insaneMult * worldDt
      );
      if (this.snowBoostTimer > 0) this.snowBoostTimer = Math.max(0, this.snowBoostTimer - rawDt);

      // Blizzards in Snow Zone
      if (this.isSnowMode() && !this.isDemo) {
        if (this.blizzardTimer > 0) {
          this.blizzardTimer = Math.max(0, this.blizzardTimer - rawDt);
        } else {
          this.blizzardCooldown -= worldDt;
          if (this.blizzardCooldown <= 0) {
            this.blizzardTimer = 3.6;
            this.blizzardCooldown = 9.0 + Math.random() * 4.5;
            this.addFloatingText("❄ ¡VENTISCA!", WIDTH / 2 - 40, 88, "#dff9fb", 15);
          }
        }
      }
      const effectiveSpeed = this.speed * blizzardMult;
      const movePx = effectiveSpeed * worldDt;

      this.distanceMeters += movePx / 22;

      const milestone = Math.floor(this.distanceMeters / 100);
      if (milestone > this.lastMilestone && milestone > 0) {
        this.lastMilestone = milestone;
        RC.Audio.milestone();
        this.addFloatingText(`${milestone * 100}m!`, WIDTH / 2 - 20, 96, "#ffd32a", 18);
      }

      // Day/Night cycle
      const cycleDist = this.level.dayNightCycleDist || 240;
      const cyclePos = (this.distanceMeters % (cycleDist * 2)) / cycleDist;
      let targetNight = 0;
      if (cyclePos >= 0.85 && cyclePos < 1.15) {
        targetNight = (cyclePos - 0.85) / 0.3;
      } else if (cyclePos >= 1.15 && cyclePos < 1.85) {
        targetNight = 1;
      } else if (cyclePos >= 1.85) {
        targetNight = 1 - (cyclePos - 1.85) / 0.15;
      }
      this.nightFactor += (targetNight - this.nightFactor) * Math.min(1, rawDt * 3);

      // Parallax scrolling
      this.groundOffset = (this.groundOffset + movePx) % 48;
      this.farBgOffset = (this.farBgOffset + movePx * 0.16) % this.bgTotalWidth;
      this.nearBgOffset = (this.nearBgOffset + movePx * 0.36) % this.bgTotalWidth;

      this.clouds.forEach((c) => {
        c.x -= (c.speed + effectiveSpeed * 0.06) * worldDt;
        if (c.x + c.w < -20) {
          c.x = WIDTH + 20 + Math.random() * 80;
          c.y = 30 + Math.random() * 90;
        }
      });

      if (this.isSwimMode(this.level.mode)) {
        this.bubbles.forEach((b) => {
          b.y -= b.speedY * worldDt;
          b.x -= movePx * 0.35;
          if (b.y < 16 || b.x < -10) {
            b.y = GROUND_Y - 8;
            b.x = Math.random() * (WIDTH + 60);
          }
        });
      }

      this.groundPebbles.forEach((p) => {
        p.x -= movePx;
        if (p.x + p.w < 0) {
          p.x = WIDTH + Math.random() * 40;
          p.y = GROUND_Y + 8 + Math.floor(Math.random() * 44);
        }
      });

      // ---- Update Cat ----
      this.updateCat(rawDt, worldDt);

      // ---- Plane / Space Auto-fire if held ----
      if (this.isPlaneMode(this.level.mode) && (this.keys.fireHeld || this.keys.jumpHeld)) {
        this.firePlaneBullet();
      } else if (this.isSpaceMode(this.level.mode) && this.keys.fireHeld) {
        this.fireSpaceLaser();
      }

      // ---- Check Level Goal & Finish Gate ----
      if (!this.isDemo && this.level.targetDistance && !this.finishGateSpawned) {
        const remainingMeters = this.level.targetDistance - this.distanceMeters;
        if (remainingMeters <= 26) {
          this.finishGateSpawned = true;
          this.finishGateX = CAT_X + remainingMeters * 22 + 40;
        }
      }

      if (this.finishGateSpawned && this.finishGateX != null) {
        this.finishGateX -= movePx;
        if (this.finishGateX <= this.cat.x + this.cat.w * 0.5) {
          this.triggerVictory();
          return;
        }
      }

      // ---- Spawning ----
      if (!this.finishGateSpawned) {
        if (
          !this.isDemo &&
          this.level.mode !== "planeBoss" &&
          this.level.mode !== "spaceBoss" &&
          this.level.mode !== "batBoss" &&
          this.level.mode !== "snowBoss" &&
          this.level.mode !== "jungleBoss"
        ) {
          this.spawnTimer -= worldDt;
          if (this.spawnTimer <= 0) {
            this.spawnObstacle();
            const speedRatio = Math.max(0, (this.speed - 320) / 480);
            const lvlMode = this.level.mode || "runner";
            const insaneScale = RC.Storage && RC.Storage.isInsanityMode() ? 0.72 : 1.0;
            const scale = (this.level.spawnScale || 1.0) * insaneScale;
            let minInterval = Math.max(0.56, (1.02 - speedRatio * 0.35) * scale);
            let maxInterval = Math.max(0.9, (1.7 - speedRatio * 0.55) * scale);
            if (lvlMode === "boss") {
              minInterval = 1.45;
              maxInterval = 2.35;
            } else if (lvlMode === "swimBoss") {
              minInterval = 1.25;
              maxInterval = 2.0;
            } else if (lvlMode === "plane") {
              minInterval = 0.65;
              maxInterval = 1.2;
            }
            this.spawnTimer = minInterval + Math.random() * (maxInterval - minInterval);
          }
        }

        this.collectibleTimer -= worldDt;
        if (this.collectibleTimer <= 0) {
          this.spawnFishPattern();
          this.collectibleTimer = 1.55 + Math.random() * 1.7;
        }

        this.powerupTimer -= worldDt;
        if (this.powerupTimer <= 0) {
          this.spawnPowerup();
          this.powerupTimer = 9.5 + Math.random() * 6.5;
        }

        if (!this.isDemo) {
          this.movingCrateTimer -= worldDt;
          if (this.movingCrateTimer <= 0) {
            this.spawnMovingCrate();
            this.movingCrateTimer = 8.5 + Math.random() * 6.5;
          }

          this.zoneHazardTimer -= worldDt;
          if (this.zoneHazardTimer <= 0) {
            this.spawnZoneHazard();
            const hScale = RC.Storage && RC.Storage.isInsanityMode() ? 0.72 : 1.0;
            this.zoneHazardTimer = (6.5 + Math.random() * 4.5) * hScale;
          }
        }
      }

      // ---- Update Projectiles (Plane mode) & Launched Mines (Swim modes) ----
      this.updateProjectiles(rawDt);
      this.updateLaunchedMines(rawDt);
      if (this.mode !== "playing") return;

      // ---- Update Boss (Chicken, Squid, Plane, Skeleton, Penguin, Snake, or Space UFO) ----
      if (this.boss && this.boss.active) {
        if (this.boss.kind === "squid") {
          this.updateSquidBoss(rawDt, worldDt);
        } else if (this.boss.kind === "plane") {
          this.updatePlaneBoss(rawDt, worldDt);
        } else if (this.boss.kind === "skeleton") {
          this.updateSkeletonBoss(rawDt, worldDt);
        } else if (this.boss.kind === "penguin") {
          this.updatePenguinBoss(rawDt, worldDt);
        } else if (this.boss.kind === "snake") {
          this.updateSnakeBoss(rawDt, worldDt);
        } else if (this.boss.kind === "ufo") {
          this.updateSpaceBoss(rawDt, worldDt);
        } else {
          this.updateBoss(rawDt, worldDt);
        }
        if (this.mode !== "playing") return;
      }

      // ---- Update Alien & Spooky Shots ----
      this.updateAlienShots(worldDt);
      if (this.mode !== "playing") return;
      this.updateSpookyShots(worldDt);
      if (this.mode !== "playing") return;
      if (this.lightningTimer > 0) this.lightningTimer = Math.max(0, this.lightningTimer - rawDt);

      // ---- Update Pits, Vines, Branches & Obstacles & Collisions ----
      this.updatePits(movePx);
      this.updateVines(movePx);
      this.updateBranches(movePx);
      if (this.mode !== "playing") return;
      this.updateObstacles(worldDt, movePx);
      if (this.mode !== "playing") return;

      // ---- Update Collectibles ----
      this.updateCollectibles(worldDt, movePx);

      // ---- FX & Timers ----
      if (this.comboTimer > 0) {
        this.comboTimer -= rawDt;
        if (this.comboTimer <= 0) this.comboCount = 0;
      }
      if (this.shakeTimer > 0) {
        this.shakeTimer = Math.max(0, this.shakeTimer - rawDt);
      }
      this.updateParticles(rawDt);
      this.updateFloatingTexts(rawDt);

      this.notifyHud();
    }

    updateCat(rawDt, worldDt) {
      const cat = this.cat;
      const lvlMode = this.level.mode || "runner";

      if (cat.clawTimer > 0) cat.clawTimer = Math.max(0, cat.clawTimer - rawDt);
      if (cat.clawCooldown > 0) cat.clawCooldown = Math.max(0, cat.clawCooldown - rawDt);
      if (cat.fireCooldown > 0) cat.fireCooldown = Math.max(0, cat.fireCooldown - rawDt);
      if (cat.dashCooldown > 0) cat.dashCooldown = Math.max(0, cat.dashCooldown - rawDt);
      if (cat.dashTimer > 0) {
        cat.dashTimer = Math.max(0, cat.dashTimer - rawDt);
        cat.x = Math.min(CAT_X + 85, cat.x + 360 * rawDt);
      } else if (this.blizzardTimer > 0 && !cat.onGround) {
        // Blizzard pushes jumping cat backward!
        cat.x = Math.max(36, cat.x - 115 * rawDt);
      } else {
        // Smoothly return cat.x to CAT_X
        cat.x += (CAT_X - cat.x) * Math.min(1, rawDt * 5);
      }
      if (cat.invulnTimer > 0) cat.invulnTimer = Math.max(0, cat.invulnTimer - rawDt);
      if (cat.magnetTimer > 0) cat.magnetTimer = Math.max(0, cat.magnetTimer - rawDt);
      if (cat.milkTimer > 0) cat.milkTimer = Math.max(0, cat.milkTimer - rawDt);

      if (this.isSwimMode(lvlMode)) {
        // Underwater buoyant swimming
        cat.w = 54;
        cat.h = 36;
        cat.ducking = false;
        cat.onGround = false;

        let targetVy = 45; // gentle sink/drift
        if (this.keys.upHeld || this.keys.jumpHeld) {
          targetVy = -265;
        } else if (this.keys.duckHeld) {
          targetVy = 285;
        }
        cat.vy += (targetVy - cat.vy) * Math.min(1, rawDt * 9);
        cat.y += cat.vy * rawDt;

        const minY = 28;
        const maxY = GROUND_Y - cat.h;
        if (cat.y < minY) {
          cat.y = minY;
          cat.vy = 0;
        } else if (cat.y > maxY) {
          cat.y = maxY;
          cat.vy = 0;
        }
      } else if (this.isPlaneMode(lvlMode)) {
        // Smooth 2D vertical flight
        cat.w = 54;
        cat.h = 27;
        cat.ducking = false;
        cat.onGround = false;

        let targetVy = 0;
        if (this.keys.upHeld) targetVy = -310;
        else if (this.keys.duckHeld) targetVy = 310;

        cat.vy += (targetVy - cat.vy) * Math.min(1, rawDt * 14);
        cat.y += cat.vy * rawDt;

        const minY = 22;
        const maxY = GROUND_Y - cat.h - 4;
        if (cat.y < minY) {
          cat.y = minY;
          cat.vy = 0;
        } else if (cat.y > maxY) {
          cat.y = maxY;
          cat.vy = 0;
        }
      } else {
        // Standard Runner / Boss ground physics
        const shouldDuck = this.keys.duckHeld && cat.onGround;
        if (shouldDuck !== cat.ducking) {
          cat.ducking = shouldDuck;
          cat.h = shouldDuck ? 27 : 42;
          cat.w = shouldDuck ? 54 : 48;
          if (cat.onGround) {
            cat.y = GROUND_Y - cat.h;
          }
        }

        if (cat.onGround) {
          cat.coyoteTimer = COYOTE_TIME;
        } else {
          cat.coyoteTimer = Math.max(0, cat.coyoteTimer - rawDt);
        }

        if (cat.jumpBufferTimer > 0) {
          cat.jumpBufferTimer = Math.max(0, cat.jumpBufferTimer - rawDt);
          if (cat.onGround || cat.coyoteTimer > 0) {
            this.tryExecuteJump();
          }
        }

        const physDt = this.slowActive ? rawDt * 0.68 : rawDt;
        const isSpace = this.isSpaceMode(lvlMode);
        const pitHit = this.isOverPit(cat.x + cat.w * 0.5);
        const overPit = Boolean(pitHit);

        if (cat.onVine) {
          cat.vy = 0;
          cat.onGround = false;
          cat.y = cat.onVine.y + cat.onVine.h - cat.h - 8;
        } else {
          // Check if cat is standing on an elevated branch
          const onBranch = this.findBranchUnderCat(cat);
          if (cat.onGround && overPit && !onBranch) {
            cat.onGround = false;
            cat.vy = 90;
          }
          if (cat.onGround && !onBranch && cat.y + cat.h < GROUND_Y - 4) {
            cat.onGround = false;
          }
          if (!cat.onGround) {
            const g = isSpace
              ? this.keys.duckHeld
                ? SPACE_FAST_FALL_GRAVITY
                : SPACE_GRAVITY
              : this.keys.duckHeld
              ? FAST_FALL_GRAVITY
              : GRAVITY;
            const prevBottom = cat.y + cat.h;
            cat.vy += g * physDt;
            cat.y += cat.vy * physDt;

            if (cat.y < 14) {
              cat.y = 14;
              if (cat.vy < 0) cat.vy = 0;
            }

            if (overPit && cat.y > GROUND_Y + 12) {
              this.triggerHazardEvent(pitHit.kind === "swamp" ? "swamp" : "pit");
              return;
            }

            // Land on elevated jungle branch
            const targetH = this.keys.duckHeld ? 27 : 42;
            const landingBranch = this.findLandingBranch(cat, prevBottom, targetH);
            if (landingBranch && !this.keys.duckHeld) {
              cat.ducking = false;
              cat.h = 42;
              cat.w = 48;
              cat.y = landingBranch.y - cat.h;
              cat.vy = 0;
              cat.onGround = true;
              cat.jumpsUsed = 0;
            } else if (!overPit && cat.y + targetH >= GROUND_Y) {
              cat.ducking = this.keys.duckHeld;
              cat.h = targetH;
              cat.w = cat.ducking ? 54 : 48;
              cat.y = GROUND_Y - cat.h;
              cat.vy = 0;
              cat.onGround = true;
              cat.jumpsUsed = 0;
              this.spawnDust(cat.x + 20, GROUND_Y - 2, 5, "#d9ccb4");
            }
          }
        }
      }

      cat.runAnimTimer += worldDt * (this.speed / 34);

      if ((this.slowActive || cat.milkTimer > 0) && Math.floor(this.time * 24) % 2 === 0) {
        cat.afterimages.push({
          x: cat.x,
          y: cat.y,
          pose: this.getCatPose(),
          alpha: 0.45
        });
        if (cat.afterimages.length > 5) cat.afterimages.shift();
      }
      cat.afterimages.forEach((img) => {
        img.x -= this.speed * worldDt * 0.65;
        img.alpha -= rawDt * 1.9;
      });
      cat.afterimages = cat.afterimages.filter((img) => img.alpha > 0.02);
    }

    getCatPose() {
      const cat = this.cat;
      const lvlMode = this.level.mode || "runner";
      if (this.mode === "gameover") return "hurt";
      if (this.isSwimMode(lvlMode)) {
        return Math.floor(cat.runAnimTimer) % 2 === 0 ? "swim1" : "swim2";
      }
      if (this.isPlaneMode(lvlMode)) {
        return Math.floor(this.time * 16) % 2 === 0 ? "plane1" : "plane2";
      }
      if (this.isBatMode(lvlMode) && !cat.onGround && cat.jumpsUsed >= 2) {
        return Math.floor(cat.runAnimTimer * 1.4) % 2 === 0 ? "bat1" : "bat2";
      }
      if (cat.clawTimer > 0) return "slash";
      if (!cat.onGround) return "jump";
      const frame = Math.floor(cat.runAnimTimer) % 2;
      if (cat.ducking) return frame === 0 ? "duck1" : "duck2";
      return frame === 0 ? "run1" : "run2";
    }

    getCatHitbox() {
      const cat = this.cat;
      if (cat.ducking) {
        return { x: cat.x + 8, y: cat.y + 6, w: cat.w - 14, h: cat.h - 8 };
      }
      return { x: cat.x + 10, y: cat.y + 7, w: cat.w - 18, h: cat.h - 10 };
    }

    getClawHitbox() {
      const cat = this.cat;
      return {
        x: cat.x + cat.w - 8,
        y: cat.y - 12,
        w: 72,
        h: cat.h + 24
      };
    }

    // ---- Spawners ----
    pickWeightedObstacle() {
      const table = this.level.obstacles;
      const total = table.reduce((sum, item) => sum + item.weight, 0);
      let roll = Math.random() * total;
      for (const item of table) {
        roll -= item.weight;
        if (roll <= 0) return item.type;
      }
      return table[0].type;
    }

    spawnObstacle() {
      const type = this.pickWeightedObstacle();
      const x = WIDTH + 40;
      const lvlMode = this.level.mode || "runner";
      let obs = null;

      if (type === "hydrant") {
        obs = { type, sprite: "hydrant", x, y: GROUND_Y - 39, w: 30, h: 39, scratchable: false, extraSpeed: 0 };
      } else if (type === "trash") {
        obs = { type, sprite: "trash", x, y: GROUND_Y - 39, w: 36, h: 39, scratchable: false, extraSpeed: 0 };
      } else if (type === "bush") {
        obs = { type, sprite: "bush", x, y: GROUND_Y - 30, w: 45, h: 30, scratchable: false, extraSpeed: 0 };
      } else if (type === "antenna") {
        obs = { type, sprite: "antenna", x, y: GROUND_Y - 42, w: 30, h: 42, scratchable: false, extraSpeed: 0 };
      } else if (type === "hay") {
        obs = { type, sprite: "hay", x, y: GROUND_Y - 27, w: 36, h: 27, scratchable: true, points: 25, extraSpeed: 0 };
      } else if (type === "crate") {
        obs = {
          type,
          sprite: "crate",
          x,
          y: GROUND_Y - 36,
          w: 36,
          h: 36,
          scratchable: true,
          points: 30,
          extraSpeed: 0
        };
      } else if (type === "mouse") {
        obs = {
          type,
          sprite: "mouse1",
          animFrames: ["mouse1", "mouse2"],
          x,
          y: GROUND_Y - 27,
          w: 42,
          h: 27,
          scratchable: true,
          points: 50,
          extraSpeed: 55
        };
      } else if (type === "skyDrop") {
        // Falling branch/acorn from the sky (Level 2 aerial hazard)
        obs = {
          type,
          sprite: "skyDrop",
          x: WIDTH * (0.52 + Math.random() * 0.38),
          y: -28,
          w: 36,
          h: 21,
          scratchable: true,
          points: 45,
          vy: 145 + Math.random() * 65,
          extraSpeed: -40
        };
      } else if (type === "seaWall") {
        // Tall breakable underwater wall! Smash with Special Attack (X)
        const wallH = 114;
        const fromTop = Math.random() < 0.45;
        const wy = fromTop ? 26 : GROUND_Y - wallH;
        obs = {
          type,
          sprite: "seaWall",
          x,
          y: wy,
          w: 34,
          h: wallH,
          scratchable: true,
          shootable: false,
          points: 60,
          extraSpeed: 0
        };
      } else if (type === "jellyfish") {
        const laneY = 48 + Math.random() * (GROUND_Y - 110);
        obs = {
          type,
          sprite: "jellyfish1",
          animFrames: ["jellyfish1", "jellyfish2"],
          x,
          y: laneY,
          baseY: laneY,
          w: 36,
          h: 24,
          scratchable: true,
          points: 50,
          extraSpeed: 28,
          bobPhase: Math.random() * Math.PI * 2
        };
      } else if (type === "seaMine") {
        const laneY = 50 + Math.random() * (GROUND_Y - 105);
        obs = {
          type,
          sprite: "seaMine",
          x,
          y: laneY,
          baseY: laneY,
          w: 30,
          h: 30,
          scratchable: false,
          extraSpeed: 0,
          bobPhase: Math.random() * Math.PI * 2
        };
      } else if (type === "proxMine") {
        // Proximity bomb: arms if cat swims too close; can be scratched (X) to launch forward!
        const laneY = 54 + Math.random() * (GROUND_Y - 114);
        obs = {
          type,
          sprite: "proxMine",
          x,
          y: laneY,
          baseY: laneY,
          w: 30,
          h: 30,
          scratchable: true,
          launchable: true,
          isProximityMine: true,
          proxRadius: 96,
          blastRadius: 72,
          armed: false,
          fuseTimer: 0.45,
          beepCooldown: 0,
          extraSpeed: 0,
          bobPhase: Math.random() * Math.PI * 2
        };
      } else if (type === "seaweed") {
        // Full-height dense seaweed barrier: only passable by attacking (X)
        obs = {
          type,
          sprite: "seaweed",
          x,
          y: 24,
          w: 42,
          h: GROUND_Y - 24,
          scratchable: true,
          shootable: false,
          points: 65,
          extraSpeed: 0
        };
      } else if (type === "coral") {
        obs = {
          type,
          sprite: "coral",
          x,
          y: GROUND_Y - 30,
          w: 36,
          h: 30,
          scratchable: false,
          extraSpeed: 0
        };
      } else if (type === "iceBlock") {
        obs = {
          type,
          sprite: "iceBlock",
          x,
          y: GROUND_Y - 36,
          w: 36,
          h: 36,
          scratchable: true,
          points: 35,
          extraSpeed: 0
        };
      } else if (type === "polarBear") {
        obs = {
          type,
          sprite: "polarBear1",
          animFrames: ["polarBear1", "polarBear2"],
          x,
          y: GROUND_Y - 30,
          w: 42,
          h: 30,
          scratchable: true,
          canHop: true,
          canSnowball: true,
          shootTimer: 0.9 + Math.random() * 0.8,
          hopDone: false,
          vy: 0,
          points: 60,
          extraSpeed: 45
        };
      } else if (type === "seal") {
        obs = {
          type,
          sprite: "seal1",
          animFrames: ["seal1", "seal2"],
          x,
          y: GROUND_Y - 22,
          w: 42,
          h: 22,
          scratchable: true,
          canHop: true,
          hopDone: false,
          vy: 0,
          points: 55,
          extraSpeed: 85
        };
      } else if (type === "eagle") {
        const ey = 62 + Math.random() * 78;
        obs = {
          type,
          sprite: "eagle1",
          animFrames: ["eagle1", "eagle2"],
          x,
          y: ey,
          baseY: ey,
          w: 42,
          h: 20,
          scratchable: true,
          canSnowball: true,
          swoop: true,
          shootTimer: 0.8 + Math.random() * 0.8,
          points: 60,
          extraSpeed: 80,
          bobPhase: Math.random() * Math.PI * 2
        };
      } else if (type === "whale") {
        obs = {
          type,
          sprite: "whale1",
          animFrames: ["whale1", "whale2"],
          x,
          y: GROUND_Y - 21,
          w: 42,
          h: 21,
          scratchable: false,
          canWaterJet: true,
          shootTimer: 0.75 + Math.random() * 0.6,
          extraSpeed: 0
        };
      } else if (type === "jungleSnake") {
        obs = {
          type,
          sprite: "jungleSnake1",
          animFrames: ["jungleSnake1", "jungleSnake2"],
          x,
          y: GROUND_Y - 15,
          w: 51,
          h: 15,
          scratchable: true,
          canVomit: true,
          shootTimer: 0.85 + Math.random() * 0.8,
          points: 60,
          extraSpeed: 55
        };
      } else if (type === "monkey") {
        const my = 34 + Math.random() * 28;
        obs = {
          type,
          sprite: "monkey1",
          animFrames: ["monkey1", "monkey2"],
          x,
          y: my,
          baseY: my,
          bobAmp: 12,
          w: 36,
          h: 27,
          scratchable: true,
          canCoconut: true,
          shootTimer: 0.7 + Math.random() * 0.7,
          points: 65,
          extraSpeed: 20,
          bobPhase: Math.random() * Math.PI * 2
        };
      } else if (type === "bee") {
        const by = 42 + Math.random() * (GROUND_Y - 95);
        const dx = this.cat.x - x;
        const dy = this.cat.y - by;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const spd = 460;
        obs = {
          type,
          sprite: "bee1",
          animFrames: ["bee1", "bee2"],
          x,
          y: by,
          w: 36,
          h: 15,
          scratchable: true,
          lockedTrajectory: true,
          vx: (dx / dist) * spd,
          vy: (dy / dist) * spd,
          points: 70,
          extraSpeed: 0
        };
      } else if (type === "croc") {
        obs = {
          type,
          sprite: "croc1",
          animFrames: ["croc1", "croc2"],
          x,
          y: GROUND_Y - 18,
          w: 42,
          h: 18,
          scratchable: false,
          canHop: true,
          hopVel: -520,
          hopDone: false,
          vy: 0,
          extraSpeed: 10
        };
      } else if (type === "ruins") {
        obs = {
          type,
          sprite: "ruins",
          x,
          y: GROUND_Y - 28,
          w: 42,
          h: 28,
          scratchable: false,
          extraSpeed: 0
        };
      } else if (type === "jaguar") {
        obs = {
          type,
          sprite: "jaguar1",
          animFrames: ["jaguar1", "jaguar2"],
          x,
          y: GROUND_Y - 30,
          w: 48,
          h: 30,
          scratchable: true,
          canHop: true,
          hopVel: -460,
          hopDone: false,
          vy: 0,
          points: 65,
          extraSpeed: 105
        };
      } else if (type === "toucan") {
        const ty = 60 + Math.random() * 82;
        obs = {
          type,
          sprite: "toucan1",
          animFrames: ["toucan1", "toucan2"],
          x,
          y: ty,
          baseY: ty,
          w: 36,
          h: 18,
          scratchable: true,
          canEgg: true,
          swoop: true,
          shootTimer: 0.75 + Math.random() * 0.85,
          points: 60,
          extraSpeed: 70,
          bobPhase: Math.random() * Math.PI * 2
        };
      } else if (type === "jungleBug") {
        const by = GROUND_Y - 62 - Math.random() * 48;
        obs = {
          type,
          sprite: "jungleBug1",
          animFrames: ["jungleBug1", "jungleBug2"],
          x,
          y: by,
          baseY: by,
          w: 36,
          h: 16,
          scratchable: true,
          canVomit: true,
          shootTimer: 0.9 + Math.random() * 0.9,
          points: 55,
          extraSpeed: 65,
          bobPhase: Math.random() * Math.PI * 2
        };
      } else if (type === "tombstone") {
        obs = {
          type,
          sprite: "tombstone",
          x,
          y: GROUND_Y - 33,
          w: 36,
          h: 33,
          scratchable: false,
          extraSpeed: 0
        };
      } else if (type === "miniSkeleton") {
        obs = {
          type,
          sprite: "miniSkeleton1",
          animFrames: ["miniSkeleton1", "miniSkeleton2"],
          x,
          y: GROUND_Y - 30,
          w: 36,
          h: 30,
          scratchable: true,
          points: 55,
          extraSpeed: 60
        };
      } else if (type === "spider") {
        const sy = 44 + Math.random() * 48;
        obs = {
          type,
          sprite: "spider1",
          animFrames: ["spider1", "spider2"],
          x,
          y: sy,
          baseY: sy,
          w: 36,
          h: 18,
          scratchable: true,
          canDrop: true,
          shootTimer: 0.75 + Math.random() * 0.9,
          points: 60,
          extraSpeed: 20,
          bobPhase: Math.random() * Math.PI * 2
        };
      } else if (type === "zombie") {
        obs = {
          type,
          sprite: "zombie1",
          animFrames: ["zombie1", "zombie2"],
          x,
          y: GROUND_Y - 30,
          w: 36,
          h: 30,
          scratchable: true,
          canVomit: true,
          shootTimer: 0.95 + Math.random() * 1.0,
          points: 65,
          extraSpeed: 25
        };
      } else if (type === "crow") {
        const cy = 62 + Math.random() * 88;
        obs = {
          type,
          sprite: "crow1",
          animFrames: ["crow1", "crow2"],
          x,
          y: cy,
          baseY: cy,
          w: 36,
          h: 18,
          scratchable: true,
          canEgg: true,
          shootTimer: 0.8 + Math.random() * 1.0,
          points: 60,
          extraSpeed: 65,
          bobPhase: Math.random() * Math.PI * 2
        };
      } else if (type === "alienWalker") {
        const canShoot = this.level.id !== "space1" ? Math.random() < 0.7 : Math.random() < 0.4;
        obs = {
          type,
          sprite: "alienWalker1",
          animFrames: ["alienWalker1", "alienWalker2"],
          x,
          y: GROUND_Y - 33,
          w: 42,
          h: 33,
          scratchable: true,
          shootable: true,
          canShoot,
          shootTimer: 0.9 + Math.random() * 1.1,
          points: 55,
          extraSpeed: 40
        };
      } else if (type === "alienFloater") {
        const laneY = Math.random() < 0.5 ? GROUND_Y - 82 : GROUND_Y - 134;
        const canShoot = this.level.id !== "space1" ? Math.random() < 0.75 : Math.random() < 0.45;
        obs = {
          type,
          sprite: "alienFloater1",
          animFrames: ["alienFloater1", "alienFloater2"],
          x,
          y: laneY,
          baseY: laneY,
          w: 42,
          h: 24,
          scratchable: true,
          shootable: true,
          canShoot,
          shootTimer: 0.8 + Math.random() * 1.1,
          points: 65,
          extraSpeed: 50,
          bobPhase: Math.random() * Math.PI * 2
        };
      } else if (type === "spaceRock") {
        const floating = Math.random() < 0.35;
        const ry = floating ? GROUND_Y - 88 : GROUND_Y - 24;
        obs = {
          type,
          sprite: "spaceRock",
          x,
          y: ry,
          w: 36,
          h: 24,
          scratchable: false,
          shootable: false,
          extraSpeed: 0
        };
      } else if (type === "skyBlock") {
        // Floating sky blocks at varied altitudes for Mini-Plane weaving
        const lane = Math.floor(Math.random() * 3); // 0=top, 1=mid, 2=low
        const blockH = 58;
        const blockY = lane === 0 ? 28 : lane === 1 ? 124 : GROUND_Y - blockH - 6;
        obs = {
          type,
          sprite: "skyBlock",
          x,
          y: blockY,
          w: 42,
          h: blockH,
          scratchable: false,
          shootable: false,
          extraSpeed: 0
        };
      } else if (type === "bird" || type === "drone") {
        const isDrone = type === "drone";
        let laneY;
        if (lvlMode === "plane") {
          laneY = 34 + Math.random() * (GROUND_Y - 76);
        } else {
          const lanes = [GROUND_Y - 34, GROUND_Y - 58, GROUND_Y - 98];
          laneY = lanes[Math.floor(Math.random() * lanes.length)];
        }
        obs = {
          type,
          sprite: isDrone ? "drone1" : "bird1",
          animFrames: isDrone ? ["drone1", "drone2"] : ["bird1", "bird2"],
          x,
          y: laneY,
          baseY: laneY,
          w: 42,
          h: 24,
          scratchable: true,
          shootable: true,
          points: isDrone ? 65 : 50,
          extraSpeed: isDrone ? 75 : 48,
          bobPhase: Math.random() * Math.PI * 2
        };
      }

      if (obs) {
        obs.animTimer = 0;
        this.obstacles.push(obs);
        if (RC.Storage && !this.isDemo) {
          const encKey =
            type === "trash" || type === "bush" || type === "antenna" ? "hydrant" : type;
          RC.Storage.discoverEntry(encKey);
        }

        // In harder runner levels (N2, N3, Endless), occasionally pair ground obstacles with an aerial hazard
        const isGroundRunner =
          lvlMode === "runner" &&
          (this.level.spawnScale || 1) <= 0.85 &&
          ["hydrant", "trash", "bush", "antenna", "crate"].includes(type);
        const airChance = (this.level.spawnScale || 1) <= 0.72 ? 0.38 : 0.22;
        if (isGroundRunner && Math.random() < airChance) {
          const isDrone = Math.random() < 0.45;
          const airY = GROUND_Y - (Math.random() < 0.5 ? 102 : 60);
          this.obstacles.push({
            type: isDrone ? "drone" : "bird",
            sprite: isDrone ? "drone1" : "bird1",
            animFrames: isDrone ? ["drone1", "drone2"] : ["bird1", "bird2"],
            x: x + 150 + Math.random() * 75,
            y: airY,
            baseY: airY,
            w: 42,
            h: 24,
            scratchable: true,
            shootable: true,
            points: isDrone ? 65 : 50,
            extraSpeed: isDrone ? 70 : 45,
            bobPhase: Math.random() * Math.PI * 2,
            animTimer: 0
          });
        }
      }
    }

    spawnFishPattern() {
      const pattern = Math.random();
      const startX = WIDTH + 50;
      const lvlMode = this.level.mode || "runner";

      if (this.isSwimMode(lvlMode) || this.isPlaneMode(lvlMode)) {
        const baseY = 48 + Math.random() * (GROUND_Y - 110);
        for (let i = 0; i < 3; i++) {
          const isGold = i === 1 && Math.random() < 0.35;
          this.collectibles.push({
            kind: isGold ? "goldFish" : "fish",
            x: startX + i * 44,
            y: baseY + (i === 1 ? -16 : 0),
            w: 32,
            h: 22,
            points: isGold ? 75 : 25,
            slowBoost: isGold ? 28 : 12,
            phase: i * 0.7
          });
        }
        return;
      }

      if (pattern < 0.45) {
        for (let i = 0; i < 3; i++) {
          const arcY = GROUND_Y - 46 - (i === 1 ? 34 : 10);
          const isGold = i === 1 && Math.random() < 0.35;
          this.collectibles.push({
            kind: isGold ? "goldFish" : "fish",
            x: startX + i * 44,
            y: arcY,
            w: 32,
            h: 22,
            points: isGold ? 75 : 25,
            slowBoost: isGold ? 28 : 12,
            phase: i * 0.7
          });
        }
      } else if (pattern < 0.8) {
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          this.collectibles.push({
            kind: "fish",
            x: startX + i * 42,
            y: GROUND_Y - 30,
            w: 32,
            h: 22,
            points: 25,
            slowBoost: 12,
            phase: i * 0.6
          });
        }
      } else {
        this.collectibles.push({
          kind: "goldFish",
          x: startX,
          y: GROUND_Y - 122,
          w: 34,
          h: 24,
          points: 75,
          slowBoost: 30,
          phase: 0
        });
      }
    }

    spawnPowerup() {
      const lvlMode = this.level.mode || "runner";
      const kinds = lvlMode === "snow" ? ["snowBoost", "shield", "magnet", "milk"] : ["shield", "magnet", "milk"];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      this.collectibles.push({
        kind,
        isPowerup: true,
        x: WIDTH + 60,
        y: 68 + Math.floor(Math.random() * (GROUND_Y - 135)),
        w: 33,
        h: 33,
        phase: Math.random() * Math.PI * 2
      });
    }

    isOverPit(cx) {
      for (let i = 0; i < this.pits.length; i++) {
        const p = this.pits[i];
        if (cx > p.x + 12 && cx < p.x + p.w - 12) return p;
      }
      return null;
    }

    findBranchUnderCat(cat) {
      const cx = cat.x + cat.w * 0.5;
      for (let i = 0; i < this.branches.length; i++) {
        const b = this.branches[i];
        if (cx >= b.x - 8 && cx <= b.x + b.w + 8 && Math.abs(cat.y + cat.h - b.y) <= 8) {
          return b;
        }
      }
      return null;
    }

    findLandingBranch(cat, prevBottom, targetH) {
      if (cat.vy < 0) return null;
      const cx = cat.x + cat.w * 0.5;
      const newBottom = cat.y + targetH;
      for (let i = 0; i < this.branches.length; i++) {
        const b = this.branches[i];
        if (cx >= b.x - 8 && cx <= b.x + b.w + 8 && prevBottom <= b.y + 8 && newBottom >= b.y) {
          return b;
        }
      }
      return null;
    }

    updateBranches(movePx) {
      for (let i = this.branches.length - 1; i >= 0; i--) {
        this.branches[i].x -= movePx;
        if (this.branches[i].x + this.branches[i].w < -60) {
          this.branches.splice(i, 1);
        }
      }
    }

    updateVines(movePx) {
      const cat = this.cat;
      const catBox = this.getCatHitbox();
      for (let i = this.vines.length - 1; i >= 0; i--) {
        const v = this.vines[i];
        v.x -= movePx;
        if (v.x + v.w < -40) {
          if (cat.onVine === v) cat.onVine = null;
          this.vines.splice(i, 1);
          continue;
        }

        if (!cat.onGround && !cat.onVine) {
          const grabBox = { x: v.x - 14, y: v.y + 40, w: v.w + 28, h: v.h - 20 };
          if (this.rectsOverlap(catBox, grabBox)) {
            cat.onVine = v;
            cat.vy = 0;
            cat.jumpsUsed = 1;
            RC.Audio.jump();
            this.addFloatingText("🌿 ¡LIANA!", v.x, v.y + v.h, "#2ed573", 11);
          }
        }
      }
      if (cat.onVine && cat.onVine.x + cat.onVine.w < cat.x - 10) {
        cat.onVine = null;
      }
    }

    updatePits(movePx) {
      for (let i = this.pits.length - 1; i >= 0; i--) {
        this.pits[i].x -= movePx;
        if (this.pits[i].x + this.pits[i].w < -40) {
          this.pits.splice(i, 1);
        }
      }
    }

    spawnMovingCrate() {
      if (RC.Storage) RC.Storage.discoverEntry("movingCrate");
      const laneY = 54 + Math.random() * (GROUND_Y - 115);
      this.obstacles.push({
        type: "movingCrate",
        sprite: "movingCrate",
        x: WIDTH + 40,
        y: laneY,
        baseY: laneY,
        w: 48,
        h: 21,
        scratchable: true,
        shootable: true,
        isMovingCrate: true,
        points: 45,
        extraSpeed: 35,
        bobPhase: Math.random() * Math.PI * 2,
        animTimer: 0
      });
    }

    spawnZoneHazard() {
      if (RC.Storage) RC.Storage.discoverEntry("whirlpool");
      const lvlMode = this.level.mode || "runner";
      const x = WIDTH + 60;

      if (lvlMode === "runner" || lvlMode === "boss" || this.isSnowMode(lvlMode)) {
        // Pit in the ground (Hueco en el suelo / nieve)
        this.pits.push({ x, w: 78 + Math.floor(Math.random() * 18), kind: "pit" });
      } else if (this.isJungleMode(lvlMode)) {
        // Swamp + hanging vine + elevated branching platform!
        const sw = 92 + Math.floor(Math.random() * 18);
        this.pits.push({ x, w: sw, kind: "swamp" });
        this.vines.push({ x: x + Math.floor(sw * 0.35), y: 12, w: 22, h: 175 });
        const by = Math.random() < 0.5 ? GROUND_Y - 96 : GROUND_Y - 144;
        this.branches.push({ x: x + sw + 30, y: by, w: 155 + Math.floor(Math.random() * 45) });
      } else if (this.isSwimMode(lvlMode)) {
        // Whirlpool (Remolino marino)
        const wy = 70 + Math.random() * (GROUND_Y - 140);
        this.obstacles.push({
          type: "whirlpool",
          sprite: "whirlpool1",
          animFrames: ["whirlpool1", "whirlpool2"],
          x,
          y: wy,
          baseY: wy,
          w: 42,
          h: 24,
          scratchable: false,
          shootable: false,
          isZoneHazard: "whirlpool",
          suctionRadius: 118,
          extraSpeed: 10,
          bobPhase: Math.random() * Math.PI * 2,
          animTimer: 0
        });
      } else if (this.isPlaneMode(lvlMode)) {
        // Tornado
        const ty = 48 + Math.random() * (GROUND_Y - 120);
        this.obstacles.push({
          type: "tornado",
          sprite: "tornado1",
          animFrames: ["tornado1", "tornado2"],
          x,
          y: ty,
          baseY: ty,
          w: 42,
          h: 27,
          scratchable: false,
          shootable: false,
          isZoneHazard: "tornado",
          extraSpeed: 35,
          bobPhase: Math.random() * Math.PI * 2,
          animTimer: 0
        });
      } else if (this.isBatMode(lvlMode)) {
        // Floating Ghost (Fantasma secuestrador)
        const gy = 54 + Math.random() * (GROUND_Y - 115);
        this.obstacles.push({
          type: "ghost",
          sprite: "ghost1",
          animFrames: ["ghost1", "ghost2"],
          x,
          y: gy,
          baseY: gy,
          w: 42,
          h: 30,
          scratchable: false,
          shootable: false,
          isZoneHazard: "ghost",
          extraSpeed: 30,
          bobPhase: Math.random() * Math.PI * 2,
          animTimer: 0
        });
      } else if (this.isSpaceMode(lvlMode)) {
        // Abductor UFO with tractor beam
        const uy = 38 + Math.random() * 45;
        this.obstacles.push({
          type: "abductorUfo",
          sprite: "abductorUfo1",
          animFrames: ["abductorUfo1", "abductorUfo2"],
          x,
          y: uy,
          baseY: uy,
          w: 48,
          h: 18,
          scratchable: false,
          shootable: false,
          isZoneHazard: "abductor",
          extraSpeed: 20,
          bobPhase: Math.random() * Math.PI * 2,
          animTimer: 0
        });
      }
    }

    takeDamage() {
      if (this.cat.milkTimer > 0 || this.cat.invulnTimer > 0) return false;
      if (this.cat.shield) {
        this.cat.shield = false;
        this.cat.invulnTimer = 1.15;
        RC.Audio.shieldBreak();
        this.triggerShake(8, 0.22);
        this.addFloatingText("¡ESCUDO ROTO!", this.cat.x, this.cat.y - 16, "#48dbfb", 13);
        this.spawnBurst(this.cat.x + 24, this.cat.y + 20, "#48dbfb", 16);
        return false;
      }

      this.hitsTaken += 1;
      this.lives -= 1;
      this.triggerShake(10, 0.25);
      this.spawnBurst(this.cat.x + 24, this.cat.y + 20, "#ff4757", 16);

      if (this.lives > 0) {
        this.cat.invulnTimer = 1.5;
        RC.Audio.shieldBreak();
        this.addFloatingText("💔 -1 VIDA!", this.cat.x, this.cat.y - 18, "#ff4757", 14);
        this.notifyHud();
        return false;
      }

      this.triggerGameOver();
      return true;
    }

    triggerHazardEvent(kind, obs) {
      this.lives = 0;
      this.mode = "hazardEvent";
      this.slowActive = false;
      RC.Audio.gameOver();
      this.triggerShake(12, 0.35);

      const texts = {
        pit: "¡CAÍSTE AL HUECO!",
        swamp: "¡TE AHOGASTE EN EL PANTANO!",
        whirlpool: "¡SUCCIONADO POR EL REMOLINO!",
        tornado: "¡ESTRELLADO EN EL TORNADO!",
        ghost: "¡SECUESTRADO POR EL FANTASMA!",
        abductor: "¡ABDUCIDO POR LOS ALIENS!"
      };
      this.hazardEvent = {
        kind,
        timer: 0,
        duration: 1.85,
        x: obs ? obs.x : this.cat.x,
        y: obs ? obs.y : GROUND_Y,
        catX: this.cat.x,
        catY: this.cat.y,
        text: texts[kind] || "¡PELIGRO LETAL!"
      };
      this.notifyHud();
    }

    updateHazardEvent(dt) {
      this.time += dt;
      if (!this.hazardEvent) {
        this.triggerGameOver();
        return;
      }
      this.hazardEvent.timer += dt;
      if (this.hazardEvent.timer >= this.hazardEvent.duration) {
        this.triggerGameOver();
      }
    }

    renderHazardEvent() {
      // Draw the current world background first, then animate the event over it
      const savedMode = this.mode;
      this.mode = "gameover";
      this.render();
      this.mode = savedMode;

      const ctx = this.ctx;
      const ev = this.hazardEvent;
      if (!ev) return;
      const p = Math.min(1, ev.timer / ev.duration);
      const cx = Math.floor(ev.catX);
      const cy = Math.floor(ev.catY);

      ctx.save();
      if (ev.kind === "pit" || ev.kind === "swamp") {
        const spr = RC.Sprites.getCatSprite("hurt", this.skinId, 3);
        ctx.drawImage(spr, cx, Math.floor(cy + p * 120));
      } else if (ev.kind === "whirlpool") {
        const ang = p * Math.PI * 6;
        const r = (1 - p) * 32;
        const spr = RC.Sprites.getCatSprite("hurt", this.skinId, 3);
        ctx.drawImage(spr, Math.floor(ev.x + Math.cos(ang) * r), Math.floor(ev.y + Math.sin(ang) * r));
      } else if (ev.kind === "tornado") {
        const ang = p * Math.PI * 8;
        const spr = RC.Sprites.getCatSprite("hurt", this.skinId, 3);
        ctx.drawImage(spr, Math.floor(ev.x + Math.cos(ang) * 24), Math.floor(ev.y - p * 40));
      } else if (ev.kind === "ghost") {
        const gx = Math.floor(ev.catX - p * 140);
        const gy = Math.floor(ev.catY - p * 110);
        const spr = RC.Sprites.getCatSprite("hurt", this.skinId, 3);
        const ghostSpr = RC.Sprites.getWorldSprite("ghost1", 3);
        ctx.drawImage(spr, gx, gy);
        if (ghostSpr) ctx.drawImage(ghostSpr, gx + 10, gy - 26);
      } else if (ev.kind === "abductor") {
        const ufoX = Math.floor(ev.x);
        const ufoY = Math.floor(ev.y);
        ctx.fillStyle = "rgba(72, 219, 251, 0.35)";
        ctx.fillRect(ufoX + 10, ufoY + 18, 32, GROUND_Y - ufoY);
        const spr = RC.Sprites.getCatSprite("hurt", this.skinId, 3);
        ctx.drawImage(spr, ufoX + 4, Math.floor(cy + (ufoY + 10 - cy) * p));
        const ufoSpr = RC.Sprites.getWorldSprite("abductorUfo1", 3);
        if (ufoSpr) ctx.drawImage(ufoSpr, ufoX, ufoY);
      }

      // Loss of all lives banner
      ctx.fillStyle = "rgba(18, 12, 20, 0.85)";
      ctx.fillRect(WIDTH / 2 - 220, 34, 440, 56);
      ctx.strokeStyle = "#ff4757";
      ctx.lineWidth = 3;
      ctx.strokeRect(WIDTH / 2 - 220, 34, 440, 56);
      ctx.fillStyle = "#ff4757";
      ctx.font = '900 16px "Courier New", monospace';
      ctx.fillText(ev.text, WIDTH / 2 - 175, 58);
      ctx.fillStyle = "#ffd32a";
      ctx.font = '900 12px "Courier New", monospace';
      ctx.fillText("💔 PERDISTE TODAS TUS VIDAS — REGRESANDO AL INICIO", WIDTH / 2 - 195, 78);
      // Blizzard Frost & Wind Overlay (Snow Zone)
      if (this.blizzardTimer > 0) {
        ctx.save();
        ctx.fillStyle = "rgba(223, 249, 251, 0.18)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        for (let i = 0; i < 24; i++) {
          const sx = (WIDTH - ((this.time * 520 + i * 97) % (WIDTH + 60)));
          const sy = (i * 31 + Math.sin(this.time * 4 + i) * 14) % GROUND_Y;
          ctx.fillRect(Math.floor(sx), Math.floor(sy), 18, 3);
        }
        ctx.fillStyle = "#dff9fb";
        ctx.font = '900 13px "Courier New", monospace';
        ctx.fillText("❄ ¡VENTISCA! (EMPUJA AL SALTAR)", 16, 86);
        ctx.restore();
      }

      ctx.restore();
    }

    // ---- Boss Logic (Level 5: Giant Chicken) ----
    updateBoss(rawDt, worldDt) {
      const boss = this.boss;
      if (!boss || !boss.active) return;

      boss.animTimer += rawDt * 7;
      if (boss.hurtTimer > 0) boss.hurtTimer = Math.max(0, boss.hurtTimer - rawDt);

      if (boss.state === "aerial") {
        // Glide across the top and drop eggs
        boss.x += boss.dir * 135 * worldDt;
        if (boss.x > WIDTH - 140) boss.dir = -1;
        if (boss.x < 160) boss.dir = 1;
        boss.y = 28 + Math.sin(this.time * 3.2) * 8;

        boss.eggTimer -= worldDt;
        if (boss.eggTimer <= 0) {
          boss.eggTimer = 0.78 + Math.random() * 0.55;
          RC.Audio.eggDrop();
          this.bossEggs.push({
            x: boss.x + boss.w * 0.4,
            y: boss.y + boss.h - 10,
            w: 24,
            h: 24,
            vx: -this.speed * 0.42,
            vy: 130
          });
        }

        boss.stateTimer -= rawDt;
        if (boss.stateTimer <= 0) {
          boss.state = "telegraph";
          boss.stateTimer = 1.05;
          RC.Audio.bossAlert();
          this.addFloatingText("⚠ ¡GALLINA AL COSTADO! ¡GOLPEA (X)!", WIDTH * 0.34, 88, "#ffd32a", 15);
        }
      } else if (boss.state === "telegraph") {
        // Move to right side and descend
        const targetX = 235;
        const targetY = GROUND_Y - boss.h;
        boss.x += (targetX - boss.x) * Math.min(1, rawDt * 5);
        boss.y += (targetY - boss.y) * Math.min(1, rawDt * 5);

        boss.stateTimer -= rawDt;
        if (boss.stateTimer <= 0) {
          boss.state = "side";
          boss.stateTimer = 3.2;
          boss.hitThisWindow = false;
        }
      } else if (boss.state === "side") {
        // Vulnerable on the side! Wait for player's claw slash!
        boss.x = 232 + Math.sin(this.time * 10) * 6;
        boss.y = GROUND_Y - boss.h;

        if (!boss.hitThisWindow && this.cat.clawTimer > 0) {
          const clawBox = this.getClawHitbox();
          // Generous reach for side boss duel
          const expandedClaw = {
            x: clawBox.x - 10,
            y: clawBox.y - 10,
            w: clawBox.w + 90,
            h: clawBox.h + 20
          };
          const bossBox = { x: boss.x, y: boss.y, w: boss.w, h: boss.h };
          if (this.rectsOverlap(expandedClaw, bossBox)) {
            this.damageBoss();
            return;
          }
        }

        boss.stateTimer -= rawDt;
        if (boss.stateTimer <= 0) {
          boss.state = "retreat";
          boss.stateTimer = 0.9;
        }
      } else if (boss.state === "retreat") {
        boss.y += (28 - boss.y) * Math.min(1, rawDt * 5.5);
        boss.x += (WIDTH * 0.62 - boss.x) * Math.min(1, rawDt * 4);
        boss.stateTimer -= rawDt;
        if (boss.stateTimer <= 0) {
          boss.state = "aerial";
          boss.stateTimer = 5.8 + Math.random() * 1.5;
          boss.eggTimer = 0.65;
        }
      }

      // Update falling eggs
      const catBox = this.getCatHitbox();
      const clawActive = this.cat.clawTimer > 0;
      const clawBox = clawActive ? this.getClawHitbox() : null;

      for (let i = this.bossEggs.length - 1; i >= 0; i--) {
        const egg = this.bossEggs[i];
        egg.x += egg.vx * worldDt;
        egg.vy += 380 * worldDt;
        egg.y += egg.vy * worldDt;

        // Claw can smack eggs out of the air
        if (clawActive && this.rectsOverlap(clawBox, egg)) {
          this.killScore += 20;
          RC.Audio.scratchHit();
          this.spawnBurst(egg.x + 12, egg.y + 12, "#fff8ee", 8);
          this.addFloatingText("+20", egg.x, egg.y - 8, "#ffd32a", 12);
          this.bossEggs.splice(i, 1);
          continue;
        }

        if (egg.y + egg.h >= GROUND_Y) {
          this.spawnBurst(egg.x + 12, GROUND_Y - 4, "#ffd32a", 6);
          this.bossEggs.splice(i, 1);
          continue;
        }

        if (this.rectsOverlap(catBox, egg)) {
          if (this.cat.milkTimer > 0) {
            this.spawnBurst(egg.x + 12, egg.y + 12, "#ffd32a", 8);
            this.bossEggs.splice(i, 1);
            continue;
          }
          if (this.cat.invulnTimer > 0) continue;
          this.bossEggs.splice(i, 1);
          if (this.takeDamage()) return;
        }
      }
    }

    damageBoss() {
      const boss = this.boss;
      boss.hp -= 1;
      boss.hurtTimer = 0.45;
      boss.hitThisWindow = true;
      this.killCount += 1;
      this.killScore += 150;
      this.hitstopTimer = 0.05;
      this.triggerShake(9, 0.22);
      RC.Audio.bossHit();

      this.spawnBurst(boss.x + boss.w * 0.4, boss.y + boss.h * 0.5, "#ffd32a", 22);
      this.addFloatingText("¡GOLPE! +150", boss.x, boss.y - 12, "#ffd32a", 16);

      if (boss.hp <= 0) {
        boss.active = false;
        this.killScore += 500;
        this.triggerVictory();
        return;
      }

      boss.state = "retreat";
      boss.stateTimer = 0.85;
    }

    // ---- Squid Boss Logic (Level 8: Giant Squid) ----
    updateSquidBoss(rawDt, worldDt) {
      const boss = this.boss;
      if (!boss || !boss.active) return;

      boss.animTimer += rawDt * 6;
      if (boss.hurtTimer > 0) boss.hurtTimer = Math.max(0, boss.hurtTimer - rawDt);

      // Vertical patrol on the right side
      boss.y += boss.dir * 95 * worldDt;
      if (boss.y < 36) {
        boss.y = 36;
        boss.dir = 1;
      } else if (boss.y > GROUND_Y - boss.h - 12) {
        boss.y = GROUND_Y - boss.h - 12;
        boss.dir = -1;
      }

      // Launch piranhas from front to back
      boss.piranhaTimer -= worldDt;
      if (boss.piranhaTimer <= 0) {
        const rage = boss.maxHp - boss.hp;
        boss.piranhaTimer = Math.max(0.55, 1.15 - rage * 0.06) + Math.random() * 0.45;
        RC.Audio.shoot();
        const py = boss.y + boss.h * 0.4;
        this.bossPiranhas.push({
          x: boss.x - 16,
          y: py,
          baseY: py,
          w: 42,
          h: 27,
          vx: -(370 + rage * 20),
          phase: Math.random() * Math.PI * 2,
          animTimer: 0
        });
      }

      const catBox = this.getCatHitbox();
      const clawActive = this.cat.clawTimer > 0;
      const clawBox = clawActive ? this.getClawHitbox() : null;

      for (let i = this.bossPiranhas.length - 1; i >= 0; i--) {
        const p = this.bossPiranhas[i];
        p.x += p.vx * worldDt;
        p.animTimer += worldDt * 10;
        p.y = p.baseY + Math.sin(this.time * 6 + p.phase) * 14;

        if (p.x + p.w < -40) {
          this.bossPiranhas.splice(i, 1);
          continue;
        }

        if (clawActive && this.rectsOverlap(clawBox, p)) {
          this.killScore += 25;
          RC.Audio.scratchHit();
          this.spawnBurst(p.x + p.w / 2, p.y + p.h / 2, "#ff6b81", 10);
          this.addFloatingText("+25", p.x, p.y - 8, "#ffd32a", 12);
          this.bossPiranhas.splice(i, 1);
          continue;
        }

        if (this.rectsOverlap(catBox, p)) {
          if (this.cat.milkTimer > 0) {
            this.spawnBurst(p.x + p.w / 2, p.y + p.h / 2, "#ffd32a", 10);
            this.bossPiranhas.splice(i, 1);
            continue;
          }
          if (this.cat.invulnTimer > 0) continue;
          this.bossPiranhas.splice(i, 1);
          if (this.takeDamage()) return;
        }
      }
    }

    damageSquidBoss() {
      const boss = this.boss;
      boss.hp -= 1;
      boss.hurtTimer = 0.45;
      this.killCount += 1;
      this.killScore += 150;
      this.hitstopTimer = 0.05;
      this.triggerShake(10, 0.24);
      RC.Audio.mineExplode();
      RC.Audio.bossHit();

      this.spawnBurst(boss.x + boss.w * 0.35, boss.y + boss.h * 0.5, "#ff4757", 24);
      this.spawnBurst(boss.x + boss.w * 0.35, boss.y + boss.h * 0.5, "#ffd32a", 14);
      this.addFloatingText("¡IMPACTO! +150", boss.x - 20, boss.y - 12, "#ffd32a", 16);

      if (boss.hp <= 0) {
        boss.active = false;
        this.killScore += 600;
        this.triggerVictory();
      }
    }

    // ---- Plane Boss Logic (Level 12: Trash Bomber Plane) ----
    updatePlaneBoss(rawDt, worldDt) {
      const boss = this.boss;
      if (!boss || !boss.active) return;

      boss.animTimer += rawDt * 14;
      if (boss.hurtTimer > 0) boss.hurtTimer = Math.max(0, boss.hurtTimer - rawDt);

      // Vertical patrol on the right
      const rage = boss.maxHp - boss.hp;
      boss.y += boss.dir * (105 + rage * 10) * worldDt;
      if (boss.y < 28) {
        boss.y = 28;
        boss.dir = 1;
      } else if (boss.y > GROUND_Y - boss.h - 14) {
        boss.y = GROUND_Y - boss.h - 14;
        boss.dir = -1;
      }

      // Throw trash bags toward the cat
      boss.trashTimer -= worldDt;
      if (boss.trashTimer <= 0) {
        boss.trashTimer = Math.max(0.55, 1.05 - rage * 0.05) + Math.random() * 0.45;
        boss.bagCount += 1;
        RC.Audio.eggDrop();
        this.bossTrash.push({
          x: boss.x - 10,
          y: boss.y + boss.h * 0.45,
          w: 30,
          h: 26,
          vx: -(310 + rage * 18 + Math.random() * 55),
          vy: (Math.random() - 0.5) * 90,
          hasMissile: boss.bagCount % 2 === 0 || Math.random() < 0.45
        });
      }

      const catBox = this.getCatHitbox();
      for (let i = this.bossTrash.length - 1; i >= 0; i--) {
        const t = this.bossTrash[i];
        t.x += t.vx * worldDt;
        t.y += t.vy * worldDt;
        if (t.y < 24 || t.y + t.h > GROUND_Y - 6) {
          t.vy *= -1;
        }

        if (t.x + t.w < -40) {
          this.bossTrash.splice(i, 1);
          continue;
        }

        if (this.rectsOverlap(catBox, t)) {
          if (this.cat.milkTimer > 0) {
            this.spawnBurst(t.x + 15, t.y + 13, "#ffd32a", 10);
            this.bossTrash.splice(i, 1);
            continue;
          }
          if (this.cat.invulnTimer > 0) continue;
          this.bossTrash.splice(i, 1);
          if (this.takeDamage()) return;
        }
      }
    }

    damagePlaneBoss() {
      const boss = this.boss;
      boss.hp -= 1;
      boss.hurtTimer = 0.45;
      this.killCount += 1;
      this.killScore += 180;
      this.hitstopTimer = 0.05;
      this.triggerShake(10, 0.24);
      RC.Audio.mineExplode();
      RC.Audio.bossHit();

      this.spawnBurst(boss.x + boss.w * 0.4, boss.y + boss.h * 0.5, "#ff4757", 24);
      this.spawnBurst(boss.x + boss.w * 0.4, boss.y + boss.h * 0.5, "#ffd32a", 14);
      this.addFloatingText("¡MISILAZO! +180", boss.x - 24, boss.y - 12, "#ffd32a", 16);

      if (boss.hp <= 0) {
        boss.active = false;
        this.killScore += 750;
        this.triggerVictory();
      }
    }

    // ---- Skeleton Boss Logic (Level 16: Giant Skeleton + Lightning Charge) ----
    updateSkeletonBoss(rawDt, worldDt) {
      const boss = this.boss;
      if (!boss || !boss.active) return;

      boss.animTimer += rawDt * 6;
      if (boss.hurtTimer > 0) boss.hurtTimer = Math.max(0, boss.hurtTimer - rawDt);

      // Throws spinning bones toward the cat (scratchable!)
      boss.boneTimer -= worldDt;
      if (boss.boneTimer <= 0) {
        const rage = boss.maxHp - boss.hp;
        boss.boneTimer = Math.max(0.65, 1.25 - rage * 0.1) + Math.random() * 0.45;
        RC.Audio.eggDrop();
        const high = Math.random() < 0.45;
        this.spookyShots.push({
          sprite: "bone",
          x: boss.x - 12,
          y: high ? GROUND_Y - 96 : GROUND_Y - 36,
          w: 30,
          h: 15,
          vx: -(330 + rage * 25),
          vy: high ? 25 : 0
        });
      }

      // Summons mini-skeletons & crows to build lightning charge
      boss.minionTimer -= worldDt;
      if (boss.minionTimer <= 0) {
        boss.minionTimer = 1.9 + Math.random() * 1.1;
        const isCrow = Math.random() < 0.45;
        if (isCrow) {
          const cy = 68 + Math.random() * 75;
          this.obstacles.push({
            type: "crow",
            sprite: "crow1",
            animFrames: ["crow1", "crow2"],
            x: boss.x - 20,
            y: cy,
            baseY: cy,
            w: 36,
            h: 18,
            scratchable: true,
            canEgg: false,
            points: 60,
            extraSpeed: 55,
            bobPhase: Math.random() * Math.PI * 2,
            animTimer: 0
          });
        } else {
          this.obstacles.push({
            type: "miniSkeleton",
            sprite: "miniSkeleton1",
            animFrames: ["miniSkeleton1", "miniSkeleton2"],
            x: boss.x - 20,
            y: GROUND_Y - 30,
            w: 36,
            h: 30,
            scratchable: true,
            points: 55,
            extraSpeed: 55,
            animTimer: 0
          });
        }
      }
    }

    addLightningCharge() {
      if (this.level.mode !== "batBoss" || !this.boss || !this.boss.active) return;
      this.lightningCharge += 1;
      if (this.lightningCharge >= 5) {
        this.lightningCharge = 0;
        this.lightningTimer = 0.55;
        const boss = this.boss;
        boss.hp = Math.max(0, boss.hp - 1);
        boss.hurtTimer = 0.55;
        this.killScore += 250;
        this.hitstopTimer = 0.06;
        this.triggerShake(12, 0.3);
        RC.Audio.mineExplode();
        RC.Audio.bossHit();
        this.spawnBurst(boss.x + boss.w * 0.5, boss.y + boss.h * 0.4, "#48dbfb", 28);
        this.spawnBurst(boss.x + boss.w * 0.5, boss.y + boss.h * 0.4, "#ffd32a", 18);
        this.addFloatingText("⚡ ¡RAYO! +250", boss.x - 20, boss.y - 16, "#ffd32a", 16);

        if (boss.hp <= 0) {
          boss.active = false;
          this.killScore += 800;
          this.triggerVictory();
        }
      } else {
        this.addFloatingText(`⚡ ${this.lightningCharge}/5`, this.cat.x, this.cat.y - 18, "#48dbfb", 12);
      }
    }

    updateSpookyShots(worldDt) {
      const catBox = this.getCatHitbox();
      const clawActive = this.cat.clawTimer > 0;
      const clawBox = clawActive ? this.getClawHitbox() : null;

      for (let i = this.spookyShots.length - 1; i >= 0; i--) {
        const s = this.spookyShots[i];
        s.x += s.vx * worldDt;
        s.y += s.vy * worldDt;

        if (s.x + s.w < -40 || s.y > GROUND_Y + 20 || s.y + s.h < -30) {
          this.spookyShots.splice(i, 1);
          continue;
        }

        if (clawActive && this.rectsOverlap(clawBox, s)) {
          this.killScore += 30;
          RC.Audio.scratchHit();
          this.spawnBurst(s.x + s.w / 2, s.y + s.h / 2, "#ffd32a", 10);
          this.addFloatingText("+30", s.x, s.y - 8, "#ffd32a", 12);
          this.spookyShots.splice(i, 1);
          this.addLightningCharge();
          if (this.mode !== "playing") return;
          continue;
        }

        if (this.rectsOverlap(catBox, s)) {
          if (this.cat.milkTimer > 0) {
            this.spawnBurst(s.x, s.y, "#ffd32a", 8);
            this.spookyShots.splice(i, 1);
            continue;
          }
          if (this.cat.invulnTimer > 0) continue;
          this.spookyShots.splice(i, 1);
          if (this.takeDamage()) return;
        }
      }
    }

    // ---- Space Boss Logic (Level 20: Alien Mothership) ----
    updateSpaceBoss(rawDt, worldDt) {
      const boss = this.boss;
      if (!boss || !boss.active) return;

      boss.animTimer += rawDt * 9;
      if (boss.hurtTimer > 0) boss.hurtTimer = Math.max(0, boss.hurtTimer - rawDt);

      const rage = boss.maxHp - boss.hp;
      boss.y += boss.dir * (85 + rage * 3) * worldDt;
      if (boss.y < 28) {
        boss.y = 28;
        boss.dir = 1;
      } else if (boss.y > 175) {
        boss.y = 175;
        boss.dir = -1;
      }

      // Launch small alien ships (destroy to get weapon upgrades)
      boss.shipTimer -= worldDt;
      if (boss.shipTimer <= 0) {
        boss.shipTimer = Math.max(1.0, 1.85 - rage * 0.03) + Math.random() * 0.5;
        this.obstacles.push({
          type: "miniUfo",
          sprite: "miniUfo1",
          animFrames: ["miniUfo1", "miniUfo2"],
          x: boss.x - 10,
          y: boss.y + boss.h * 0.45,
          baseY: boss.y + boss.h * 0.45,
          w: 36,
          h: 18,
          scratchable: true,
          shootable: true,
          isMiniUfo: true,
          points: 70,
          extraSpeed: 75,
          bobPhase: Math.random() * Math.PI * 2,
          animTimer: 0
        });
      }

      // Launch unbreakable space rocks/obstacles to dodge
      boss.hazardTimer -= worldDt;
      if (boss.hazardTimer <= 0) {
        boss.hazardTimer = Math.max(1.15, 2.1 - rage * 0.035) + Math.random() * 0.55;
        const onGround = Math.random() < 0.6;
        this.obstacles.push({
          type: "spaceRock",
          sprite: "spaceRock",
          x: boss.x + 10,
          y: onGround ? GROUND_Y - 24 : GROUND_Y - 92,
          w: 36,
          h: 24,
          scratchable: false,
          shootable: false,
          extraSpeed: 40,
          animTimer: 0
        });
      }
    }

    damageSpaceBoss(dmg) {
      const boss = this.boss;
      boss.hp = Math.max(0, boss.hp - (dmg || 1));
      boss.hurtTimer = 0.35;
      this.killCount += 1;
      this.killScore += 120 * (dmg || 1);
      this.hitstopTimer = 0.04;
      this.triggerShake(8, 0.18);
      RC.Audio.bossHit();

      this.spawnBurst(boss.x + boss.w * 0.4, boss.y + boss.h * 0.5, "#48dbfb", 18);
      this.addFloatingText(`-${dmg || 1} HP`, boss.x, boss.y - 10, "#ffd32a", 15);

      if (boss.hp <= 0) {
        boss.active = false;
        this.killScore += 1000;
        RC.Audio.mineExplode();
        if (this.isBossRush) {
          this.triggerVictory();
          return;
        }
        const dist = Math.floor(this.distanceMeters);
        const total = dist + this.itemScore + this.killScore;
        RC.Storage.recordRun(this.level.id, total, dist, true);
        if (this.callbacks.onEndingStart) {
          this.callbacks.onEndingStart(this.buildRunSummary(true));
        } else {
          this.startEnding(this.skinId, true);
        }
      }
    }

    // ---- Penguin Boss Logic (Level 29: Giant Hungry Penguin) ----
    updatePenguinBoss(rawDt, worldDt) {
      const boss = this.boss;
      if (!boss || !boss.active) return;

      boss.animTimer += rawDt * 6;
      if (boss.hurtTimer > 0) boss.hurtTimer = Math.max(0, boss.hurtTimer - rawDt);

      // Throws snowballs
      boss.snowTimer -= worldDt;
      if (boss.snowTimer <= 0) {
        const fed = boss.maxHp - boss.hp;
        boss.snowTimer = Math.max(0.65, 1.2 - fed * 0.06) + Math.random() * 0.45;
        RC.Audio.eggDrop();
        const high = Math.random() < 0.45;
        this.spookyShots.push({
          sprite: "snowball",
          x: boss.x - 10,
          y: high ? GROUND_Y - 88 : GROUND_Y - 34,
          w: 24,
          h: 18,
          vx: -(330 + fed * 18),
          vy: high ? 22 : 0
        });
      }

      // Spawns fish collectibles so the player can feed the penguin
      boss.fishTimer -= worldDt;
      if (boss.fishTimer <= 0) {
        boss.fishTimer = 1.4 + Math.random() * 0.9;
        this.collectibles.push({
          kind: "fish",
          x: WIDTH + 30,
          y: GROUND_Y - 40 - Math.random() * 75,
          w: 32,
          h: 22,
          points: 25,
          slowBoost: 12,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    feedPenguinBoss() {
      const boss = this.boss;
      boss.hp = Math.max(0, boss.hp - 1);
      boss.hurtTimer = 0.35;
      this.killCount += 1;
      this.killScore += 150;
      this.hitstopTimer = 0.04;
      this.triggerShake(7, 0.16);
      RC.Audio.fish();
      this.spawnBurst(boss.x + boss.w * 0.4, boss.y + boss.h * 0.5, "#ffd32a", 16);
      this.addFloatingText("🐟 ¡ÑAM!", boss.x - 10, boss.y - 12, "#ffd32a", 15);

      if (boss.hp <= 0) {
        boss.active = false;
        this.killScore += 700;
        this.addFloatingText("¡ESTOY LLENO! 🐟", boss.x - 40, boss.y - 26, "#2ed573", 16);
        this.triggerVictory();
      }
    }

    // ---- Snake Boss Logic (Level 33: Giant Acid Serpent) ----
    updateSnakeBoss(rawDt, worldDt) {
      const boss = this.boss;
      if (!boss || !boss.active) return;

      boss.animTimer += rawDt * 7;
      if (boss.hurtTimer > 0) boss.hurtTimer = Math.max(0, boss.hurtTimer - rawDt);

      // Spits acid venom
      boss.venomTimer -= worldDt;
      if (boss.venomTimer <= 0) {
        const rage = boss.maxHp - boss.hp;
        boss.venomTimer = Math.max(0.6, 1.15 - rage * 0.06) + Math.random() * 0.45;
        RC.Audio.shoot();
        const high = Math.random() < 0.45;
        this.spookyShots.push({
          sprite: "venom",
          x: boss.x - 12,
          y: high ? GROUND_Y - 82 : GROUND_Y - 34,
          w: 24,
          h: 14,
          vx: -(360 + rage * 22),
          vy: high ? 14 : 0
        });
      }

      // Spawns mud balls to collect & throw
      boss.mudTimer -= worldDt;
      if (boss.mudTimer <= 0) {
        boss.mudTimer = 1.45 + Math.random() * 0.9;
        this.collectibles.push({
          kind: "mudBall",
          x: WIDTH + 30,
          y: GROUND_Y - 36 - Math.random() * 82,
          w: 28,
          h: 22,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    damageSnakeBoss() {
      const boss = this.boss;
      boss.hp = Math.max(0, boss.hp - 1);
      boss.hurtTimer = 0.4;
      this.killCount += 1;
      this.killScore += 180;
      this.hitstopTimer = 0.045;
      this.triggerShake(9, 0.2);
      RC.Audio.bossHit();
      this.spawnBurst(boss.x + boss.w * 0.4, boss.y + boss.h * 0.5, "#a3cb38", 20);
      this.addFloatingText("¡LODO! +180", boss.x - 16, boss.y - 12, "#a3cb38", 15);

      if (boss.hp <= 0) {
        boss.active = false;
        this.killScore += 1000;
        RC.Audio.mineExplode();
        if (this.isBossRush) {
          this.triggerVictory();
          return;
        }
        const dist = Math.floor(this.distanceMeters);
        const total = dist + this.itemScore + this.killScore;
        RC.Storage.recordRun(this.level.id, total, dist, true);
        if (this.callbacks.onSecretEndingStart) {
          this.callbacks.onSecretEndingStart(this.buildRunSummary(true));
        } else {
          this.startSecretEnding(this.skinId, true);
        }
      }
    }

    updateAlienShots(worldDt) {
      const catBox = this.getCatHitbox();
      for (let i = this.alienShots.length - 1; i >= 0; i--) {
        const s = this.alienShots[i];
        s.x += s.vx * worldDt;
        if (s.x < -30) {
          this.alienShots.splice(i, 1);
          continue;
        }
        if (this.rectsOverlap(catBox, s)) {
          if (this.cat.milkTimer > 0) {
            this.spawnBurst(s.x, s.y, "#ffd32a", 8);
            this.alienShots.splice(i, 1);
            continue;
          }
          if (this.cat.invulnTimer > 0) continue;
          this.alienShots.splice(i, 1);
          if (this.takeDamage()) return;
        }
      }
    }

    // ---- Launched Mines (Swim Levels 5-8) ----
    updateLaunchedMines(rawDt) {
      for (let i = this.launchedMines.length - 1; i >= 0; i--) {
        const m = this.launchedMines[i];
        m.x += m.vx * rawDt;

        if (Math.random() < 0.5) {
          this.spawnParticle(m.x, m.y + m.h / 2, -60, (Math.random() - 0.5) * 40, "#ffd32a", 3, 0.18);
        }

        if (m.x > WIDTH + 50) {
          this.launchedMines.splice(i, 1);
          continue;
        }

        // Check hit on Squid Boss
        if (this.boss && this.boss.active && this.boss.kind === "squid") {
          const bossBox = { x: this.boss.x, y: this.boss.y, w: this.boss.w, h: this.boss.h };
          if (this.rectsOverlap(m, bossBox)) {
            this.launchedMines.splice(i, 1);
            this.damageSquidBoss();
            if (this.mode !== "playing") return;
            continue;
          }
        }

        // Check hit on other underwater obstacles
        let hitObs = false;
        for (let j = this.obstacles.length - 1; j >= 0; j--) {
          const obs = this.obstacles[j];
          if (this.rectsOverlap(m, obs)) {
            hitObs = true;
            RC.Audio.mineExplode();
            this.triggerShake(6, 0.16);
            this.spawnBurst(obs.x + obs.w / 2, obs.y + obs.h / 2, "#ff4757", 16);
            this.killCount += 1;
            this.killScore += 80;
            this.addFloatingText("+80 ¡BOOM!", obs.x, obs.y - 10, "#ffd32a", 13);
            this.obstacles.splice(j, 1);
            break;
          }
        }
        if (hitObs) {
          this.launchedMines.splice(i, 1);
        }
      }
    }

    // ---- Projectiles (Plane mode & Plane Boss) ----
    updateProjectiles(rawDt) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const b = this.projectiles[i];
        b.x += b.vx * rawDt;

        if (b.isMissile && Math.random() < 0.7) {
          this.spawnParticle(b.x, b.y + b.h / 2, -80, (Math.random() - 0.5) * 40, "#ff9f43", 4, 0.16);
        }

        if (b.x > WIDTH + 40) {
          this.projectiles.splice(i, 1);
          continue;
        }

        // Check hit on Plane Boss
        if (this.boss && this.boss.active && this.boss.kind === "plane") {
          const bossBox = { x: this.boss.x, y: this.boss.y, w: this.boss.w, h: this.boss.h };
          if (this.rectsOverlap(b, bossBox)) {
            this.projectiles.splice(i, 1);
            if (b.isMissile) {
              this.damagePlaneBoss();
              if (this.mode !== "playing") return;
            } else {
              this.spawnBurst(b.x, b.y, "#c8d6e5", 4);
              if (this.catMissiles === 0 && Math.random() < 0.2) {
                this.addFloatingText("¡USA MISILES!", this.boss.x - 16, this.boss.y - 10, "#ffd32a", 12);
              }
            }
            continue;
          }
        }

        // Check hit on Penguin Boss (fed with fish) or Snake Boss (hit with mud)
        if (this.boss && this.boss.active) {
          const bossBox = { x: this.boss.x, y: this.boss.y, w: this.boss.w, h: this.boss.h };
          if (this.boss.kind === "penguin" && b.isThrownFish && this.rectsOverlap(b, bossBox)) {
            this.projectiles.splice(i, 1);
            this.feedPenguinBoss();
            if (this.mode !== "playing") return;
            continue;
          }
          if (this.boss.kind === "snake" && b.isMud && this.rectsOverlap(b, bossBox)) {
            this.projectiles.splice(i, 1);
            this.damageSnakeBoss();
            if (this.mode !== "playing") return;
            continue;
          }
        }

        // Check hit on Space Boss (Alien Mothership)
        if (this.boss && this.boss.active && this.boss.kind === "ufo") {
          const bossBox = { x: this.boss.x, y: this.boss.y, w: this.boss.w, h: this.boss.h };
          if (this.rectsOverlap(b, bossBox)) {
            this.projectiles.splice(i, 1);
            this.damageSpaceBoss(b.damage || 1);
            if (this.mode !== "playing") return;
            continue;
          }
        }

        // Check hit on Plane Boss Trash Bags -> drops collectible missiles!
        let hitTrash = false;
        for (let k = this.bossTrash.length - 1; k >= 0; k--) {
          const t = this.bossTrash[k];
          if (this.rectsOverlap(b, t)) {
            hitTrash = true;
            this.killScore += 20;
            RC.Audio.scratchHit();
            this.spawnBurst(t.x + t.w / 2, t.y + t.h / 2, "#7f9c6e", 10);
            if (t.hasMissile) {
              this.collectibles.push({
                kind: "missilePickup",
                x: t.x,
                y: t.y,
                w: 34,
                h: 28,
                phase: Math.random() * Math.PI * 2
              });
              this.addFloatingText("🚀 ¡MISIL!", t.x, t.y - 10, "#ffd32a", 12);
            } else {
              this.addFloatingText("+20", t.x, t.y - 8, "#a3cb38", 11);
            }
            this.bossTrash.splice(k, 1);
            break;
          }
        }
        if (hitTrash) {
          this.projectiles.splice(i, 1);
          continue;
        }

        let hit = false;
        for (let j = this.obstacles.length - 1; j >= 0; j--) {
          const obs = this.obstacles[j];
          if (this.rectsOverlap(b, obs)) {
            hit = true;
            if (obs.shootable) {
              if (obs.isMiniUfo) {
                this.collectibles.push({
                  kind: "weaponPickup",
                  x: obs.x,
                  y: obs.y,
                  w: 36,
                  h: 27,
                  phase: Math.random() * Math.PI * 2
                });
                this.addFloatingText("⚡ ¡ARMA!", obs.x, obs.y - 10, "#ffd32a", 12);
              }
              this.destroyObstacleByClaw(obs);
              this.obstacles.splice(j, 1);
            } else {
              // Indestructible skyBlock / spaceRock spark
              this.spawnBurst(b.x, b.y, "#c8d6e5", 5);
            }
            break;
          }
        }
        if (hit) {
          this.projectiles.splice(i, 1);
        }
      }
    }

    // ---- Updates & Collisions ----
    rectsOverlap(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    destroyObstacleByClaw(obs) {
      this.killCount += 1;
      this.comboCount += 1;
      this.comboTimer = 2.4;
      const comboBonus = this.comboCount >= 2 ? (this.comboCount - 1) * 15 : 0;
      const pts = (obs.points || 40) + comboBonus;
      this.killScore += pts;
      this.slowEnergy = Math.min(100, this.slowEnergy + 10);

      if (obs.type === "seaWall") {
        RC.Audio.wallSmash();
      } else {
        RC.Audio.scratchHit();
      }
      this.hitstopTimer = 0.035;
      this.triggerShake(5, 0.14);

      const cx = obs.x + obs.w / 2;
      const cy = obs.y + obs.h / 2;
      const colors =
        obs.type === "crate"
          ? ["#e6a65c", "#b87435", "#ffeaa7"]
          : obs.type === "seaWall"
          ? ["#82ccdd", "#4a69bd", "#ffd32a"]
          : obs.type === "seaweed"
          ? ["#2ed573", "#168246", "#a3cb38"]
          : ["#ff6b81", "#ffd32a", "#ffffff"];

      for (let i = 0; i < 14; i++) {
        const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
        const spd = 80 + Math.random() * 190;
        this.spawnParticle(
          cx,
          cy,
          Math.cos(angle) * spd,
          Math.sin(angle) * spd - 40,
          colors[i % colors.length],
          4 + Math.floor(Math.random() * 3),
          0.35 + Math.random() * 0.2
        );
      }

      const tag = this.comboCount >= 2 ? `+${pts} x${this.comboCount}!` : `+${pts}!`;
      this.addFloatingText(tag, cx - 20, cy - 16, "#ff9f43", 13);
      this.addLightningCharge();

      // Moving crates very sporadically drop +1 Life!
      if (obs.isMovingCrate && Math.random() < 0.25) {
        this.collectibles.push({
          kind: "heart",
          x: obs.x + 8,
          y: obs.y,
          w: 30,
          h: 26,
          phase: Math.random() * Math.PI * 2
        });
        this.addFloatingText("♥ ¡VIDA!", obs.x, obs.y - 24, "#ff4757", 13);
      }
    }

    updateObstacles(worldDt, movePx) {
      const catBox = this.getCatHitbox();
      const clawActive = this.cat.clawTimer > 0;
      const clawBox = clawActive ? this.getClawHitbox() : null;

      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        if (obs.lockedTrajectory) {
          obs.x += obs.vx * worldDt;
          obs.y += obs.vy * worldDt;
        } else {
          obs.x -= movePx + (obs.extraSpeed || 0) * worldDt;
        }
        if (obs.canHop) {
          if (!obs.hopDone && obs.x < this.cat.x + 300 && obs.x > this.cat.x + 60) {
            obs.hopDone = true;
            obs.vy = obs.hopVel || -380;
          }
          if (obs.vy !== 0 || obs.y + obs.h < GROUND_Y) {
            obs.vy += 1250 * worldDt;
            obs.y += obs.vy * worldDt;
            if (obs.y + obs.h >= GROUND_Y) {
              obs.y = GROUND_Y - obs.h;
              obs.vy = 0;
            }
          }
        } else if (!obs.lockedTrajectory && obs.vy) {
          obs.y += obs.vy * worldDt;
        }

        if (obs.swoop && obs.baseY != null && obs.x < this.cat.x + 320 && obs.x > this.cat.x) {
          obs.baseY += (this.cat.y - obs.baseY) * Math.min(1, worldDt * 1.4);
        }

        if (obs.animFrames) {
          obs.animTimer += worldDt * 8;
          obs.sprite = obs.animFrames[Math.floor(obs.animTimer) % obs.animFrames.length];
        }
        if (obs.baseY != null) {
          const amp = obs.isMovingCrate ? 28 : obs.bobAmp || 14;
          obs.y = obs.baseY + Math.sin(this.time * 5 + obs.bobPhase) * amp;
        }

        // Zone Hazard behaviors
        if (obs.isZoneHazard === "whirlpool") {
          const catCx = this.cat.x + this.cat.w / 2;
          const catCy = this.cat.y + this.cat.h / 2;
          const wCx = obs.x + obs.w / 2;
          const wCy = obs.y + obs.h / 2;
          const dist = Math.hypot(catCx - wCx, catCy - wCy);
          if (dist < obs.suctionRadius && dist > 1) {
            const pull = 175 * worldDt;
            this.cat.y += ((wCy - catCy) / dist) * pull;
          }
          if (dist < 26) {
            this.triggerHazardEvent("whirlpool", obs);
            return;
          }
        } else if (obs.isZoneHazard === "abductor") {
          const beamBox = {
            x: obs.x + 8,
            y: obs.y + obs.h,
            w: obs.w - 16,
            h: GROUND_Y - (obs.y + obs.h)
          };
          if (this.rectsOverlap(catBox, beamBox)) {
            this.triggerHazardEvent("abductor", obs);
            return;
          }
        }

        if (obs.canShoot && obs.x < WIDTH - 40 && obs.x > this.cat.x + 110) {
          obs.shootTimer -= worldDt;
          if (obs.shootTimer <= 0) {
            obs.shootTimer = 1.35 + Math.random() * 0.9;
            RC.Audio.shoot();
            this.alienShots.push({
              x: obs.x - 10,
              y: obs.y + Math.floor(obs.h * 0.45),
              w: 14,
              h: 6,
              vx: -460
            });
          }
        }

        if ((obs.canDrop || obs.canVomit || obs.canEgg || obs.canSnowball || obs.canWaterJet || obs.canCoconut) && obs.x < WIDTH - 30 && obs.x > this.cat.x + 30) {
          obs.shootTimer -= worldDt;
          if (obs.shootTimer <= 0) {
            obs.shootTimer = 1.1 + Math.random() * 0.85;
            if (obs.canWaterJet) {
              this.spookyShots.push({
                sprite: "waterJet",
                x: obs.x + 14,
                y: obs.y - 16,
                w: 12,
                h: 18,
                vx: -this.speed * 0.15,
                vy: -360
              });
            } else if (obs.canCoconut) {
              this.spookyShots.push({
                sprite: "coconut",
                x: obs.x + 4,
                y: obs.y + obs.h,
                w: 24,
                h: 15,
                vx: -this.speed * 0.45,
                vy: 230
              });
            } else if (obs.canVomit) {
              this.spookyShots.push({
                sprite: "vomitGlob",
                x: obs.x - 12,
                y: obs.y + 8,
                w: 24,
                h: 12,
                vx: -(this.speed * 0.65 + 150),
                vy: 15
              });
            } else if (obs.canSnowball) {
              this.spookyShots.push({
                sprite: "snowball",
                x: obs.x - 10,
                y: obs.y + 6,
                w: 24,
                h: 18,
                vx: -(this.speed * 0.6 + 160),
                vy: obs.swoop ? 120 : 10
              });
            } else {
              this.spookyShots.push({
                sprite: obs.canEgg ? "egg" : "vomitGlob",
                x: obs.x + 6,
                y: obs.y + obs.h,
                w: 24,
                h: 20,
                vx: -this.speed * 0.35,
                vy: 190
              });
            }
          }
        }

        if (obs.x + obs.w < -60 || obs.y > GROUND_Y + 40) {
          this.obstacles.splice(i, 1);
          continue;
        }

        // Proximity Mine logic (Levels 6 & 7)
        if (obs.isZoneHazard === "abductor") {
          ctx.save();
          ctx.fillStyle = `rgba(72, 219, 251, ${0.2 + 0.1 * Math.sin(this.time * 12)})`;
          ctx.beginPath();
          ctx.moveTo(ox + 12, oy + obs.h);
          ctx.lineTo(ox + obs.w - 12, oy + obs.h);
          ctx.lineTo(ox + obs.w + 8, GROUND_Y);
          ctx.lineTo(ox - 8, GROUND_Y);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (obs.isZoneHazard === "whirlpool") {
          ctx.save();
          ctx.strokeStyle = "rgba(72, 219, 251, 0.35)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ox + obs.w / 2, oy + obs.h / 2, obs.suctionRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        if (obs.isProximityMine) {
          const catCx = this.cat.x + this.cat.w / 2;
          const catCy = this.cat.y + this.cat.h / 2;
          const mineCx = obs.x + obs.w / 2;
          const mineCy = obs.y + obs.h / 2;
          const dist = Math.hypot(catCx - mineCx, catCy - mineCy);

          if (!obs.armed && dist <= obs.proxRadius) {
            obs.armed = true;
            obs.beepCooldown = 0.14;
            RC.Audio.mineBeep();
            this.addFloatingText("¡CUIDADO!", mineCx - 28, obs.y - 12, "#ff4757", 11);
          }

          if (obs.armed) {
            obs.fuseTimer -= worldDt;
            obs.beepCooldown -= worldDt;
            if (obs.beepCooldown <= 0) {
              obs.beepCooldown = 0.14;
              RC.Audio.mineBeep();
            }
            obs.sprite = Math.floor(this.time * 20) % 2 === 0 ? "proxMineArmed" : "proxMine";

            if (obs.fuseTimer <= 0) {
              RC.Audio.mineExplode();
              this.triggerShake(9, 0.22);
              this.spawnBurst(mineCx, mineCy, "#ff4757", 24);
              this.spawnBurst(mineCx, mineCy, "#ffd32a", 12);
              this.obstacles.splice(i, 1);

              if (dist <= obs.blastRadius) {
                if (this.cat.milkTimer > 0 || this.cat.invulnTimer > 0) {
                  continue;
                }
                if (this.takeDamage()) return;
                continue;
              }
              continue;
            }
          }
        }

        const obsBox = {
          x: obs.x + 4,
          y: obs.y + 4,
          w: obs.w - 8,
          h: obs.h - 6
        };

        // 1. Check Claw / Special Attack
        if (clawActive && obs.scratchable && this.rectsOverlap(clawBox, obsBox)) {
          if (obs.launchable) {
            RC.Audio.scratchHit();
            this.triggerShake(4, 0.1);
            this.spawnBurst(obs.x + obs.w / 2, obs.y + obs.h / 2, "#ffd32a", 8);
            this.addFloatingText("¡LANZADA!", obs.x, obs.y - 12, "#ffd32a", 12);
            this.launchedMines.push({
              x: obs.x + 12,
              y: obs.y,
              w: obs.w,
              h: obs.h,
              vx: 640
            });
            this.obstacles.splice(i, 1);
            continue;
          }
          this.destroyObstacleByClaw(obs);
          this.obstacles.splice(i, 1);
          continue;
        }

        // 2. Check Cat Collision
        if (this.rectsOverlap(catBox, obsBox)) {
          if (obs.isZoneHazard) {
            this.triggerHazardEvent(obs.isZoneHazard, obs);
            return;
          }

          if (obs.type === "iceBlock" && this.snowBoostTimer > 0) {
            this.destroyObstacleByClaw(obs);
            this.obstacles.splice(i, 1);
            continue;
          }

          if (this.cat.milkTimer > 0 || (this.cat.dashTimer > 0 && obs.scratchable)) {
            this.destroyObstacleByClaw({ ...obs, points: obs.points || 35 });
            this.obstacles.splice(i, 1);
            continue;
          }

          if (this.cat.invulnTimer > 0) continue;

          this.obstacles.splice(i, 1);
          if (this.takeDamage()) return;
          continue;
        }
      }
    }

    updateCollectibles(worldDt, movePx) {
      const cat = this.cat;
      const catBox = {
        x: cat.x + 4,
        y: cat.y + 2,
        w: cat.w - 8,
        h: cat.h - 4
      };

      for (let i = this.collectibles.length - 1; i >= 0; i--) {
        const item = this.collectibles[i];
        item.x -= movePx;

        if (!item.isPowerup && cat.magnetTimer > 0) {
          const dx = cat.x + cat.w / 2 - (item.x + item.w / 2);
          const dy = cat.y + cat.h / 2 - (item.y + item.h / 2);
          const dist = Math.hypot(dx, dy);
          if (dist < 240 && dist > 1) {
            const pull = 460 * worldDt;
            item.x += (dx / dist) * pull;
            item.y += (dy / dist) * pull;
          }
        }

        if (item.x + item.w < -50) {
          this.collectibles.splice(i, 1);
          continue;
        }

        const itemBox = {
          x: item.x,
          y: item.y + Math.sin(this.time * 5 + item.phase) * 4,
          w: item.w,
          h: item.h
        };

        if (this.rectsOverlap(catBox, itemBox)) {
          this.collectItem(item);
          this.collectibles.splice(i, 1);
        }
      }
    }

    collectItem(item) {
      if (RC.Storage && item && item.kind) {
        RC.Storage.discoverEntry(item.kind);
      }
      const cx = item.x + item.w / 2;
      const cy = item.y + item.h / 2;

      if (item.isPowerup) {
        RC.Audio.powerup();
        if (item.kind === "shield") {
          this.cat.shield = true;
          this.addFloatingText("🧶 ESCUDO DORADO!", cx - 28, cy - 10, "#ffd32a", 13);
          this.spawnBurst(cx, cy, "#ffd32a", 14);
        } else if (item.kind === "magnet") {
          const bonus = RC.Storage && RC.Storage.hasUpgrade("magnet_plus") ? 4.0 : 0;
          this.cat.magnetTimer = 8.5 + bonus;
          this.addFloatingText("🧲 IMÁN!", cx - 18, cy - 10, "#ff6b81", 13);
          this.spawnBurst(cx, cy, "#ff6b81", 14);
        } else if (item.kind === "milk") {
          this.slowEnergy = 100;
          this.slowLockout = false;
          this.cat.milkTimer = 4.5;
          this.addFloatingText("🥛 BRILLO DORADO!", cx - 32, cy - 10, "#ffd32a", 13);
          this.spawnBurst(cx, cy, "#ffd32a", 16);
        }
        return;
      }

      if (item.kind === "snowBoost") {
        RC.Audio.powerup();
        this.snowBoostTimer = 5.0;
        this.addFloatingText("❄ ¡ROMPE HIELO!", cx - 32, cy - 12, "#48dbfb", 13);
        this.spawnBurst(cx, cy, "#48dbfb", 14);
        return;
      }

      if (item.kind === "mudBall") {
        RC.Audio.powerup();
        this.mudAmmo += 1;
        this.itemScore += 30;
        this.addFloatingText("🟤 +1 LODO!", cx - 26, cy - 12, "#a3cb38", 13);
        this.spawnBurst(cx, cy, "#9e6b43", 10);
        return;
      }

      if (item.kind === "heart") {
        RC.Audio.powerup();
        this.lives = Math.min(this.maxLives, this.lives + 1);
        this.itemScore += 60;
        this.addFloatingText("♥ +1 VIDA!", cx - 24, cy - 12, "#ff4757", 14);
        this.spawnBurst(cx, cy, "#ff4757", 14);
        return;
      }

      if (item.kind === "weaponPickup") {
        RC.Audio.powerup();
        this.laserLevel = Math.min(3, (this.laserLevel || 1) + 1);
        this.itemScore += 50;
        this.addFloatingText(`⚡ LÁSER N${this.laserLevel}!`, cx - 28, cy - 12, "#48dbfb", 14);
        this.spawnBurst(cx, cy, "#ffd32a", 14);
        return;
      }

      if (item.kind === "missilePickup") {
        RC.Audio.powerup();
        this.catMissiles += 1;
        this.itemScore += 30;
        this.addFloatingText("🚀 +1 MISIL!", cx - 26, cy - 12, "#ffd32a", 14);
        this.spawnBurst(cx, cy, "#ff4757", 12);
        return;
      }

      this.fishCount += 1;
      this.itemScore += item.points;
      this.slowEnergy = Math.min(100, this.slowEnergy + item.slowBoost);
      if (this.level.mode === "snowBoss") {
        this.bossFishAmmo += 1;
        this.addFloatingText("🐟 +1 PEZ!", cx - 22, cy - 26, "#ffd32a", 13);
      }

      if (item.kind === "goldFish") {
        RC.Audio.goldFish();
        this.addFloatingText(`+${item.points} ★`, cx - 16, cy - 12, "#ffd32a", 14);
        this.spawnBurst(cx, cy, "#ffd32a", 12);
      } else {
        RC.Audio.fish();
        this.addFloatingText(`+${item.points}`, cx - 12, cy - 10, "#48dbfb", 12);
        this.spawnBurst(cx, cy, "#48dbfb", 8);
      }
    }

    getTotalScore() {
      return Math.floor(this.distanceMeters) + this.itemScore + this.killScore;
    }

    buildRunSummary(victory) {
      this.flushPlayTime();
      const dist = Math.floor(this.distanceMeters);
      const total = dist + this.itemScore + this.killScore;
      const stars = victory ? (this.hitsTaken === 0 ? 3 : this.lives >= 3 ? 2 : 1) : 0;
      const recordInfo = RC.Storage.recordRun(this.level.id, total, dist, victory, {
        fishCount: this.fishCount,
        killCount: this.killCount,
        levelName: this.level.shortName,
        stars
      });
      return {
        victory,
        level: this.level,
        stars,
        runElapsedSec: this.runElapsedSec,
        isBossRush: this.isBossRush,
        isTimeAttack: this.isTimeAttack,
        distance: dist,
        distScore: dist,
        fishCount: this.fishCount,
        itemScore: this.itemScore,
        killCount: this.killCount,
        killScore: this.killScore,
        totalScore: total,
        ...recordInfo
      };
    }

    advanceBossRushIfNeeded() {
      if (!this.isBossRush) return false;
      this.bossRushIndex += 1;
      if (this.bossRushIndex >= this.bossRushOrder.length) {
        RC.Storage.setBossRushBest(this.runElapsedSec);
        return false;
      }
      const nextBossId = this.bossRushOrder[this.bossRushIndex];
      const savedLives = Math.min(this.maxLives, this.lives + 1);
      const savedFish = this.fishCount;
      const savedItemScore = this.itemScore;
      const savedKillCount = this.killCount;
      const savedKillScore = this.killScore;
      const savedElapsed = this.runElapsedSec;
      const savedDist = this.distanceMeters;

      this.level = RC.Levels.getLevelById(nextBossId);
      this.resetRunState();
      this.lives = savedLives;
      this.fishCount = savedFish;
      this.itemScore = savedItemScore;
      this.killCount = savedKillCount;
      this.killScore = savedKillScore;
      this.runElapsedSec = savedElapsed;
      this.distanceMeters = savedDist;
      this.mode = "playing";
      if (this.boss && RC.Storage) RC.Storage.discoverEntry(`boss_${this.boss.kind}`);
      this.addFloatingText(`👑 BOSS RUSH ${this.bossRushIndex + 1}/7! (+1 ♥)`, WIDTH / 2 - 110, 90, "#ffd32a", 15);
      this.notifyHud();
      return true;
    }

    triggerGameOver() {
      this.mode = "gameover";
      this.slowActive = false;
      RC.Audio.gameOver();
      this.triggerShake(10, 0.28);
      this.spawnBurst(this.cat.x + 24, this.cat.y + 20, "#ff4757", 18);
      const summary = this.buildRunSummary(false);
      this.notifyHud();
      if (this.callbacks.onRunEnd) this.callbacks.onRunEnd(summary);
    }

    triggerVictory() {
      if (this.advanceBossRushIfNeeded()) return;
      this.mode = "victory";
      this.slowActive = false;
      if (this.level.targetDistance) {
        this.distanceMeters = this.level.targetDistance;
      }
      RC.Audio.victory();
      for (let b = 0; b < 4; b++) {
        this.spawnBurst(
          180 + b * 180,
          90 + (b % 2) * 50,
          ["#ffd32a", "#48dbfb", "#ff6b81", "#2ed573"][b],
          20
        );
      }
      const summary = this.buildRunSummary(true);
      this.notifyHud();
      if (this.callbacks.onRunEnd) this.callbacks.onRunEnd(summary);
    }

    // ---- Particles & Floating Text ----
    spawnParticle(x, y, vx, vy, color, size, life) {
      this.particles.push({ x, y, vx, vy, color, size, life, maxLife: life });
    }

    spawnDust(x, y, count, color) {
      for (let i = 0; i < count; i++) {
        this.spawnParticle(
          x + (Math.random() - 0.5) * 18,
          y,
          -40 - Math.random() * 80,
          -20 - Math.random() * 75,
          color,
          3 + Math.floor(Math.random() * 3),
          0.25 + Math.random() * 0.2
        );
      }
    }

    spawnBurst(x, y, color, count) {
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const spd = 70 + Math.random() * 170;
        this.spawnParticle(
          x,
          y,
          Math.cos(ang) * spd,
          Math.sin(ang) * spd - 30,
          i % 3 === 0 ? "#ffffff" : color,
          4,
          0.35 + Math.random() * 0.25
        );
      }
    }

    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 320 * dt;
      }
    }

    addFloatingText(text, x, y, color, size) {
      this.floatingTexts.push({
        text,
        x,
        y,
        color: color || "#ffffff",
        size: size || 13,
        life: 0.78,
        maxLife: 0.78
      });
    }

    updateFloatingTexts(dt) {
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.life -= dt;
        ft.y -= 36 * dt;
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }
    }

    triggerShake(intensity, duration) {
      this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
      this.shakeTimer = Math.max(this.shakeTimer, duration);
    }

    notifyHud() {
      if (!this.callbacks.onHudUpdate) return;
      const cat = this.cat;
      this.callbacks.onHudUpdate({
        level: this.level,
        isDemo: this.isDemo,
        score: this.getTotalScore(),
        distance: Math.floor(this.distanceMeters),
        fish: this.fishCount,
        kills: this.killCount,
        slowPct: Math.round(this.slowEnergy),
        slowActive: this.slowActive,
        clawPct: Math.round(Math.max(0, 1 - cat.clawCooldown / CLAW_COOLDOWN) * 100),
        dashPct: Math.round(Math.max(0, 1 - cat.dashCooldown / 1.1) * 100),
        dashAllowed: !this.isPlaneMode() && !this.isSwimMode(),
        runElapsedSec: this.runElapsedSec,
        isBossRush: this.isBossRush,
        bossRushStage: (this.bossRushIndex || 0) + 1,
        isTimeAttack: this.isTimeAttack,
        shield: cat.shield,
        magnetSec: Math.ceil(cat.magnetTimer),
        milkSec: Math.ceil(cat.milkTimer),
        bossHp: this.boss ? this.boss.hp : null,
        bossMaxHp: this.boss ? this.boss.maxHp : null,
        lives: this.lives,
        maxLives: this.maxLives,
        missiles: this.catMissiles,
        laserLevel: this.isSpaceMode() ? this.laserLevel : 0,
        lightningCharge: this.level.mode === "batBoss" ? this.lightningCharge : null,
        snowBoostSec: Math.ceil(this.snowBoostTimer),
        bossFishAmmo: this.level.mode === "snowBoss" ? this.bossFishAmmo : 0,
        mudAmmo: this.level.mode === "jungleBoss" ? this.mudAmmo : 0,
        levelHi: RC.Storage.getLevelRecord(this.level.id).hiScore
      });
    }

    // ---- Rendering ----
    render() {
      if (this.mode === "hazardEvent") {
        this.renderHazardEvent();
        return;
      }
      if (this.mode === "intro") {
        this.renderIntro();
        return;
      }
      if (this.mode === "zoneDemo") {
        this.renderZoneDemo();
        return;
      }
      if (this.mode === "ending" || this.mode === "secretEnding") {
        this.renderEnding(this.mode === "secretEnding");
        return;
      }
      const ctx = this.ctx;
      const lvl = this.level;
      const lvlMode = lvl.mode || "runner";
      const nf = this.nightFactor;

      ctx.save();

      if (this.shakeTimer > 0) {
        const sx = (Math.random() - 0.5) * 2 * this.shakeIntensity;
        const sy = (Math.random() - 0.5) * 2 * this.shakeIntensity;
        ctx.translate(Math.round(sx), Math.round(sy));
      }

      // 1. Sky / Ocean Gradient
      const skyTop = lerpColor(lvl.day.skyTop, lvl.night.skyTop, nf);
      const skyBottom = lerpColor(lvl.day.skyBottom, lvl.night.skyBottom, nf);
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(1, skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, WIDTH, GROUND_Y);

      if (this.isSwimMode(lvlMode)) {
        // Underwater light rays & rising bubbles
        ctx.save();
        ctx.fillStyle = "rgba(129, 236, 236, 0.08)";
        for (let r = 0; r < 5; r++) {
          const rx = ((r * 210 - this.farBgOffset * 0.4) % (WIDTH + 200)) + 80;
          ctx.beginPath();
          ctx.moveTo(rx, 0);
          ctx.lineTo(rx + 60, 0);
          ctx.lineTo(rx - 30, GROUND_Y);
          ctx.lineTo(rx - 90, GROUND_Y);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = "rgba(199, 236, 238, 0.45)";
        this.bubbles.forEach((b) => {
          const bx = Math.floor(b.x + Math.sin(this.time * 3 + b.phase) * 4);
          ctx.fillRect(bx, Math.floor(b.y), b.size, b.size);
        });
        ctx.restore();
      } else {
        // Stars (night)
        if (nf > 0.15) {
          ctx.save();
          this.stars.forEach((s) => {
            const twinkle = 0.55 + 0.45 * Math.sin(this.time * 3.5 + s.phase);
            ctx.globalAlpha = Math.min(1, (nf - 0.15) * 1.25) * twinkle;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
          });
          ctx.restore();
        }

        // Sun / Moon
        const celestialColor = lerpColor(lvl.day.sunMoon, lvl.night.sunMoon, nf);
        const moonX = WIDTH - 140;
        const moonY = 58 + Math.sin(nf * Math.PI) * 14;
        ctx.fillStyle = celestialColor;
        ctx.fillRect(moonX, moonY, 26, 26);
        ctx.fillRect(moonX - 3, moonY + 4, 32, 18);
        ctx.fillRect(moonX + 4, moonY - 3, 18, 32);
        if (nf > 0.5) {
          ctx.fillStyle = skyTop;
          ctx.fillRect(moonX + 11, moonY + 1, 16, 16);
        }

        // Clouds
        ctx.fillStyle = lerpColor(lvl.day.cloud, lvl.night.cloud, nf);
        this.clouds.forEach((c) => {
          const cx = Math.floor(c.x);
          const cy = Math.floor(c.y);
          ctx.fillRect(cx, cy + 6, c.w, 10);
          ctx.fillRect(cx + 8, cy, c.w - 16, 8);
          ctx.fillRect(cx + 14, cy - 4, Math.max(12, c.w - 30), 6);
        });
      }

      // Parallax layer
      this.renderParallaxLayer(
        lerpColor(lvl.day.farBg, lvl.night.farBg, nf),
        this.farBgOffset,
        0.75,
        lvl.bgStyle,
        false
      );
      this.renderParallaxLayer(
        lerpColor(lvl.day.nearBg, lvl.night.nearBg, nf),
        this.nearBgOffset,
        0.52,
        lvl.bgStyle,
        nf > 0.45 || lvl.bgStyle === "neon"
      );

      // Ground / Seabed
      ctx.fillStyle = lerpColor(lvl.day.groundFill, lvl.night.groundFill, nf);
      ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

      ctx.fillStyle = lerpColor(lvl.day.groundTop, lvl.night.groundTop, nf);
      ctx.fillRect(0, GROUND_Y, WIDTH, 4);

      ctx.fillStyle = lerpColor(lvl.day.groundDetail, lvl.night.groundDetail, nf);
      for (let x = -this.groundOffset; x < WIDTH; x += 48) {
        ctx.fillRect(Math.floor(x), GROUND_Y + 4, 18, 3);
        ctx.fillRect(Math.floor(x + 26), GROUND_Y + 9, 8, 2);
      }
      this.groundPebbles.forEach((p) => {
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.w, p.h);
      });

      // Ground Pits & Swamps
      this.pits.forEach((p) => {
        const px = Math.floor(p.x);
        if (p.kind === "swamp") {
          ctx.fillStyle = "#143d18";
          ctx.fillRect(px, GROUND_Y, p.w, HEIGHT - GROUND_Y);
          ctx.fillStyle = "#2ed573";
          ctx.fillRect(px, GROUND_Y, p.w, 6);
        } else {
          ctx.fillStyle = "#080910";
          ctx.fillRect(px, GROUND_Y, p.w, HEIGHT - GROUND_Y);
          ctx.fillStyle = "#ff4757";
          ctx.fillRect(px, GROUND_Y, 4, 6);
          ctx.fillRect(px + p.w - 4, GROUND_Y, 4, 6);
        }
      });

      // Hanging Jungle Vines
      this.vines.forEach((v) => {
        const vx = Math.floor(v.x + v.w / 2);
        ctx.fillStyle = "#168246";
        ctx.fillRect(vx - 3, v.y, 6, v.h);
        ctx.fillStyle = "#2ed573";
        ctx.fillRect(vx - 8, v.y + Math.floor(v.h * 0.35), 16, 6);
        ctx.fillRect(vx - 8, v.y + Math.floor(v.h * 0.7), 16, 6);
        ctx.fillStyle = "#a3cb38";
        ctx.fillRect(vx - 5, v.y + v.h - 6, 10, 8);
      });

      // Elevated Jungle Branches (Branching Upper Paths)
      this.branches.forEach((b) => {
        const bx = Math.floor(b.x);
        ctx.fillStyle = "#6e472b";
        ctx.fillRect(bx, b.y, b.w, 12);
        ctx.fillStyle = "#2ed573";
        ctx.fillRect(bx, b.y - 4, b.w, 5);
        ctx.fillStyle = "#168246";
        ctx.fillRect(bx + 12, b.y + 10, 24, 6);
        ctx.fillRect(bx + b.w - 36, b.y + 10, 24, 6);
      });

      // Finish Gate
      if (this.finishGateSpawned && this.finishGateX != null) {
        this.renderFinishGate(Math.floor(this.finishGateX));
      }

      // Collectibles & Power-ups
      this.collectibles.forEach((item) => {
        const bobY = Math.floor(item.y + Math.sin(this.time * 5 + item.phase) * 4);
        const spr = RC.Sprites.getWorldSprite(item.kind, 3);
        if (item.isPowerup) {
          ctx.save();
          ctx.globalAlpha = 0.35 + 0.15 * Math.sin(this.time * 8);
          ctx.fillStyle = "#ffd32a";
          ctx.beginPath();
          ctx.arc(Math.floor(item.x + item.w / 2), bobY + Math.floor(item.h / 2), 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        if (spr) ctx.drawImage(spr, Math.floor(item.x), bobY);
      });

      // Projectiles (Plane bullets, missiles, space lasers, thrown fish & mud)
      this.projectiles.forEach((b) => {
        if (b.isThrownFish) {
          const spr = RC.Sprites.getWorldSprite("fish", 3);
          if (spr) ctx.drawImage(spr, Math.floor(b.x), Math.floor(b.y));
        } else if (b.isMud) {
          const spr = RC.Sprites.getWorldSprite("mudBall", 3);
          if (spr) ctx.drawImage(spr, Math.floor(b.x), Math.floor(b.y));
        } else if (b.isMissile) {
          const spr = RC.Sprites.getWorldSprite("missile", 3);
          if (spr) ctx.drawImage(spr, Math.floor(b.x), Math.floor(b.y));
        } else if (b.isLaser) {
          const col = b.laserLevel >= 3 ? "#ff6b81" : b.laserLevel === 2 ? "#ffd32a" : "#48dbfb";
          ctx.fillStyle = col;
          ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.w, b.h);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(Math.floor(b.x + 3), Math.floor(b.y + 1), Math.max(4, b.w - 6), Math.max(2, b.h - 2));
        } else {
          ctx.fillStyle = "#ffd32a";
          ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.w, b.h);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(Math.floor(b.x + 6), Math.floor(b.y + 1), b.w - 8, b.h - 2);
        }
      });

      // Alien & Spooky Shots
      this.alienShots.forEach((s) => {
        ctx.fillStyle = "#ff4757";
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.w, s.h);
        ctx.fillStyle = "#ffd32a";
        ctx.fillRect(Math.floor(s.x + 2), Math.floor(s.y + 1), s.w - 6, s.h - 2);
      });
      this.spookyShots.forEach((s) => {
        const spr = RC.Sprites.getWorldSprite(s.sprite, 3);
        if (spr) ctx.drawImage(spr, Math.floor(s.x), Math.floor(s.y));
      });

      // Boss (Chicken, Squid, or Plane) & Projectiles
      if (this.boss && this.boss.active) {
        this.renderBoss();
      }
      this.bossEggs.forEach((egg) => {
        const spr = RC.Sprites.getWorldSprite("egg", 3);
        if (spr) ctx.drawImage(spr, Math.floor(egg.x), Math.floor(egg.y));
      });
      this.bossPiranhas.forEach((p) => {
        const sprName = Math.floor(p.animTimer) % 2 === 0 ? "piranha1" : "piranha2";
        const spr = RC.Sprites.getWorldSprite(sprName, 3);
        if (spr) ctx.drawImage(spr, Math.floor(p.x), Math.floor(p.y));
      });
      this.bossTrash.forEach((t) => {
        const spr = RC.Sprites.getWorldSprite("trashBag", 3);
        if (spr) ctx.drawImage(spr, Math.floor(t.x), Math.floor(t.y));
        if (t.hasMissile) {
          ctx.save();
          ctx.globalAlpha = 0.55 + 0.35 * Math.sin(this.time * 16);
          ctx.strokeStyle = "#ffd32a";
          ctx.lineWidth = 2;
          ctx.strokeRect(Math.floor(t.x) - 2, Math.floor(t.y) - 2, t.w + 4, t.h + 4);
          ctx.restore();
        }
      });
      this.launchedMines.forEach((m) => {
        const spr = RC.Sprites.getWorldSprite("proxMineArmed", 3);
        if (spr) ctx.drawImage(spr, Math.floor(m.x), Math.floor(m.y));
      });

      // Obstacles & Enemies
      this.obstacles.forEach((obs) => {
        const ox = Math.floor(obs.x);
        const oy = Math.floor(obs.y);

        if (obs.scratchable && obs.x < this.cat.x + 250 && obs.x > this.cat.x - 10) {
          ctx.save();
          ctx.globalAlpha = 0.5 + 0.35 * Math.sin(this.time * 16);
          ctx.fillStyle = obs.type === "seaWall" ? "#ffd32a" : "#ff6b81";
          ctx.fillRect(ox + obs.w / 2 - 5, oy - 8, 10, 3);
          ctx.restore();
        }

        if (obs.isZoneHazard === "abductor") {
          ctx.save();
          ctx.fillStyle = `rgba(72, 219, 251, ${0.2 + 0.1 * Math.sin(this.time * 12)})`;
          ctx.beginPath();
          ctx.moveTo(ox + 12, oy + obs.h);
          ctx.lineTo(ox + obs.w - 12, oy + obs.h);
          ctx.lineTo(ox + obs.w + 8, GROUND_Y);
          ctx.lineTo(ox - 8, GROUND_Y);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (obs.isZoneHazard === "whirlpool") {
          ctx.save();
          ctx.strokeStyle = "rgba(72, 219, 251, 0.35)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ox + obs.w / 2, oy + obs.h / 2, obs.suctionRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        if (obs.isProximityMine) {
          const mcx = ox + obs.w / 2;
          const mcy = oy + obs.h / 2;
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([5, 5]);
          ctx.arc(mcx, mcy, obs.proxRadius, 0, Math.PI * 2);
          ctx.strokeStyle = obs.armed
            ? `rgba(255, 71, 87, ${0.55 + 0.4 * Math.sin(this.time * 26)})`
            : "rgba(255, 159, 67, 0.38)";
          ctx.lineWidth = obs.armed ? 2.5 : 1.5;
          ctx.stroke();
          ctx.restore();
        }

        if (obs.type === "seaWall") {
          const spr = RC.Sprites.getWorldSprite("seaWall", 3);
          if (spr) ctx.drawImage(spr, ox, oy, obs.w, obs.h);
        } else if (obs.type === "seaweed") {
          const spr = RC.Sprites.getWorldSprite("seaweed", 3);
          if (spr) {
            const tileH = spr.height;
            for (let sy = oy; sy < oy + obs.h; sy += tileH) {
              const drawH = Math.min(tileH, oy + obs.h - sy);
              ctx.drawImage(spr, 0, 0, spr.width, drawH, ox, sy, obs.w, drawH);
            }
          }
          if (obs.x < this.cat.x + 280 && obs.x > this.cat.x) {
            ctx.save();
            ctx.globalAlpha = 0.65 + 0.35 * Math.sin(this.time * 14);
            ctx.fillStyle = "#2ed573";
            ctx.font = '900 11px "Courier New", monospace';
            ctx.fillText("CORTA (X)", ox - 8, oy + 16);
            ctx.restore();
          }
        } else if (obs.type === "skyBlock") {
          const spr = RC.Sprites.getWorldSprite("skyBlock", 3);
          if (spr) ctx.drawImage(spr, ox, oy, obs.w, obs.h);
        } else {
          const spr = RC.Sprites.getWorldSprite(obs.sprite, 3);
          if (spr) ctx.drawImage(spr, ox, oy);
        }
      });

      // Cat Afterimages
      this.cat.afterimages.forEach((img) => {
        const spr = RC.Sprites.getCatSprite(img.pose, this.skinId, 3);
        ctx.save();
        ctx.globalAlpha = img.alpha * 0.65;
        ctx.drawImage(spr, Math.floor(img.x), Math.floor(img.y));
        ctx.restore();
      });

      // Player Cat (with Golden Glow Power-up redesign!)
      this.renderCat();

      // Claw / Special Attack FX
      if (this.cat.clawTimer > 0) {
        const progress = 1 - this.cat.clawTimer / CLAW_DURATION;
        const frameIdx = Math.min(2, Math.floor(progress * 3));
        const clawSpr = RC.Sprites.getClawSprite(frameIdx, 4);
        ctx.drawImage(
          clawSpr,
          Math.floor(this.cat.x + this.cat.w - 4),
          Math.floor(this.cat.y - 6)
        );
      }

      // Particles
      this.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        ctx.restore();
      });

      // Floating Score Texts
      this.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
        ctx.font = `900 ${ft.size}px "Courier New", monospace`;
        ctx.fillStyle = "#0e101c";
        ctx.fillText(ft.text, Math.floor(ft.x) + 2, Math.floor(ft.y) + 2);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, Math.floor(ft.x), Math.floor(ft.y));
        ctx.restore();
      });

      // Slow-Motion Tint
      if (this.slowActive || this.timeScale < 0.92) {
        const intensity = Math.max(0, (1 - this.timeScale) / (1 - SLOW_TIME_SCALE));
        ctx.save();
        ctx.fillStyle = `rgba(38, 175, 255, ${0.14 * intensity})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = `rgba(72, 219, 251, ${0.09 * intensity})`;
        for (let y = 0; y < HEIGHT; y += 6) {
          ctx.fillRect(0, y, WIDTH, 2);
        }
        ctx.fillStyle = `rgba(72, 219, 251, ${0.9 * intensity})`;
        ctx.font = '900 13px "Courier New", monospace';
        ctx.fillText("⏱ CÁMARA LENTA", 16, HEIGHT - 16);
        ctx.restore();
      }

      // Blizzard Frost & Wind Overlay (Snow Zone)
      if (this.blizzardTimer > 0) {
        ctx.save();
        ctx.fillStyle = "rgba(223, 249, 251, 0.18)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        for (let i = 0; i < 24; i++) {
          const sx = (WIDTH - ((this.time * 520 + i * 97) % (WIDTH + 60)));
          const sy = (i * 31 + Math.sin(this.time * 4 + i) * 14) % GROUND_Y;
          ctx.fillRect(Math.floor(sx), Math.floor(sy), 18, 3);
        }
        ctx.fillStyle = "#dff9fb";
        ctx.font = '900 13px "Courier New", monospace';
        ctx.fillText("❄ ¡VENTISCA! (EMPUJA AL SALTAR)", 16, 86);
        ctx.restore();
      }

      ctx.restore();
    }

    renderBoss() {
      const ctx = this.ctx;
      const boss = this.boss;
      const bx = Math.floor(boss.x);
      const by = Math.floor(boss.y);

      if (boss.kind === "squid") {
        const sprName =
          boss.hurtTimer > 0
            ? "squidHurt"
            : Math.floor(boss.animTimer) % 2 === 0
            ? "squid1"
            : "squid2";
        const spr = RC.Sprites.getWorldSprite(sprName, 5);
        if (spr) ctx.drawImage(spr, bx, by);

        ctx.save();
        ctx.globalAlpha = 0.75 + 0.25 * Math.sin(this.time * 8);
        ctx.font = '900 11px "Courier New", monospace';
        ctx.fillStyle = "#ffd32a";
        ctx.fillText("¡LÁNZALE MINAS (X)!", bx - 20, by - 8);
        ctx.restore();
        return;
      }

      if (boss.kind === "penguin") {
        const sprName =
          boss.hurtTimer > 0
            ? "penguinHurt"
            : Math.floor(boss.animTimer) % 2 === 0
            ? "penguin1"
            : "penguin2";
        const spr = RC.Sprites.getWorldSprite(sprName, 6);
        const fed = boss.maxHp - boss.hp;
        const extraW = fed * 7;
        const drawW = (spr ? spr.width : 84) + extraW;
        const drawH = spr ? spr.height : 66;
        if (spr) ctx.drawImage(spr, bx - Math.floor(extraW / 2), by, drawW, drawH);

        ctx.save();
        ctx.globalAlpha = 0.75 + 0.25 * Math.sin(this.time * 8);
        ctx.font = '900 11px "Courier New", monospace';
        ctx.fillStyle = "#ffd32a";
        ctx.fillText(`🐟 ALIMENTA AL PINGÜINO (X)`, bx - 44, by - 8);
        ctx.restore();
        return;
      }

      if (boss.kind === "snake") {
        const sprName =
          boss.hurtTimer > 0
            ? "snakeHurt"
            : Math.floor(boss.animTimer) % 2 === 0
            ? "snake1"
            : "snake2";
        const spr = RC.Sprites.getWorldSprite(sprName, 6);
        if (spr) ctx.drawImage(spr, bx, by);

        ctx.save();
        ctx.globalAlpha = 0.75 + 0.25 * Math.sin(this.time * 8);
        ctx.font = '900 11px "Courier New", monospace';
        ctx.fillStyle = "#a3cb38";
        ctx.fillText("🟤 LANZA LODO (X)", bx - 14, by - 8);
        ctx.restore();
        return;
      }

      if (boss.kind === "skeleton") {
        const sprName =
          boss.hurtTimer > 0
            ? "giantSkeletonHurt"
            : Math.floor(boss.animTimer) % 2 === 0
            ? "giantSkeleton1"
            : "giantSkeleton2";
        const spr = RC.Sprites.getWorldSprite(sprName, 6);
        if (spr) ctx.drawImage(spr, bx, by);

        if (this.lightningTimer > 0) {
          ctx.save();
          ctx.strokeStyle = "#48dbfb";
          ctx.lineWidth = 8;
          ctx.beginPath();
          const lx = bx + boss.w * 0.5;
          ctx.moveTo(lx, 0);
          ctx.lineTo(lx - 18, by * 0.35);
          ctx.lineTo(lx + 16, by * 0.65);
          ctx.lineTo(lx, by + 24);
          ctx.stroke();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = 0.75 + 0.25 * Math.sin(this.time * 8);
        ctx.font = '900 11px "Courier New", monospace';
        ctx.fillStyle = "#48dbfb";
        ctx.fillText(`⚡ RAYO: ${this.lightningCharge}/5`, bx - 6, by - 8);
        ctx.restore();
        return;
      }

      if (boss.kind === "ufo") {
        const sprName =
          boss.hurtTimer > 0
            ? "mothershipHurt"
            : Math.floor(boss.animTimer) % 2 === 0
            ? "mothership1"
            : "mothership2";
        const spr = RC.Sprites.getWorldSprite(sprName, 6);
        if (spr) ctx.drawImage(spr, bx, by);

        ctx.save();
        ctx.globalAlpha = 0.75 + 0.25 * Math.sin(this.time * 8);
        ctx.font = '900 11px "Courier New", monospace';
        ctx.fillStyle = "#48dbfb";
        ctx.fillText("¡DESTRUYE MINI-NAVES Y DISPARA!", bx - 48, by - 8);
        ctx.restore();
        return;
      }

      if (boss.kind === "plane") {
        const sprName =
          boss.hurtTimer > 0
            ? "bossPlaneHurt"
            : Math.floor(boss.animTimer) % 2 === 0
            ? "bossPlane1"
            : "bossPlane2";
        const spr = RC.Sprites.getWorldSprite(sprName, 6);
        if (spr) ctx.drawImage(spr, bx, by);

        ctx.save();
        ctx.globalAlpha = 0.75 + 0.25 * Math.sin(this.time * 8);
        ctx.font = '900 11px "Courier New", monospace';
        ctx.fillStyle = "#ffd32a";
        ctx.fillText("¡DERROTA CON MISILES!", bx - 24, by - 8);
        ctx.restore();
        return;
      }

      const sprName =
        boss.hurtTimer > 0
          ? "chickenHurt"
          : Math.floor(boss.animTimer) % 2 === 0
          ? "chicken1"
          : "chicken2";
      const spr = RC.Sprites.getWorldSprite(sprName, 6);

      if (boss.state === "side") {
        // Golden/red vulnerable indicator above boss when on the side
        ctx.save();
        ctx.globalAlpha = 0.7 + 0.3 * Math.sin(this.time * 18);
        ctx.font = '900 13px "Courier New", monospace';
        ctx.fillStyle = "#ffd32a";
        ctx.fillText("¡ARAÑA AQUÍ (X)!", bx - 14, by - 10);
        ctx.restore();
      }

      if (spr) {
        ctx.drawImage(spr, bx, by);
      }
    }

    renderCat() {
      const ctx = this.ctx;
      const cat = this.cat;
      const cx = Math.floor(cat.x);
      const cy = Math.floor(cat.y);

      // Ground shadow (only in runner/boss)
      const lvlMode = this.level.mode || "runner";
      if (lvlMode === "runner" || lvlMode === "boss") {
        const distFromGround = Math.max(0, GROUND_Y - (cat.y + cat.h));
        const shadowScale = Math.max(0.35, 1 - distFromGround / 170);
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        const sw = Math.floor(38 * shadowScale);
        ctx.fillRect(Math.floor(cat.x + (cat.w - sw) / 2), GROUND_Y - 2, sw, 4);
        ctx.restore();
      }

      if (cat.invulnTimer > 0 && Math.floor(this.time * 18) % 2 === 0) {
        return;
      }

      const pose = this.getCatPose();
      const hatPalette = ["#ff4757", "#ff9f43", "#ffd32a", "#2ed573", "#48dbfb", "#5352ed", "#a55eea", "#ff6b81"];
      const hasRainbowHat =
        this.skinId === "winicat" ||
        (this.skinId === "custom" && RC.Storage && RC.Storage.getCustomCat().cosmetic === "hat");
      const hatColor = hasRainbowHat
        ? hatPalette[Math.floor(this.time * 4) % hatPalette.length]
        : null;
      const spr = RC.Sprites.getCatSprite(pose, this.skinId, 3, hatColor);

      // Redesigned Power-Up Visual: Golden Glow Aura (NO boxy square!)
      const hasGoldPower = cat.milkTimer > 0 || cat.shield || cat.magnetTimer > 0;
      if (hasGoldPower) {
        const pulse = 0.55 + 0.35 * Math.sin(this.time * 12);
        const glowColor = cat.milkTimer > 0 ? "#ffd32a" : cat.shield ? "#ffe066" : "#ffbe76";
        const glowSpr = RC.Sprites.getGlowCatSprite(pose, glowColor, 3);

        ctx.save();
        ctx.shadowColor = "#ffd32a";
        ctx.shadowBlur = cat.milkTimer > 0 ? 18 : 12;
        ctx.globalAlpha = pulse;
        // Draw golden silhouette outline around the cat
        ctx.drawImage(glowSpr, cx - 3, cy);
        ctx.drawImage(glowSpr, cx + 3, cy);
        ctx.drawImage(glowSpr, cx, cy - 3);
        ctx.drawImage(glowSpr, cx, cy + 3);
        ctx.restore();

        // Orbiting golden pixel sparkles
        ctx.save();
        for (let i = 0; i < 4; i++) {
          const ang = this.time * 5 + (Math.PI * 2 * i) / 4;
          const sx = Math.floor(cx + cat.w / 2 + Math.cos(ang) * 28);
          const sy = Math.floor(cy + cat.h / 2 + Math.sin(ang) * 20);
          ctx.fillStyle = i % 2 === 0 ? "#ffd32a" : "#fff7b2";
          ctx.fillRect(sx, sy, 4, 4);
        }
        ctx.restore();
      }

      // Draw actual cat sprite (with subtle golden sheen if milkTimer active)
      ctx.save();
      if (cat.milkTimer > 0) {
        ctx.shadowColor = "#ffd32a";
        ctx.shadowBlur = 10;
      }
      ctx.drawImage(spr, cx, cy);
      if (cat.milkTimer > 0) {
        ctx.globalAlpha = 0.25 + 0.15 * Math.sin(this.time * 16);
        const goldOverlay = RC.Sprites.getGlowCatSprite(pose, "#ffd32a", 3);
        ctx.drawImage(goldOverlay, cx, cy);
      }
      ctx.restore();

      // Husky + Sled in Snow Zone!
      if (this.isSnowMode()) {
        const huskySprName = Math.floor(cat.runAnimTimer) % 2 === 0 ? "husky1" : "husky2";
        const huskySpr = RC.Sprites.getWorldSprite(huskySprName, 3);
        const sledSpr = RC.Sprites.getWorldSprite("sled", 3);
        if (sledSpr) ctx.drawImage(sledSpr, cx - 2, cy + cat.h - 16);
        if (huskySpr) ctx.drawImage(huskySpr, cx + cat.w + 4, cy + cat.h - 28);
        // Harness rope
        ctx.fillStyle = "#ffd32a";
        ctx.fillRect(cx + cat.w - 4, cy + cat.h - 12, 12, 2);
      }

      // Astronaut helmet bubble in Space levels
      if (this.isSpaceMode()) {
        ctx.save();
        ctx.strokeStyle = "rgba(116, 232, 255, 0.85)";
        ctx.fillStyle = "rgba(116, 232, 255, 0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx + cat.w * 0.62, cy + 13, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    renderParallaxLayer(color, offset, heightScale, bgStyle, showWindows) {
      const ctx = this.ctx;
      ctx.fillStyle = color;

      for (let repeat = 0; repeat < 2; repeat++) {
        const baseX = repeat * this.bgTotalWidth - offset;
        for (let i = 0; i < this.bgBuildings.length; i++) {
          const b = this.bgBuildings[i];
          const x = Math.floor(baseX + b.x);
          if (x + b.w < -20 || x > WIDTH + 20) continue;
          const h = Math.floor(b.h * heightScale);

          if (bgStyle === "park") {
            const trunkW = Math.max(8, Math.floor(b.w * 0.24));
            const trunkX = x + Math.floor((b.w - trunkW) / 2);
            ctx.fillStyle = color;
            ctx.fillRect(trunkX, GROUND_Y - Math.floor(h * 0.55), trunkW, Math.floor(h * 0.55));
            ctx.fillRect(x, GROUND_Y - h, b.w, Math.floor(h * 0.6));
            ctx.fillRect(x + 6, GROUND_Y - h - 10, b.w - 12, 12);
          } else if (bgStyle === "ocean") {
            // Underwater coral silhouettes & kelp
            ctx.fillStyle = color;
            ctx.fillRect(x, GROUND_Y - h, Math.floor(b.w * 0.6), h);
            ctx.fillRect(x + 10, GROUND_Y - h - 14, Math.floor(b.w * 0.35), 14);
          } else {
            ctx.fillStyle = color;
            ctx.fillRect(x, GROUND_Y - h, b.w, h);
            if (showWindows && b.hasWindows && h > 34) {
              ctx.fillStyle =
                bgStyle === "neon" ? "rgba(72, 219, 251, 0.35)" : "rgba(255, 226, 120, 0.35)";
              for (let wy = GROUND_Y - h + 8; wy < GROUND_Y - 12; wy += 12) {
                for (let wx = x + 6; wx < x + b.w - 8; wx += 10) {
                  ctx.fillRect(wx, wy, 5, 6);
                }
              }
            }
          }
        }
      }
    }

    renderFinishGate(x) {
      const ctx = this.ctx;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, GROUND_Y - 110, 6, 110);
      const cols = 4;
      const rows = 5;
      const cell = 7;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? "#ffffff" : "#111111";
          ctx.fillRect(x + 6 + c * cell, GROUND_Y - 110 + r * cell, cell, cell);
        }
      }
      ctx.fillStyle = "#2ed573";
      ctx.font = '900 12px "Courier New", monospace';
      ctx.fillText("META!", x - 6, GROUND_Y - 118);
    }

    // ---- Ending Cutscene (Cat walks home to Abuelita, food, milk & cozy bed) ----
    updateEnding(dt) {
      this.time += dt;
      this.endingTimer += dt;
      this.cat.runAnimTimer += dt * 7;
    }

    renderEnding(isSecret) {
      const ctx = this.ctx;
      const t = this.endingTimer;

      // 1. Warm sunset sky
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      sky.addColorStop(0, "#2c2459");
      sky.addColorStop(0.55, "#ff7b6b");
      sky.addColorStop(1, "#ffd39b");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, WIDTH, GROUND_Y);

      // Twinkling evening stars
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      for (let i = 0; i < 18; i++) {
        const sx = (i * 53 + 20) % WIDTH;
        const sy = 16 + ((i * 37) % 90);
        if (Math.sin(this.time * 3 + i) > -0.2) ctx.fillRect(sx, sy, 2, 2);
      }

      // Cozy grass & dirt path
      ctx.fillStyle = "#3c6e47";
      ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
      ctx.fillStyle = "#5cb874";
      ctx.fillRect(0, GROUND_Y, WIDTH, 4);
      ctx.fillStyle = "#c9a679";
      ctx.fillRect(0, GROUND_Y + 12, 560, 14);

      // 2. Cozy Little House (Casita) on the right
      const hx = 560;
      const hy = 132;
      // Chimney & smoke
      ctx.fillStyle = "#8c3b2b";
      ctx.fillRect(hx + 230, hy - 34, 24, 40);
      for (let s = 0; s < 4; s++) {
        const sy = hy - 44 - ((t * 18 + s * 16) % 52);
        const sx = hx + 236 + Math.sin(t * 2 + s) * 6;
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.fillRect(Math.floor(sx), Math.floor(sy), 10, 8);
      }

      // House walls
      ctx.fillStyle = "#f7e3c3";
      ctx.fillRect(hx, hy, 290, GROUND_Y - hy);
      // Roof
      ctx.fillStyle = "#b8402e";
      ctx.beginPath();
      ctx.moveTo(hx - 18, hy + 4);
      ctx.lineTo(hx + 145, hy - 56);
      ctx.lineTo(hx + 308, hy + 4);
      ctx.closePath();
      ctx.fill();

      // Warm glowing interior window / open cozy room on the right half of the house
      ctx.fillStyle = "#ffdf8e";
      ctx.fillRect(hx + 115, hy + 28, 152, GROUND_Y - hy - 34);
      ctx.strokeStyle = "#6e472b";
      ctx.lineWidth = 4;
      ctx.strokeRect(hx + 115, hy + 28, 152, GROUND_Y - hy - 34);

      // Doorway
      ctx.fillStyle = "#7a4b2a";
      ctx.fillRect(hx + 26, hy + 72, 52, GROUND_Y - (hy + 72));
      ctx.fillStyle = "#ffd32a";
      ctx.fillRect(hx + 68, hy + 114, 6, 6);

      // 3. Cozy Cat Bed (Camita), Food Bowl & Milk Saucer inside the warm room
      const bedX = hx + 148;
      const bedY = GROUND_Y - 22;
      ctx.fillStyle = "#e84118";
      ctx.fillRect(bedX, bedY, 68, 20);
      ctx.fillStyle = "#ffeaa7";
      ctx.fillRect(bedX + 6, bedY + 3, 56, 12);

      // Food bowl (Comida)
      const foodX = hx + 224;
      ctx.fillStyle = "#ff6b81";
      ctx.fillRect(foodX, GROUND_Y - 12, 22, 10);
      ctx.fillStyle = "#b87435";
      ctx.fillRect(foodX + 3, GROUND_Y - 15, 16, 4);

      // Milk saucer (Leche)
      ctx.fillStyle = "#70a1ff";
      ctx.fillRect(foodX - 2, GROUND_Y - 2, 26, 4);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(foodX + 2, GROUND_Y - 5, 18, 4);

      // 4. Abuelita (Grandma)
      const grandmaSpr = RC.Sprites.getWorldSprite("grandma", 5);
      const grandmaX = t < 4.4 ? hx + 76 : hx + 118;
      const grandmaY = GROUND_Y - 60;
      if (grandmaSpr) ctx.drawImage(grandmaSpr, grandmaX, grandmaY);

      // 5. Cat Animation Phases
      if (t < 4.2) {
        // Phase 1: Cat walks happily toward the cottage
        const walkProgress = Math.min(1, t / 3.8);
        const catX = Math.floor(60 + walkProgress * (hx - 54));
        const pose = walkProgress < 1 && Math.floor(this.cat.runAnimTimer) % 2 === 0 ? "run1" : "run2";
        const catSpr = RC.Sprites.getCatSprite(pose, this.skinId, 3);
        ctx.drawImage(catSpr, catX, GROUND_Y - 42);

        if (walkProgress > 0.75) {
          ctx.fillStyle = "rgba(255, 248, 232, 0.92)";
          const msg = isSecret ? `¡Traje ${this.secretBossItem}! ♥` : "¡Mi gatito volvió! ♥";
          const bw = isSecret ? 275 : 178;
          ctx.fillRect(grandmaX - 66, grandmaY - 28, bw, 22);
          ctx.strokeStyle = "#2f1b14";
          ctx.lineWidth = 2;
          ctx.strokeRect(grandmaX - 66, grandmaY - 28, bw, 22);
          ctx.fillStyle = "#1e1624";
          ctx.font = '900 12px "Courier New", monospace';
          ctx.fillText(msg, grandmaX - 58, grandmaY - 13);
        }
      } else if (t < 6.0) {
        // Phase 2: Abuelita greets and cooks/cuddles the cat at the porch
        const catSpr = RC.Sprites.getCatSprite("run1", this.skinId, 3);
        ctx.drawImage(catSpr, hx + 46, GROUND_Y - 42);
        if (isSecret) {
          ctx.fillStyle = "rgba(255, 248, 232, 0.92)";
          ctx.fillRect(grandmaX - 70, grandmaY - 28, 250, 22);
          ctx.strokeStyle = "#2f1b14";
          ctx.lineWidth = 2;
          ctx.strokeRect(grandmaX - 70, grandmaY - 28, 250, 22);
          ctx.fillStyle = "#1e1624";
          ctx.font = '900 11px "Courier New", monospace';
          ctx.fillText("🍲 ¡Te prepararé algo rico!", grandmaX - 62, grandmaY - 13);
        } else {
          ctx.fillStyle = "#b81d3a";
          ctx.font = '900 16px "Courier New", monospace';
          const heartY = grandmaY - 14 - Math.floor(Math.sin(t * 6) * 5);
          ctx.fillText("♥  ♥", grandmaX + 4, heartY);
        }
      } else {
        // Phase 3: Cat tucked into its cozy bed with food & milk, sleeping peacefully
        const catSpr = RC.Sprites.getCatSprite("duck1", this.skinId, 3);
        ctx.drawImage(catSpr, bedX + 8, bedY - 12);

        // Cozy blanket over the cat's back
        ctx.fillStyle = "#ff9ff3";
        ctx.fillRect(bedX + 10, bedY + 2, 34, 11);

        // Floating Zzz and hearts (dark readable text)
        const zOff = (t * 14) % 24;
        ctx.fillStyle = "#1b263b";
        ctx.font = '900 14px "Courier New", monospace';
        ctx.fillText("Zzz...", bedX + 26, Math.floor(bedY - 22 - zOff));
        ctx.fillStyle = "#b81d3a";
        ctx.fillText("♥", grandmaX + 22, grandmaY - 10);

        // Ending Banner
        ctx.fillStyle = "rgba(18, 20, 34, 0.82)";
        ctx.fillRect(WIDTH / 2 - 230, 26, 460, 56);
        ctx.strokeStyle = "#ffd32a";
        ctx.lineWidth = 2;
        ctx.strokeRect(WIDTH / 2 - 230, 26, 460, 56);
        ctx.fillStyle = "#ffd32a";
        ctx.font = '900 17px "Courier New", monospace';
        ctx.fillText(
          isSecret ? "👑 ¡FINAL SECRETO COMPLETADO!" : "🏠 ¡FELIZ DESCANSO EN CASITA!",
          WIDTH / 2 - 175,
          50
        );
        ctx.fillStyle = "#ffffff";
        ctx.font = '700 12px "Courier New", monospace';
        ctx.fillText(
          isSecret
            ? `Cenó guiso con ${this.secretBossItem} y a dormir. ¡FIN!`
            : "Comida, leche y sueños felinos. ¡FIN!",
          WIDTH / 2 - 185,
          70
        );
      }
    }

    // ---- Intro Cutscene (Sleeping cat woken up angry by noisy planes, UFOs & birds) ----
    updateIntro(dt) {
      this.time += dt;
      this.introTimer += dt;
      this.cat.runAnimTimer += dt * 9;

      if (this.introTimer >= 7.5 && this.callbacks.onIntroEnd) {
        this.callbacks.onIntroEnd();
      }
    }

    renderIntro() {
      const ctx = this.ctx;
      const t = this.introTimer;

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      sky.addColorStop(0, "#5fa8d3");
      sky.addColorStop(1, "#cae9ff");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, WIDTH, GROUND_Y);

      // Ground & yard
      ctx.fillStyle = "#3c6e47";
      ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
      ctx.fillStyle = "#5cb874";
      ctx.fillRect(0, GROUND_Y, WIDTH, 4);

      // Cozy House on the left
      const hx = 60;
      const hy = 132;
      ctx.fillStyle = "#f7e3c3";
      ctx.fillRect(hx, hy, 250, GROUND_Y - hy);
      ctx.fillStyle = "#b8402e";
      ctx.beginPath();
      ctx.moveTo(hx - 16, hy + 4);
      ctx.lineTo(hx + 125, hy - 54);
      ctx.lineTo(hx + 266, hy + 4);
      ctx.closePath();
      ctx.fill();

      // Open bedroom view inside house
      ctx.fillStyle = "#ffe8b3";
      ctx.fillRect(hx + 22, hy + 30, 148, GROUND_Y - hy - 36);
      ctx.strokeStyle = "#6e472b";
      ctx.lineWidth = 4;
      ctx.strokeRect(hx + 22, hy + 30, 148, GROUND_Y - hy - 36);

      // Door on right of house
      ctx.fillStyle = "#7a4b2a";
      ctx.fillRect(hx + 186, hy + 72, 48, GROUND_Y - (hy + 72));

      // Cat bed inside room
      const bedX = hx + 46;
      const bedY = GROUND_Y - 22;
      ctx.fillStyle = "#e84118";
      ctx.fillRect(bedX, bedY, 68, 20);
      ctx.fillStyle = "#ffeaa7";
      ctx.fillRect(bedX + 6, bedY + 3, 56, 12);

      // Phase 2+: Noisy flying things outside (birds, drones, UFOs, planes)
      if (t >= 1.8) {
        const nt = t - 1.8;
        const flyers = [
          { spr: Math.floor(t * 10) % 2 === 0 ? "bird1" : "bird2", x: WIDTH - (nt * 210) % (WIDTH + 120), y: 74 },
          { spr: Math.floor(t * 12) % 2 === 0 ? "drone1" : "drone2", x: WIDTH - ((nt * 260 + 180) % (WIDTH + 140)), y: 120 },
          { spr: Math.floor(t * 8) % 2 === 0 ? "miniUfo1" : "miniUfo2", x: WIDTH - ((nt * 300 + 340) % (WIDTH + 160)), y: 50 },
          { spr: Math.floor(t * 14) % 2 === 0 ? "bossPlane1" : "bossPlane2", x: WIDTH - ((nt * 330 + 90) % (WIDTH + 220)), y: 158 }
        ];
        flyers.forEach((f) => {
          const spr = RC.Sprites.getWorldSprite(f.spr, 3);
          if (spr) ctx.drawImage(spr, Math.floor(f.x), f.y);
        });

        if (t < 6.0) {
          // Noise text bubbles outside
          ctx.fillStyle = "#1e272e";
          ctx.font = '900 13px "Courier New", monospace';
          const shakeY = Math.sin(t * 28) * 3;
          ctx.fillText("¡BEEP! ¡BRRR!", 420, Math.floor(96 + shakeY));
          ctx.fillText("¡PIO! ¡ZOOOM!", 580, Math.floor(142 - shakeY));
          ctx.fillText("💥 ¡RUIDO!", 490, Math.floor(54 + shakeY));
        }
      }

      // Cat animation
      if (t < 4.2) {
        // Sleeping in bed
        const catSpr = RC.Sprites.getCatSprite("duck1", this.skinId, 3);
        ctx.drawImage(catSpr, bedX + 8, bedY - 12);
        ctx.fillStyle = "#ff9ff3";
        ctx.fillRect(bedX + 10, bedY + 2, 34, 11);

        if (t < 2.3) {
          ctx.fillStyle = "#1e272e";
          ctx.font = '900 14px "Courier New", monospace';
          ctx.fillText("Zzz...", bedX + 26, Math.floor(bedY - 22 - (t * 12) % 18));
        } else {
          ctx.fillStyle = "#c0392b";
          ctx.font = '900 16px "Courier New", monospace';
          ctx.fillText("!?", bedX + 34, bedY - 24);
        }
      } else if (t < 5.7) {
        // Wakes up ANGRY!
        const catSpr = RC.Sprites.getCatSprite("hurt", this.skinId, 3);
        ctx.drawImage(catSpr, bedX + 18, GROUND_Y - 44 - Math.abs(Math.sin(t * 14) * 6));

        ctx.fillStyle = "rgba(255, 248, 232, 0.94)";
        ctx.fillRect(bedX - 8, GROUND_Y - 86, 224, 24);
        ctx.strokeStyle = "#c0392b";
        ctx.lineWidth = 2;
        ctx.strokeRect(bedX - 8, GROUND_Y - 86, 224, 24);
        ctx.fillStyle = "#1e272e";
        ctx.font = '900 12px "Courier New", monospace';
        ctx.fillText("💢 ¡GRRR! ¡MUCHO RUIDO!", bedX, GROUND_Y - 70);
      } else {
        // Runs out the door to investigate!
        const runProg = (t - 5.7) / 1.8;
        const catX = Math.floor(hx + 186 + runProg * 620);
        const pose = Math.floor(this.cat.runAnimTimer) % 2 === 0 ? "run1" : "run2";
        const catSpr = RC.Sprites.getCatSprite(pose, this.skinId, 3);
        ctx.drawImage(catSpr, catX, GROUND_Y - 42);

        ctx.fillStyle = "rgba(255, 248, 232, 0.94)";
        ctx.fillRect(catX - 24, GROUND_Y - 74, 150, 22);
        ctx.strokeStyle = "#1e272e";
        ctx.lineWidth = 2;
        ctx.strokeRect(catX - 24, GROUND_Y - 74, 150, 22);
        ctx.fillStyle = "#1e272e";
        ctx.font = '900 12px "Courier New", monospace';
        ctx.fillText("¡A INVESTIGAR!", catX - 14, GROUND_Y - 59);
      }
    }

    // ---- Optional Zone Tutorial Mini-Demo ----
    renderZoneDemo() {
      const ctx = this.ctx;
      const data = this.zoneDemoData || RC.Levels.ZONE_TUTORIALS.city;
      const step = data.steps[Math.min(this.zoneDemoStep, data.steps.length - 1)];

      const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      bg.addColorStop(0, "#171a2e");
      bg.addColorStop(1, "#293052");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Ground strip
      ctx.fillStyle = "#2f3640";
      ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
      ctx.fillStyle = "#48dbfb";
      ctx.fillRect(0, GROUND_Y, WIDTH, 4);

      // Title & Step Badge
      ctx.fillStyle = "#ffd32a";
      ctx.font = '900 18px "Courier New", monospace';
      ctx.fillText(`🎓 ${data.title.toUpperCase()}`, 32, 42);

      ctx.fillStyle = "#48dbfb";
      ctx.font = '900 13px "Courier New", monospace';
      ctx.fillText(step.label, 32, 72);

      // Step Description Box
      ctx.fillStyle = "rgba(14, 16, 28, 0.86)";
      ctx.fillRect(32, 86, WIDTH - 64, 52);
      ctx.strokeStyle = "#48dbfb";
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 86, WIDTH - 64, 52);
      ctx.fillStyle = "#ffffff";
      ctx.font = '700 13px "Courier New", monospace';
      ctx.fillText(step.text, 48, 117);

      // Showcase Cat on left
      const pose = Math.floor(this.time * 6) % 2 === 0 ? "run1" : "run2";
      const catSpr = RC.Sprites.getCatSprite(pose, this.skinId, 3);
      ctx.drawImage(catSpr, 90, GROUND_Y - 42);

      // Showcase Step Sprites animated in the center-right
      const count = step.sprites.length;
      const spacing = Math.min(165, Math.floor(560 / Math.max(1, count)));
      step.sprites.forEach((sprKey, idx) => {
        const spr = RC.Sprites.getWorldSprite(sprKey, 4);
        if (!spr) return;
        const sx = 290 + idx * spacing;
        const bob = Math.floor(Math.sin(this.time * 4 + idx) * 8);
        const sy = GROUND_Y - spr.height - 26 + bob;
        ctx.drawImage(spr, sx, sy);
      });
    }
  }

  RC.RunnerGame = RunnerGame;
})(window.RunnerCat = window.RunnerCat || {});
