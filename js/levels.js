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
    },
    {
      id: "tortie",
      name: "Carey",
      desc: "Hembra carey",
      pattern: "tortie",
      palette: {
        body: "#2d221c",
        dark: "#140e0b",
        light: "#e67e22",
        eye: "#ffd32a",
        nose: "#ff9ff3",
        collar: "#ff6b81"
      }
    },
    {
      id: "white_bow",
      name: "Perla",
      desc: "Blanca con moño",
      pattern: "bow",
      bowColor: "#ff4757",
      palette: {
        body: "#ffffff",
        dark: "#b2bec3",
        light: "#fff5f8",
        eye: "#ff6b81",
        nose: "#ff9ff3",
        collar: "#ff4757"
      }
    },
    {
      id: "tabby_gray",
      name: "Gris",
      desc: "Gris atigrado",
      pattern: "tabby",
      palette: {
        body: "#95a5a6",
        dark: "#2f3640",
        light: "#dfe6e9",
        eye: "#2ed573",
        nose: "#ff9ff3",
        collar: "#0984e3"
      }
    },
    {
      id: "cow",
      name: "Manchas",
      desc: "Blanco y negro",
      pattern: "spots",
      palette: {
        body: "#f5f6fa",
        dark: "#1e272e",
        light: "#ffffff",
        eye: "#ffa502",
        nose: "#ff7675",
        collar: "#ff4757"
      }
    }
  ];

  const STORY_LEVELS = [
    {
      id: "alley",
      number: 1,
      mode: "runner",
      name: "Callejón Retro",
      shortName: "N1: CALLEJÓN",
      difficulty: "Fácil",
      targetDistance: 600,
      baseSpeed: 335,
      maxSpeed: 565,
      accelPerSec: 6.2,
      spawnScale: 1.0,
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
      baseSpeed: 390,
      maxSpeed: 685,
      accelPerSec: 8.5,
      spawnScale: 0.84,
      dayNightCycleDist: 240,
      bgStyle: "park",
      previewGradient: "linear-gradient(90deg, #ffbe76 0%, #eb7d5b 50%, #222f3e 100%)",
      description: "Más velocidad y más obstáculos en tierra y aire: aves, drones y ramas que caen.",
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
        { type: "bush", weight: 14 },
        { type: "antenna", weight: 10 },
        { type: "crate", weight: 14 },
        { type: "mouse", weight: 16 },
        { type: "bird", weight: 24 },
        { type: "drone", weight: 12 },
        { type: "skyDrop", weight: 10 }
      ]
    },
    {
      id: "rooftops",
      number: 3,
      mode: "runner",
      name: "Azoteas Nocturnas",
      shortName: "N3: AZOTEAS",
      difficulty: "Difícil",
      targetDistance: 1050,
      baseSpeed: 435,
      maxSpeed: 790,
      accelPerSec: 10.5,
      spawnScale: 0.7,
      dayNightCycleDist: 200,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #5f27cd 0%, #ff6b81 55%, #ff9f43 100%)",
      description: "Carrera extrema: oleadas rápidas de obstáculos en el suelo y amenazas aéreas.",
      day: {
        skyTop: "#3b3b98",
        skyBottom: "#82589f",
        cloud: "#b8a9c9",
        farBg: "#4b3869",
        nearBg: "#2c2447",
        groundTop: "#ff9f43",
        groundFill: "#2c2c54",
        groundDetail: "#706fd3",
        sunMoon: "#ffd32a"
      },
      night: {
        skyTop: "#0c0b1d",
        skyBottom: "#22183b",
        cloud: "#3c2a63",
        farBg: "#16112b",
        nearBg: "#231a42",
        groundTop: "#48dbfb",
        groundFill: "#110d21",
        groundDetail: "#ff6b81",
        sunMoon: "#f5f6fa"
      },
      obstacles: [
        { type: "hydrant", weight: 11 },
        { type: "trash", weight: 11 },
        { type: "antenna", weight: 14 },
        { type: "crate", weight: 12 },
        { type: "mouse", weight: 14 },
        { type: "bird", weight: 15 },
        { type: "drone", weight: 14 },
        { type: "skyDrop", weight: 9 }
      ]
    },
    {
      id: "boss",
      number: 4,
      mode: "boss",
      name: "La Gallina Gigante",
      shortName: "N4: JEFE GALLINA",
      difficulty: "Jefe",
      targetDistance: null,
      bossMaxHp: 10,
      baseSpeed: 390,
      maxSpeed: 540,
      accelPerSec: 4,
      spawnScale: 1.0,
      dayNightCycleDist: 300,
      bgStyle: "park",
      previewGradient: "linear-gradient(90deg, #ff6b81 0%, #ff9f43 50%, #ffd32a 100%)",
      description: "Esquiva los huevos que lanza desde arriba y golpéala con X cuando baje a un costado.",
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
      id: "ocean",
      number: 5,
      mode: "swim",
      name: "Abismo Marino I",
      shortName: "N5: BUCEO I",
      difficulty: "Media-Alta",
      targetDistance: 850,
      baseSpeed: 315,
      maxSpeed: 530,
      accelPerSec: 6.5,
      spawnScale: 0.96,
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
        { type: "seaWall", weight: 24 },
        { type: "jellyfish", weight: 24 },
        { type: "proxMine", weight: 16 },
        { type: "seaMine", weight: 18 },
        { type: "coral", weight: 18 }
      ]
    },
    {
      id: "ocean2",
      number: 6,
      mode: "swim",
      name: "Arrecife Explosivo",
      shortName: "N6: BUCEO II",
      difficulty: "Difícil",
      targetDistance: 1050,
      baseSpeed: 350,
      maxSpeed: 600,
      accelPerSec: 7.5,
      spawnScale: 0.84,
      dayNightCycleDist: 260,
      bgStyle: "ocean",
      previewGradient: "linear-gradient(90deg, #00cec9 0%, #0984e3 55%, #d63031 100%)",
      description: "Cuidado con las bombas de proximidad si nadas cerca y corta las algas densas con X.",
      day: {
        skyTop: "#0984e3",
        skyBottom: "#062c54",
        cloud: "#74b9ff",
        farBg: "#0b4675",
        nearBg: "#072d4d",
        groundTop: "#00b894",
        groundFill: "#5c4d2e",
        groundDetail: "#00cec9",
        sunMoon: "#81ecec"
      },
      night: {
        skyTop: "#07142b",
        skyBottom: "#030814",
        cloud: "#102a4f",
        farBg: "#081c38",
        nearBg: "#041124",
        groundTop: "#ff7675",
        groundFill: "#141a29",
        groundDetail: "#2d3d59",
        sunMoon: "#ff6b81"
      },
      obstacles: [
        { type: "proxMine", weight: 24 },
        { type: "seaweed", weight: 24 },
        { type: "seaWall", weight: 16 },
        { type: "jellyfish", weight: 18 },
        { type: "seaMine", weight: 10 },
        { type: "coral", weight: 8 }
      ]
    },
    {
      id: "ocean3",
      number: 7,
      mode: "swim",
      name: "Trinchera Abisal",
      shortName: "N7: BUCEO III",
      difficulty: "Experto",
      targetDistance: 1250,
      baseSpeed: 390,
      maxSpeed: 675,
      accelPerSec: 9.0,
      spawnScale: 0.72,
      dayNightCycleDist: 240,
      bgStyle: "ocean",
      previewGradient: "linear-gradient(90deg, #6c5ce7 0%, #071e3d 55%, #ff4757 100%)",
      description: "Profundidades extremas: campos de bombas de proximidad y muros de algas sin tregua.",
      day: {
        skyTop: "#1e3799",
        skyBottom: "#0c1438",
        cloud: "#4a69bd",
        farBg: "#162561",
        nearBg: "#0e1842",
        groundTop: "#ff6b81",
        groundFill: "#221e38",
        groundDetail: "#e55039",
        sunMoon: "#f8c291"
      },
      night: {
        skyTop: "#050714",
        skyBottom: "#02030a",
        cloud: "#141838",
        farBg: "#0a0e24",
        nearBg: "#060817",
        groundTop: "#ff4757",
        groundFill: "#0f0c1c",
        groundDetail: "#5352ed",
        sunMoon: "#ff4757"
      },
      obstacles: [
        { type: "proxMine", weight: 30 },
        { type: "seaweed", weight: 28 },
        { type: "seaWall", weight: 14 },
        { type: "jellyfish", weight: 16 },
        { type: "seaMine", weight: 12 }
      ]
    },
    {
      id: "squidBoss",
      number: 8,
      mode: "swimBoss",
      name: "El Calamar Gigante",
      shortName: "N8: JEFE CALAMAR",
      difficulty: "Jefe",
      targetDistance: null,
      bossMaxHp: 8,
      baseSpeed: 330,
      maxSpeed: 470,
      accelPerSec: 3.5,
      spawnScale: 1.0,
      dayNightCycleDist: 300,
      bgStyle: "ocean",
      previewGradient: "linear-gradient(90deg, #9b59b6 0%, #0652dd 50%, #ff4757 100%)",
      description: "Esquiva las pirañas del calamar y araña las minas (X) para lanzárselas de frente.",
      day: {
        skyTop: "#134e7a",
        skyBottom: "#082542",
        cloud: "#2d77ab",
        farBg: "#0d3859",
        nearBg: "#07233b",
        groundTop: "#a3cb38",
        groundFill: "#3d3322",
        groundDetail: "#6e5c3d",
        sunMoon: "#81ecec"
      },
      night: {
        skyTop: "#090d24",
        skyBottom: "#030512",
        cloud: "#161e47",
        farBg: "#0b1130",
        nearBg: "#060a1f",
        groundTop: "#ff6b81",
        groundFill: "#121024",
        groundDetail: "#4834d4",
        sunMoon: "#ff9ff3"
      },
      obstacles: [
        { type: "proxMine", weight: 78 },
        { type: "seaweed", weight: 22 }
      ]
    },
    {
      id: "skyplane",
      number: 9,
      mode: "plane",
      name: "As del Mini-Avión",
      shortName: "N9: AVIÓN I",
      difficulty: "Difícil",
      targetDistance: 950,
      baseSpeed: 370,
      maxSpeed: 620,
      accelPerSec: 7.0,
      spawnScale: 0.95,
      dayNightCycleDist: 260,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #48dbfb 0%, #5f27cd 55%, #ff6b81 100%)",
      description: "Pilota el mini-avión: esquiva bloques arriba/abajo y dispara (X / ESPACIO) a las aves.",
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
      id: "skyplane2",
      number: 10,
      mode: "plane",
      name: "Escuadrón Nube",
      shortName: "N10: AVIÓN II",
      difficulty: "Muy Difícil",
      targetDistance: 1150,
      baseSpeed: 410,
      maxSpeed: 690,
      accelPerSec: 8.2,
      spawnScale: 0.8,
      dayNightCycleDist: 240,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #ff9f43 0%, #ee5253 55%, #341f97 100%)",
      description: "Cielos turbulentos con más drones y bloques flotantes a gran velocidad.",
      day: {
        skyTop: "#ff9f43",
        skyBottom: "#ffcccc",
        cloud: "#fff5f5",
        farBg: "#c46d6d",
        nearBg: "#8c4654",
        groundTop: "#222f3e",
        groundFill: "#19202b",
        groundDetail: "#576574",
        sunMoon: "#ffeaa7"
      },
      night: {
        skyTop: "#190a29",
        skyBottom: "#3b174d",
        cloud: "#5b247a",
        farBg: "#260f3d",
        nearBg: "#331452",
        groundTop: "#ff9f43",
        groundFill: "#12071c",
        groundDetail: "#ff6b81",
        sunMoon: "#ffd32a"
      },
      obstacles: [
        { type: "skyBlock", weight: 34 },
        { type: "bird", weight: 30 },
        { type: "drone", weight: 36 }
      ]
    },
    {
      id: "skyplane3",
      number: 11,
      mode: "plane",
      name: "Tormenta Supersónica",
      shortName: "N11: AVIÓN III",
      difficulty: "Experto",
      targetDistance: 1350,
      baseSpeed: 450,
      maxSpeed: 760,
      accelPerSec: 9.5,
      spawnScale: 0.68,
      dayNightCycleDist: 220,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #00d2d3 0%, #54a0ff 50%, #5f27cd 100%)",
      description: "Vuelo supersónico: oleadas intensas de drones, aves y muros aéreos.",
      day: {
        skyTop: "#1e3799",
        skyBottom: "#70a1ff",
        cloud: "#dff9fb",
        farBg: "#3c6382",
        nearBg: "#2c3e50",
        groundTop: "#00d2d3",
        groundFill: "#1e272e",
        groundDetail: "#48dbfb",
        sunMoon: "#ffffff"
      },
      night: {
        skyTop: "#070919",
        skyBottom: "#171c3d",
        cloud: "#293266",
        farBg: "#0e122b",
        nearBg: "#171d45",
        groundTop: "#ff4757",
        groundFill: "#060814",
        groundDetail: "#00d2d3",
        sunMoon: "#48dbfb"
      },
      obstacles: [
        { type: "skyBlock", weight: 34 },
        { type: "bird", weight: 26 },
        { type: "drone", weight: 40 }
      ]
    },
    {
      id: "planeBoss",
      number: 12,
      mode: "planeBoss",
      name: "El Avión Basurero",
      shortName: "N12: JEFE AVIÓN",
      difficulty: "Jefe Final",
      targetDistance: null,
      bossMaxHp: 8,
      baseSpeed: 390,
      maxSpeed: 540,
      accelPerSec: 3.5,
      spawnScale: 1.0,
      dayNightCycleDist: 280,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #ff4757 0%, #576574 55%, #ffd32a 100%)",
      description: "Destruye bolsas de basura para recoger misiles y derriba al avión jefe.",
      day: {
        skyTop: "#2c3e50",
        skyBottom: "#fd79a8",
        cloud: "#dfe6e9",
        farBg: "#636e72",
        nearBg: "#2d3436",
        groundTop: "#ff7675",
        groundFill: "#1e272e",
        groundDetail: "#636e72",
        sunMoon: "#ffeaa7"
      },
      night: {
        skyTop: "#090a1a",
        skyBottom: "#2b1236",
        cloud: "#442054",
        farBg: "#170c26",
        nearBg: "#24123b",
        groundTop: "#ff4757",
        groundFill: "#0b0714",
        groundDetail: "#ffd32a",
        sunMoon: "#ff6b81"
      },
      obstacles: []
    }
  ];

  const ENDLESS_LEVELS = [
    {
      id: "endless",
      number: 1,
      category: "endless",
      mode: "runner",
      name: "Infinito Clásico",
      shortName: "∞ CLÁSICO",
      difficulty: "Arcade ∞",
      targetDistance: null,
      baseSpeed: 365,
      maxSpeed: 840,
      accelPerSec: 8,
      spawnScale: 0.78,
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
    },
    {
      id: "endless_rooftops",
      number: 2,
      category: "endless",
      mode: "runner",
      name: "Infinito Techos",
      shortName: "∞ TECHOS",
      difficulty: "Arcade ∞",
      targetDistance: null,
      baseSpeed: 425,
      maxSpeed: 880,
      accelPerSec: 9.5,
      spawnScale: 0.7,
      dayNightCycleDist: 210,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #5f27cd 0%, #ff6b81 55%, #ff9f43 100%)",
      description: "Carrera infinita sobre los techos nocturnos con oleadas rápidas de suelo y aire.",
      day: {
        skyTop: "#3b3b98",
        skyBottom: "#82589f",
        cloud: "#b8a9c9",
        farBg: "#4b3869",
        nearBg: "#2c2447",
        groundTop: "#ff9f43",
        groundFill: "#2c2c54",
        groundDetail: "#706fd3",
        sunMoon: "#ffd32a"
      },
      night: {
        skyTop: "#0c0b1d",
        skyBottom: "#22183b",
        cloud: "#3c2a63",
        farBg: "#16112b",
        nearBg: "#231a42",
        groundTop: "#48dbfb",
        groundFill: "#110d21",
        groundDetail: "#ff6b81",
        sunMoon: "#f5f6fa"
      },
      obstacles: [
        { type: "hydrant", weight: 10 },
        { type: "trash", weight: 10 },
        { type: "antenna", weight: 16 },
        { type: "crate", weight: 12 },
        { type: "mouse", weight: 14 },
        { type: "bird", weight: 15 },
        { type: "drone", weight: 14 },
        { type: "skyDrop", weight: 9 }
      ]
    },
    {
      id: "endless_swim",
      number: 3,
      category: "endless",
      mode: "swim",
      name: "Infinito Buceo",
      shortName: "∞ BUCEO",
      difficulty: "Arcade ∞",
      targetDistance: null,
      baseSpeed: 345,
      maxSpeed: 720,
      accelPerSec: 7.5,
      spawnScale: 0.78,
      dayNightCycleDist: 250,
      bgStyle: "ocean",
      previewGradient: "linear-gradient(90deg, #00cec9 0%, #0984e3 55%, #6c5ce7 100%)",
      description: "Buceo infinito: esquiva o lanza bombas de proximidad y corta algas con X.",
      day: {
        skyTop: "#0984e3",
        skyBottom: "#062c54",
        cloud: "#74b9ff",
        farBg: "#0b4675",
        nearBg: "#072d4d",
        groundTop: "#00b894",
        groundFill: "#5c4d2e",
        groundDetail: "#00cec9",
        sunMoon: "#81ecec"
      },
      night: {
        skyTop: "#050714",
        skyBottom: "#02030a",
        cloud: "#141838",
        farBg: "#0a0e24",
        nearBg: "#060817",
        groundTop: "#ff4757",
        groundFill: "#0f0c1c",
        groundDetail: "#5352ed",
        sunMoon: "#ff4757"
      },
      obstacles: [
        { type: "proxMine", weight: 24 },
        { type: "seaweed", weight: 22 },
        { type: "seaWall", weight: 16 },
        { type: "jellyfish", weight: 18 },
        { type: "seaMine", weight: 12 },
        { type: "coral", weight: 8 }
      ]
    },
    {
      id: "endless_plane",
      number: 4,
      category: "endless",
      mode: "plane",
      name: "Infinito Avión",
      shortName: "∞ AVIÓN",
      difficulty: "Arcade ∞",
      targetDistance: null,
      baseSpeed: 405,
      maxSpeed: 800,
      accelPerSec: 8.5,
      spawnScale: 0.74,
      dayNightCycleDist: 230,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #00d2d3 0%, #54a0ff 50%, #ff6b81 100%)",
      description: "Vuelo infinito en mini-avión: esquiva bloques y derriba drones y aves.",
      day: {
        skyTop: "#1e3799",
        skyBottom: "#70a1ff",
        cloud: "#dff9fb",
        farBg: "#3c6382",
        nearBg: "#2c3e50",
        groundTop: "#00d2d3",
        groundFill: "#1e272e",
        groundDetail: "#48dbfb",
        sunMoon: "#ffffff"
      },
      night: {
        skyTop: "#070919",
        skyBottom: "#171c3d",
        cloud: "#293266",
        farBg: "#0e122b",
        nearBg: "#171d45",
        groundTop: "#ff4757",
        groundFill: "#060814",
        groundDetail: "#00d2d3",
        sunMoon: "#48dbfb"
      },
      obstacles: [
        { type: "skyBlock", weight: 34 },
        { type: "bird", weight: 30 },
        { type: "drone", weight: 36 }
      ]
    }
  ];

  const LEVELS = [...STORY_LEVELS, ...ENDLESS_LEVELS];

  function getLevelById(id) {
    return LEVELS.find((l) => l.id === id) || STORY_LEVELS[0];
  }

  function getNextLevel(id) {
    const idx = STORY_LEVELS.findIndex((l) => l.id === id);
    if (idx === -1 || idx + 1 >= STORY_LEVELS.length) return null;
    return STORY_LEVELS[idx + 1];
  }

  function isLevelUnlocked(id) {
    if (RC.Storage && RC.Storage.isDevUnlockAll()) return true;
    const lvl = LEVELS.find((l) => l.id === id);
    if (!lvl) return false;
    if (lvl.category === "endless") return true;
    const idx = STORY_LEVELS.findIndex((l) => l.id === id);
    if (idx <= 0) return true;
    if (!RC.Storage) return idx === 0;
    const prevLvl = STORY_LEVELS[idx - 1];
    return Boolean(RC.Storage.getLevelRecord(prevLvl.id).cleared);
  }

  function getCatSkinById(id) {
    return CAT_SKINS.find((c) => c.id === id) || CAT_SKINS[0];
  }

  RC.Levels = {
    LIST: LEVELS,
    STORY_LIST: STORY_LEVELS,
    ENDLESS_LIST: ENDLESS_LEVELS,
    CAT_SKINS,
    getLevelById,
    getNextLevel,
    isLevelUnlocked,
    getCatSkinById
  };
})(window.RunnerCat = window.RunnerCat || {});
