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
    selectedCat: "ginger",
    selectedLevel: "alley",
    levels: {},
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
      selectedCat: DEFAULT_DATA.selectedCat,
      selectedLevel: DEFAULT_DATA.selectedLevel,
      levels: {},
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
      return state.controlMode === "gestures" ? "gestures" : "buttons";
    },
    hasChosenControl() {
      return Boolean(state.controlChosen);
    },
    setControlMode(mode) {
      state.controlMode = mode === "gestures" ? "gestures" : "buttons";
      state.controlChosen = true;
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
    }
  };
})(window.RunnerCat = window.RunnerCat || {});
