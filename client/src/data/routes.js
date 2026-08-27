/**
 * DAMRI Gorontalo Route Network (GeoJSON Corridors)
 * Maintained & Engineered by: BieM363 (https://github.com/BieM363)
 */

export const routes = [
  {
    id: "route-airport",
    name: "Shuttle Bandara Djalaluddin ⇄ Dungingi",
    code: "DMR-AP01",
    type: "Shuttle Bandara Express",
    color: "#00f0ff", // Neon Cyan
    activeFleetCount: 2,
    fare: 25000,
    distanceKm: 32.4,
    estDurationMin: 45,
    operatingHours: "05:00 - 20:00 WITA",
    headwayMin: 30,
    stopIds: [
      "stop-dungingi",
      "stop-taruna",
      "stop-ung",
      "stop-telaga",
      "stop-limboto",
      "stop-tibawa",
      "stop-airport"
    ],
    coordinates: [
      [0.5408, 123.0589], // Terminal Dungingi
      [0.5390, 123.0620],
      [0.5376, 123.0655], // Bundaran Taruna Remaja
      [0.5445, 123.0660],
      [0.5510, 123.0642],
      [0.5562, 123.0618], // UNG
      [0.5640, 123.0530],
      [0.5730, 123.0440],
      [0.5821, 123.0360], // Simpang Telaga
      [0.5915, 123.0245],
      [0.6020, 123.0100],
      [0.6130, 122.9960],
      [0.6277, 122.9818], // Menara Keagungan Limboto
      [0.6335, 122.9605],
      [0.6362, 122.9300],
      [0.6378, 122.9000],
      [0.6392, 122.8700],
      [0.6415, 122.8420], // Tibawa
      [0.6400, 122.8480],
      [0.6385, 122.8517]  // Bandara Djalaluddin
    ]
  },
  {
    id: "route-kwandang",
    name: "Terminal Dungingi ⇄ Pelabuhan Kwandang (Gorut)",
    code: "DMR-GW02",
    type: "Perintis Gorut",
    color: "#10b981", // Emerald Green
    activeFleetCount: 2,
    fare: 35000,
    distanceKm: 58.6,
    estDurationMin: 75,
    operatingHours: "06:00 - 18:00 WITA",
    headwayMin: 45,
    stopIds: [
      "stop-dungingi",
      "stop-telaga",
      "stop-limboto",
      "stop-isimu",
      "stop-molingkapoto",
      "stop-kwandang"
    ],
    coordinates: [
      [0.5408, 123.0589], // Dungingi
      [0.5640, 123.0530],
      [0.5821, 123.0360], // Telaga
      [0.6020, 123.0100],
      [0.6277, 122.9818], // Limboto
      [0.6362, 122.9300],
      [0.6415, 122.8420],
      [0.6480, 122.8360], // Terminal Isimu
      [0.6720, 122.8450],
      [0.7050, 122.8620],
      [0.7380, 122.8780],
      [0.7680, 122.8920],
      [0.7950, 122.9050],
      [0.8150, 122.9150], // Molingkapoto
      [0.8240, 122.9190],
      [0.8295, 122.9230]  // Pelabuhan Kwandang
    ]
  },
  {
    id: "route-marisa",
    name: "Terminal Dungingi ⇄ Marisa (Pohuwato)",
    code: "DMR-SW03",
    type: "Trans-Sulawesi Barat",
    color: "#f59e0b", // Amber Gold
    activeFleetCount: 2,
    fare: 65000,
    distanceKm: 155.0,
    estDurationMin: 180,
    operatingHours: "06:30 - 17:00 WITA",
    headwayMin: 60,
    stopIds: [
      "stop-dungingi",
      "stop-limboto",
      "stop-tibawa",
      "stop-isimu",
      "stop-pulubala",
      "stop-paguyaman",
      "stop-tilamuta",
      "stop-paguat",
      "stop-marisa"
    ],
    coordinates: [
      [0.5408, 123.0589], // Dungingi
      [0.5821, 123.0360], // Telaga
      [0.6277, 122.9818], // Limboto
      [0.6415, 122.8420], // Tibawa
      [0.6480, 122.8360], // Isimu
      [0.6550, 122.7900],
      [0.6620, 122.7480], // Pulubala
      [0.6580, 122.6850],
      [0.6420, 122.6250],
      [0.6180, 122.5850],
      [0.5900, 122.5600], // Paguyaman
      [0.5650, 122.4800],
      [0.5480, 122.4100],
      [0.5320, 122.3420], // Tilamuta Boalemo
      [0.4980, 122.2150], // Botumoito
      [0.4780, 122.1250], // Mananggu
      [0.4680, 122.0200], // Paguat
      [0.4620, 121.9750],
      [0.4578, 121.9365]  // Marisa Pohuwato
    ]
  },
  {
    id: "route-suwawa",
    name: "Terminal Dungingi ⇄ Suwawa (Bone Bolango)",
    code: "DMR-BB04",
    type: "Koridor Bone Bolango",
    color: "#a855f7", // Purple Neon
    activeFleetCount: 1,
    fare: 15000,
    distanceKm: 21.5,
    estDurationMin: 35,
    operatingHours: "06:00 - 19:00 WITA",
    headwayMin: 30,
    stopIds: [
      "stop-dungingi",
      "stop-ung",
      "stop-kabila",
      "stop-suwawa"
    ],
    coordinates: [
      [0.5408, 123.0589], // Dungingi
      [0.5480, 123.0595],
      [0.5562, 123.0618], // UNG
      [0.5540, 123.0780],
      [0.5510, 123.0900],
      [0.5480, 123.1000], // Kabila
      [0.5440, 123.1250],
      [0.5410, 123.1480],
      [0.5380, 123.1650]  // Suwawa
    ]
  },
  {
    id: "route-city-tour",
    name: "Benteng Otanaha ⇄ Pantai Botubarani ⇄ Leato",
    code: "DMR-CT05",
    type: "Wisata & Pesisir Gorontalo",
    color: "#ec4899", // Pink Coral
    activeFleetCount: 1,
    fare: 15000,
    distanceKm: 22.8,
    estDurationMin: 40,
    operatingHours: "07:00 - 18:00 WITA",
    headwayMin: 45,
    stopIds: [
      "stop-otanaha",
      "stop-ung",
      "stop-taruna",
      "stop-leato",
      "stop-botubarani"
    ],
    coordinates: [
      [0.5280, 123.0130], // Benteng Otanaha
      [0.5365, 123.0380], // Jl. Raja Eyato
      [0.5480, 123.0520],
      [0.5562, 123.0618], // UNG
      [0.5470, 123.0645],
      [0.5376, 123.0655], // Taruna Remaja
      [0.5250, 123.0670],
      [0.5103, 123.0682], // Pelabuhan Leato
      [0.4975, 123.0910], // Jl. Pesisir
      [0.4850, 123.1180]  // Pantai Hiu Paus Botubarani
    ]
  }
];
