/* ============================================================
   RunnerCat — UI Controller, Menus & Input Wiring
   ============================================================ */
(function (RC) {
  function padScore(num) {
    return String(Math.max(0, Math.floor(num))).padStart(5, "0");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game-canvas");

    // Top bar elements
    const elGlobalHi = document.getElementById("global-hi-score");
    const btnSound = document.getElementById("btn-sound");
    const btnPause = document.getElementById("btn-pause");
    const btnMenuTop = document.getElementById("btn-menu-top");

    // Screens & HUD
    const hud = document.getElementById("hud");
    const screenTitle = document.getElementById("screen-title");
    const screenMode = document.getElementById("screen-mode");
    const screenMenu = document.getElementById("screen-menu");
    const screenCats = document.getElementById("screen-cats");
    const screenControls = document.getElementById("screen-controls");
    const screenHelp = document.getElementById("screen-help");
    const screenPause = document.getElementById("screen-pause");
    const screenResult = document.getElementById("screen-result");

    // Title & Mode elements
    const btnEnter = document.getElementById("btn-enter");
    const btnOpenCats = document.getElementById("btn-open-cats");
    const btnOpenControls = document.getElementById("btn-open-controls");
    const btnBackTitle = document.getElementById("btn-back-title");
    const btnModeStory = document.getElementById("btn-mode-story");
    const btnModeArcade = document.getElementById("btn-mode-arcade");
    const btnModeCats = document.getElementById("btn-mode-cats");
    const btnModeControls = document.getElementById("btn-mode-controls");
    const lblCurCat = document.getElementById("lbl-cur-cat");
    const lblCurCtrl = document.getElementById("lbl-cur-ctrl");

    // Level & Cat & Controls modal elements
    const levelsEyebrow = document.getElementById("levels-eyebrow");
    const levelsTitle = document.getElementById("levels-title");
    const levelGrid = document.getElementById("level-grid");
    const catGrid = document.getElementById("cat-grid");
    const catSelectedDesc = document.getElementById("cat-selected-desc");
    const levelSummaryBox = document.getElementById("selected-level-summary");
    const btnPlay = document.getElementById("btn-play");
    const btnDevUnlock = document.getElementById("btn-dev-unlock");
    const btnDevIntro = document.getElementById("btn-dev-intro");
    const btnDevEnding = document.getElementById("btn-dev-ending");
    const btnInsanityMode = document.getElementById("btn-insanity-mode");
    const btnInsanityLevels = document.getElementById("btn-insanity-levels");
    const btnBackMode = document.getElementById("btn-back-mode");
    const btnCloseCats = document.getElementById("btn-close-cats");
    const btnCloseControls = document.getElementById("btn-close-controls");
    const btnCtrlButtons = document.getElementById("btn-ctrl-buttons");
    const btnCtrlGestures = document.getElementById("btn-ctrl-gestures");
    const btnStartDemo = document.getElementById("btn-start-demo");
    const btnSaveControls = document.getElementById("btn-save-controls");
    const demoBanner = document.getElementById("demo-banner");
    const btnExitDemo = document.getElementById("btn-exit-demo");
    const endingBanner = document.getElementById("ending-banner");
    const btnExitEnding = document.getElementById("btn-exit-ending");
    const introBanner = document.getElementById("intro-banner");
    const btnExitIntro = document.getElementById("btn-exit-intro");
    const btnHelp = document.getElementById("btn-help");
    const btnCloseHelp = document.getElementById("btn-close-help");

    // Pause elements
    const btnResume = document.getElementById("btn-resume");
    const btnRestartPause = document.getElementById("btn-restart-pause");
    const btnQuitPause = document.getElementById("btn-quit-pause");

    // Result elements
    const resBadge = document.getElementById("result-badge");
    const resTitle = document.getElementById("result-title");
    const resSubtitle = document.getElementById("result-subtitle");
    const newRecordBanner = document.getElementById("new-record-banner");
    const resDist = document.getElementById("res-dist");
    const resDistPts = document.getElementById("res-dist-pts");
    const resFish = document.getElementById("res-fish");
    const resFishPts = document.getElementById("res-fish-pts");
    const resKills = document.getElementById("res-kills");
    const resKillsPts = document.getElementById("res-kills-pts");
    const resTotal = document.getElementById("res-total");
    const resHi = document.getElementById("res-hi");
    const btnNextLevel = document.getElementById("btn-next-level");
    const btnRetry = document.getElementById("btn-retry");
    const btnResultMenu = document.getElementById("btn-result-menu");

    // HUD elements
    const hudLevelName = document.getElementById("hud-level-name");
    const hudLives = document.getElementById("hud-lives");
    const hudScore = document.getElementById("hud-score");
    const hudDist = document.getElementById("hud-dist");
    const hudFish = document.getElementById("hud-fish");
    const hudKills = document.getElementById("hud-kills");
    const hudLevelHi = document.getElementById("hud-level-hi");
    const meterSlow = document.getElementById("meter-slow");
    const meterClaw = document.getElementById("meter-claw");
    const activePowerups = document.getElementById("active-powerups");
    const levelProgressWrap = document.getElementById("level-progress-wrap");
    const hudGoalLabel = document.getElementById("hud-goal-label");
    const hudGoalText = document.getElementById("hud-goal-text");
    const hudGoalBar = document.getElementById("hud-goal-bar");

    // Touch & Gesture controls
    const touchControlsBar = document.getElementById("touch-controls");
    const touchSlow = document.getElementById("touch-slow");
    const touchDuck = document.getElementById("touch-duck");
    const touchClaw = document.getElementById("touch-claw");
    const touchJump = document.getElementById("touch-jump");
    const gestureControls = document.getElementById("gesture-controls");
    const gestureLeftZone = document.getElementById("gesture-left-zone");
    const gestureSlowBtn = document.getElementById("gesture-slow-btn");
    const gestureDuckBtn = document.getElementById("gesture-duck-btn");
    const gestureFireBtn = document.getElementById("gesture-fire-btn");

    let activeCategory = "story"; // "story" | "endless"
    let returnScreen = "title"; // "title" | "mode"
    let pendingEndingSummary = null;
    let introSeenThisSession = false;
    let introWillStartGame = false;
    let selectedLevelId = RC.Storage.getState().selectedLevel;
    if (
      !RC.Levels.LIST.some((l) => l.id === selectedLevelId) ||
      !RC.Levels.isLevelUnlocked(selectedLevelId)
    ) {
      selectedLevelId = RC.Levels.STORY_LIST[0].id;
      RC.Storage.setSelectedLevel(selectedLevelId);
    }
    let selectedCatId = RC.Storage.getState().selectedCat;

    function tryLockLandscape() {
      try {
        if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
          window.screen.orientation.lock("landscape").catch(() => {});
        }
      } catch (_err) {
        // Ignore on browsers that disallow orientation lock outside fullscreen
      }
    }

    // Instantiate Game Engine
    const game = new RC.RunnerGame(canvas, {
      onHudUpdate: updateHud,
      onRunEnd: showResultScreen,
      onEndingStart: (summary) => {
        pendingEndingSummary = summary;
        hud.classList.add("hidden");
        btnPause.classList.add("hidden");
        btnMenuTop.classList.add("hidden");
        applyControlModeUI(false);
        hideAllOverlays();
        endingBanner.classList.remove("hidden");
        game.startEnding(selectedCatId, true);
      },
      onIntroEnd: finishIntro,
      onPauseChange: (paused) => {
        screenPause.classList.toggle("hidden", !paused);
      }
    });

    // ---- Sound button state ----
    function refreshSoundBtn() {
      const on = RC.Audio.isEnabled();
      btnSound.textContent = on ? "🔊 SFX" : "🔇 MUTE";
      btnSound.classList.toggle("muted", !on);
    }

    function refreshGlobalHi() {
      elGlobalHi.textContent = padScore(RC.Storage.getState().globalHi);
    }

    function refreshDevUnlockBtn() {
      const active = RC.Storage.isDevUnlockAll();
      btnDevUnlock.textContent = active ? "🔓 DEV: TODO ACTIVO" : "🔒 DEV: ACTIVAR TODOS";
      btnDevUnlock.classList.toggle("btn-dev-active", active);
      btnDevIntro.classList.toggle("hidden", !active);
      btnDevEnding.classList.toggle("hidden", !active);
      refreshInsanityBtns();
    }

    function refreshInsanityBtns() {
      const unlocked = RC.Levels.isInsanityUnlocked();
      const on = RC.Storage.isInsanityMode() && unlocked;
      const text = on ? "🔥 LOCURA: ON" : "🔥 LOCURA: OFF";
      [btnInsanityMode, btnInsanityLevels].forEach((btn) => {
        if (!btn) return;
        btn.classList.toggle("hidden", !unlocked);
        btn.textContent = text;
        btn.classList.toggle("btn-insanity-active", on);
      });
    }

    function drawZoneCover(canvasEl, zoneId) {
      const ctx = canvasEl.getContext("2d");
      const w = canvasEl.width;
      const h = canvasEl.height;
      ctx.imageSmoothingEnabled = false;

      if (zoneId === "city") {
        ctx.fillStyle = "#2c2447";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#eb7d5b";
        ctx.fillRect(0, h - 14, w, 14);
        ctx.fillStyle = "#191529";
        [8, 28, 52, 78, 98].forEach((bx, idx) => {
          const bh = 18 + (idx % 3) * 7;
          ctx.fillRect(bx, h - bh, 16, bh);
        });
        const spr = RC.Sprites.getWorldSprite("chicken1", 2);
        if (spr) ctx.drawImage(spr, w - 34, 6, 26, 26);
      } else if (zoneId === "ocean") {
        ctx.fillStyle = "#083059";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#00a8ff";
        ctx.fillRect(0, 0, w, 8);
        ctx.fillStyle = "#e1b12c";
        ctx.fillRect(0, h - 8, w, 8);
        const spr = RC.Sprites.getWorldSprite("squid1", 2);
        if (spr) ctx.drawImage(spr, w - 36, 8, 28, 24);
      } else if (zoneId === "sky") {
        ctx.fillStyle = "#3c8ce7";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(10, 8, 28, 8);
        ctx.fillRect(54, 16, 24, 7);
        const spr = RC.Sprites.getWorldSprite("bossPlane1", 2);
        if (spr) ctx.drawImage(spr, w - 42, 10, 34, 20);
      } else if (zoneId === "spooky") {
        ctx.fillStyle = "#19112b";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#ffeaa7";
        ctx.fillRect(12, 6, 12, 12);
        ctx.fillStyle = "#2f2a38";
        ctx.fillRect(0, h - 10, w, 10);
        const spr = RC.Sprites.getWorldSprite("giantSkeleton1", 2);
        if (spr) ctx.drawImage(spr, w - 34, 6, 28, 28);
      } else if (zoneId === "space") {
        ctx.fillStyle = "#06081a";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#ffffff";
        [10, 26, 44, 66, 82].forEach((sx, idx) => ctx.fillRect(sx, 6 + (idx * 7) % 24, 2, 2));
        ctx.fillStyle = "#57606f";
        ctx.fillRect(0, h - 8, w, 8);
        const spr = RC.Sprites.getWorldSprite("mothership1", 2);
        if (spr) ctx.drawImage(spr, w - 42, 8, 36, 20);
      }
    }

    function getLevelThumbSprite(lvl) {
      if (lvl.thumbSprite) return RC.Sprites.getWorldSprite(lvl.thumbSprite, 2);
      const map = {
        alley: "hydrant",
        park: "bird1",
        rooftops: "drone1",
        boss: "chicken1",
        ocean: "fish",
        ocean2: "proxMine",
        ocean3: "seaweed",
        squidBoss: "squid1",
        skyplane: "skyBlock",
        skyplane2: "drone1",
        skyplane3: "bird1",
        planeBoss: "bossPlane1",
        endless: "hydrant",
        endless_rooftops: "drone1",
        endless_swim: "proxMine",
        endless_plane: "bossPlane1"
      };
      const key = map[lvl.id] || "fish";
      return RC.Sprites.getWorldSprite(key, 2);
    }

    function renderLevelCards(list, containerEl) {
      containerEl.innerHTML = "";
      list.forEach((lvl) => {
        const rec = RC.Storage.getLevelRecord(lvl.id);
        const unlocked = RC.Levels.isLevelUnlocked(lvl.id);
        const card = document.createElement("button");
        card.type = "button";
        card.className = `level-card${lvl.id === selectedLevelId ? " selected" : ""}${
          !unlocked ? " locked" : ""
        }`;
        card.dataset.levelId = lvl.id;
        card.disabled = !unlocked;

        const goalStr = lvl.targetDistance
          ? `Meta: ${lvl.targetDistance}m`
          : lvl.mode === "boss" ||
            lvl.mode === "swimBoss" ||
            lvl.mode === "planeBoss" ||
            lvl.mode === "batBoss" ||
            lvl.mode === "spaceBoss"
          ? `Jefe: ${lvl.bossMaxHp} HP`
          : "Sin meta (∞)";
        const statusTag = !unlocked
          ? `<span class="level-badge-lock">🔒</span>`
          : rec.cleared
          ? `<span class="level-badge-clear">✓ CLEAR</span>`
          : "";
        const footerText = unlocked
          ? `HI: ${padScore(rec.hiScore)} · ${rec.bestDist}m`
          : `Supera el Nivel ${lvl.number - 1}`;

        card.innerHTML = `
          <div class="level-preview-bar" style="background: ${lvl.previewGradient}"></div>
          <div class="level-card-top">
            <span class="level-num">${lvl.category === "endless" ? "MODO ∞" : `NIVEL ${lvl.number}`}</span>
            ${statusTag}
          </div>
          <div class="level-card-body">
            <div class="level-card-info">
              <div class="level-name">${lvl.name}</div>
              <div class="level-meta">${lvl.difficulty} · ${goalStr}</div>
            </div>
          </div>
          <div class="level-hi">${footerText}</div>
        `;

        const thumbSpr = getLevelThumbSprite(lvl);
        if (thumbSpr) {
          const thumb = document.createElement("canvas");
          thumb.className = "level-thumb";
          thumb.width = 24;
          thumb.height = 24;
          const tctx = thumb.getContext("2d");
          tctx.imageSmoothingEnabled = false;
          const scale = Math.min(24 / thumbSpr.width, 24 / thumbSpr.height);
          const dw = Math.floor(thumbSpr.width * scale);
          const dh = Math.floor(thumbSpr.height * scale);
          tctx.drawImage(thumbSpr, Math.floor((24 - dw) / 2), Math.floor((24 - dh) / 2), dw, dh);
          card.querySelector(".level-card-body").appendChild(thumb);
        }

        card.addEventListener("click", () => {
          if (!unlocked) return;
          RC.Audio.uiClick();
          selectedLevelId = lvl.id;
          RC.Storage.setSelectedLevel(lvl.id);
          game.setPreviewConfig(selectedLevelId, selectedCatId);
          renderMenu();
        });

        containerEl.appendChild(card);
      });
    }

    function applyControlModeUI(playing) {
      const mode = RC.Storage.getControlMode();
      const useGestures = playing && mode === "gestures";
      gestureControls.classList.toggle("hidden", !useGestures);
      touchControlsBar.classList.toggle("hidden", mode === "gestures" && playing);
    }

    function refreshModeBadges() {
      const skin = RC.Levels.getCatSkinById(selectedCatId);
      const ctrl = RC.Storage.getControlMode();
      lblCurCat.textContent = skin.name;
      lblCurCtrl.textContent = ctrl === "gestures" ? "Gestos" : "Botones";
      btnCtrlButtons.classList.toggle("selected", ctrl === "buttons");
      btnCtrlGestures.classList.toggle("selected", ctrl === "gestures");
    }

    function renderCatsModal() {
      catGrid.innerHTML = "";
      RC.Levels.CAT_SKINS.forEach((skin) => {
        const unlocked = RC.Levels.isCatUnlocked(skin.id);
        const card = document.createElement("button");
        card.type = "button";
        card.className = `cat-card${skin.id === selectedCatId ? " selected" : ""}${
          !unlocked ? " locked" : ""
        }`;
        card.disabled = !unlocked;

        const swatch = document.createElement("canvas");
        swatch.className = "cat-swatch";
        swatch.width = 32;
        swatch.height = 28;
        const sctx = swatch.getContext("2d");
        sctx.imageSmoothingEnabled = false;
        const catSpr = RC.Sprites.getCatSprite(
          "run1",
          skin.id,
          2,
          skin.id === "winicat" ? "#48dbfb" : null
        );
        sctx.drawImage(catSpr, 0, 0);

        const label = document.createElement("span");
        label.className = "cat-name";
        label.textContent = unlocked ? skin.name : `🔒 ${skin.name}`;

        card.appendChild(swatch);
        card.appendChild(label);

        card.addEventListener("click", () => {
          if (!unlocked) return;
          RC.Audio.uiClick();
          selectedCatId = skin.id;
          RC.Storage.setSelectedCat(skin.id);
          game.setPreviewConfig(selectedLevelId, selectedCatId);
          renderCatsModal();
          refreshModeBadges();
        });

        catGrid.appendChild(card);
      });

      const curSkin = RC.Levels.getCatSkinById(selectedCatId);
      const lockedNote = curSkin.unlockBossName ? ` (Desbloqueado tras ${curSkin.unlockBossName})` : "";
      catSelectedDesc.innerHTML = `<strong>${curSkin.name}</strong> — ${curSkin.desc}${lockedNote}`;
    }

    // ---- Build Level Selection Cards ----
    function renderMenu() {
      refreshGlobalHi();
      refreshDevUnlockBtn();
      refreshModeBadges();

      const isStory = activeCategory === "story";
      const list = isStory ? RC.Levels.STORY_LIST : RC.Levels.ENDLESS_LIST;
      levelsEyebrow.textContent = isStory ? "MODO HISTORIA" : "MODO ARCADE INFINITO";
      levelsTitle.textContent = isStory ? "5 ZONAS · 25 NIVELES" : "ELIGE TU ESCENARIO INFINITO";
      btnDevUnlock.classList.toggle("hidden", !isStory);
      btnDevIntro.classList.toggle("hidden", !isStory || !RC.Storage.isDevUnlockAll());
      btnDevEnding.classList.toggle("hidden", !isStory || !RC.Storage.isDevUnlockAll());

      if (!list.some((l) => l.id === selectedLevelId)) {
        selectedLevelId = list[0].id;
        RC.Storage.setSelectedLevel(selectedLevelId);
        game.setPreviewConfig(selectedLevelId, selectedCatId);
      }

      levelGrid.innerHTML = "";
      if (isStory) {
        levelGrid.className = "zones-container";
        RC.Levels.STORY_ZONES.forEach((zone) => {
          const zoneGroup = document.createElement("div");
          zoneGroup.className = "zone-group";

          const banner = document.createElement("div");
          banner.className = "zone-banner";
          banner.style.background = zone.gradient;

          const cover = document.createElement("canvas");
          cover.className = "zone-cover";
          cover.width = 112;
          cover.height = 42;
          drawZoneCover(cover, zone.id);

          const textWrap = document.createElement("div");
          textWrap.className = "zone-banner-text";
          textWrap.innerHTML = `<h3>${zone.title}</h3><p>${zone.subtitle}</p>`;

          banner.appendChild(cover);
          banner.appendChild(textWrap);
          zoneGroup.appendChild(banner);

          const zGrid = document.createElement("div");
          zGrid.className = "level-grid zone-level-grid";
          const zoneLevels = list.filter((l) => l.zoneId === zone.id);
          renderLevelCards(zoneLevels, zGrid);
          zoneGroup.appendChild(zGrid);

          levelGrid.appendChild(zoneGroup);
        });
      } else {
        levelGrid.className = "level-grid endless-grid";
        renderLevelCards(list, levelGrid);
      }

      // Selected level summary
      const curLvl = RC.Levels.getLevelById(selectedLevelId);
      const curSkin = RC.Levels.getCatSkinById(selectedCatId);
      levelSummaryBox.innerHTML = `
        <strong>${curLvl.name}</strong> con <strong>${curSkin.name}</strong><br/>
        ${curLvl.description}
      `;
    }

    function hideAllOverlays() {
      screenTitle.classList.add("hidden");
      screenMode.classList.add("hidden");
      screenMenu.classList.add("hidden");
      screenCats.classList.add("hidden");
      screenControls.classList.add("hidden");
      screenHelp.classList.add("hidden");
      screenPause.classList.add("hidden");
      screenResult.classList.add("hidden");
    }

    // ---- Screen Navigation ----
    function showTitleScreen() {
      game.returnToMenu();
      game.setPreviewConfig(selectedLevelId, selectedCatId);
      hud.classList.add("hidden");
      demoBanner.classList.add("hidden");
      btnPause.classList.add("hidden");
      btnMenuTop.classList.add("hidden");
      applyControlModeUI(false);
      hideAllOverlays();
      screenTitle.classList.remove("hidden");
      refreshGlobalHi();
      refreshModeBadges();
    }

    function showModeScreen() {
      game.returnToMenu();
      hud.classList.add("hidden");
      demoBanner.classList.add("hidden");
      btnPause.classList.add("hidden");
      btnMenuTop.classList.add("hidden");
      applyControlModeUI(false);
      hideAllOverlays();
      screenMode.classList.remove("hidden");
      refreshModeBadges();
    }

    function showMenu(category) {
      if (category) activeCategory = category;
      game.returnToMenu();
      game.setPreviewConfig(selectedLevelId, selectedCatId);
      hud.classList.add("hidden");
      demoBanner.classList.add("hidden");
      btnPause.classList.add("hidden");
      btnMenuTop.classList.add("hidden");
      applyControlModeUI(false);
      hideAllOverlays();
      screenMenu.classList.remove("hidden");
      renderMenu();
    }

    function finishIntro() {
      introBanner.classList.add("hidden");
      if (introWillStartGame) {
        introWillStartGame = false;
        launchLevelDirect();
      } else {
        showMenu("story");
      }
    }

    function launchLevelDirect() {
      hideAllOverlays();
      demoBanner.classList.add("hidden");
      introBanner.classList.add("hidden");
      hud.classList.remove("hidden");
      btnPause.classList.remove("hidden");
      btnMenuTop.classList.remove("hidden");
      applyControlModeUI(true);
      game.startLevel(selectedLevelId, selectedCatId);
    }

    function startCurrentLevel() {
      RC.Audio.uiClick();
      tryLockLandscape();
      if (selectedLevelId === "alley" && !introSeenThisSession) {
        introSeenThisSession = true;
        introWillStartGame = true;
        hud.classList.add("hidden");
        btnPause.classList.add("hidden");
        btnMenuTop.classList.add("hidden");
        applyControlModeUI(false);
        hideAllOverlays();
        introBanner.classList.remove("hidden");
        game.startIntro(selectedCatId);
        return;
      }
      launchLevelDirect();
    }

    function startControlDemo() {
      RC.Audio.uiClick();
      tryLockLandscape();
      hideAllOverlays();
      hud.classList.remove("hidden");
      demoBanner.classList.remove("hidden");
      btnPause.classList.add("hidden");
      btnMenuTop.classList.add("hidden");
      applyControlModeUI(true);
      game.startDemo(selectedCatId);
    }

    function updateHud(data) {
      hudLevelName.textContent = data.level.shortName;
      if (hudLives) {
        const l = Math.max(0, data.lives != null ? data.lives : 3);
        const empty = Math.max(0, 3 - l);
        hudLives.textContent = "♥".repeat(l) + "♡".repeat(empty);
      }
      hudScore.textContent = padScore(data.score);
      hudDist.textContent = data.distance;
      hudFish.textContent = data.fish;
      hudKills.textContent = data.kills;
      hudLevelHi.textContent = padScore(Math.max(data.levelHi, data.score));

      meterSlow.style.width = `${data.slowPct}%`;
      meterClaw.style.width = `${data.clawPct}%`;

      if (data.bossHp != null && data.bossMaxHp) {
        levelProgressWrap.classList.remove("hidden");
        hudGoalLabel.textContent =
          data.level.mode === "swimBoss"
            ? "🦑 CALAMAR"
            : data.level.mode === "planeBoss"
            ? "✈ AVIÓN JEFE"
            : data.level.mode === "batBoss"
            ? "💀 ESQUELETO"
            : data.level.mode === "spaceBoss"
            ? "🛸 NAVE NODRIZA"
            : "🐔 GALLINA";
        const pct = Math.max(0, (data.bossHp / data.bossMaxHp) * 100);
        hudGoalText.textContent = `${data.bossHp} / ${data.bossMaxHp} HP`;
        hudGoalBar.style.width = `${pct}%`;
        hudGoalBar.classList.add("boss-hp");
      } else if (data.level.targetDistance) {
        levelProgressWrap.classList.remove("hidden");
        hudGoalLabel.textContent = "META";
        const pct = Math.min(100, (data.distance / data.level.targetDistance) * 100);
        hudGoalText.textContent = `${data.distance} / ${data.level.targetDistance} m`;
        hudGoalBar.style.width = `${pct}%`;
        hudGoalBar.classList.remove("boss-hp");
      } else {
        levelProgressWrap.classList.add("hidden");
      }

      // Active power-up pills
      let pills = "";
      if (data.lightningCharge != null) pills += `<span class="powerup-pill shield">⚡ RAYO ${data.lightningCharge}/5</span>`;
      if (data.laserLevel > 1) pills += `<span class="powerup-pill shield">⚡ LÁSER N${data.laserLevel}</span>`;
      if (data.missiles > 0) pills += `<span class="powerup-pill milk">🚀 MISIL x${data.missiles}</span>`;
      if (data.shield) pills += `<span class="powerup-pill shield">🧶 ESCUDO</span>`;
      if (data.magnetSec > 0) pills += `<span class="powerup-pill magnet">🧲 ${data.magnetSec}s</span>`;
      if (data.milkSec > 0) pills += `<span class="powerup-pill milk">🥛 ${data.milkSec}s</span>`;
      activePowerups.innerHTML = pills;
    }

    function showResultScreen(summary) {
      refreshGlobalHi();
      btnPause.classList.add("hidden");
      screenPause.classList.add("hidden");
      screenResult.classList.remove("hidden");

      if (summary.victory) {
        resBadge.textContent = "NIVEL COMPLETADO";
        resBadge.classList.add("victory");
        resTitle.textContent = "🎉 ¡META ALCANZADA!";
        resSubtitle.textContent = `Dominaste ${summary.level.name} como todo un felino ágil.`;
      } else {
        resBadge.textContent = "FIN DE LA CARRERA";
        resBadge.classList.remove("victory");
        resTitle.textContent = "😿 ¡GAME OVER!";
        resSubtitle.textContent = summary.level.targetDistance
          ? `Llegaste a ${summary.distance}m de ${summary.level.targetDistance}m en ${summary.level.name}.`
          : `Sobreviviste ${summary.distance}m en el Modo Infinito.`;
      }

      newRecordBanner.classList.toggle("hidden", !(summary.isNewLevelRecord || summary.isNewGlobalRecord));

      resDist.textContent = `${summary.distance} m`;
      resDistPts.textContent = `+${summary.distScore} pts`;
      resFish.textContent = String(summary.fishCount);
      resFishPts.textContent = `+${summary.itemScore} pts`;
      resKills.textContent = String(summary.killCount);
      resKillsPts.textContent = `+${summary.killScore} pts`;
      resTotal.textContent = padScore(summary.totalScore);
      resHi.textContent = `HI: ${padScore(summary.levelHi)}`;

      const nextLvl = RC.Levels.getNextLevel(summary.level.id);
      if (summary.victory && nextLvl) {
        btnNextLevel.classList.remove("hidden");
        btnNextLevel.textContent = `⏭ NIVEL ${nextLvl.number}: ${nextLvl.name.toUpperCase()}`;
      } else {
        btnNextLevel.classList.add("hidden");
      }
    }

    // ---- Button Events ----
    btnSound.addEventListener("click", () => {
      RC.Audio.toggle();
      refreshSoundBtn();
    });

    btnEnter.addEventListener("click", () => {
      RC.Audio.uiClick();
      tryLockLandscape();
      showModeScreen();
    });

    btnBackTitle.addEventListener("click", () => {
      RC.Audio.uiClick();
      showTitleScreen();
    });

    btnModeStory.addEventListener("click", () => {
      RC.Audio.uiClick();
      showMenu("story");
    });

    btnModeArcade.addEventListener("click", () => {
      RC.Audio.uiClick();
      showMenu("endless");
    });

    btnBackMode.addEventListener("click", () => {
      RC.Audio.uiClick();
      showModeScreen();
    });

    btnOpenCats.addEventListener("click", () => {
      RC.Audio.uiClick();
      returnScreen = "title";
      hideAllOverlays();
      renderCatsModal();
      screenCats.classList.remove("hidden");
    });

    btnModeCats.addEventListener("click", () => {
      RC.Audio.uiClick();
      returnScreen = "mode";
      hideAllOverlays();
      renderCatsModal();
      screenCats.classList.remove("hidden");
    });

    btnCloseCats.addEventListener("click", () => {
      RC.Audio.uiClick();
      if (returnScreen === "mode") showModeScreen();
      else showTitleScreen();
    });

    btnOpenControls.addEventListener("click", () => {
      RC.Audio.uiClick();
      returnScreen = "title";
      hideAllOverlays();
      refreshModeBadges();
      screenControls.classList.remove("hidden");
    });

    btnModeControls.addEventListener("click", () => {
      RC.Audio.uiClick();
      returnScreen = "mode";
      hideAllOverlays();
      refreshModeBadges();
      screenControls.classList.remove("hidden");
    });

    btnCtrlButtons.addEventListener("click", () => {
      RC.Audio.uiClick();
      RC.Storage.setControlMode("buttons");
      refreshModeBadges();
    });

    btnCtrlGestures.addEventListener("click", () => {
      RC.Audio.uiClick();
      RC.Storage.setControlMode("gestures");
      refreshModeBadges();
    });

    btnStartDemo.addEventListener("click", startControlDemo);

    btnExitDemo.addEventListener("click", () => {
      RC.Audio.uiClick();
      game.returnToMenu();
      hud.classList.add("hidden");
      demoBanner.classList.add("hidden");
      applyControlModeUI(false);
      hideAllOverlays();
      refreshModeBadges();
      screenControls.classList.remove("hidden");
    });

    const closeControlsAction = () => {
      RC.Audio.uiClick();
      if (returnScreen === "mode") showModeScreen();
      else showTitleScreen();
    };
    btnCloseControls.addEventListener("click", closeControlsAction);
    btnSaveControls.addEventListener("click", closeControlsAction);

    btnDevIntro.addEventListener("click", () => {
      RC.Audio.uiClick();
      introWillStartGame = false;
      hud.classList.add("hidden");
      btnPause.classList.add("hidden");
      btnMenuTop.classList.add("hidden");
      applyControlModeUI(false);
      hideAllOverlays();
      introBanner.classList.remove("hidden");
      game.startIntro(selectedCatId);
    });

    btnExitIntro.addEventListener("click", () => {
      RC.Audio.uiClick();
      finishIntro();
    });

    btnDevEnding.addEventListener("click", () => {
      RC.Audio.uiClick();
      pendingEndingSummary = null;
      hud.classList.add("hidden");
      btnPause.classList.add("hidden");
      btnMenuTop.classList.add("hidden");
      applyControlModeUI(false);
      hideAllOverlays();
      endingBanner.classList.remove("hidden");
      game.startEnding(selectedCatId, false);
    });

    btnExitEnding.addEventListener("click", () => {
      RC.Audio.uiClick();
      endingBanner.classList.add("hidden");
      if (pendingEndingSummary) {
        const summary = pendingEndingSummary;
        pendingEndingSummary = null;
        showResultScreen(summary);
      } else {
        showMenu("story");
      }
    });

    btnPlay.addEventListener("click", startCurrentLevel);

    const toggleInsanity = () => {
      if (!RC.Levels.isInsanityUnlocked()) return;
      RC.Audio.uiClick();
      RC.Storage.setInsanityMode(!RC.Storage.isInsanityMode());
      refreshInsanityBtns();
    };
    if (btnInsanityMode) btnInsanityMode.addEventListener("click", toggleInsanity);
    if (btnInsanityLevels) btnInsanityLevels.addEventListener("click", toggleInsanity);

    btnDevUnlock.addEventListener("click", () => {
      RC.Audio.uiClick();
      const nextState = !RC.Storage.isDevUnlockAll();
      RC.Storage.setDevUnlockAll(nextState);
      if (!RC.Levels.isLevelUnlocked(selectedLevelId)) {
        selectedLevelId = RC.Levels.STORY_LIST[0].id;
        RC.Storage.setSelectedLevel(selectedLevelId);
        game.setPreviewConfig(selectedLevelId, selectedCatId);
      }
      if (!RC.Levels.isCatUnlocked(selectedCatId)) {
        selectedCatId = RC.Levels.CAT_SKINS[0].id;
        RC.Storage.setSelectedCat(selectedCatId);
      }
      renderMenu();
    });

    btnHelp.addEventListener("click", () => {
      RC.Audio.uiClick();
      screenHelp.classList.remove("hidden");
    });

    btnCloseHelp.addEventListener("click", () => {
      RC.Audio.uiClick();
      screenHelp.classList.add("hidden");
    });

    btnPause.addEventListener("click", () => {
      RC.Audio.uiClick();
      if (game.mode === "playing") game.pause();
      else if (game.mode === "paused") game.resume();
    });

    btnMenuTop.addEventListener("click", () => {
      RC.Audio.uiClick();
      showMenu();
    });

    btnResume.addEventListener("click", () => {
      RC.Audio.uiClick();
      game.resume();
    });

    btnRestartPause.addEventListener("click", startCurrentLevel);
    btnQuitPause.addEventListener("click", () => {
      RC.Audio.uiClick();
      showMenu();
    });

    btnRetry.addEventListener("click", startCurrentLevel);
    btnResultMenu.addEventListener("click", () => {
      RC.Audio.uiClick();
      showMenu();
    });

    btnNextLevel.addEventListener("click", () => {
      const nextLvl = RC.Levels.getNextLevel(selectedLevelId);
      if (nextLvl) {
        selectedLevelId = nextLvl.id;
        RC.Storage.setSelectedLevel(nextLvl.id);
      }
      startCurrentLevel();
    });

    // ---- Keyboard Input ----
    window.addEventListener("keydown", (e) => {
      const code = e.code;

      // Prevent browser scrolling on game keys
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(code)) {
        e.preventDefault();
      }

      // Close help modal with Escape
      if (!screenHelp.classList.contains("hidden") && (code === "Escape" || code === "Enter")) {
        screenHelp.classList.add("hidden");
        return;
      }

      // Quick start from Main Menu with Enter
      if (game.mode === "menu" && screenHelp.classList.contains("hidden")) {
        if (code === "Enter" && !e.repeat) {
          e.preventDefault();
          startCurrentLevel();
        }
        return;
      }

      // Quick actions on Result screen
      if (game.mode === "gameover" || game.mode === "victory") {
        if (code === "Space" || code === "KeyR" || code === "Enter") {
          if (!e.repeat) startCurrentLevel();
        } else if (code === "Escape") {
          showMenu();
        }
        return;
      }

      // Pause toggle
      if ((code === "KeyP" || code === "Escape") && !e.repeat) {
        if (game.mode === "playing") game.pause();
        else if (game.mode === "paused") game.resume();
        return;
      }

      if (game.mode !== "playing") return;

      // Jump / Double Jump / Swim Up / Plane Up-Fire
      if (code === "ArrowUp" || code === "KeyW") {
        game.setUp(true);
        if (!e.repeat && game.level.mode !== "plane") {
          game.pressJump();
        }
      } else if (code === "Space" && !e.repeat) {
        game.pressJump();
      }

      // Duck / Dive / Plane Down
      if (code === "ArrowDown" || code === "KeyS") {
        game.setDuck(true);
      }

      // Claw Slash / Special Wall Break / Plane Shoot
      if (code === "KeyX" || code === "KeyJ" || code === "ArrowRight" || code === "KeyD") {
        game.setFire(true);
        if (!e.repeat) {
          game.pressClaw();
        }
      }

      // Slow-Motion (Hold)
      if (code === "ShiftLeft" || code === "ShiftRight" || code === "ArrowLeft" || code === "KeyA") {
        game.setSlow(true);
      }
    });

    window.addEventListener("keyup", (e) => {
      const code = e.code;
      if (code === "ArrowUp" || code === "KeyW") {
        game.setUp(false);
        game.releaseJump();
      }
      if (code === "Space") {
        game.releaseJump();
      }
      if (code === "ArrowDown" || code === "KeyS") {
        game.setDuck(false);
      }
      if (code === "KeyX" || code === "KeyJ" || code === "ArrowRight" || code === "KeyD") {
        game.setFire(false);
      }
      if (code === "ShiftLeft" || code === "ShiftRight" || code === "ArrowLeft" || code === "KeyA") {
        game.setSlow(false);
      }
    });

    // Auto-pause if browser tab loses focus during gameplay
    window.addEventListener("blur", () => {
      game.setUp(false);
      game.setDuck(false);
      game.setSlow(false);
      game.setFire(false);
      if (game.mode === "playing") {
        game.pause();
      }
    });

    // ---- Touch / Pointer Controls ----
    function bindHoldButton(el, onDown, onUp) {
      el.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        el.classList.add("active");
        onDown();
      });
      const release = (e) => {
        if (e) e.preventDefault();
        el.classList.remove("active");
        onUp();
      };
      el.addEventListener("pointerup", release);
      el.addEventListener("pointerleave", release);
      el.addEventListener("pointercancel", release);
    }

    bindHoldButton(
      touchJump,
      () => game.pressJump(),
      () => game.releaseJump()
    );
    bindHoldButton(
      touchDuck,
      () => game.setDuck(true),
      () => game.setDuck(false)
    );
    bindHoldButton(
      touchSlow,
      () => game.setSlow(true),
      () => game.setSlow(false)
    );
    touchClaw.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      touchClaw.classList.add("active");
      game.pressClaw();
    });
    touchClaw.addEventListener("pointerup", () => touchClaw.classList.remove("active"));
    touchClaw.addEventListener("pointerleave", () => touchClaw.classList.remove("active"));

    // ---- Gesture / Zone Controls (Left Tap = Jump / Double Tap = Double Jump, Right = Claw, Duck, Slow) ----
    gestureLeftZone.addEventListener("pointerdown", (e) => {
      if (game.mode !== "playing") return;
      e.preventDefault();
      gestureLeftZone.classList.add("active");
      game.setUp(true);
      game.pressJump();
    });
    const endLeftTap = (e) => {
      if (e) e.preventDefault();
      gestureLeftZone.classList.remove("active");
      game.setUp(false);
      game.releaseJump();
    };
    gestureLeftZone.addEventListener("pointerup", endLeftTap);
    gestureLeftZone.addEventListener("pointercancel", endLeftTap);
    gestureLeftZone.addEventListener("pointerleave", endLeftTap);

    bindHoldButton(
      gestureSlowBtn,
      () => game.setSlow(true),
      () => game.setSlow(false)
    );
    bindHoldButton(
      gestureDuckBtn,
      () => game.setDuck(true),
      () => game.setDuck(false)
    );
    bindHoldButton(
      gestureFireBtn,
      () => {
        game.setFire(true);
        game.pressClaw();
      },
      () => game.setFire(false)
    );

    // Canvas quick click/tap to jump during play (disabled when using gesture overlay)
    canvas.addEventListener("pointerdown", (e) => {
      if (game.mode !== "playing") return;
      if (RC.Storage.getControlMode() === "gestures") return;
      if (e.button === 2) {
        game.pressClaw();
      } else {
        game.pressJump();
      }
    });
    canvas.addEventListener("pointerup", () => {
      if (game.mode === "playing" && RC.Storage.getControlMode() !== "gestures") {
        game.releaseJump();
      }
    });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    // Initial UI setup
    refreshSoundBtn();
    showTitleScreen();
  });
})(window.RunnerCat = window.RunnerCat || {});
