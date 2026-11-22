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

    setPreviewConfig(levelId, skinId) {
      this.level = RC.Levels.getLevelById(levelId);
      this.skinId = skinId;
    }

    resetRunState() {
      const lvl = this.level;
      const lvlMode = lvl.mode || "runner";
      this.speed = lvl.baseSpeed;
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
        lvlMode === "swim" || lvlMode === "plane" ? Math.floor(GROUND_Y * 0.45) : GROUND_Y - 42;
      const startW = lvlMode === "swim" ? 54 : lvlMode === "plane" ? 54 : 48;
      const startH = lvlMode === "swim" ? 36 : lvlMode === "plane" ? 27 : 42;

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
        invulnTimer: 0,
        shield: false,
        magnetTimer: 0,
        milkTimer: 0,
        afterimages: []
      };

      this.obstacles = [];
      this.collectibles = [];
      this.projectiles = []; // plane bullets
      this.bossEggs = [];    // giant chicken eggs
      this.particles = [];
      this.floatingTexts = [];

      this.spawnTimer = 1.05;
      this.collectibleTimer = 1.4;
      this.powerupTimer = 7.0;
      this.finishGateSpawned = false;
      this.finishGateX = null;

      // Boss state (Level 5: Giant Chicken)
      if (lvlMode === "boss") {
        const maxHp = lvl.bossMaxHp || 10;
        this.boss = {
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
      } else {
        this.boss = null;
      }
    }

    startLevel(levelId, skinId) {
      this.level = RC.Levels.getLevelById(levelId);
      this.skinId = skinId || this.skinId;
      this.resetRunState();
      this.mode = "playing";
      this.keys.jumpHeld = false;
      this.keys.upHeld = false;
      this.keys.duckHeld = false;
      this.keys.slowHeld = false;
      this.keys.fireHeld = false;
      this.notifyHud();
    }

    pause() {
      if (this.mode !== "playing") return;
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
      this.mode = "menu";
      this.resetRunState();
    }

    // ---- Input Handlers ----
    pressJump() {
      if (this.mode !== "playing") return;
      const lvlMode = this.level.mode || "runner";
      this.keys.jumpHeld = true;

      if (lvlMode === "swim") {
        this.keys.upHeld = true;
        this.cat.vy = Math.min(this.cat.vy, -240);
        RC.Audio.swim();
        this.spawnDust(this.cat.x + 12, this.cat.y + 24, 4, "#81ecec");
        return;
      }

      if (lvlMode === "plane") {
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
      if (lvlMode === "swim") {
        this.keys.upHeld = false;
        return;
      }
      if (lvlMode === "plane") return;

      if (this.mode === "playing" && this.cat.vy < -260) {
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

      if (lvlMode === "plane") {
        this.firePlaneBullet();
        return;
      }

      const cat = this.cat;
      if (cat.clawCooldown > 0) return;

      cat.clawTimer = CLAW_DURATION;
      cat.clawCooldown = CLAW_COOLDOWN;
      if (lvlMode === "swim") {
        RC.Audio.swim();
      } else {
        RC.Audio.claw();
      }

      const sparkColor = lvlMode === "swim" ? "#48dbfb" : "#ff6b81";
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
      RC.Audio.shoot();

      this.projectiles.push({
        x: cat.x + cat.w + 4,
        y: cat.y + Math.floor(cat.h * 0.52),
        w: 16,
        h: 6,
        vx: 760
      });

      this.spawnParticle(cat.x + cat.w + 4, cat.y + cat.h * 0.52, 160, 0, "#ffd32a", 4, 0.08);
    }

    tryExecuteJump() {
      const cat = this.cat;
      const canGroundJump = cat.onGround || cat.coyoteTimer > 0;

      if (canGroundJump) {
        cat.vy = JUMP_VEL;
        cat.onGround = false;
        cat.coyoteTimer = 0;
        cat.jumpBufferTimer = 0;
        cat.jumpsUsed = 1;
        cat.ducking = false;
        RC.Audio.jump();
        this.spawnDust(cat.x + 18, GROUND_Y - 2, 7, "#d9ccb4");
        return true;
      }

      if (cat.jumpsUsed < cat.maxJumps) {
        cat.vy = DOUBLE_JUMP_VEL;
        cat.jumpsUsed += 1;
        cat.jumpBufferTimer = 0;
        cat.ducking = false;
        RC.Audio.doubleJump();
        this.spawnDust(cat.x + 22, cat.y + cat.h, 10, "#48dbfb");
        this.addFloatingText("DOUBLE!", cat.x + 12, cat.y - 6, "#48dbfb", 11);
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
      if (lvlMode === "swim" || lvlMode === "plane") {
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
        this.slowEnergy = Math.min(100, this.slowEnergy + SLOW_REGEN_PER_SEC * rawDt);
        if (this.slowLockout && this.slowEnergy >= SLOW_MIN_TO_START) {
          this.slowLockout = false;
        }
      }

      const targetScale = this.slowActive ? SLOW_TIME_SCALE : 1.0;
      this.timeScale += (targetScale - this.timeScale) * Math.min(1, rawDt * 14);
      const worldDt = rawDt * this.timeScale;

      this.speed = Math.min(this.level.maxSpeed, this.speed + this.level.accelPerSec * worldDt);
      const effectiveSpeed = this.speed;
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

      if (this.level.mode === "swim") {
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

      // ---- Plane Auto-fire if held ----
      if (this.level.mode === "plane" && (this.keys.fireHeld || this.keys.jumpHeld)) {
        this.firePlaneBullet();
      }

      // ---- Check Level Goal & Finish Gate ----
      if (this.level.targetDistance && !this.finishGateSpawned) {
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
        this.spawnTimer -= worldDt;
        if (this.spawnTimer <= 0) {
          this.spawnObstacle();
          const speedRatio = Math.max(0, (this.speed - 320) / 480);
          const lvlMode = this.level.mode || "runner";
          let minInterval = Math.max(0.6, 1.02 - speedRatio * 0.35);
          let maxInterval = Math.max(1.0, 1.7 - speedRatio * 0.55);
          if (lvlMode === "boss") {
            minInterval = 1.45;
            maxInterval = 2.35;
          } else if (lvlMode === "plane") {
            minInterval = 0.65;
            maxInterval = 1.2;
          }
          this.spawnTimer = minInterval + Math.random() * (maxInterval - minInterval);
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
      }

      // ---- Update Projectiles (Plane mode) ----
      this.updateProjectiles(rawDt);

      // ---- Update Boss (Level 5) ----
      if (this.boss && this.boss.active) {
        this.updateBoss(rawDt, worldDt);
        if (this.mode !== "playing") return;
      }

      // ---- Update Obstacles & Collisions ----
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
      if (cat.invulnTimer > 0) cat.invulnTimer = Math.max(0, cat.invulnTimer - rawDt);
      if (cat.magnetTimer > 0) cat.magnetTimer = Math.max(0, cat.magnetTimer - rawDt);
      if (cat.milkTimer > 0) cat.milkTimer = Math.max(0, cat.milkTimer - rawDt);

      if (lvlMode === "swim") {
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
      } else if (lvlMode === "plane") {
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
        if (!cat.onGround) {
          const g = this.keys.duckHeld ? FAST_FALL_GRAVITY : GRAVITY;
          cat.vy += g * physDt;
          cat.y += cat.vy * physDt;

          const targetH = this.keys.duckHeld ? 27 : 42;
          if (cat.y + targetH >= GROUND_Y) {
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
      if (lvlMode === "swim") {
        return Math.floor(cat.runAnimTimer) % 2 === 0 ? "swim1" : "swim2";
      }
      if (lvlMode === "plane") {
        return Math.floor(this.time * 16) % 2 === 0 ? "plane1" : "plane2";
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
      }
    }

    spawnFishPattern() {
      const pattern = Math.random();
      const startX = WIDTH + 50;
      const lvlMode = this.level.mode || "runner";

      if (lvlMode === "swim" || lvlMode === "plane") {
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
      const kinds = ["shield", "magnet", "milk"];
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
          if (this.cat.shield) {
            this.cat.shield = false;
            this.cat.invulnTimer = 1.15;
            RC.Audio.shieldBreak();
            this.triggerShake(8, 0.22);
            this.spawnBurst(this.cat.x + 24, this.cat.y + 20, "#48dbfb", 14);
            this.bossEggs.splice(i, 1);
            continue;
          }
          this.triggerGameOver();
          return;
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

    // ---- Projectiles (Plane Mode) ----
    updateProjectiles(rawDt) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const b = this.projectiles[i];
        b.x += b.vx * rawDt;

        if (b.x > WIDTH + 30) {
          this.projectiles.splice(i, 1);
          continue;
        }

        let hit = false;
        for (let j = this.obstacles.length - 1; j >= 0; j--) {
          const obs = this.obstacles[j];
          if (this.rectsOverlap(b, obs)) {
            hit = true;
            if (obs.shootable) {
              this.destroyObstacleByClaw(obs);
              this.obstacles.splice(j, 1);
            } else {
              // Indestructible skyBlock spark
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
    }

    updateObstacles(worldDt, movePx) {
      const catBox = this.getCatHitbox();
      const clawActive = this.cat.clawTimer > 0;
      const clawBox = clawActive ? this.getClawHitbox() : null;

      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.x -= movePx + (obs.extraSpeed || 0) * worldDt;
        if (obs.vy) {
          obs.y += obs.vy * worldDt;
        }

        if (obs.animFrames) {
          obs.animTimer += worldDt * 8;
          obs.sprite = obs.animFrames[Math.floor(obs.animTimer) % obs.animFrames.length];
        }
        if (obs.baseY != null) {
          obs.y = obs.baseY + Math.sin(this.time * 5 + obs.bobPhase) * 6;
        }

        if (obs.x + obs.w < -60 || obs.y > GROUND_Y + 40) {
          this.obstacles.splice(i, 1);
          continue;
        }

        const obsBox = {
          x: obs.x + 4,
          y: obs.y + 4,
          w: obs.w - 8,
          h: obs.h - 6
        };

        // 1. Check Claw / Special Attack
        if (clawActive && obs.scratchable && this.rectsOverlap(clawBox, obsBox)) {
          this.destroyObstacleByClaw(obs);
          this.obstacles.splice(i, 1);
          continue;
        }

        // 2. Check Cat Collision
        if (this.rectsOverlap(catBox, obsBox)) {
          if (this.cat.milkTimer > 0) {
            this.destroyObstacleByClaw({ ...obs, points: obs.points || 35 });
            this.obstacles.splice(i, 1);
            continue;
          }

          if (this.cat.invulnTimer > 0) continue;

          if (this.cat.shield) {
            this.cat.shield = false;
            this.cat.invulnTimer = 1.15;
            RC.Audio.shieldBreak();
            this.triggerShake(8, 0.22);
            this.addFloatingText("¡ESCUDO ROTO!", this.cat.x, this.cat.y - 16, "#48dbfb", 13);
            this.spawnBurst(this.cat.x + 24, this.cat.y + 20, "#48dbfb", 16);
            this.obstacles.splice(i, 1);
            continue;
          }

          this.triggerGameOver();
          return;
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
      const cx = item.x + item.w / 2;
      const cy = item.y + item.h / 2;

      if (item.isPowerup) {
        RC.Audio.powerup();
        if (item.kind === "shield") {
          this.cat.shield = true;
          this.addFloatingText("🧶 ESCUDO DORADO!", cx - 28, cy - 10, "#ffd32a", 13);
          this.spawnBurst(cx, cy, "#ffd32a", 14);
        } else if (item.kind === "magnet") {
          this.cat.magnetTimer = 8.5;
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

      this.fishCount += 1;
      this.itemScore += item.points;
      this.slowEnergy = Math.min(100, this.slowEnergy + item.slowBoost);

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
      const dist = Math.floor(this.distanceMeters);
      const total = dist + this.itemScore + this.killScore;
      const recordInfo = RC.Storage.recordRun(this.level.id, total, dist, victory);
      return {
        victory,
        level: this.level,
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
        score: this.getTotalScore(),
        distance: Math.floor(this.distanceMeters),
        fish: this.fishCount,
        kills: this.killCount,
        slowPct: Math.round(this.slowEnergy),
        slowActive: this.slowActive,
        clawPct: Math.round(Math.max(0, 1 - cat.clawCooldown / CLAW_COOLDOWN) * 100),
        shield: cat.shield,
        magnetSec: Math.ceil(cat.magnetTimer),
        milkSec: Math.ceil(cat.milkTimer),
        bossHp: this.boss ? this.boss.hp : null,
        bossMaxHp: this.boss ? this.boss.maxHp : null,
        levelHi: RC.Storage.getLevelRecord(this.level.id).hiScore
      });
    }

    // ---- Rendering ----
    render() {
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

      if (lvlMode === "swim") {
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

      // Projectiles (Plane bullets)
      this.projectiles.forEach((b) => {
        ctx.fillStyle = "#ffd32a";
        ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.w, b.h);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.floor(b.x + 6), Math.floor(b.y + 1), b.w - 8, b.h - 2);
      });

      // Boss (Giant Chicken) & Eggs
      if (this.boss && this.boss.active) {
        this.renderBoss();
      }
      this.bossEggs.forEach((egg) => {
        const spr = RC.Sprites.getWorldSprite("egg", 3);
        if (spr) ctx.drawImage(spr, Math.floor(egg.x), Math.floor(egg.y));
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

        if (obs.type === "seaWall") {
          const spr = RC.Sprites.getWorldSprite("seaWall", 3);
          if (spr) ctx.drawImage(spr, ox, oy, obs.w, obs.h);
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

      ctx.restore();
    }

    renderBoss() {
      const ctx = this.ctx;
      const boss = this.boss;
      const sprName =
        boss.hurtTimer > 0
          ? "chickenHurt"
          : Math.floor(boss.animTimer) % 2 === 0
          ? "chicken1"
          : "chicken2";
      const spr = RC.Sprites.getWorldSprite(sprName, 6);
      const bx = Math.floor(boss.x);
      const by = Math.floor(boss.y);

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
      const spr = RC.Sprites.getCatSprite(pose, this.skinId, 3);

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
  }

  RC.RunnerGame = RunnerGame;
})(window.RunnerCat = window.RunnerCat || {});
