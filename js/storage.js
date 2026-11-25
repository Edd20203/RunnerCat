/* ============================================================
   RunnerCat — Persistent LocalStorage Manager
   ============================================================ */
(function (RC) {
  const STORAGE_KEY = "runnercat_save_v1";

  const DEFAULT_DATA = {
    globalHi: 0,
    soundEnabled: true,
    musicEnabled: true,
    devUnlockAll: false,
    insanityMode: false,
    fishCoins: 0,
    upgrades: {},
    achievements: {},
    activeTitle: "Novato",
    bossRushBestSec: null,
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
        upgrades:
          parsed && typeof parsed.upgrades === "object" && parsed.upgrades
            ? parsed.upgrades
            : {},
        achievements:
          parsed && typeof parsed.achievements === "object" && parsed.achievements
            ? parsed.achievements
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
      musicEnabled: DEFAULT_DATA.musicEnabled,
      devUnlockAll: DEFAULT_DATA.devUnlockAll,
      insanityMode: DEFAULT_DATA.insanityMode,
      fishCoins: 0,
      upgrades: {},
      achievements: {},
      activeTitle: "Novato",
      bossRushBestSec: null,
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
        cleared: false,
        stars: 0
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
    if (extra && extra.stars && extra.stars > (rec.stars || 0)) {
      rec.stars = extra.stars;
    }
    if (isNewGlobalRecord) state.globalHi = score;

    if (extra) {
      state.fishCoins = (state.fishCoins || 0) + (extra.fishCount || 0);
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

      // Evaluate Achievements
      if (!state.achievements) state.achievements = {};
      if (cleared) state.achievements.first_clear = true;
      if ((state.profile.totalKills || 0) >= 50) state.achievements.slayer_50 = true;
      if ((state.profile.totalFish || 0) >= 100) state.achievements.fish_100 = true;
      if (Object.keys(state.discovered || {}).length >= 20) state.achievements.ency_half = true;
      if (["boss", "squidBoss", "planeBoss", "spookyBoss", "spaceBoss"].every((id) => state.levels[id] && state.levels[id].cleared)) {
        state.achievements.all_bosses = true;
      }
      if (cleared && state.insanityMode) state.achievements.insane_win = true;
      if (cleared && levelId === "jungleBoss") state.achievements.secret_win = true;
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
    isMusicEnabled() {
      return state.musicEnabled !== false;
    },
    setMusicEnabled(enabled) {
      state.musicEnabled = Boolean(enabled);
      save();
    },
    getFishCoins() {
      return state.fishCoins || 0;
    },
    hasUpgrade(id) {
      return Boolean(state.upgrades && state.upgrades[id]);
    },
    buyUpgrade(id, cost) {
      if (this.hasUpgrade(id)) return true;
      if ((state.fishCoins || 0) < cost) return false;
      state.fishCoins -= cost;
      if (!state.upgrades) state.upgrades = {};
      state.upgrades[id] = true;
      save();
      return true;
    },
    getAchievements() {
      return state.achievements || {};
    },
    getActiveTitle() {
      return state.activeTitle || "Novato";
    },
    setActiveTitle(title) {
      state.activeTitle = title || "Novato";
      save();
    },
    getBossRushBest() {
      return state.bossRushBestSec;
    },
    setBossRushBest(sec) {
      if (state.bossRushBestSec == null || sec < state.bossRushBestSec) {
        state.bossRushBestSec = sec;
        save();
        return true;
      }
      return false;
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
