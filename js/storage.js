/* ============================================================
   RunnerCat — Persistent LocalStorage Manager
   ============================================================ */
(function (RC) {
  const STORAGE_KEY = "runnercat_save_v1";

  const DEFAULT_DATA = {
    globalHi: 0,
    soundEnabled: true,
    devUnlockAll: false,
    controlMode: "buttons",
    selectedCat: "ginger",
    selectedLevel: "alley",
    levels: {}
    // levels[id] = { hiScore, bestDist, cleared, totalFish, totalKills }
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
        levels: parsed && typeof parsed.levels === "object" ? parsed.levels : {}
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
      controlMode: DEFAULT_DATA.controlMode,
      selectedCat: DEFAULT_DATA.selectedCat,
      selectedLevel: DEFAULT_DATA.selectedLevel,
      levels: {}
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

  function recordRun(levelId, score, dist, cleared) {
    const rec = getLevelRecord(levelId);
    const isNewLevelRecord = score > rec.hiScore;
    const isNewGlobalRecord = score > state.globalHi;

    if (isNewLevelRecord) rec.hiScore = score;
    if (dist > rec.bestDist) rec.bestDist = dist;
    if (cleared) rec.cleared = true;
    if (isNewGlobalRecord) state.globalHi = score;

    save();
    return {
      isNewLevelRecord,
      isNewGlobalRecord,
      levelHi: rec.hiScore,
      globalHi: state.globalHi
    };
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
    getControlMode() {
      return state.controlMode === "gestures" ? "gestures" : "buttons";
    },
    setControlMode(mode) {
      state.controlMode = mode === "gestures" ? "gestures" : "buttons";
      save();
    },
    setSelectedCat(catId) {
      state.selectedCat = catId;
      save();
    },
    setSelectedLevel(levelId) {
      state.selectedLevel = levelId;
      save();
    }
  };
})(window.RunnerCat = window.RunnerCat || {});
