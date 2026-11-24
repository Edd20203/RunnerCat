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
    },
    // --- 10 Unlockable Cats (2 per Boss) ---
    {
      id: "gold_rooster",
      name: "Kikirikí",
      desc: "Dorado de granja",
      unlockBossId: "boss",
      unlockBossName: "Gallina Gigante",
      palette: {
        body: "#ffd32a",
        dark: "#cc8e00",
        light: "#fff2a6",
        eye: "#e84118",
        nose: "#ff6b81",
        collar: "#ff4757"
      }
    },
    {
      id: "feather_cream",
      name: "Pluma",
      desc: "Crema suave",
      pattern: "bow",
      bowColor: "#ffa502",
      unlockBossId: "boss",
      unlockBossName: "Gallina Gigante",
      palette: {
        body: "#fff1d0",
        dark: "#b5835a",
        light: "#ffffff",
        eye: "#5f27cd",
        nose: "#ff9ff3",
        collar: "#ffa502"
      }
    },
    {
      id: "coral_pink",
      name: "Coral",
      desc: "Rosa marino",
      unlockBossId: "squidBoss",
      unlockBossName: "Calamar Gigante",
      palette: {
        body: "#ff7979",
        dark: "#b33939",
        light: "#ffd3d3",
        eye: "#48dbfb",
        nose: "#ffffff",
        collar: "#00cec9"
      }
    },
    {
      id: "deep_teal",
      name: "Kraken",
      desc: "Azul abisal",
      pattern: "tabby",
      unlockBossId: "squidBoss",
      unlockBossName: "Calamar Gigante",
      palette: {
        body: "#00a8cc",
        dark: "#0c2461",
        light: "#81ecec",
        eye: "#ffd32a",
        nose: "#ff9ff3",
        collar: "#ff4757"
      }
    },
    {
      id: "ace_blue",
      name: "Piloto",
      desc: "As del cielo",
      unlockBossId: "planeBoss",
      unlockBossName: "Avión Basurero",
      palette: {
        body: "#54a0ff",
        dark: "#2e86de",
        light: "#dff9fb",
        eye: "#1e272e",
        nose: "#ff9f43",
        collar: "#ffd32a"
      }
    },
    {
      id: "crimson_jet",
      name: "Turbo",
      desc: "Rojo supersónico",
      pattern: "tabby",
      unlockBossId: "planeBoss",
      unlockBossName: "Avión Basurero",
      palette: {
        body: "#ee5253",
        dark: "#831616",
        light: "#ffcccc",
        eye: "#ffd32a",
        nose: "#ffffff",
        collar: "#48dbfb"
      }
    },
    {
      id: "vampire_cat",
      name: "Drácula",
      desc: "Conde felino",
      unlockBossId: "spookyBoss",
      unlockBossName: "Esqueleto Gigante",
      palette: {
        body: "#2c2440",
        dark: "#120c1c",
        light: "#a55eea",
        eye: "#ff4757",
        nose: "#ffffff",
        collar: "#ff4757"
      }
    },
    {
      id: "bone_white",
      name: "Calavera",
      desc: "Blanco espectral",
      pattern: "spots",
      unlockBossId: "spookyBoss",
      unlockBossName: "Esqueleto Gigante",
      palette: {
        body: "#dfe4ea",
        dark: "#2f3542",
        light: "#ffffff",
        eye: "#2ed573",
        nose: "#1e272e",
        collar: "#6c5ce7"
      }
    },
    {
      id: "cosmic_purple",
      name: "Astro",
      desc: "Viajero cósmico",
      unlockBossId: "spaceBoss",
      unlockBossName: "Nave Nodriza",
      palette: {
        body: "#6c5ce7",
        dark: "#341f97",
        light: "#a29bfe",
        eye: "#48dbfb",
        nose: "#ffd32a",
        collar: "#00d2d3"
      }
    },
    {
      id: "starlight_gold",
      name: "Estrella",
      desc: "Brillo estelar",
      pattern: "bow",
      bowColor: "#48dbfb",
      unlockBossId: "spaceBoss",
      unlockBossName: "Nave Nodriza",
      palette: {
        body: "#ffeaa7",
        dark: "#e17055",
        light: "#ffffff",
        eye: "#0984e3",
        nose: "#ff7675",
        collar: "#48dbfb"
      }
    },
    {
      id: "winicat",
      name: "Winicat",
      desc: "Beige con gorrito arcoíris",
      pattern: "hat",
      palette: {
        body: "#e6ccb2",
        dark: "#9c7a5b",
        light: "#fdf0d5",
        eye: "#1e272e",
        nose: "#ff7675",
        collar: "#ff9f43"
      }
    },
    {
      id: "champion_cat",
      name: "Campeón",
      desc: "Leyenda al acabar el juego",
      pattern: "crown",
      unlockBossId: "spaceBoss",
      unlockBossName: "Acabar el juego (N25)",
      palette: {
        body: "#fff8e7",
        dark: "#b8860b",
        light: "#ffffff",
        eye: "#48dbfb",
        nose: "#ff6b81",
        collar: "#ffd32a"
      }
    }
  ];

  const STORY_ZONES = [
    {
      id: "city",
      title: "ZONA 1: CIUDAD Y TECHOS",
      subtitle: "Salta huecos en los techos y derrota a la Gallina Gigante",
      bossId: "boss",
      gradient: "linear-gradient(135deg, #2c2447 0%, #eb7d5b 60%, #ffd32a 100%)"
    },
    {
      id: "ocean",
      title: "ZONA 2: ABISMO MARINO",
      subtitle: "Esquiva remolinos, lanza minas y vence al Calamar Gigante",
      bossId: "squidBoss",
      gradient: "linear-gradient(135deg, #071e3d 0%, #0984e3 60%, #00cec9 100%)"
    },
    {
      id: "sky",
      title: "ZONA 3: CIELOS EN MINI-AVIÓN",
      subtitle: "Evita tornados, dispara y derriba al Avión Basurero",
      bossId: "planeBoss",
      gradient: "linear-gradient(135deg, #3c8ce7 0%, #5f27cd 60%, #ff6b81 100%)"
    },
    {
      id: "spooky",
      title: "ZONA 4: TRANSILVANIA",
      subtitle: "Vuela como murciélago, evita fantasmas y fulmina al Esqueleto",
      bossId: "spookyBoss",
      gradient: "linear-gradient(135deg, #110c1c 0%, #6c5ce7 60%, #ff4757 100%)"
    },
    {
      id: "space",
      title: "ZONA 5: ESPACIO EXTERIOR",
      subtitle: "Gravedad lunar, láseres, OVNIs abductores y la Nave Nodriza",
      bossId: "spaceBoss",
      gradient: "linear-gradient(135deg, #040614 0%, #5352ed 60%, #00d2d3 100%)"
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
      id: "rooftops2",
      number: 4,
      mode: "runner",
      name: "Torreón Urbano",
      shortName: "N4: TORREÓN",
      difficulty: "Difícil",
      targetDistance: 1200,
      baseSpeed: 465,
      maxSpeed: 820,
      accelPerSec: 11.0,
      spawnScale: 0.65,
      dayNightCycleDist: 180,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #ff4757 0%, #ff9f43 50%, #5f27cd 100%)",
      description: "Antesala del jefe: techos altos con huecos, drones veloces y cajas móviles.",
      day: {
        skyTop: "#2c2447",
        skyBottom: "#eb7d5b",
        cloud: "#ffd3b6",
        farBg: "#4a304d",
        nearBg: "#2e1f36",
        groundTop: "#ff9f43",
        groundFill: "#2c2447",
        groundDetail: "#ff6b81",
        sunMoon: "#ffd32a"
      },
      night: {
        skyTop: "#090814",
        skyBottom: "#24163b",
        cloud: "#3d2661",
        farBg: "#150e29",
        nearBg: "#20153d",
        groundTop: "#48dbfb",
        groundFill: "#0f0a1c",
        groundDetail: "#ff4757",
        sunMoon: "#f5f6fa"
      },
      obstacles: [
        { type: "hydrant", weight: 10 },
        { type: "antenna", weight: 16 },
        { type: "crate", weight: 12 },
        { type: "mouse", weight: 14 },
        { type: "bird", weight: 16 },
        { type: "drone", weight: 18 },
        { type: "skyDrop", weight: 14 }
      ]
    },
    {
      id: "boss",
      number: 5,
      mode: "boss",
      name: "La Gallina Gigante",
      shortName: "N5: JEFE GALLINA",
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
      id: "ocean4",
      number: 9,
      mode: "swim",
      name: "Fosa Mariana",
      shortName: "N9: BUCEO IV",
      difficulty: "Experto",
      targetDistance: 1400,
      baseSpeed: 415,
      maxSpeed: 710,
      accelPerSec: 9.5,
      spawnScale: 0.66,
      dayNightCycleDist: 220,
      bgStyle: "ocean",
      previewGradient: "linear-gradient(90deg, #071e3d 0%, #6c5ce7 55%, #ff4757 100%)",
      description: "Corrientes letales con remolinos, bombas de proximidad y muros de algas.",
      day: {
        skyTop: "#0c2461",
        skyBottom: "#060e29",
        cloud: "#3c6382",
        farBg: "#12295c",
        nearBg: "#0a183b",
        groundTop: "#ff4757",
        groundFill: "#19182b",
        groundDetail: "#5352ed",
        sunMoon: "#48dbfb"
      },
      night: {
        skyTop: "#030510",
        skyBottom: "#010208",
        cloud: "#101533",
        farBg: "#070a1c",
        nearBg: "#040612",
        groundTop: "#ff6b81",
        groundFill: "#0a0814",
        groundDetail: "#4834d4",
        sunMoon: "#ff4757"
      },
      obstacles: [
        { type: "proxMine", weight: 30 },
        { type: "seaweed", weight: 26 },
        { type: "seaWall", weight: 14 },
        { type: "jellyfish", weight: 18 },
        { type: "seaMine", weight: 12 }
      ]
    },
    {
      id: "squidBoss",
      number: 10,
      mode: "swimBoss",
      name: "El Calamar Gigante",
      shortName: "N10: JEFE CALAMAR",
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
      id: "skyplane4",
      number: 14,
      mode: "plane",
      name: "Huracán Aéreo",
      shortName: "N14: AVIÓN IV",
      difficulty: "Experto",
      targetDistance: 1500,
      baseSpeed: 475,
      maxSpeed: 800,
      accelPerSec: 10.0,
      spawnScale: 0.62,
      dayNightCycleDist: 200,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #222f3e 0%, #00d2d3 50%, #ff4757 100%)",
      description: "Antesala del cielo: tornados implacables y escuadrones de drones.",
      day: {
        skyTop: "#130f40",
        skyBottom: "#5352ed",
        cloud: "#dff9fb",
        farBg: "#2c2c54",
        nearBg: "#1e1e3b",
        groundTop: "#ff9f43",
        groundFill: "#161626",
        groundDetail: "#48dbfb",
        sunMoon: "#ffd32a"
      },
      night: {
        skyTop: "#050612",
        skyBottom: "#141836",
        cloud: "#252c5e",
        farBg: "#0a0d21",
        nearBg: "#121633",
        groundTop: "#ff4757",
        groundFill: "#04050d",
        groundDetail: "#00d2d3",
        sunMoon: "#48dbfb"
      },
      obstacles: [
        { type: "skyBlock", weight: 32 },
        { type: "bird", weight: 24 },
        { type: "drone", weight: 44 }
      ]
    },
    {
      id: "planeBoss",
      number: 15,
      mode: "planeBoss",
      name: "El Avión Basurero",
      shortName: "N15: JEFE AVIÓN",
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
    },
    {
      id: "spooky1",
      number: 13,
      mode: "bat",
      thumbSprite: "tombstone",
      name: "Cementerio Sombrío",
      shortName: "N13: TRANSILVANIA I",
      difficulty: "Difícil",
      targetDistance: 950,
      baseSpeed: 360,
      maxSpeed: 610,
      accelPerSec: 7.0,
      spawnScale: 0.9,
      dayNightCycleDist: 280,
      bgStyle: "park",
      previewGradient: "linear-gradient(90deg, #2c2447 0%, #6c5ce7 55%, #ff793f 100%)",
      description: "Transfórmate en murciélago al volar (doble salto) y ataca esqueletos, arañas y cuervos.",
      day: {
        skyTop: "#2c2240",
        skyBottom: "#59437a",
        cloud: "#7b659e",
        farBg: "#3d2f57",
        nearBg: "#281e3b",
        groundTop: "#6ab04c",
        groundFill: "#2f2a38",
        groundDetail: "#574f66",
        sunMoon: "#ffeaa7"
      },
      night: {
        skyTop: "#110c1c",
        skyBottom: "#251a3d",
        cloud: "#3c2b61",
        farBg: "#19112b",
        nearBg: "#221738",
        groundTop: "#a3cb38",
        groundFill: "#171321",
        groundDetail: "#4834d4",
        sunMoon: "#f5f6fa"
      },
      obstacles: [
        { type: "tombstone", weight: 22 },
        { type: "miniSkeleton", weight: 28 },
        { type: "spider", weight: 18 },
        { type: "crow", weight: 20 },
        { type: "zombie", weight: 12 }
      ]
    },
    {
      id: "spooky2",
      number: 14,
      mode: "bat",
      thumbSprite: "zombie1",
      name: "Bosque Maldito",
      shortName: "N14: TRANSILVANIA II",
      difficulty: "Muy Difícil",
      targetDistance: 1150,
      baseSpeed: 395,
      maxSpeed: 675,
      accelPerSec: 8.2,
      spawnScale: 0.78,
      dayNightCycleDist: 250,
      bgStyle: "park",
      previewGradient: "linear-gradient(90deg, #1e272e 0%, #2ed573 50%, #9b59b6 100%)",
      description: "Zombis que vomitan, arañas venenosas y cuervos que lanzan huevos desde el aire.",
      day: {
        skyTop: "#1f2b38",
        skyBottom: "#405952",
        cloud: "#638076",
        farBg: "#2a3b38",
        nearBg: "#1b2624",
        groundTop: "#2ed573",
        groundFill: "#232927",
        groundDetail: "#4b5954",
        sunMoon: "#ffd32a"
      },
      night: {
        skyTop: "#0b1214",
        skyBottom: "#1a2b29",
        cloud: "#294541",
        farBg: "#111c1a",
        nearBg: "#182926",
        groundTop: "#7bed9f",
        groundFill: "#0f1413",
        groundDetail: "#2ed573",
        sunMoon: "#dff9fb"
      },
      obstacles: [
        { type: "tombstone", weight: 18 },
        { type: "miniSkeleton", weight: 24 },
        { type: "spider", weight: 20 },
        { type: "zombie", weight: 18 },
        { type: "crow", weight: 20 }
      ]
    },
    {
      id: "spooky3",
      number: 15,
      mode: "bat",
      thumbSprite: "crow1",
      name: "Cripta de Drácula",
      shortName: "N15: TRANSILVANIA III",
      difficulty: "Experto",
      targetDistance: 1350,
      baseSpeed: 430,
      maxSpeed: 740,
      accelPerSec: 9.2,
      spawnScale: 0.68,
      dayNightCycleDist: 220,
      bgStyle: "park",
      previewGradient: "linear-gradient(90deg, #6b0f1a 0%, #2c2240 55%, #ff4757 100%)",
      description: "Hordas nocturnas de esqueletos, zombis, arañas y cuervos sin descanso.",
      day: {
        skyTop: "#380d17",
        skyBottom: "#6e1b2d",
        cloud: "#963348",
        farBg: "#4a111f",
        nearBg: "#2e0a13",
        groundTop: "#ff6b81",
        groundFill: "#261218",
        groundDetail: "#702437",
        sunMoon: "#ffd32a"
      },
      night: {
        skyTop: "#140409",
        skyBottom: "#2b0914",
        cloud: "#4a1224",
        farBg: "#1f060e",
        nearBg: "#2e0a15",
        groundTop: "#ff4757",
        groundFill: "#12060a",
        groundDetail: "#ff6b81",
        sunMoon: "#ff4757"
      },
      obstacles: [
        { type: "tombstone", weight: 16 },
        { type: "miniSkeleton", weight: 24 },
        { type: "spider", weight: 20 },
        { type: "zombie", weight: 20 },
        { type: "crow", weight: 20 }
      ]
    },
    {
      id: "spooky4",
      number: 19,
      mode: "bat",
      thumbSprite: "spider1",
      name: "Castillo del Conde",
      shortName: "N19: TRANSILVANIA IV",
      difficulty: "Experto",
      targetDistance: 1500,
      baseSpeed: 455,
      maxSpeed: 780,
      accelPerSec: 9.8,
      spawnScale: 0.62,
      dayNightCycleDist: 200,
      bgStyle: "park",
      previewGradient: "linear-gradient(90deg, #140409 0%, #6c5ce7 50%, #ff4757 100%)",
      description: "Fantasmas acechantes, zombis y cuervos custodian la puerta del Esqueleto Gigante.",
      day: {
        skyTop: "#240714",
        skyBottom: "#52132e",
        cloud: "#782447",
        farBg: "#330a1c",
        nearBg: "#1f0611",
        groundTop: "#ff4757",
        groundFill: "#1a0b12",
        groundDetail: "#9b59b6",
        sunMoon: "#ffd32a"
      },
      night: {
        skyTop: "#0a0206",
        skyBottom: "#1f0614",
        cloud: "#380d25",
        farBg: "#12040b",
        nearBg: "#1c0612",
        groundTop: "#a55eea",
        groundFill: "#0d0409",
        groundDetail: "#ff4757",
        sunMoon: "#ff4757"
      },
      obstacles: [
        { type: "tombstone", weight: 16 },
        { type: "miniSkeleton", weight: 24 },
        { type: "spider", weight: 20 },
        { type: "zombie", weight: 20 },
        { type: "crow", weight: 20 }
      ]
    },
    {
      id: "spookyBoss",
      number: 20,
      mode: "batBoss",
      thumbSprite: "giantSkeleton1",
      name: "El Esqueleto Gigante",
      shortName: "N20: JEFE ESQUELETO",
      difficulty: "Jefe",
      targetDistance: null,
      bossMaxHp: 5,
      baseSpeed: 375,
      maxSpeed: 520,
      accelPerSec: 3.5,
      spawnScale: 1.0,
      dayNightCycleDist: 260,
      bgStyle: "park",
      previewGradient: "linear-gradient(90deg, #dfe4ea 0%, #2f3542 50%, #48dbfb 100%)",
      description: "Destruye 5 huesos o enemigos para invocar un rayo cargado contra el Esqueleto Gigante.",
      day: {
        skyTop: "#1c1a30",
        skyBottom: "#3d2f57",
        cloud: "#59487a",
        farBg: "#272040",
        nearBg: "#1a152b",
        groundTop: "#a4b0be",
        groundFill: "#222430",
        groundDetail: "#57606f",
        sunMoon: "#ffeaa7"
      },
      night: {
        skyTop: "#0a0914",
        skyBottom: "#1a152e",
        cloud: "#2d254d",
        farBg: "#120e21",
        nearBg: "#1a1530",
        groundTop: "#48dbfb",
        groundFill: "#0f0e17",
        groundDetail: "#747d8c",
        sunMoon: "#f5f6fa"
      },
      obstacles: []
    },
    {
      id: "space1",
      number: 17,
      mode: "space",
      thumbSprite: "alienWalker1",
      name: "Órbita Lunar",
      shortName: "N17: ESPACIO I",
      difficulty: "Difícil",
      targetDistance: 950,
      baseSpeed: 345,
      maxSpeed: 580,
      accelPerSec: 6.5,
      spawnScale: 0.92,
      dayNightCycleDist: 280,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #0c2461 0%, #6c5ce7 55%, #00d2d3 100%)",
      description: "Gravedad lunar: salta alto, flota y usa tu láser (X) contra alienígenas.",
      day: {
        skyTop: "#0a0e29",
        skyBottom: "#1b2452",
        cloud: "#2e3b7a",
        farBg: "#161d42",
        nearBg: "#222c5c",
        groundTop: "#a4b0be",
        groundFill: "#57606f",
        groundDetail: "#747d8c",
        sunMoon: "#dff9fb"
      },
      night: {
        skyTop: "#040614",
        skyBottom: "#0e1330",
        cloud: "#1c2454",
        farBg: "#090d24",
        nearBg: "#12193d",
        groundTop: "#70a1ff",
        groundFill: "#2f3542",
        groundDetail: "#57606f",
        sunMoon: "#48dbfb"
      },
      obstacles: [
        { type: "alienWalker", weight: 32 },
        { type: "alienFloater", weight: 32 },
        { type: "spaceRock", weight: 36 }
      ]
    },
    {
      id: "space2",
      number: 18,
      mode: "space",
      thumbSprite: "alienFloater1",
      name: "Cinturón Estelar",
      shortName: "N18: ESPACIO II",
      difficulty: "Muy Difícil",
      targetDistance: 1150,
      baseSpeed: 380,
      maxSpeed: 645,
      accelPerSec: 7.8,
      spawnScale: 0.8,
      dayNightCycleDist: 260,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #341f97 0%, #ee5253 55%, #48dbfb 100%)",
      description: "Aliens con disparo láser en tierra y aire. ¡Calcula tus saltos flotantes!",
      day: {
        skyTop: "#130f40",
        skyBottom: "#30336b",
        cloud: "#5352ed",
        farBg: "#201e54",
        nearBg: "#2c296e",
        groundTop: "#ff9f43",
        groundFill: "#3d3347",
        groundDetail: "#6c5ce7",
        sunMoon: "#ffd32a"
      },
      night: {
        skyTop: "#060417",
        skyBottom: "#17113b",
        cloud: "#2d2266",
        farBg: "#0d0929",
        nearBg: "#181242",
        groundTop: "#ff6b81",
        groundFill: "#1f1a33",
        groundDetail: "#4834d4",
        sunMoon: "#ff9ff3"
      },
      obstacles: [
        { type: "alienWalker", weight: 34 },
        { type: "alienFloater", weight: 36 },
        { type: "spaceRock", weight: 30 }
      ]
    },
    {
      id: "space3",
      number: 19,
      mode: "space",
      thumbSprite: "spaceRock",
      name: "Nebulosa Hostil",
      shortName: "N19: ESPACIO III",
      difficulty: "Experto",
      targetDistance: 1350,
      baseSpeed: 415,
      maxSpeed: 710,
      accelPerSec: 8.8,
      spawnScale: 0.7,
      dayNightCycleDist: 240,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #ff4757 0%, #5f27cd 55%, #00d2d3 100%)",
      description: "Oleadas espaciales intensas: alienígenas armados y rocas lunares.",
      day: {
        skyTop: "#2c0735",
        skyBottom: "#61135e",
        cloud: "#8e247d",
        farBg: "#3d0b47",
        nearBg: "#52105e",
        groundTop: "#00d2d3",
        groundFill: "#2a1b3d",
        groundDetail: "#ff6b81",
        sunMoon: "#ffffff"
      },
      night: {
        skyTop: "#08020d",
        skyBottom: "#1a0726",
        cloud: "#310f47",
        farBg: "#11041c",
        nearBg: "#1e0830",
        groundTop: "#48dbfb",
        groundFill: "#140b24",
        groundDetail: "#ff4757",
        sunMoon: "#48dbfb"
      },
      obstacles: [
        { type: "alienWalker", weight: 36 },
        { type: "alienFloater", weight: 38 },
        { type: "spaceRock", weight: 26 }
      ]
    },
    {
      id: "space4",
      number: 24,
      mode: "space",
      thumbSprite: "miniUfo1",
      name: "Agujero Negro",
      shortName: "N24: ESPACIO IV",
      difficulty: "Experto",
      targetDistance: 1500,
      baseSpeed: 440,
      maxSpeed: 750,
      accelPerSec: 9.5,
      spawnScale: 0.64,
      dayNightCycleDist: 210,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #000000 0%, #5352ed 50%, #ff4757 100%)",
      description: "Antesala final: OVNIs abductores con rayo de luz y lluvia de láseres alienígenas.",
      day: {
        skyTop: "#130f40",
        skyBottom: "#08061c",
        cloud: "#2e2770",
        farBg: "#191547",
        nearBg: "#0f0c2e",
        groundTop: "#48dbfb",
        groundFill: "#141026",
        groundDetail: "#ff4757",
        sunMoon: "#ff9ff3"
      },
      night: {
        skyTop: "#03020a",
        skyBottom: "#0a071c",
        cloud: "#1b1442",
        farBg: "#060414",
        nearBg: "#0d0924",
        groundTop: "#ff4757",
        groundFill: "#080614",
        groundDetail: "#48dbfb",
        sunMoon: "#48dbfb"
      },
      obstacles: [
        { type: "alienWalker", weight: 38 },
        { type: "alienFloater", weight: 40 },
        { type: "spaceRock", weight: 22 }
      ]
    },
    {
      id: "spaceBoss",
      number: 25,
      mode: "spaceBoss",
      thumbSprite: "mothership1",
      name: "La Nave Nodriza",
      shortName: "N25: JEFE FINAL",
      difficulty: "Jefe Final",
      targetDistance: null,
      bossMaxHp: 24,
      baseSpeed: 375,
      maxSpeed: 520,
      accelPerSec: 3.5,
      spawnScale: 1.0,
      dayNightCycleDist: 300,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #2ed573 0%, #5f27cd 50%, #ff4757 100%)",
      description: "Destruye mini-naves para mejorar tu láser, esquiva obstáculos y derrota a la Nave Nodriza.",
      day: {
        skyTop: "#0b0c24",
        skyBottom: "#251749",
        cloud: "#3f2b73",
        farBg: "#151238",
        nearBg: "#1f1a4d",
        groundTop: "#2ed573",
        groundFill: "#1e272e",
        groundDetail: "#48dbfb",
        sunMoon: "#ffd32a"
      },
      night: {
        skyTop: "#03040d",
        skyBottom: "#100826",
        cloud: "#221447",
        farBg: "#09061a",
        nearBg: "#110b2e",
        groundTop: "#ff4757",
        groundFill: "#0b0d14",
        groundDetail: "#2ed573",
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
    },
    {
      id: "endless_spooky",
      number: 5,
      category: "endless",
      mode: "bat",
      thumbSprite: "zombie1",
      name: "Infinito Transilvania",
      shortName: "∞ TRANSILVANIA",
      difficulty: "Arcade ∞",
      targetDistance: null,
      baseSpeed: 390,
      maxSpeed: 790,
      accelPerSec: 8.5,
      spawnScale: 0.74,
      dayNightCycleDist: 230,
      bgStyle: "park",
      previewGradient: "linear-gradient(90deg, #2c2240 0%, #6c5ce7 55%, #ff4757 100%)",
      description: "Transilvania infinita: vuela como murciélago y enfrenta esqueletos, arañas, zombis y cuervos.",
      day: {
        skyTop: "#2c2240",
        skyBottom: "#59437a",
        cloud: "#7b659e",
        farBg: "#3d2f57",
        nearBg: "#281e3b",
        groundTop: "#6ab04c",
        groundFill: "#2f2a38",
        groundDetail: "#574f66",
        sunMoon: "#ffeaa7"
      },
      night: {
        skyTop: "#110c1c",
        skyBottom: "#251a3d",
        cloud: "#3c2b61",
        farBg: "#19112b",
        nearBg: "#221738",
        groundTop: "#ff4757",
        groundFill: "#171321",
        groundDetail: "#4834d4",
        sunMoon: "#f5f6fa"
      },
      obstacles: [
        { type: "tombstone", weight: 18 },
        { type: "miniSkeleton", weight: 24 },
        { type: "spider", weight: 20 },
        { type: "zombie", weight: 18 },
        { type: "crow", weight: 20 }
      ]
    },
    {
      id: "endless_space",
      number: 6,
      category: "endless",
      mode: "space",
      thumbSprite: "alienFloater1",
      name: "Infinito Espacio",
      shortName: "∞ ESPACIO",
      difficulty: "Arcade ∞",
      targetDistance: null,
      baseSpeed: 375,
      maxSpeed: 760,
      accelPerSec: 8.2,
      spawnScale: 0.75,
      dayNightCycleDist: 240,
      bgStyle: "neon",
      previewGradient: "linear-gradient(90deg, #0c2461 0%, #6c5ce7 55%, #00d2d3 100%)",
      description: "Espacio infinito: gravedad lunar flotante, láser y oleadas de alienígenas armados.",
      day: {
        skyTop: "#0a0e29",
        skyBottom: "#1b2452",
        cloud: "#2e3b7a",
        farBg: "#161d42",
        nearBg: "#222c5c",
        groundTop: "#a4b0be",
        groundFill: "#57606f",
        groundDetail: "#747d8c",
        sunMoon: "#dff9fb"
      },
      night: {
        skyTop: "#040614",
        skyBottom: "#0e1330",
        cloud: "#1c2454",
        farBg: "#090d24",
        nearBg: "#12193d",
        groundTop: "#48dbfb",
        groundFill: "#140b24",
        groundDetail: "#ff4757",
        sunMoon: "#48dbfb"
      },
      obstacles: [
        { type: "alienWalker", weight: 35 },
        { type: "alienFloater", weight: 37 },
        { type: "spaceRock", weight: 28 }
      ]
    }
  ];

  // Normalize sequential story numbers (1..25) and zoneId tags
  STORY_LEVELS.forEach((lvl, i) => {
    lvl.number = i + 1;
    const m = lvl.mode;
    lvl.zoneId =
      m === "swim" || m === "swimBoss"
        ? "ocean"
        : m === "plane" || m === "planeBoss"
        ? "sky"
        : m === "bat" || m === "batBoss"
        ? "spooky"
        : m === "space" || m === "spaceBoss"
        ? "space"
        : "city";
    if (!lvl.shortName.startsWith(`N${lvl.number}:`)) {
      const colonIdx = lvl.shortName.indexOf(":");
      if (colonIdx !== -1) {
        lvl.shortName = `N${lvl.number}${lvl.shortName.slice(colonIdx)}`;
      }
    }
  });

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

  function isCatUnlocked(catId) {
    if (RC.Storage && RC.Storage.isDevUnlockAll()) return true;
    const skin = getCatSkinById(catId);
    if (!skin.unlockBossId) return true;
    if (!RC.Storage) return false;
    return Boolean(RC.Storage.getLevelRecord(skin.unlockBossId).cleared);
  }

  function areAllBossesCleared() {
    if (!RC.Storage) return false;
    const bossIds = ["boss", "squidBoss", "planeBoss", "spookyBoss", "spaceBoss"];
    return bossIds.every((id) => Boolean(RC.Storage.getLevelRecord(id).cleared));
  }

  function isInsanityUnlocked() {
    return areAllBossesCleared() || Boolean(RC.Storage && RC.Storage.isDevUnlockAll());
  }

  RC.Levels = {
    LIST: LEVELS,
    STORY_LIST: STORY_LEVELS,
    ENDLESS_LIST: ENDLESS_LEVELS,
    STORY_ZONES,
    CAT_SKINS,
    getLevelById,
    getNextLevel,
    isLevelUnlocked,
    getCatSkinById,
    isCatUnlocked,
    areAllBossesCleared,
    isInsanityUnlocked
  };
})(window.RunnerCat = window.RunnerCat || {});
