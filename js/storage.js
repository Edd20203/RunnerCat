/* ============================================================
   RunnerCat — Persistent LocalStorage Manager
   ============================================================ */
(function (RC) {
  const STORAGE_KEY = "runnercat_save_v1";

  const DEFAULT_DATA = {
    globalHi: 0,
    soundEnabled: true,
    devUnlockAll: false,
    insanityMode: false,
    controlMode: "buttons",
    controlChosen: false,
    controlLayout: {
      buttonOrder: ["slow", "duck", "claw", "jump"],
      gesturePos: {
        claw: { x: 86, y: 72 },
        duck: { x: 72, y: 52 },
        slow: { x: 86, y: 42 }
      },
      joystickPos: {
        stick: { x: 14, y: 68 },
        claw: { x: 86, y: 68 }
      }
    },
    selectedCat: "ginger",
    selectedLevel: "alley",
    levels: {},
    discovered: {},
    customCat: {
      name: "Mi Michi",
      breed: "classic",
      color: "orange",
      pattern: "none",
      cosmetic: "none"
    },
    profile: {
      username: "MichiPlayer",
      avatarId: "ginger",
      totalPlaySeconds: 0,
      totalRuns: 0,
      totalFish: 0,
      totalKills: 0,
      history: []
    }
  };

  let state = load();

  function load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefault();
      const parsed = JSON.parse(raw);
      return {
        ...cloneDefault(),
        ...parsed,
        levels: parsed && typeof parsed.levels === "object" ? parsed.levels : {},
        discovered:
          parsed && typeof parsed.discovered === "object" && parsed.discovered
            ? parsed.discovered
            : {},
        customCat: {
          ...DEFAULT_DATA.customCat,
          ...(parsed && typeof parsed.customCat === "object" ? parsed.customCat : {})
        },
        profile: {
          ...DEFAULT_DATA.profile,
          ...(parsed && typeof parsed.profile === "object" ? parsed.profile : {}),
          history:
            parsed && parsed.profile && Array.isArray(parsed.profile.history)
              ? parsed.profile.history
              : []
        },
        controlLayout: {
          buttonOrder:
            parsed && parsed.controlLayout && Array.isArray(parsed.controlLayout.buttonOrder)
              ? parsed.controlLayout.buttonOrder
              : [...DEFAULT_DATA.controlLayout.buttonOrder],
          gesturePos: {
            ...DEFAULT_DATA.controlLayout.gesturePos,
            ...(parsed && parsed.controlLayout && parsed.controlLayout.gesturePos
              ? parsed.controlLayout.gesturePos
              : {})
          },
          joystickPos: {
            ...DEFAULT_DATA.controlLayout.joystickPos,
            ...(parsed && parsed.controlLayout && parsed.controlLayout.joystickPos
              ? parsed.controlLayout.joystickPos
              : {})
          }
        }
      };
    } catch (_err) {
      return cloneDefault();
    }
  }

  function cloneDefault() {
    return {
      globalHi: DEFAULT_DATA.globalHi,
      soundEnabled: DEFAULT_DATA.soundEnabled,
      devUnlockAll: DEFAULT_DATA.devUnlockAll,
      insanityMode: DEFAULT_DATA.insanityMode,
      controlMode: DEFAULT_DATA.controlMode,
      controlChosen: DEFAULT_DATA.controlChosen,
      controlLayout: JSON.parse(JSON.stringify(DEFAULT_DATA.controlLayout)),
      selectedCat: DEFAULT_DATA.selectedCat,
      selectedLevel: DEFAULT_DATA.selectedLevel,
      levels: {},
      discovered: {},
      customCat: { ...DEFAULT_DATA.customCat },
      profile: { ...DEFAULT_DATA.profile, history: [] }
    };
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_err) {
      // Ignore storage quota / private mode issues
    }
  }

  function getLevelRecord(levelId) {
    if (!state.levels[levelId]) {
      state.levels[levelId] = {
        hiScore: 0,
        bestDist: 0,
        cleared: false
      };
    }
    return state.levels[levelId];
  }

  function recordRun(levelId, score, dist, cleared, extra) {
    const rec = getLevelRecord(levelId);
    const isNewLevelRecord = score > rec.hiScore;
    const isNewGlobalRecord = score > state.globalHi;

    if (isNewLevelRecord) rec.hiScore = score;
    if (dist > rec.bestDist) rec.bestDist = dist;
    if (cleared) rec.cleared = true;
    if (isNewGlobalRecord) state.globalHi = score;

    if (extra) {
      state.profile.totalRuns = (state.profile.totalRuns || 0) + 1;
      state.profile.totalFish = (state.profile.totalFish || 0) + (extra.fishCount || 0);
      state.profile.totalKills = (state.profile.totalKills || 0) + (extra.killCount || 0);
      const entry = {
        levelName: extra.levelName || levelId,
        score,
        dist,
        victory: Boolean(cleared),
        timeStr: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      state.profile.history = [entry, ...(state.profile.history || [])].slice(0, 15);
    }

    save();
    return {
      isNewLevelRecord,
      isNewGlobalRecord,
      levelHi: rec.hiScore,
      globalHi: state.globalHi
    };
  }

  function getClearedCount() {
    return Object.values(state.levels).filter((r) => r && r.cleared).length;
  }

  RC.Storage = {
    getState: () => state,
    getLevelRecord,
    recordRun,
    setSoundEnabled(enabled) {
      state.soundEnabled = Boolean(enabled);
      save();
    },
    isDevUnlockAll() {
      return Boolean(state.devUnlockAll);
    },
    setDevUnlockAll(enabled) {
      state.devUnlockAll = Boolean(enabled);
      save();
    },
    isInsanityMode() {
      return Boolean(state.insanityMode);
    },
    setInsanityMode(enabled) {
      state.insanityMode = Boolean(enabled);
      save();
    },
    getControlMode() {
      if (state.controlMode === "gestures" || state.controlMode === "joystick") {
        return state.controlMode;
      }
      return "buttons";
    },
    hasChosenControl() {
      return Boolean(state.controlChosen);
    },
    setControlMode(mode) {
      state.controlMode =
        mode === "gestures" || mode === "joystick" ? mode : "buttons";
      state.controlChosen = true;
      save();
    },
    getControlLayout() {
      return state.controlLayout;
    },
    setControlLayout(partial) {
      state.controlLayout = { ...state.controlLayout, ...partial };
      save();
    },
    resetControlLayout() {
      state.controlLayout = JSON.parse(JSON.stringify(DEFAULT_DATA.controlLayout));
      save();
    },
    setSelectedCat(catId) {
      state.selectedCat = catId;
      save();
    },
    setSelectedLevel(levelId) {
      state.selectedLevel = levelId;
      save();
    },
    getClearedCount,
    getCustomCat() {
      return state.customCat;
    },
    setCustomCat(partial) {
      state.customCat = { ...state.customCat, ...partial };
      save();
    },
    getProfile() {
      return state.profile;
    },
    setUsername(name) {
      const clean = String(name || "").trim().slice(0, 16) || "MichiPlayer";
      state.profile.username = clean;
      save();
    },
    setAvatarId(id) {
      state.profile.avatarId = id || "ginger";
      save();
    },
    addPlayTime(seconds) {
      if (!seconds || seconds <= 0) return;
      state.profile.totalPlaySeconds = (state.profile.totalPlaySeconds || 0) + seconds;
      save();
    },
    isDiscovered(id) {
      if (state.devUnlockAll) return true;
      return Boolean(state.discovered && state.discovered[id]);
    },
    discoverEntry(id) {
      if (!id) return;
      if (!state.discovered) state.discovered = {};
      if (state.discovered[id]) return;
      state.discovered[id] = true;
      save();
    }
  };
})(window.RunnerCat = window.RunnerCat || {});
