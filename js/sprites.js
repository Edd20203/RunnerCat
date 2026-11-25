/* ============================================================
   RunnerCat — Procedural Pixel-Art Sprite Engine
   ============================================================ */
(function (RC) {
  // Legend for Cat sprites:
  // B = body, D = dark/stripes/outline, L = light belly/muzzle,
  // E = eye, N = nose, C = collar, . = transparent
  const CAT_MATRICES = {
    run1: [
      ".........D..D...",
      "........DBDBBD..",
      ".DD.....DBBBBD..",
      "D..D....DBEBED..",
      "D......DDBBBBLD.",
      ".D...DDBBBBBBND.",
      "..DDDBBBBBCCDD..",
      "..DBBDDBBBBBD...",
      "..DBBBBBBBBBD...",
      "..DBLLLLLLBBD...",
      "..DBBDDDDDBB....",
      ".DBB......DBB...",
      "DB.........DB...",
      "................"
    ],
    run2: [
      ".........D..D...",
      "........DBDBBD..",
      "........DBBBBD..",
      "..DD....DBEBED..",
      ".D..D..DDBBBBLD.",
      ".D...DDBBBBBBND.",
      "..DDDBBBBBCCDD..",
      "..DBBDDBBBBBD...",
      "..DBBBBBBBBBD...",
      "..DBLLLLLLBBD...",
      "...DBDDDDDBB....",
      "....DBB..DB.....",
      "....DB....DB....",
      "................"
    ],
    jump: [
      "..........D..D..",
      ".........DBDBBD.",
      ".........DBBBBD.",
      "D........DBEBED.",
      "D......DDBBBBLD.",
      ".D...DDBBBBBBND.",
      "..DDDBBBBBCCDD..",
      "..DBBDDBBBBBD...",
      "..DBBBBBBBBBD...",
      ".DBBLLLLLLBB....",
      "DBB.......DBB...",
      "...........DB...",
      "................",
      "................"
    ],
    slash: [
      "..........D..D..",
      ".........DBDBBD.",
      ".D.......DBBBBD.",
      "D........DBEBED.",
      ".D.....DDBBBBLD.",
      "..D..DDBBBBBBND.",
      "..DDDBBBBBCCDDDD",
      "..DBBDDBBBBBLLLL",
      "..DBBBBBBBBBD...",
      "..DBLLLLLLBB....",
      ".DBB.....DB.....",
      "DB........DB....",
      "................",
      "................"
    ],
    hurt: [
      ".........D..D...",
      "........DBDBBD..",
      "D.......DBBBBD..",
      ".D......DLBLBD..",
      "..D....DDBEBEBD.",
      "..D..DDBBBBBBND.",
      "..DDDBBBBBCCDD..",
      "..DBBDDBBBBBD...",
      "..DBBBBBBBBBD...",
      "..DBLLLLLLBBD...",
      ".DB........DB...",
      "DB..........DB..",
      "................",
      "................"
    ],
    duck1: [
      "...........D..D...",
      "..........DBDBBD..",
      "DDD......DDBBBBD..",
      "...DDDDDDBBBEBED..",
      "..DBBDDBBBBBBBBLD.",
      ".DBBBBBBBBBCCCBND.",
      ".DBLLLLLLLLBBBDD..",
      "DBB........DBB....",
      ".................."
    ],
    duck2: [
      "...........D..D...",
      "..........DBDBBD..",
      ".DDD.....DDBBBBD..",
      "...DDDDDDBBBEBED..",
      "..DBBDDBBBBBBBBLD.",
      ".DBBBBBBBBBCCCBND.",
      ".DBLLLLLLLLBBBDD..",
      "..DBB....DBB......",
      ".................."
    ],
    swim1: [
      "........GGGGGG....",
      ".......GWWGGGGGG..",
      "......GGGD..DGGG..",
      "......GGDBDBBDGG..",
      ".DD...GGDBBBBDGG..",
      "D..D..GGDBEBEDGG..",
      ".DD..DDDDBBBBLDG..",
      "..DDDBBBBBBBBND...",
      ".DBBDDBBBBBCCDD...",
      "DBB..DBLLLLLBB....",
      "......DBB..DBB....",
      ".................."
    ],
    swim2: [
      "........GGGGGG....",
      ".......GWWGGGGGG..",
      "......GGGD..DGGG..",
      "......GGDBDBBDGG..",
      "......GGDBBBBDGG..",
      ".DD...GGDBEBEDGG..",
      "D..D.DDDDBBBBLDG..",
      ".DD..DBBBBBBBBND..",
      "..DDDBBBBBBCCDD...",
      "...DDBLLLLLBB.....",
      ".....DBB...DBB....",
      ".................."
    ],
    plane1: [
      "........GGGG......",
      ".......GWWGGG.....",
      ".......GDBBBBD..Y.",
      "..RR...GDBEBED..W.",
      ".RRRRRRRRBBBBRRRW.",
      "RRRRRRRRRRRRRRRRR.",
      ".RRRRRRYYYYYYRRRR.",
      "...RRRRRRRRRRRRR..",
      ".....DD......DD..."
    ],
    plane2: [
      "........GGGG......",
      ".......GWWGGG.....",
      ".......GDBBBBD....",
      "..RR...GDBEBED..W.",
      ".RRRRRRRRBBBBRRRW.",
      "RRRRRRRRRRRRRRRRR.",
      ".RRRRRRYYYYYYRRRR.",
      "...RRRRRRRRRRRRRY.",
      ".....DD......DD..."
    ],
    bat1: [
      "..DD..........DD..",
      ".DBBD..D..D..DBBD.",
      "DBBBBDDBDBBDDBBBBD",
      "DBBBBDBBBBBBDBBBBD",
      ".DBBBDBEBEDDBBBBD.",
      "..DBDDBBBBNDDDBD..",
      "...DD.DBBBD..DD...",
      ".......D.D........"
    ],
    bat2: [
      "......D....D......",
      ".....DBD..DBD.....",
      "...DDBBBBBBBBDD...",
      "..DBBDBEBEDDBBBD..",
      ".DBBBDBBBBNDBBBBD.",
      "DBBD..DBBBD..DBBBD",
      "DD.....D.D......DD",
      ".................."
    ]
  };

  // Claw slash effect frames (W = white core, O = orange/pink glow, Y = yellow spark)
  const CLAW_FRAMES = [
    [
      "....OO........",
      ".....WO.......",
      "......WO..OO..",
      ".......WO..WO.",
      "..OO....WO..WO",
      "...WO....W...W",
      "....WO.......Y",
      ".....WO.......",
      "......W.......",
      ".............."
    ],
    [
      "..OO..........",
      "...WOO........",
      "....WWOO..OO..",
      ".....WWWO..WOO",
      "OO....WWWO..WW",
      ".WOO...WWWO..W",
      "..WWOO..WWY..Y",
      "...WWWO..Y....",
      "....WWY.......",
      ".....Y........"
    ],
    [
      "..............",
      ".O............",
      "..OO.....O....",
      "...OY.....OO..",
      "....Y......OY.",
      ".O.....O....Y.",
      "..OO....Y.....",
      "...Y..........",
      "..............",
      ".............."
    ]
  ];

  // World sprites with built-in palettes
  const WORLD_SPRITES = {
    hydrant: {
      palette: { D: "#6b1515", R: "#e84118", H: "#ff7675", M: "#dcdde1" },
      matrix: [
        "...DDDD...",
        "..DRRRRD..",
        ".DDRHHDD..",
        "..DRRRRD..",
        "DDRRHRRRDD",
        "DMDRHRRDMD",
        "DDRRRRRRDD",
        "..DRHRRD..",
        "..DRHRRD..",
        "..DRHRRD..",
        "..DRRRRD..",
        ".DDRRRRDD.",
        "DDDDDDDDDD"
      ]
    },
    trash: {
      palette: { D: "#2f3640", G: "#718093", L: "#b2bec3", S: "#535c68" },
      matrix: [
        "....DDDD....",
        "..DDLLLLDD..",
        ".DLLLLLLLLD.",
        "DDDDDDDDDDDD",
        ".DGLGGLGGLD.",
        ".DGSGGSGGSD.",
        ".DGLGGLGGLD.",
        ".DGSGGSGGSD.",
        ".DGLGGLGGLD.",
        ".DGSGGSGGSD.",
        ".DGLGGLGGLD.",
        ".DGGGGGGGGD.",
        ".DDDDDDDDDD."
      ]
    },
    bush: {
      palette: { D: "#143d22", G: "#218c48", L: "#55c774", B: "#ff4757" },
      matrix: [
        ".....DDDDD.....",
        "...DDLLLLLDD...",
        "..DLLLGBGLLLD..",
        ".DLLGGGGGGGLLD.",
        "DDGGGBGGGGGBGDD",
        "DGGGGGGGGGGGGGD",
        "DGGDGGGGGGDGGGD",
        "DGGGGDGGDGGGGGD",
        ".DGGGGGGGGGGGD.",
        ".DDDDDDDDDDDDD."
      ]
    },
    antenna: {
      palette: { D: "#191c2b", M: "#8395a7", L: "#c8d6e5", R: "#ff4757", G: "#ff9f43" },
      matrix: [
        "....RR....",
        "...RGRR...",
        "....RR....",
        "....DM....",
        "..DDLMDD..",
        "....DM....",
        "...DMLD...",
        "..DM..MD..",
        "..DMMMMD..",
        ".DM....MD.",
        ".DMMMMMMD.",
        "DM......MD",
        "DMMMMMMMMD",
        "DDDDDDDDDD"
      ]
    },
    crate: {
      // Breakable wooden/cardboard crate with bright slash-able highlight
      palette: { D: "#4a2c14", B: "#b87435", L: "#e6a65c", T: "#ffeaa7" },
      matrix: [
        "DDDDDDDDDDDD",
        "DLLLLLLLLLLD",
        "DLBBBBBBBBBD",
        "DLBTTBBTTBBD",
        "DLBBTTTTBBBD",
        "DLBBBTTBBBBD",
        "DLBBBTTBBBBD",
        "DLBBTTTTBBBD",
        "DLBTTBBTTBBD",
        "DLBBBBBBBBBD",
        "DBBBBBBBBBBD",
        "DDDDDDDDDDDD"
      ]
    },
    mouse1: {
      palette: { D: "#222533", G: "#747d8c", L: "#ced6e0", P: "#ff9ff3", R: "#ff4757" },
      matrix: [
        "...DD.........",
        "..DPPD........",
        "..DPPD........",
        ".DGGGGDD......",
        "DGRGGGGGGDD...",
        "DGGLLGGGGGGDD.",
        ".DGGGGGGGGGGPP",
        "..DDGDD..DGDD.",
        "..DD......DD.."
      ]
    },
    mouse2: {
      palette: { D: "#222533", G: "#747d8c", L: "#ced6e0", P: "#ff9ff3", R: "#ff4757" },
      matrix: [
        "...DD.........",
        "..DPPD........",
        "..DPPD.....PP.",
        ".DGGGGDD..P...",
        "DGRGGGGGGDD...",
        "DGGLLGGGGGGD..",
        ".DGGGGGGGGGD..",
        "...DGDD.DGD...",
        "...DD....DD..."
      ]
    },
    bird1: {
      palette: { D: "#161925", B: "#3c40c6", L: "#575fcf", Y: "#ffd32a", R: "#ff4757" },
      matrix: [
        "......DDD.....",
        ".....DLLLD....",
        "....DBBBBBD...",
        "..DDDBBBBBBD..",
        "YYDRBBBBBBBDDD",
        "..DBBBBBBBBLLD",
        "...DDBBBBBDDD.",
        ".....DDDDD...."
      ]
    },
    bird2: {
      palette: { D: "#161925", B: "#3c40c6", L: "#575fcf", Y: "#ffd32a", R: "#ff4757" },
      matrix: [
        "..............",
        "..DDD.........",
        "YYDRBDDDD.....",
        "..DBBBBBBDDD..",
        "...DDBBBBBLLD.",
        ".....DBBBBBD..",
        "......DLLLD...",
        ".......DDD...."
      ]
    },
    drone1: {
      palette: { D: "#131626", M: "#576574", L: "#c8d6e5", C: "#48dbfb", R: "#ff4757" },
      matrix: [
        "CC..DDDDDD..CC",
        "..DDLLLLLLDD..",
        ".DMMMMMMMMMMD.",
        "DMMMRRRRMMMMMD",
        "DMMMRCCRRMMMMD",
        ".DMMMMMMMMMMD.",
        "..DDMMMMMMDD..",
        "...D..DD..D..."
      ]
    },
    drone2: {
      palette: { D: "#131626", M: "#576574", L: "#c8d6e5", C: "#48dbfb", R: "#ff4757" },
      matrix: [
        ".CC.DDDDDD.CC.",
        "..DDLLLLLLDD..",
        ".DMMMMMMMMMMD.",
        "DMMMRCCRRMMMMD",
        "DMMMRRRRMMMMMD",
        ".DMMMMMMMMMMD.",
        "..DDMMMMMMDD..",
        "..D...DD...D.."
      ]
    },
    fish: {
      palette: { D: "#0c2461", B: "#48dbfb", L: "#c7ecee", W: "#ffffff" },
      matrix: [
        "....DDDD....",
        "..DDLLLLDD..",
        "D.DLWBBBBBDD",
        "DDDBBBBBBBBD",
        "DDDBBBBBBBBD",
        "D.DDBBBBBBDD",
        "..DDLLLLDD..",
        "....DDDD...."
      ]
    },
    goldFish: {
      palette: { D: "#7d4e00", B: "#ffd32a", L: "#fff2a6", W: "#ffffff" },
      matrix: [
        "....DDDD....",
        "..DDLLLLDD..",
        "D.DLWBBBBBDD",
        "DDDBBBBBBBBD",
        "DDDBBBBBBBBD",
        "D.DDBBBBBBDD",
        "..DDLLLLDD..",
        "....DDDD...."
      ]
    },
    shield: {
      palette: { D: "#0a3d62", C: "#48dbfb", L: "#c7ecee", W: "#ffffff" },
      matrix: [
        "...DDDDD...",
        "..DCCLLCD..",
        ".DCWCCCCCD.",
        "DCWCCLLCCCD",
        "DCCCLLCCCCD",
        "DCCCLCCCCCD",
        "DCCCCLLCCCD",
        ".DCCCCCCCD.",
        "..DCCCCCD..",
        "...DDDDD..."
      ]
    },
    magnet: {
      palette: { D: "#222533", R: "#ff4757", L: "#ff7f8f", M: "#dfe4ea" },
      matrix: [
        ".DDD...DDD.",
        "DMMMD.DMMMD",
        "DMMMD.DMMMD",
        "DRRRD.DRRRD",
        "DRLRD.DRLRD",
        "DRRRD.DRRRD",
        "DRRRDDDRRRD",
        ".DRRRRRRRD.",
        "..DRRRRRD..",
        "...DDDDD..."
      ]
    },
    milk: {
      palette: { D: "#1e272e", W: "#ffffff", B: "#3742fa", L: "#70a1ff" },
      matrix: [
        "...DDDD...",
        "..DWWWWDD.",
        ".DLLLLLLLD",
        ".DWWWWWWWD",
        ".DWBBBBWWD",
        ".DWBBBBWWD",
        ".DWWWWWWWD",
        ".DWLLLLWWD",
        ".DWWWWWWWD",
        ".DDDDDDDDD"
      ]
    },
    seaWall: {
      palette: { D: "#1e3748", R: "#4a69bd", L: "#82ccdd", C: "#ffd32a" },
      matrix: [
        "DDDDDDDDDD",
        "DRLLLRRLLD",
        "DRRRCCRRRD",
        "DRRCLLCRRD",
        "DLLCRRRLLD",
        "DRRCRRRRRD",
        "DRRRCLLRRD",
        "DLLLRRCRRD",
        "DRRRRRCRLD",
        "DRLLCCRRRD",
        "DRRRRRRLLD",
        "DDDDDDDDDD"
      ]
    },
    jellyfish1: {
      palette: { D: "#4a144b", P: "#ff6b81", L: "#ff9ff3", W: "#ffffff" },
      matrix: [
        "...DDDDDD...",
        "..DPLLLPPD..",
        ".DPLWPPPPPD.",
        ".DPPPPPPPPD.",
        ".DDDDDDDDDD.",
        "..D.D..D.D..",
        ".D..D..D..D.",
        ".D...D..D.D."
      ]
    },
    jellyfish2: {
      palette: { D: "#4a144b", P: "#ff6b81", L: "#ff9ff3", W: "#ffffff" },
      matrix: [
        "...DDDDDD...",
        "..DPLLLPPD..",
        ".DPLWPPPPPD.",
        ".DPPPPPPPPD.",
        ".DDDDDDDDDD.",
        "..D..D.D..D.",
        "..D..D.D..D.",
        "...D.D..D..."
      ]
    },
    seaMine: {
      palette: { D: "#11141c", M: "#57606f", L: "#a4b0be", R: "#ff4757" },
      matrix: [
        "....DD....",
        ".D..DM..D.",
        "..DMMMMD..",
        ".DMMLMMMD.",
        "DDMMRRMMDD",
        "DDMMRRMMDD",
        ".DMMMMMMD.",
        "..DMMMMD..",
        ".D..DM..D.",
        "....DD...."
      ]
    },
    proxMine: {
      palette: { D: "#1a0d13", M: "#3d2c3e", L: "#7f6a85", R: "#ff4757", Y: "#ffd32a" },
      matrix: [
        "....YY....",
        ".R..DM..R.",
        "..DMMMMD..",
        ".DMMLMMMD.",
        "DDMMRRMMDD",
        "DDMMRYRMMD",
        ".DMMMMMMD.",
        "..DMMMMD..",
        ".R..DM..R.",
        "....YY...."
      ]
    },
    proxMineArmed: {
      palette: { D: "#4a0808", M: "#ff4757", L: "#ff9f43", R: "#ffffff", Y: "#ffd32a" },
      matrix: [
        "....RR....",
        ".Y..RM..Y.",
        "..RMMMMR..",
        ".RMMLMMMR.",
        "RRMMYYMMRR",
        "RRMMYRYMRR",
        ".RMMMMMMR.",
        "..RMMMMR..",
        ".Y..RM..Y.",
        "....RR...."
      ]
    },
    seaweed: {
      palette: { D: "#0a2e1c", G: "#168246", L: "#2ed573", Y: "#a3cb38" },
      matrix: [
        ".DD.DD.DD.",
        "DGGDGGDGGD",
        "DGLDGLDGLD",
        ".DGDDGGDGD",
        "DGLDGGLDGD",
        "DGGDGLDGLD",
        "DYYDGGDGGD",
        ".DGGDGDDGD",
        "DGLDGGDGLD",
        "DGGDGLDGGD",
        "DDDDDDDDDD"
      ]
    },
    coral: {
      palette: { D: "#5c162e", P: "#ff4757", O: "#ff7f50", L: "#ffa502" },
      matrix: [
        "..DD....DD..",
        ".DPPD..DOOD.",
        ".DPPD..DOOD.",
        ".DPPPDDPOOD.",
        "..DPPPPOOD..",
        "...DPPOOD...",
        "..DDPPPODD..",
        ".DLLPPPPOLD.",
        ".DDDDDDDDDD."
      ]
    },
    skyBlock: {
      palette: { D: "#1e272e", M: "#576574", L: "#c8d6e5", Y: "#ff9f43" },
      matrix: [
        "DDDDDDDDDDDD",
        "DLLLLLLLLLLD",
        "DLMMMMMMMMMD",
        "DLMYYMMYYMMD",
        "DLMMMMMMMMMD",
        "DLMYYMMYYMMD",
        "DLMMMMMMMMMD",
        "DLMMMMMMMMMD",
        "DDDDDDDDDDDD"
      ]
    },
    skyDrop: {
      palette: { D: "#2d1a0b", B: "#8c5327", L: "#c47d43", G: "#2ed573" },
      matrix: [
        "..GG....GG..",
        ".GDDGGGGDDG.",
        "..DDBBBBDD..",
        "..DBLLLLBD..",
        "..DBBBBBBD..",
        "...DBBBBD...",
        "....DDDD...."
      ]
    },
    hay: {
      palette: { D: "#6b470c", Y: "#e1b12c", L: "#fbc531", B: "#b57c16" },
      matrix: [
        "DDDDDDDDDDDD",
        "DLLLLLLLLLLD",
        "DYYYYYYYYYYD",
        "DBBBBBBBBBBD",
        "DYYYYYYYYYYD",
        "DLLLLLLLLLLD",
        "DBBBBBBBBBBD",
        "DYYYYYYYYYYD",
        "DDDDDDDDDDDD"
      ]
    },
    egg: {
      palette: { D: "#5c4d3c", W: "#fff8ee", L: "#ffffff", S: "#e6d8c3" },
      matrix: [
        "...DDDD...",
        "..DLLWWD..",
        ".DLWWWWWD.",
        ".DWWWWWWSD",
        ".DWWWWWSSD",
        ".DWWWWSSSD",
        "..DSSSSSD.",
        "...DDDDD.."
      ]
    },
    chicken1: {
      palette: { D: "#2f1b14", W: "#ffffff", S: "#dfe4ea", R: "#ff4757", Y: "#ffa502", E: "#1e272e" },
      matrix: [
        "......RRRR....",
        ".....RRRRRR...",
        "....DDDDDDDD..",
        "...DWWWWWWWWD.",
        "..DWWWEWWWWWD.",
        ".YYDWWWWWWWWD.",
        "..DDWWWWWWWSD.",
        "..DWWWWSSSSSD.",
        ".DWWWWWSSSSSSD",
        ".DWWWWWWSSSSSD",
        "..DWWWWWWWWSD.",
        "...DDDDDDDDD..",
        "....YY...YY...",
        "...YY.....YY.."
      ]
    },
    chicken2: {
      palette: { D: "#2f1b14", W: "#ffffff", S: "#dfe4ea", R: "#ff4757", Y: "#ffa502", E: "#1e272e" },
      matrix: [
        "......RRRR....",
        ".....RRRRRR...",
        "....DDDDDDDD..",
        "...DWWWWWWWWD.",
        "..DWWWEWWWWWD.",
        ".YYDWWWWWWWWD.",
        "..DDWWWWWWWSD.",
        ".DWWWWSSSSSSD.",
        "DWWWWWWSSSSSSD",
        ".DWWWWWWSSSSSD",
        "..DWWWWWWWWSD.",
        "...DDDDDDDDD..",
        ".....YY..YY...",
        ".....YY..YY..."
      ]
    },
    chickenHurt: {
      palette: { D: "#701414", W: "#ffd32a", S: "#ff9f43", R: "#ff4757", Y: "#ffffff", E: "#ff4757" },
      matrix: [
        "......RRRR....",
        ".....RRRRRR...",
        "....DDDDDDDD..",
        "...DWWWWWWWWD.",
        "..DWWWEWWWWWD.",
        ".YYDWWWWWWWWD.",
        "..DDWWWWWWWSD.",
        "..DWWWWSSSSSD.",
        ".DWWWWWSSSSSSD",
        ".DWWWWWWSSSSSD",
        "..DWWWWWWWWSD.",
        "...DDDDDDDDD..",
        "....YY...YY...",
        "...YY.....YY.."
      ]
    },
    piranha1: {
      palette: { D: "#1d0b24", R: "#ff4757", P: "#ff6b81", W: "#ffffff", Y: "#ffd32a" },
      matrix: [
        ".....DDDD.....",
        "...DDRRRRDD...",
        "..DRRRRRRRRD..",
        ".DRWWRRRRRRPP.",
        "DWWRRRRRRRRPP.",
        "DDWWWRRRRRRPP.",
        ".DRRRRRRRRRPP.",
        "..DDRRRRRRDD..",
        "....DDDDDD...."
      ]
    },
    piranha2: {
      palette: { D: "#1d0b24", R: "#ff4757", P: "#ff6b81", W: "#ffffff", Y: "#ffd32a" },
      matrix: [
        ".....DDDD.....",
        "...DDRRRRDD...",
        "..DRRRRRRRRD..",
        ".DRWWRRRRRRPP.",
        "DWWWRRRRRRRPP.",
        "DWWRRRRRRRRPP.",
        ".DRRRRRRRRRPP.",
        "..DDRRRRRRDD..",
        "....DDDDDD...."
      ]
    },
    squid1: {
      palette: { D: "#2b0c3b", P: "#9b59b6", L: "#d980fa", W: "#ffffff", E: "#ffd32a" },
      matrix: [
        "......DDDDDD......",
        "....DDLLLLLLDD....",
        "...DLPPPPPPPPLD...",
        "..DLPPPPPPPPPPPD..",
        "..DPPPPPPPEEPPPD..",
        "..DPPPPPPPWWPPPD..",
        "...DPPPPPPPPPPPD..",
        "....DDPPPPPPPDD...",
        "..DDD.DPPPPPD.DDD.",
        ".DPPD.DPD.DPD.DPPD",
        "DPPD.DPD...DPD.DPP",
        "DDD..DD.....DD..DD"
      ]
    },
    squid2: {
      palette: { D: "#2b0c3b", P: "#9b59b6", L: "#d980fa", W: "#ffffff", E: "#ffd32a" },
      matrix: [
        "......DDDDDD......",
        "....DDLLLLLLDD....",
        "...DLPPPPPPPPLD...",
        "..DLPPPPPPPPPPPD..",
        "..DPPPPPPPEEPPPD..",
        "..DPPPPPPPWWPPPD..",
        "...DPPPPPPPPPPPD..",
        "....DDPPPPPPPDD...",
        "...DD.DPPPPPD.DD..",
        "..DPD.DPD.DPD.DPD.",
        ".DPD..DP...DP..DPD",
        ".DD...DD...DD...DD"
      ]
    },
    squidHurt: {
      palette: { D: "#6b0f1a", P: "#ff4757", L: "#ffd32a", W: "#ffffff", E: "#ff4757" },
      matrix: [
        "......DDDDDD......",
        "....DDLLLLLLDD....",
        "...DLPPPPPPPPLD...",
        "..DLPPPPPPPPPPPD..",
        "..DPPPPPPPEEPPPD..",
        "..DPPPPPPPWWPPPD..",
        "...DPPPPPPPPPPPD..",
        "....DDPPPPPPPDD...",
        "..DDD.DPPPPPD.DDD.",
        ".DPPD.DPD.DPD.DPPD",
        "DPPD.DPD...DPD.DPP",
        "DDD..DD.....DD..DD"
      ]
    },
    trashBag: {
      palette: { D: "#1a2018", G: "#4b6344", L: "#7f9c6e", T: "#ffd32a" },
      matrix: [
        "....DDDD....",
        "...DGGGGD...",
        "....TTTT....",
        "..DDGGGGDD..",
        ".DGGLLLLGGD.",
        "DGGGLLLLGGGD",
        "DGGGGGGGGGGD",
        "DGGDGGGGDGGD",
        ".DGGGGGGGGD.",
        "..DDDDDDDD.."
      ]
    },
    missilePickup: {
      palette: { D: "#1e272e", R: "#ff4757", W: "#ffffff", Y: "#ffd32a" },
      matrix: [
        ".....DDD....",
        "...DDRRRD...",
        "..DRWWWRRD..",
        ".DRRWWWWWRD.",
        "YYRRRRRRRRRD",
        "YYRRRRRRRRRD",
        ".DRRWWWWWRD.",
        "..DRWWWRRD..",
        "...DDRRRD...",
        ".....DDD...."
      ]
    },
    missile: {
      palette: { D: "#1e272e", R: "#ff4757", W: "#ffffff", Y: "#ffd32a", O: "#ff9f43" },
      matrix: [
        "........DDD...",
        "..O...DDRRRDD.",
        "YYOODDRWWWWWRD",
        "YYWWRRRRRRRRRD",
        "..O...DDRRRDD.",
        "........DDD..."
      ]
    },
    bossPlane1: {
      palette: { D: "#161822", M: "#576574", L: "#c8d6e5", R: "#ff4757", C: "#48dbfb", Y: "#ffd32a" },
      matrix: [
        "...........DDDDDD...",
        "..........DMMMMMMD..",
        "....DDDDDDMMMMRRMD..",
        "..DDCCCCCDMMMMMMMD..",
        "YDMMMMMMMMMMMMMMMRRD",
        ".DMMMMMMMMMMMMMMMRRD",
        "..DDDDLLLLLLLLDDDD..",
        ".....DMMMMMMMMD.....",
        "......DD....DD......"
      ]
    },
    bossPlane2: {
      palette: { D: "#161822", M: "#576574", L: "#c8d6e5", R: "#ff4757", C: "#48dbfb", Y: "#ffd32a" },
      matrix: [
        "...........DDDDDD...",
        "..........DMMMMMMD..",
        "....DDDDDDMMMMRRMD..",
        "..DDCCCCCDMMMMMMMD..",
        ".DMMMMMMMMMMMMMMMRRD",
        "YDMMMMMMMMMMMMMMMRRD",
        "..DDDDLLLLLLLLDDDD..",
        ".....DMMMMMMMMD.....",
        "......DD....DD......"
      ]
    },
    bossPlaneHurt: {
      palette: { D: "#5c0f0f", M: "#ff4757", L: "#ffd32a", R: "#ffffff", C: "#ffd32a", Y: "#ffffff" },
      matrix: [
        "...........DDDDDD...",
        "..........DMMMMMMD..",
        "....DDDDDDMMMMRRMD..",
        "..DDCCCCCDMMMMMMMD..",
        "YDMMMMMMMMMMMMMMMRRD",
        ".DMMMMMMMMMMMMMMMRRD",
        "..DDDDLLLLLLLLDDDD..",
        ".....DMMMMMMMMD.....",
        "......DD....DD......"
      ]
    },
    alienWalker1: {
      palette: { D: "#0e2918", G: "#2ed573", L: "#7bed9f", E: "#ff4757", P: "#a55eea" },
      matrix: [
        "....PP..PP....",
        "....DD..DD....",
        "...DGGGGGGD...",
        "..DGLGGGGGGD..",
        "..DGEGGGGEGD..",
        "..DGGGGGGGGD..",
        "...DDGGGGDD...",
        "..DGGGGGGGGD..",
        ".DGG.DGGD.GGD.",
        ".DD..DGGD..DD.",
        "....DD..DD...."
      ]
    },
    alienWalker2: {
      palette: { D: "#0e2918", G: "#2ed573", L: "#7bed9f", E: "#ff4757", P: "#a55eea" },
      matrix: [
        "....PP..PP....",
        "....DD..DD....",
        "...DGGGGGGD...",
        "..DGLGGGGGGD..",
        "..DGEGGGGEGD..",
        "..DGGGGGGGGD..",
        "...DDGGGGDD...",
        "..DGGGGGGGGD..",
        "...DGD..DGD...",
        "..DD......DD..",
        ".DD........DD."
      ]
    },
    alienFloater1: {
      palette: { D: "#1e0c36", P: "#a55eea", L: "#d980fa", C: "#48dbfb", R: "#ff4757" },
      matrix: [
        "....DDDDDD....",
        "..DDLLLLLLDD..",
        ".DLPPPPPPPPLD.",
        "DPPCPPPPPCPPPD",
        "DPPPPPPPPPPPPD",
        ".DDDDDDDDDDDD.",
        "..D..D..D..D..",
        ".D...R..R...D."
      ]
    },
    alienFloater2: {
      palette: { D: "#1e0c36", P: "#a55eea", L: "#d980fa", C: "#48dbfb", R: "#ff4757" },
      matrix: [
        "....DDDDDD....",
        "..DDLLLLLLDD..",
        ".DLPPPPPPPPLD.",
        "DPPCPPPPPCPPPD",
        "DPPPPPPPPPPPPD",
        ".DDDDDDDDDDDD.",
        "...D.D..D.D...",
        "..D..R..R..D.."
      ]
    },
    spaceRock: {
      palette: { D: "#1e272e", M: "#576574", L: "#a4b0be", C: "#70a1ff" },
      matrix: [
        "....DDDD....",
        "..DDLLLLDD..",
        ".DLMMMMCCLD.",
        "DMMMMMCCMMMD",
        "DMMCCMMMMMMD",
        "DMMMMMMMMMMD",
        ".DMMMMMMMMD.",
        "DDDDDDDDDDDD"
      ]
    },
    miniUfo1: {
      palette: { D: "#161822", C: "#48dbfb", M: "#747d8c", L: "#dfe4ea", R: "#ff4757" },
      matrix: [
        "....DDDD....",
        "...DCCCCD...",
        "..DDDDDDDD..",
        ".DLLLLLLLLD.",
        "DMMMRMMMRMMD",
        ".DDDDDDDDDD."
      ]
    },
    miniUfo2: {
      palette: { D: "#161822", C: "#48dbfb", M: "#747d8c", L: "#dfe4ea", Y: "#ffd32a" },
      matrix: [
        "....DDDD....",
        "...DCCCCD...",
        "..DDDDDDDD..",
        ".DLLLLLLLLD.",
        "DMMMYMMMYMMD",
        ".DDDDDDDDDD."
      ]
    },
    weaponPickup: {
      palette: { D: "#1e272e", Y: "#ffd32a", C: "#48dbfb", W: "#ffffff" },
      matrix: [
        "...DDDDDD...",
        "..DYYYYYYD..",
        ".DYWWWWWWYD.",
        "DYWWCCCCWWYD",
        "DYWCCCCCCWYD",
        "DYWWCCCCWWYD",
        ".DYWWWWWWYD.",
        "..DYYYYYYD..",
        "...DDDDDD..."
      ]
    },
    mothership1: {
      palette: { D: "#161426", M: "#5352ed", L: "#70a1ff", C: "#48dbfb", R: "#ff4757", Y: "#ffd32a" },
      matrix: [
        ".......DDDDDD.......",
        ".....DDCCCCCCDD.....",
        "....DCCCCCCCCCCD....",
        "..DDDDDDDDDDDDDDDD..",
        ".DLLLLLLLLLLLLLLLLD.",
        "DMMRMMMRMMMMRMMMRMMD",
        "DMMMMMMMMMMMMMMMMMMD",
        ".DDDDYYDDDDDDYYDDDD.",
        ".....DD......DD....."
      ]
    },
    mothership2: {
      palette: { D: "#161426", M: "#5352ed", L: "#70a1ff", C: "#48dbfb", R: "#ff4757", Y: "#ffd32a" },
      matrix: [
        ".......DDDDDD.......",
        ".....DDCCCCCCDD.....",
        "....DCCCCCCCCCCD....",
        "..DDDDDDDDDDDDDDDD..",
        ".DLLLLLLLLLLLLLLLLD.",
        "DMMYMMMYMMMMYMMMYMMD",
        "DMMMMMMMMMMMMMMMMMMD",
        ".DDDDCCDDDDDDCCDDDD.",
        ".....DD......DD....."
      ]
    },
    mothershipHurt: {
      palette: { D: "#5c0f0f", M: "#ff4757", L: "#ffd32a", C: "#ffffff", R: "#ffffff", Y: "#ffd32a" },
      matrix: [
        ".......DDDDDD.......",
        ".....DDCCCCCCDD.....",
        "....DCCCCCCCCCCD....",
        "..DDDDDDDDDDDDDDDD..",
        ".DLLLLLLLLLLLLLLLLD.",
        "DMMRMMMRMMMMRMMMRMMD",
        "DMMMMMMMMMMMMMMMMMMD",
        ".DDDDYYDDDDDDYYDDDD.",
        ".....DD......DD....."
      ]
    },
    grandma: {
      palette: { D: "#2c1d18", H: "#dfe4ea", S: "#ffdfc4", P: "#ff9ff3", B: "#70a1ff", W: "#ffffff" },
      matrix: [
        "....HHHH....",
        "...HHHHHH...",
        "...HSSSSHH..",
        "...DSSDSSH..",
        "....SSSS....",
        "..DDPPPPDD..",
        ".DPPPPPPPPD.",
        ".DPWWPPWWPD.",
        "..DPPPPPPD..",
        "..DBBBBBBD..",
        "..DBBBBBBD..",
        "...DD..DD..."
      ]
    },
    tombstone: {
      palette: { D: "#1e272e", M: "#747d8c", L: "#ced6e0", S: "#57606f" },
      matrix: [
        "...DDDDDD...",
        "..DLLLLLLD..",
        ".DLMMMMMMLD.",
        ".DMMDDDDMMD.",
        ".DMMMDMMMMD.",
        ".DMMDDDDMMD.",
        ".DMMMDMMMMD.",
        ".DMMMDMMMMD.",
        ".DMMMMMMMMD.",
        "DDSSSSSSSSDD",
        "DDDDDDDDDDDD"
      ]
    },
    miniSkeleton1: {
      palette: { D: "#1e272e", W: "#f5f6fa", S: "#ced6e0", E: "#ff4757" },
      matrix: [
        "...DDDDDD...",
        "..DWWWWWWD..",
        "..DWEWWEWD..",
        "..DWWWWWWD..",
        "...DWDDWD...",
        "..DDWWWWDD..",
        ".DW.DSSD.WD.",
        "....DSSD....",
        "...DW..WD...",
        "..DD....DD.."
      ]
    },
    miniSkeleton2: {
      palette: { D: "#1e272e", W: "#f5f6fa", S: "#ced6e0", E: "#ff4757" },
      matrix: [
        "...DDDDDD...",
        "..DWWWWWWD..",
        "..DWEWWEWD..",
        "..DWWWWWWD..",
        "...DWDDWD...",
        "..DDWWWWDD..",
        "....DSSDDW..",
        "....DSSD....",
        "....DW.WD...",
        "....DD..DD.."
      ]
    },
    spider1: {
      palette: { D: "#140c1c", P: "#6c5ce7", R: "#ff4757" },
      matrix: [
        ".D..DDDD..D.",
        "D.DDPPPPDD.D",
        ".DDPRPPPRDD.",
        "DDPPPPPPPPDD",
        ".D.DDDDDD.D.",
        "D..D....D..D"
      ]
    },
    spider2: {
      palette: { D: "#140c1c", P: "#6c5ce7", R: "#ff4757" },
      matrix: [
        "D...DDDD...D",
        ".DDDPPPPDDD.",
        "D.DPRPPPRD.D",
        ".DPPPPPPPPD.",
        "D..DDDDDD..D",
        "...D....D..."
      ]
    },
    zombie1: {
      palette: { D: "#132917", G: "#2ed573", L: "#7bed9f", P: "#5f27cd", E: "#ffd32a" },
      matrix: [
        "...DDDDDD...",
        "..DGGGGGGD..",
        "..DGEGGGED..",
        "..DGGGGGGD..",
        "...DDGGDD...",
        "DDDPPPPPPD..",
        "GGDPPPPPPD..",
        "...DPPPPD...",
        "..DG....GD..",
        "..DD....DD.."
      ]
    },
    zombie2: {
      palette: { D: "#132917", G: "#2ed573", L: "#7bed9f", P: "#5f27cd", E: "#ffd32a" },
      matrix: [
        "...DDDDDD...",
        "..DGGGGGGD..",
        "..DGEGGGED..",
        "..DGGGGGGD..",
        "...DDGGDD...",
        ".DDPPPPPPD..",
        "GGDPPPPPPD..",
        "...DPPPPD...",
        "...DG..GD...",
        "...DD..DD..."
      ]
    },
    crow1: {
      palette: { D: "#0c0d14", B: "#2f3640", L: "#57606f", Y: "#ffa502", E: "#ff4757" },
      matrix: [
        ".....DDDD...",
        "YYDDBBBBBD..",
        "..DBEBLLLBD.",
        "...DBBBBBBD.",
        "....DDBBDDD.",
        "......DD...."
      ]
    },
    crow2: {
      palette: { D: "#0c0d14", B: "#2f3640", L: "#57606f", Y: "#ffa502", E: "#ff4757" },
      matrix: [
        "..DD........",
        "YYDBBDDDD...",
        "..DBEBLLLBD.",
        "...DBBBBBBD.",
        ".....DDBBDD.",
        ".......DD..."
      ]
    },
    bone: {
      palette: { D: "#2f3640", W: "#ffffff", S: "#dfe4ea" },
      matrix: [
        ".DD....DD.",
        "DWWD..DWWD",
        ".DWWWWWWSD",
        "DWWD..DWWD",
        ".DD....DD."
      ]
    },
    vomitGlob: {
      palette: { D: "#143d18", G: "#2ed573", L: "#a3cb38" },
      matrix: [
        "..DDDD..",
        ".DGLLGD.",
        "DGGGGGGD",
        ".DDDDDD."
      ]
    },
    giantSkeleton1: {
      palette: { D: "#191b26", W: "#f5f6fa", S: "#b2bec3", E: "#ff4757", P: "#6c5ce7" },
      matrix: [
        "....DDDDDDDD....",
        "...DWWWWWWWWD...",
        "..DWWWEWWWEWWD..",
        "..DWWWWDDWWWWD..",
        "...DWDDDDDDWD...",
        "....DWWWWWWD....",
        ".DDDWWWWWWWWDDD.",
        "DWWWDSSSSSSDWWWD",
        "DWW.DWWWWWWSD.WW",
        "....DSSSSSSD....",
        "...DWW....WWD...",
        "..DWW......WWD..",
        "..DDD......DDD.."
      ]
    },
    giantSkeleton2: {
      palette: { D: "#191b26", W: "#f5f6fa", S: "#b2bec3", E: "#ff4757", P: "#6c5ce7" },
      matrix: [
        "....DDDDDDDD....",
        "...DWWWWWWWWD...",
        "..DWWWEWWWEWWD..",
        "..DWWWWDDWWWWD..",
        "...DWDDDDDDWD...",
        "....DWWWWWWD....",
        "..DDWWWWWWWWDD..",
        ".DWWDSSSSSSDWWWD",
        ".DW.DWWWWWWSD.WW",
        "....DSSSSSSD....",
        "....DWW..WWD....",
        "...DWW....WWD...",
        "...DDD....DDD..."
      ]
    },
    giantSkeletonHurt: {
      palette: { D: "#5c0f0f", W: "#ffd32a", S: "#48dbfb", E: "#ffffff", P: "#ff4757" },
      matrix: [
        "....DDDDDDDD....",
        "...DWWWWWWWWD...",
        "..DWWWEWWWEWWD..",
        "..DWWWWDDWWWWD..",
        "...DWDDDDDDWD...",
        "....DWWWWWWD....",
        ".DDDWWWWWWWWDDD.",
        "DWWWDSSSSSSDWWWD",
        "DWW.DWWWWWWSD.WW",
        "....DSSSSSSD....",
        "...DWW....WWD...",
        "..DWW......WWD..",
        "..DDD......DDD.."
      ]
    },
    heart: {
      palette: { D: "#4a0814", R: "#ff4757", L: "#ff7f8f", W: "#ffffff" },
      matrix: [
        ".DDD....DDD.",
        "DRRRD..DRRRD",
        "DRWWRDDRRRRD",
        "DRWRRRRRRRRD",
        "DRRRRRRRRRRD",
        ".DRRRRRRRRD.",
        "..DRRRRRRD..",
        "...DRRRRD...",
        "....DRRD....",
        ".....DD....."
      ]
    },
    movingCrate: {
      palette: { D: "#3d220c", B: "#e67e22", L: "#ffd32a", W: "#ffffff" },
      matrix: [
        "WW..DDDDDDDD..WW",
        ".WW.DLLLLLLD.WW.",
        "....DLBBBBLD....",
        "....DLBWWBLD....",
        "....DLBBBBLD....",
        "....DLBBBBLD....",
        "....DDDDDDDD...."
      ]
    },
    whirlpool1: {
      palette: { D: "#071e3d", B: "#0984e3", C: "#48dbfb", W: "#dff9fb" },
      matrix: [
        "..DDDDDDDDDD..",
        ".DCCCCCCCCCCD.",
        "DCWWWWWWWWWCCD",
        "DCWBBBBBBBBWCD",
        ".DCWBBWWBBWCD.",
        "..DCWBWWBWCD..",
        "...DCBBBBCD...",
        "....DDDDDD...."
      ]
    },
    whirlpool2: {
      palette: { D: "#071e3d", B: "#0984e3", C: "#48dbfb", W: "#dff9fb" },
      matrix: [
        "..DDDDDDDDDD..",
        ".DBBBBBBBBBBD.",
        "DBCCCCCCCCCCBD",
        "DBCWWWWWWWWCBD",
        ".DBCWBBBBWCBD.",
        "..DBCBBBBWBD..",
        "...DBCCCCBD...",
        "....DDDDDD...."
      ]
    },
    tornado1: {
      palette: { D: "#2f3640", M: "#747d8c", L: "#dfe4ea", W: "#ffffff" },
      matrix: [
        "DDDDDDDDDDDDDD",
        "DLLLLLLLLLLLLD",
        ".DMMMMMMMMMMD.",
        "..DLLLLLLLLD..",
        "...DMMMMMMD...",
        "....DWWWWD....",
        "....DMMMMD....",
        ".....DLLD.....",
        "......DD......"
      ]
    },
    tornado2: {
      palette: { D: "#2f3640", M: "#747d8c", L: "#dfe4ea", W: "#ffffff" },
      matrix: [
        "DDDDDDDDDDDDDD",
        ".DLLLLLLLLLLD.",
        "DMMMMMMMMMMMMD",
        "..DWWWWWWWWD..",
        "...DMMMMMMD...",
        "....DLLLLD....",
        "....DMMMMD....",
        ".....DLLD.....",
        "......DD......"
      ]
    },
    ghost1: {
      palette: { D: "#2c2440", W: "#f5f6fa", C: "#c7ecee", E: "#1e272e", P: "#a55eea" },
      matrix: [
        "....DDDDDD....",
        "..DDWWWWWWDD..",
        ".DWWWWWWWWWWD.",
        ".DWWWEWWWEWWD.",
        "DWWWWWWWWWWWWD",
        "DWWWWWWPWWWWWD",
        "DWWWWWWWWWWWWD",
        "DWWCCCCCCCCWWD",
        "DW.DW.DD.WD.WD",
        "D..D......D..D"
      ]
    },
    ghost2: {
      palette: { D: "#2c2440", W: "#f5f6fa", C: "#c7ecee", E: "#ff4757", P: "#a55eea" },
      matrix: [
        "....DDDDDD....",
        "..DDWWWWWWDD..",
        ".DWWWWWWWWWWD.",
        ".DWWWEWWWEWWD.",
        "DWWWWWWWWWWWWD",
        "DWWWWWWPWWWWWD",
        "DWWWWWWWWWWWWD",
        "DWWCCCCCCCCWWD",
        ".DW.DW..WD.WD.",
        "..D..D..D..D.."
      ]
    },
    abductorUfo1: {
      palette: { D: "#11131f", C: "#48dbfb", P: "#a55eea", M: "#747d8c", Y: "#ffd32a" },
      matrix: [
        ".....DDDDDD.....",
        "...DDCCCCCCDD...",
        "..DCCCCCCCCCCD..",
        ".DDDDDDDDDDDDDD.",
        "DMMYMMMPPMMMYMMD",
        ".DDDDDDDDDDDDDD."
      ]
    },
    abductorUfo2: {
      palette: { D: "#11131f", C: "#48dbfb", P: "#a55eea", M: "#747d8c", Y: "#ff4757" },
      matrix: [
        ".....DDDDDD.....",
        "...DDCCCCCCDD...",
        "..DCCCCCCCCCCD..",
        ".DDDDDDDDDDDDDD.",
        "DMMYMMMPPMMMYMMD",
        ".DDDDDDDDDDDDDD."
      ]
    },
    husky1: {
      palette: { D: "#1e272e", G: "#747d8c", W: "#ffffff", C: "#48dbfb", R: "#ff4757" },
      matrix: [
        "........DD..DD..",
        ".......DGGDDGGD.",
        "..DD...DGGGGGGD.",
        ".DGGD..DGWCWCGGD",
        "DGGGDDDDGGGGWWWD",
        ".DGGGGGGGGGGGGD.",
        "..DGGGGWWWWWGGD.",
        "..DGGD.....DGGD.",
        ".DGGD.......DGGD",
        ".DDD.........DDD"
      ]
    },
    husky2: {
      palette: { D: "#1e272e", G: "#747d8c", W: "#ffffff", C: "#48dbfb", R: "#ff4757" },
      matrix: [
        "........DD..DD..",
        ".......DGGDDGGD.",
        ".......DGGGGGGD.",
        "..DD...DGWCWCGGD",
        ".DGGDDDDGGGGWWWD",
        ".DGGGGGGGGGGGGD.",
        "..DGGGGWWWWWGGD.",
        "...DGGD...DGGD..",
        "....DGGD.DGGD...",
        "....DDD...DDD..."
      ]
    },
    sled: {
      palette: { D: "#3d220c", B: "#b87435", L: "#e6a65c", M: "#dfe4ea" },
      matrix: [
        "DD..............",
        "DBDDDDDDDDDDDD..",
        ".DBBBBBBBBBBBBD.",
        "..DDDDDDDDDDDDD.",
        "...DM........DM.",
        "MMMMMMMMMMMMMMMM"
      ]
    },
    iceBlock: {
      palette: { D: "#0984e3", C: "#74b9ff", L: "#dff9fb", W: "#ffffff" },
      matrix: [
        "DDDDDDDDDDDD",
        "DWWWWLLLLLLD",
        "DWCCCCCCCCCD",
        "DLCCWWCCCCCD",
        "DLCCCCCCCCCD",
        "DCCCCLLCCCCD",
        "DCCCCCCCCCCD",
        "DDDDDDDDDDDD"
      ]
    },
    snowBoost: {
      palette: { D: "#0a3d62", C: "#48dbfb", Y: "#ffd32a", W: "#ffffff" },
      matrix: [
        "....DDDD....",
        "..DDYYYYDD..",
        ".DYWWWWWWYD.",
        "DYWCCCCCCWYD",
        "DYWCWWWWCWYD",
        "DYWCCCCCCWYD",
        ".DYWWWWWWYD.",
        "..DDYYYYDD..",
        "....DDDD...."
      ]
    },
    polarBear1: {
      palette: { D: "#2f3640", W: "#ffffff", S: "#dfe4ea", E: "#1e272e" },
      matrix: [
        "..DD....DD....",
        ".DWWDDDDWWD...",
        "DWWWWWWWWWWWD.",
        "DWWWEWWWWWWWD.",
        "DWWWWWWWWWWWD.",
        "DWWWSSSSSSWWD.",
        ".DWWWWWWWWWD..",
        ".DWW.DWW.DWW..",
        ".DDD.DDD.DDD.."
      ]
    },
    polarBear2: {
      palette: { D: "#2f3640", W: "#ffffff", S: "#dfe4ea", E: "#1e272e" },
      matrix: [
        "..DD....DD....",
        ".DWWDDDDWWD...",
        "DWWWWWWWWWWWD.",
        "DWWWEWWWWWWWD.",
        "DWWWWWWWWWWWD.",
        "DWWWSSSSSSWWD.",
        ".DWWWWWWWWWD..",
        "..DWW.DWW.DW..",
        "..DDD.DDD.DD.."
      ]
    },
    seal1: {
      palette: { D: "#1e272e", G: "#a4b0be", L: "#dfe4ea", E: "#1e272e" },
      matrix: [
        "....DDDDD.....",
        "..DDGGGGGD....",
        ".DGEGGGGGGDD..",
        "DGGGGGGGGGGGD.",
        "DGGLLLLLLLLGGD",
        ".DDDDDDDDDDDD."
      ]
    },
    seal2: {
      palette: { D: "#1e272e", G: "#a4b0be", L: "#dfe4ea", E: "#1e272e" },
      matrix: [
        "....DDDDD.....",
        "..DDGGGGGD....",
        ".DGEGGGGGGDD..",
        "DGGGGGGGGGGGD.",
        ".DGGLLLLLLLGGD",
        "..DDDDDDDDDDD."
      ]
    },
    eagle1: {
      palette: { D: "#2c1d18", B: "#8c5327", W: "#ffffff", Y: "#ffd32a" },
      matrix: [
        ".....DDDD.....",
        "YYDDWWWWWD....",
        "..DWWBBBBDDD..",
        "...DDBBBBBLLD.",
        ".....DBBBBBD..",
        "......DDDD...."
      ]
    },
    eagle2: {
      palette: { D: "#2c1d18", B: "#8c5327", W: "#ffffff", Y: "#ffd32a" },
      matrix: [
        "..DD..........",
        "YYDBBWWWWDD...",
        "..DWWBBBBBBDD.",
        "....DDBBBBBBD.",
        "......DDDDDD..",
        ".............."
      ]
    },
    snowball: {
      palette: { D: "#74b9ff", W: "#ffffff", S: "#dff9fb" },
      matrix: [
        "..DDDD..",
        ".DWWWWD.",
        "DWWWWWSD",
        "DWWSSSSD",
        ".DSSSSSD",
        "..DDDD.."
      ]
    },
    penguin1: {
      palette: { D: "#11141c", B: "#2f3640", W: "#ffffff", Y: "#ffa502", E: "#1e272e" },
      matrix: [
        ".....DDDDDD.....",
        "...DDBBBBBBD....",
        "..DBBWWWWWWBBD..",
        ".YYBBWEWWWEWBD..",
        "..DBBWWWWWWBBD..",
        "..DBBWWWWWWBBD..",
        ".DBBBWWWWWWBBBD.",
        ".DBBBWWWWWWBBBD.",
        "..DBBWWWWWWBBD..",
        "...DDBBBBBBDD...",
        "....YY....YY...."
      ]
    },
    penguin2: {
      palette: { D: "#11141c", B: "#2f3640", W: "#ffffff", Y: "#ffa502", E: "#1e272e" },
      matrix: [
        ".....DDDDDD.....",
        "...DDBBBBBBD....",
        "..DBBWWWWWWBBD..",
        ".YYBBWEWWWEWBD..",
        "..DBBWWWWWWBBD..",
        ".DBBBWWWWWWBBBD.",
        "DBBBBWWWWWWBBBBD",
        ".DBBBWWWWWWBBBD.",
        "..DBBWWWWWWBBD..",
        "...DDBBBBBBDD...",
        "...YY......YY..."
      ]
    },
    penguinHurt: {
      palette: { D: "#4a0814", B: "#ff6b81", W: "#ffd32a", Y: "#ffffff", E: "#ff4757" },
      matrix: [
        ".....DDDDDD.....",
        "...DDBBBBBBD....",
        "..DBBWWWWWWBBD..",
        ".YYBBWEWWWEWBD..",
        "..DBBWWWWWWBBD..",
        "..DBBWWWWWWBBD..",
        ".DBBBWWWWWWBBBD.",
        ".DBBBWWWWWWBBBD.",
        "..DBBWWWWWWBBD..",
        "...DDBBBBBBDD...",
        "....YY....YY...."
      ]
    },
    ruins: {
      palette: { D: "#2f3640", M: "#7f8c8d", L: "#bdc3c7", G: "#2ed573" },
      matrix: [
        "..DDDD..DDDD..",
        ".DMMMMDDGGGGD.",
        ".DMLMMMMMGGGD.",
        "DMMMMMMMMMMMMD",
        "DMMGGMMMMMLMMD",
        "DMMMMMMMMMMMMD",
        "DDDDDDDDDDDDDD"
      ]
    },
    jaguar1: {
      palette: { D: "#2c1d18", Y: "#f39c12", L: "#ffeaa7", E: "#2ed573" },
      matrix: [
        ".........DD..DD.",
        ".DD.....DYYDDYYD",
        "D..D...DYYYYYYYD",
        ".D..DDDDYYEYEYYD",
        "..DDYYYYYYYYYYLD",
        "..DYYDYYDYYDYYD.",
        "..DYYDYYDYYDYY..",
        ".DYY......DYY...",
        ".DD........DD..."
      ]
    },
    jaguar2: {
      palette: { D: "#2c1d18", Y: "#f39c12", L: "#ffeaa7", E: "#2ed573" },
      matrix: [
        ".........DD..DD.",
        "........DYYDDYYD",
        "..DD....DYYYYYYD",
        ".D..DDDDYYEYEYYD",
        "..DDYYYYYYYYYYLD",
        "..DYYDYYDYYDYYD.",
        "...DYYDYYDYYDY..",
        "...DYY....DYY...",
        "...DD......DD..."
      ]
    },
    toucan1: {
      palette: { D: "#11141c", B: "#2f3640", Y: "#ffd32a", O: "#ff7f50", W: "#ffffff" },
      matrix: [
        ".....DDDD...",
        "OOOYYBBBBBD.",
        "YYYWWBBBBBD.",
        "...DDBBBBBBD",
        ".....DDDDDD."
      ]
    },
    toucan2: {
      palette: { D: "#11141c", B: "#2f3640", Y: "#ffd32a", O: "#ff7f50", W: "#ffffff" },
      matrix: [
        "..DD........",
        "OOOYYBBBBDD.",
        "YYYWWBBBBBD.",
        "....DDBBBBD.",
        "......DDDD.."
      ]
    },
    jungleBug1: {
      palette: { D: "#140c1c", P: "#9b59b6", G: "#2ed573", W: "#dff9fb" },
      matrix: [
        "..WW....WW..",
        ".DWWDDDDWWD.",
        "DGGGGPPGGGGD",
        ".DDDDDDDDDD."
      ]
    },
    jungleBug2: {
      palette: { D: "#140c1c", P: "#9b59b6", G: "#2ed573", W: "#dff9fb" },
      matrix: [
        ".WW......WW.",
        "..DWDDDDWD..",
        "DGGGGPPGGGGD",
        ".DDDDDDDDDD."
      ]
    },
    mudBall: {
      palette: { D: "#2d1a0b", B: "#6e472b", L: "#9e6b43" },
      matrix: [
        "..DDDD..",
        ".DBLLBD.",
        "DBBBBBBD",
        "DBBBLBBD",
        ".DBBBBD.",
        "..DDDD.."
      ]
    },
    venom: {
      palette: { D: "#143d18", G: "#2ed573", L: "#a3cb38", P: "#9b59b6" },
      matrix: [
        "..DDDD..",
        ".DGPPGD.",
        "DGLLLLGD",
        ".DDDDDD."
      ]
    },
    snake1: {
      palette: { D: "#0b2e16", G: "#2ed573", L: "#a3cb38", E: "#ff4757", Y: "#ffd32a", R: "#ff4757" },
      matrix: [
        "....DDDDDD......",
        "..DDGGGGGGDD....",
        ".DGEEGGGGGGGD...",
        "RRDGGGGGGGGGD...",
        "..DDDGGGGGGDD...",
        "....DGGGGGGGD...",
        "...DGGLLLLGGGD..",
        "..DGGGDDDDGGGGD.",
        "..DGGGD..DGGGGGD",
        "...DDDDDDDDDDDD."
      ]
    },
    snake2: {
      palette: { D: "#0b2e16", G: "#2ed573", L: "#a3cb38", E: "#ff4757", Y: "#ffd32a", R: "#ff4757" },
      matrix: [
        "....DDDDDD......",
        "..DDGGGGGGDD....",
        ".DGEEGGGGGGGD...",
        ".RDGGGGGGGGGD...",
        "..DDDGGGGGGDD...",
        "...DGGGGGGGGD...",
        "..DGGGLLLLGGGD..",
        ".DGGGGDDDDGGGGD.",
        ".DGGGGD..DGGGGGD",
        "..DDDDDDDDDDDDD."
      ]
    },
    snakeHurt: {
      palette: { D: "#4a0814", G: "#ff4757", L: "#ffd32a", E: "#ffffff", Y: "#ffd32a", R: "#ffffff" },
      matrix: [
        "....DDDDDD......",
        "..DDGGGGGGDD....",
        ".DGEEGGGGGGGD...",
        "RRDGGGGGGGGGD...",
        "..DDDGGGGGGDD...",
        "....DGGGGGGGD...",
        "...DGGLLLLGGGD..",
        "..DGGGDDDDGGGGD.",
        "..DGGGD..DGGGGGD",
        "...DDDDDDDDDDDD."
      ]
    }
  };

  // Cache of rendered offscreen canvases
  const cache = new Map();

  function buildCanvas(matrix, palette, scale) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const c = document.createElement("canvas");
    c.width = cols * scale;
    c.height = rows * scale;
    const cctx = c.getContext("2d");
    cctx.imageSmoothingEnabled = false;

    for (let r = 0; r < rows; r++) {
      const line = matrix[r];
      for (let col = 0; col < cols; col++) {
        const ch = line[col];
        if (ch === "." || ch === " ") continue;
        const color = palette[ch];
        if (!color) continue;
        cctx.fillStyle = color;
        cctx.fillRect(col * scale, r * scale, scale, scale);
      }
    }
    return c;
  }

  function getCatSprite(pose, skinId, scale, hatColor) {
    const s = scale || 3;
    const hc = hatColor || "";
    const key = `cat_${pose}_${skinId}_${s}_${hc}`;
    if (cache.has(key)) return cache.get(key);

    const skin = RC.Levels.getCatSkinById(skinId);
    const p = skin.palette;
    const palette = {
      B: p.body,
      D: p.dark,
      L: p.light,
      E: p.eye,
      N: p.nose,
      C: p.collar,
      G: "#74e8ff",
      W: "#ffffff",
      R: "#ff4757",
      Y: "#ffd32a"
    };
    const matrix = CAT_MATRICES[pose] || CAT_MATRICES.run1;
    const canvas = buildCanvas(matrix, palette, s);

    // Apply special coat patterns & accessories for new cat skins
    if (skin.pattern) {
      const cctx = canvas.getContext("2d");
      const isDuck = pose === "duck1" || pose === "duck2";
      const isSwim = pose === "swim1" || pose === "swim2";
      const isPlane = pose === "plane1" || pose === "plane2";

      if (skin.pattern === "bow" && !isPlane) {
        const bowCol = skin.bowColor || "#ff4757";
        const bowHi = "#ff9ff3";
        const bx = isDuck ? 10 * s : isSwim ? 9 * s : 8 * s;
        const by = isDuck ? 0 : isSwim ? 2 * s : 0;
        cctx.fillStyle = bowCol;
        cctx.fillRect(bx, by, 2 * s, 2 * s);
        cctx.fillRect(bx + 3 * s, by, 2 * s, 2 * s);
        cctx.fillStyle = bowHi;
        cctx.fillRect(bx + 2 * s, by + Math.floor(s * 0.5), s, s);
      } else if (skin.pattern === "spots" && !isPlane) {
        cctx.fillStyle = p.dark;
        if (isDuck) {
          cctx.fillRect(4 * s, 4 * s, 2 * s, 2 * s);
          cctx.fillRect(8 * s, 5 * s, 2 * s, 1 * s);
        } else {
          cctx.fillRect(4 * s, 7 * s, 2 * s, 2 * s);
          cctx.fillRect(7 * s, 8 * s, 2 * s, 2 * s);
          cctx.fillRect(10 * s, 2 * s, 2 * s, 1 * s);
        }
      } else if (skin.pattern === "tortie" && !isPlane) {
        cctx.fillStyle = "#e67e22";
        if (isDuck) {
          cctx.fillRect(4 * s, 4 * s, 2 * s, 2 * s);
          cctx.fillRect(9 * s, 3 * s, 2 * s, 2 * s);
        } else {
          cctx.fillRect(4 * s, 7 * s, 2 * s, 2 * s);
          cctx.fillRect(8 * s, 8 * s, 2 * s, 2 * s);
          cctx.fillRect(11 * s, 2 * s, 2 * s, 2 * s);
        }
        cctx.fillStyle = "#f39c12";
        cctx.fillRect(6 * s, isDuck ? 5 * s : 9 * s, 2 * s, s);
      } else if (skin.pattern === "tabby" && !isPlane) {
        cctx.fillStyle = p.dark;
        if (isDuck) {
          cctx.fillRect(5 * s, 4 * s, s, 2 * s);
          cctx.fillRect(8 * s, 4 * s, s, 2 * s);
        } else {
          cctx.fillRect(5 * s, 7 * s, s, 2 * s);
          cctx.fillRect(8 * s, 7 * s, s, 2 * s);
        }
      } else if (skin.pattern === "hat" && !isPlane) {
        const hatCol = hatColor || "#ff4757";
        const hx = isDuck ? 10 * s : isSwim ? 9 * s : 9 * s;
        const hy = isDuck ? 0 : isSwim ? 1 * s : 0;
        cctx.fillStyle = "#1e272e";
        cctx.fillRect(hx, hy, 5 * s, 2 * s);
        cctx.fillStyle = hatCol;
        cctx.fillRect(hx + Math.floor(s * 0.5), hy, 4 * s, 2 * s);
        cctx.fillRect(hx + s, hy - s, 3 * s, s);
        cctx.fillStyle = "#ffffff";
        cctx.fillRect(hx, hy + s, 6 * s, s);
      } else if (skin.pattern === "crown" && !isPlane) {
        const kx = isDuck ? 10 * s : 9 * s;
        const ky = isDuck ? 0 : 0;
        cctx.fillStyle = "#ffd32a";
        cctx.fillRect(kx, ky + s, 5 * s, s);
        cctx.fillRect(kx, ky, s, s);
        cctx.fillRect(kx + 2 * s, ky, s, s);
        cctx.fillRect(kx + 4 * s, ky, s, s);
        cctx.fillStyle = "#ff4757";
        cctx.fillRect(kx + 2 * s, ky + s, s, s);
      }
    }

    cache.set(key, canvas);
    return canvas;
  }

  function getGlowCatSprite(pose, colorHex, scale) {
    const s = scale || 3;
    const key = `cat_glow_${pose}_${colorHex}_${s}`;
    if (cache.has(key)) return cache.get(key);

    const matrix = CAT_MATRICES[pose] || CAT_MATRICES.run1;
    const palette = {
      B: colorHex,
      D: colorHex,
      L: colorHex,
      E: colorHex,
      N: colorHex,
      C: colorHex,
      G: colorHex,
      W: colorHex,
      R: colorHex,
      Y: colorHex
    };
    const canvas = buildCanvas(matrix, palette, s);
    cache.set(key, canvas);
    return canvas;
  }

  function getWorldSprite(name, scale) {
    const s = scale || 3;
    const key = `world_${name}_${s}`;
    if (cache.has(key)) return cache.get(key);

    const def = WORLD_SPRITES[name];
    if (!def) return null;
    const canvas = buildCanvas(def.matrix, def.palette, s);
    cache.set(key, canvas);
    return canvas;
  }

  function getClawSprite(frameIdx, scale) {
    const s = scale || 3;
    const idx = Math.max(0, Math.min(CLAW_FRAMES.length - 1, frameIdx));
    const key = `claw_${idx}_${s}`;
    if (cache.has(key)) return cache.get(key);

    const palette = {
      W: "#ffffff",
      O: "#ff6b81",
      Y: "#ffd32a"
    };
    const canvas = buildCanvas(CLAW_FRAMES[idx], palette, s);
    cache.set(key, canvas);
    return canvas;
  }

  RC.Sprites = {
    getCatSprite,
    getGlowCatSprite,
    getWorldSprite,
    getClawSprite
  };
})(window.RunnerCat = window.RunnerCat || {});
