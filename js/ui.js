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
    const screenMenu = document.getElementById("screen-menu");
    const screenHelp = document.getElementById("screen-help");
    const screenPause = document.getElementById("screen-pause");
    const screenResult = document.getElementById("screen-result");

    // Menu elements
    const levelGrid = document.getElementById("level-grid");
    const catGrid = document.getElementById("cat-grid");
    const levelSummaryBox = document.getElementById("selected-level-summary");
    const btnPlay = document.getElementById("btn-play");
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

    // Touch controls
    const touchSlow = document.getElementById("touch-slow");
    const touchDuck = document.getElementById("touch-duck");
    const touchClaw = document.getElementById("touch-claw");
    const touchJump = document.getElementById("touch-jump");

    let selectedLevelId = RC.Storage.getState().selectedLevel;
    if (
      !RC.Levels.LIST.some((l) => l.id === selectedLevelId) ||
      !RC.Levels.isLevelUnlocked(selectedLevelId)
    ) {
      selectedLevelId = RC.Levels.LIST[0].id;
      RC.Storage.setSelectedLevel(selectedLevelId);
    }
    let selectedCatId = RC.Storage.getState().selectedCat;

    // Instantiate Game Engine
    const game = new RC.RunnerGame(canvas, {
      onHudUpdate: updateHud,
      onRunEnd: showResultScreen,
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

    // ---- Build Level Selection Cards ----
    function renderMenu() {
      refreshGlobalHi();
      levelGrid.innerHTML = "";

      RC.Levels.LIST.forEach((lvl) => {
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
          : lvl.mode === "boss" || lvl.mode === "swimBoss" || lvl.mode === "planeBoss"
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
            <span class="level-num">${lvl.id === "endless" ? "MODO ∞" : `NIVEL ${lvl.number}`}</span>
            ${statusTag}
          </div>
          <div class="level-name">${lvl.name}</div>
          <div class="level-meta">${lvl.difficulty} · ${goalStr}</div>
          <div class="level-hi">${footerText}</div>
        `;

        card.addEventListener("click", () => {
          if (!unlocked) return;
          RC.Audio.uiClick();
          selectedLevelId = lvl.id;
          RC.Storage.setSelectedLevel(lvl.id);
          game.setPreviewConfig(selectedLevelId, selectedCatId);
          renderMenu();
        });

        levelGrid.appendChild(card);
      });

      // Cat skin selector
      catGrid.innerHTML = "";
      RC.Levels.CAT_SKINS.forEach((skin) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = `cat-card${skin.id === selectedCatId ? " selected" : ""}`;

        const swatch = document.createElement("canvas");
        swatch.className = "cat-swatch";
        swatch.width = 32;
        swatch.height = 28;
        const sctx = swatch.getContext("2d");
        sctx.imageSmoothingEnabled = false;
        const catSpr = RC.Sprites.getCatSprite("run1", skin.id, 2);
        sctx.drawImage(catSpr, 0, 0);

        const label = document.createElement("span");
        label.className = "cat-name";
        label.textContent = skin.name;

        card.appendChild(swatch);
        card.appendChild(label);

        card.addEventListener("click", () => {
          RC.Audio.uiClick();
          selectedCatId = skin.id;
          RC.Storage.setSelectedCat(skin.id);
          game.setPreviewConfig(selectedLevelId, selectedCatId);
          renderMenu();
        });

        catGrid.appendChild(card);
      });

      // Selected level summary
      const curLvl = RC.Levels.getLevelById(selectedLevelId);
      const curSkin = RC.Levels.getCatSkinById(selectedCatId);
      levelSummaryBox.innerHTML = `
        <strong>${curLvl.name}</strong> con <strong>${curSkin.name}</strong><br/>
        ${curLvl.description}
      `;
    }

    // ---- Screen Navigation ----
    function showMenu() {
      game.returnToMenu();
      game.setPreviewConfig(selectedLevelId, selectedCatId);
      hud.classList.add("hidden");
      btnPause.classList.add("hidden");
      btnMenuTop.classList.add("hidden");
      screenPause.classList.add("hidden");
      screenResult.classList.add("hidden");
      screenHelp.classList.add("hidden");
      screenMenu.classList.remove("hidden");
      renderMenu();
    }

    function startCurrentLevel() {
      RC.Audio.uiClick();
      screenMenu.classList.add("hidden");
      screenHelp.classList.add("hidden");
      screenPause.classList.add("hidden");
      screenResult.classList.add("hidden");
      hud.classList.remove("hidden");
      btnPause.classList.remove("hidden");
      btnMenuTop.classList.remove("hidden");
      game.startLevel(selectedLevelId, selectedCatId);
    }

    function updateHud(data) {
      hudLevelName.textContent = data.level.shortName;
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

    btnPlay.addEventListener("click", startCurrentLevel);

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

    // Canvas quick click/tap to jump during play
    canvas.addEventListener("pointerdown", (e) => {
      if (game.mode !== "playing") return;
      if (e.button === 2) {
        game.pressClaw();
      } else {
        game.pressJump();
      }
    });
    canvas.addEventListener("pointerup", () => {
      if (game.mode === "playing") game.releaseJump();
    });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    // Initial UI setup
    refreshSoundBtn();
    showMenu();
  });
})(window.RunnerCat = window.RunnerCat || {});
