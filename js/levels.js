/* ============================================================
   RunnerCat — Levels & Cat Skins Definitions
   ============================================================ */
(function (RC) {
  const CAT_SKINS = [
    {
      id: "ginger",
      name: "Tigre",
      desc: "Naranja clásico",
      palette: {
        body: "#f39c3d",
        dark: "#b85d19",
        light: "#ffe3b8",
        eye: "#1a202c",
        nose: "#ff7675",
        collar: "#e84118"
      }
    },
    {
      id: "tuxedo",
      name: "Pixel",
      desc: "Esmoquin retro",
      palette: {
        body: "#2f3640",
        dark: "#191d24",
        light: "#f5f6fa",
        eye: "#7bed9f",
        nose: "#ff9ff3",
        collar: "#00a8ff"
      }
    },
    {
      id: "siamese",
      name: "Mochi",
      desc: "Siamés crema",
      palette: {
        body: "#ebd8c3",
        dark: "#6d5240",
        light: "#fff8f0",
        eye: "#48dbfb",
        nose: "#d68d80",
        collar: "#ff6b81"
      }
    },
    {
      id: "shadow",
      name: "Sombra",
      desc: "Ninja nocturno",
      palette: {
        body: "#252136",
        dark: "#120f1c",
        light: "#5e548e",
        eye: "#ffd32a",
        nose: "#ff7675",
        collar: "#9c88ff"
      }
    }
  ];

  const LEVELS = [
    {
      id: "alley",
      number: 1,
      mode: "runner",
      name: "Callejón Retro",
      shortName: "N1: CALLEJÓN",
      difficulty: "Fácil",
      targetDistance: 600,
      baseSpeed: 335,
      maxSpeed: 590,
      accelPerSec: 6.5,
      dayNightCycleDist: 220,
      bgStyle: "city",
      previewGradient: "linear-gradient(90deg, #f3e8d2 0%, #f3c892 50%, #273257 100%)",
      description: "Carrera clásica por callejones. Domina el doble salto y el zarpazo.",
      day: {
        skyTop: "#f7f3e8",
        skyBottom: "#ebe2cc",
        cloud: "#d8ccb4",
        farBg: "#d3c6ad",
        nearBg: "#bcae93",
        groundTop: "#574f45",
        groundFill: "#dcd1bc",
        groundDetail: "#8f8371",
        sunMoon: "#f6b93b"
      },
      night: {
        skyTop: "#15192e",
        skyBottom: "#262c4a",
        cloud: "#394066",
        farBg: "#1f2440",
        nearBg: "#2c3357",
        groundTop: "#8994c7",
        groundFill: "#1a1f36",
        groundDetail: "#4d5685",
        sunMoon: "#f5f6fa"
      },
      obstacles: [
        { type: "hydrant", weight: 22 },
        { type: "trash", weight: 20 },
        { type: "crate", weight: 22 },
        { type: "mouse", weight: 20 },
        { type: "bird", weight: 16 }
      ]
    },
    {
      id: "park",
      number: 2,
      mode: "runner",
      name: "Cielos del Parque",
      shortName: "N2: PARQUE",
      difficulty: "Media",
      targetDistance: 850,
      baseSpeed: 385,
      maxSpeed: 680,
      accelPerSec: 8.5,
      dayNightCycleDist: 240,
      bgStyle: "park",
      previewGradient: "linear-gradient(90deg, #ffbe76 0%, #eb7d5b 50%, #222f3e 100%)",
      description: "Obstáculos en tierra y cielo: bandadas de aves, drones y ramas que caen.",
      day: {
        skyTop: "#ffe8c8",
        skyBottom: "#f7b78c",
        cloud: "#fff2e0",
        farBg: "#c9967a",
        nearBg: "#8a6d5c",
        groundTop: "#3c6e47",
        groundFill: "#c9b38f",
        groundDetail: "#708c58",
        sunMoon: "#ff793f"
      },
      night: {
        skyTop: "#111c29",
        skyBottom: "#1e3247",
        cloud: "#2d4a66",
        farBg: "#18293b",
        nearBg: "#213a4f",
        groundTop: "#499c6b",
        groundFill: "#16242b",
        groundDetail: "#2d5c48",
        sunMoon: "#ffeaa7"
      },
      obstacles: [
        { type: "bush", weight: 15 },
        { type: "crate", weight: 14 },
        { type: "mouse", weight: 17 },
        { type: "bird", weight: 28 },
        { type: "drone", weight: 14 },
        { type: "skyDrop", weight: 12 }
      ]
    },
    {
      id: "ocean",
      number: 3,
      mode: "swim",
      name: "Abismo Marino",
      shortName: "N3: BUCEO",
      difficulty: "Media-Alta",
      targetDistance: 900,
      baseSpeed: 315,
      maxSpeed: 540,
      accelPerSec: 6.5,
      dayNightCycleDist: 280,
      bgStyle: "ocean",
      previewGradient: "linear-gradient(90deg, #00a8ff 0%, #006299 55%, #071e3d 100%)",
      description: "Bucea con casco: nada arriba/abajo y usa tu ataque especial (X) para romper muros.",
      day: {
        skyTop: "#1b7fbd",
        skyBottom: "#0c3c6e",
        cloud: "#3ba3db",
        farBg: "#114d80",
        nearBg: "#0a3359",
        groundTop: "#e1b12c",
        groundFill: "#8c6d32",
        groundDetail: "#c29b46",
        sunMoon: "#81ecec"
      },
      night: {
        skyTop: "#091b38",
        skyBottom: "#050d1f",
        cloud: "#13315c",
        farBg: "#0b2245",
        nearBg: "#07162e",
        groundTop: "#576574",
        groundFill: "#1b2436",
        groundDetail: "#35445e",
        sunMoon: "#48dbfb"
      },
      obstacles: [
        { type: "seaWall", weight: 28 },
        { type: "jellyfish", weight: 26 },
        { type: "seaMine", weight: 24 },
        { type: "coral", weight: 22 }
      ]
    },
    {
      id: "skyplane",
      number: 4,
      mode: "plane",
      name: "As del Mini-Avión",
      shortName: "N4: AVIÓN",
      difficulty: "Difícil",
      targetDistance: 1050,
      baseSpeed: 375,
      maxSpeed: 640,
      accelPerSec: 7.5,
      dayNightCycleDist: 260,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #48dbfb 0%, #5f27cd 55%, #ff6b81 100%)",
      description: "Pilota un mini-avión: esquiva bloques arriba/abajo y dispara (X / ESPACIO) a los pájaros.",
      day: {
        skyTop: "#3c8ce7",
        skyBottom: "#9bd7ff",
        cloud: "#ffffff",
        farBg: "#6a9ee0",
        nearBg: "#4979bd",
        groundTop: "#2f3542",
        groundFill: "#1e272e",
        groundDetail: "#57606f",
        sunMoon: "#ffd32a"
      },
      night: {
        skyTop: "#130f40",
        skyBottom: "#30336b",
        cloud: "#4834d4",
        farBg: "#1e1b52",
        nearBg: "#262369",
        groundTop: "#ff6b81",
        groundFill: "#110f29",
        groundDetail: "#48dbfb",
        sunMoon: "#f5f6fa"
      },
      obstacles: [
        { type: "skyBlock", weight: 32 },
        { type: "bird", weight: 38 },
        { type: "drone", weight: 30 }
      ]
    },
    {
      id: "boss",
      number: 5,
      mode: "boss",
      name: "La Gallina Gigante",
      shortName: "N5: JEFE FINAL",
      difficulty: "Jefe",
      targetDistance: null,
      bossMaxHp: 10,
      baseSpeed: 390,
      maxSpeed: 540,
      accelPerSec: 4,
      dayNightCycleDist: 300,
      bgStyle: "park",
      previewGradient: "linear-gradient(90deg, #ff6b81 0%, #ff9f43 50%, #ffd32a 100%)",
      description: "Esquiva los huevos desde arriba y golpéala con X cuando aparezca a un costado.",
      day: {
        skyTop: "#ffd3a5",
        skyBottom: "#fd6585",
        cloud: "#fff0e5",
        farBg: "#b85d6f",
        nearBg: "#7d3c4d",
        groundTop: "#4b2c20",
        groundFill: "#9e6b43",
        groundDetail: "#6e472b",
        sunMoon: "#fff2a6"
      },
      night: {
        skyTop: "#1e1329",
        skyBottom: "#421b38",
        cloud: "#5c284e",
        farBg: "#2e1633",
        nearBg: "#3d1d42",
        groundTop: "#ff6b81",
        groundFill: "#1a1021",
        groundDetail: "#6b2d47",
        sunMoon: "#ffd32a"
      },
      obstacles: [
        { type: "crate", weight: 40 },
        { type: "hay", weight: 60 }
      ]
    },
    {
      id: "endless",
      number: 6,
      mode: "runner",
      name: "Modo Infinito",
      shortName: "∞ INFINITO",
      difficulty: "Arcade ∞",
      targetDistance: null,
      baseSpeed: 365,
      maxSpeed: 840,
      accelPerSec: 8,
      dayNightCycleDist: 250,
      bgStyle: "city",
      previewGradient: "linear-gradient(90deg, #48dbfb 0%, #ff9f43 50%, #ff6b81 100%)",
      description: "Sin meta final: todos los obstáculos terrestres y aéreos para batir récords.",
      day: {
        skyTop: "#eef2f5",
        skyBottom: "#dfe6ed",
        cloud: "#c8d3de",
        farBg: "#c4ced9",
        nearBg: "#a6b4c4",
        groundTop: "#3d4452",
        groundFill: "#d5dce3",
        groundDetail: "#7f8c9c",
        sunMoon: "#ffa801"
      },
      night: {
        skyTop: "#101426",
        skyBottom: "#1f2745",
        cloud: "#323d66",
        farBg: "#181f38",
        nearBg: "#242e52",
        groundTop: "#70a1ff",
        groundFill: "#13182b",
        groundDetail: "#4b5a8a",
        sunMoon: "#f1f2f6"
      },
      obstacles: [
        { type: "hydrant", weight: 12 },
        { type: "trash", weight: 12 },
        { type: "bush", weight: 10 },
        { type: "antenna", weight: 12 },
        { type: "crate", weight: 14 },
        { type: "mouse", weight: 14 },
        { type: "bird", weight: 14 },
        { type: "drone", weight: 12 }
      ]
    }
  ];

  function getLevelById(id) {
    return LEVELS.find((l) => l.id === id) || LEVELS[0];
  }

  function getNextLevel(id) {
    const idx = LEVELS.findIndex((l) => l.id === id);
    if (idx === -1 || idx + 1 >= LEVELS.length) return null;
    return LEVELS[idx + 1];
  }

  function getCatSkinById(id) {
    return CAT_SKINS.find((c) => c.id === id) || CAT_SKINS[0];
  }

  RC.Levels = {
    LIST: LEVELS,
    CAT_SKINS,
    getLevelById,
    getNextLevel,
    getCatSkinById
  };
})(window.RunnerCat = window.RunnerCat || {});
