/**
 * DAMRI Gorontalo Transit Terminals & Halte Dataset
 * Maintained & Engineered by: BieM363 (https://github.com/BieM363)
 */

export const stops = [
  // Hub Kota Gorontalo & Sekitarnya
  {
    id: "stop-dungingi",
    name: "Terminal Tipe A Dungingi",
    city: "Kota Gorontalo",
    type: "terminal_major",
    coords: [0.5408, 123.0589],
    address: "Jl. Poigar, Dungingi, Kota Gorontalo",
    facilities: ["Ruang Tunggu Ber-AC", "Loket Tiket", "Toilet", "Musholla", "Kantin", "Charging Station"],
    routes: ["route-airport", "route-kwandang", "route-marisa", "route-suwawa"]
  },
  {
    id: "stop-ung",
    name: "Halte Kampus 1 UNG",
    city: "Kota Gorontalo",
    type: "halte_city",
    coords: [0.5562, 123.0618],
    address: "Jl. Jend. Sudirman No.6, Kota Gorontalo",
    facilities: ["Shelter Halte", "Informasi Rute", "Penerangan LED"],
    routes: ["route-airport", "route-city-tour", "route-suwawa"]
  },
  {
    id: "stop-taruna",
    name: "Halte Bundaran Taruna Remaja",
    city: "Kota Gorontalo",
    type: "halte_city",
    coords: [0.5376, 123.0655],
    address: "Jl. Nani Wartabone, Pusat Kota Gorontalo",
    facilities: ["Shelter Terbuka", "Taman Kota", "Pusat UMKM"],
    routes: ["route-airport", "route-city-tour"]
  },
  {
    id: "stop-telaga",
    name: "Halte Simpang Lima Telaga",
    city: "Kab. Gorontalo",
    type: "halte_suburban",
    coords: [0.5821, 123.0360],
    address: "Jl. Ahmad A. Wahab, Telaga",
    facilities: ["Shelter Halte"],
    routes: ["route-airport", "route-kwandang", "route-marisa"]
  },
  {
    id: "stop-limboto",
    name: "Halte Menara Keagungan Limboto",
    city: "Kab. Gorontalo",
    type: "halte_major",
    coords: [0.6277, 122.9818],
    address: "Kawasan Menara Keagungan, Limboto",
    facilities: ["Shelter Bus", "Rest Area", "Toilet", "Pusat Kuliner"],
    routes: ["route-airport", "route-kwandang", "route-marisa"]
  },
  {
    id: "stop-tibawa",
    name: "Halte Tibawa",
    city: "Kab. Gorontalo",
    type: "halte_suburban",
    coords: [0.6415, 122.8420],
    address: "Jl. Trans Sulawesi, Tibawa",
    facilities: ["Shelter Bus"],
    routes: ["route-airport", "route-marisa"]
  },
  {
    id: "stop-airport",
    name: "Bandara Djalaluddin Gorontalo",
    city: "Kab. Gorontalo",
    type: "terminal_major",
    coords: [0.6385, 122.8517],
    address: "Area Kedatangan & Keberangkatan Bandara Djalaluddin",
    facilities: ["Loket Tiket DAMRI", "Ruang Tunggu Bandara", "Trolley Bagasi", "Pusat Informasi"],
    routes: ["route-airport"]
  },
  {
    id: "stop-isimu",
    name: "Terminal Isimu (Persimpangan Trans)",
    city: "Kab. Gorontalo",
    type: "terminal_junction",
    coords: [0.6480, 122.8360],
    address: "Simpang Tiga Isimu, Tibawa",
    facilities: ["Ruang Tunggu", "Warung Makan", "Toilet", "Pos Petugas"],
    routes: ["route-kwandang", "route-marisa"]
  },

  // Jalur Gorontalo Utara (Kwandang)
  {
    id: "stop-molingkapoto",
    name: "Halte Kantor Bupati Molingkapoto",
    city: "Kab. Gorontalo Utara",
    type: "halte_suburban",
    coords: [0.8150, 122.9150],
    address: "Kawasan Pusat Pemerintahan Molingkapoto, Kwandang",
    facilities: ["Shelter Halte", "Taman"],
    routes: ["route-kwandang"]
  },
  {
    id: "stop-kwandang",
    name: "Terminal & Pelabuhan Kwandang",
    city: "Kab. Gorontalo Utara",
    type: "terminal_major",
    coords: [0.8295, 122.9230],
    address: "Jl. Pelabuhan Kwandang, Gorontalo Utara",
    facilities: ["Ruang Tunggu", "Loket Tiket", "Akses Kapal Feri / Laut", "Kantin"],
    routes: ["route-kwandang"]
  },

  // Jalur Trans Sulawesi Barat (Boalemo - Pohuwato)
  {
    id: "stop-pulubala",
    name: "Halte Transit Pulubala",
    city: "Kab. Gorontalo",
    type: "halte_suburban",
    coords: [0.6620, 122.7480],
    address: "Jl. Trans Sulawesi, Pulubala",
    facilities: ["Shelter Halte"],
    routes: ["route-marisa"]
  },
  {
    id: "stop-paguyaman",
    name: "Halte Paguyaman (Pasar Paguyaman)",
    city: "Kab. Boalemo",
    type: "halte_suburban",
    coords: [0.5900, 122.5600],
    address: "Jl. Raya Paguyaman, Boalemo",
    facilities: ["Shelter Halte", "Area Parkir"],
    routes: ["route-marisa"]
  },
  {
    id: "stop-tilamuta",
    name: "Terminal Tipe B Tilamuta",
    city: "Kab. Boalemo",
    type: "terminal_major",
    coords: [0.5320, 122.3420],
    address: "Pusat Kota Tilamuta, Boalemo",
    facilities: ["Ruang Tunggu", "Toilet", "Kantin", "Musholla"],
    routes: ["route-marisa"]
  },
  {
    id: "stop-paguat",
    name: "Halte Paguat",
    city: "Kab. Pohuwato",
    type: "halte_suburban",
    coords: [0.4680, 122.0200],
    address: "Jl. Trans Sulawesi, Paguat",
    facilities: ["Shelter Halte", "Warung"],
    routes: ["route-marisa"]
  },
  {
    id: "stop-marisa",
    name: "Terminal Tipe A Marisa (Pohuwato)",
    city: "Kab. Pohuwato",
    type: "terminal_major",
    coords: [0.4578, 121.9365],
    address: "Jl. Trans Sulawesi, Marisa, Kab. Pohuwato",
    facilities: ["Ruang Tunggu Ber-AC", "Loket Tiket", "Toilet", "Musholla", "Area Istirahat Supir", "Kantin"],
    routes: ["route-marisa"]
  },

  // Jalur Bone Bolango & Suwawa
  {
    id: "stop-kabila",
    name: "Halte Kabila",
    city: "Kab. Bone Bolango",
    type: "halte_suburban",
    coords: [0.5480, 123.1000],
    address: "Jl. Nani Wartabone, Kabila",
    facilities: ["Shelter Halte", "Penerangan"],
    routes: ["route-suwawa"]
  },
  {
    id: "stop-suwawa",
    name: "Terminal Pasar Suwawa",
    city: "Kab. Bone Bolango",
    type: "terminal_major",
    coords: [0.5380, 123.1650],
    address: "Pusat Kecamatan Suwawa, Bone Bolango",
    facilities: ["Ruang Tunggu", "Kantin", "Musholla", "Toilet"],
    routes: ["route-suwawa"]
  },

  // Jalur Wisata Leato & Botubarani
  {
    id: "stop-otanaha",
    name: "Halte Benteng Otanaha",
    city: "Kota Gorontalo",
    type: "halte_tourist",
    coords: [0.5280, 123.0130],
    address: "Kawasan Cagar Budaya Benteng Otanaha, Dembe I",
    facilities: ["Shelter Wisata", "Pusat Souvenir", "Toilet"],
    routes: ["route-city-tour"]
  },
  {
    id: "stop-leato",
    name: "Terminal Pelabuhan Feri Leato",
    city: "Kota Gorontalo",
    type: "terminal_major",
    coords: [0.5103, 123.0682],
    address: "Jl. Mayor Dullah, Leato Selatan, Kota Gorontalo",
    facilities: ["Ruang Tunggu Feri ASDP", "Loket Tiket", "Kantin", "Toilet"],
    routes: ["route-city-tour"]
  },
  {
    id: "stop-botubarani",
    name: "Halte Wisata Hiu Paus Botubarani",
    city: "Kab. Bone Bolango",
    type: "halte_tourist",
    coords: [0.4850, 123.1180],
    address: "Pantai Botubarani, Kab. Bone Bolango",
    facilities: ["Shelter Pesisir", "Pusat Edukasi Hiu Paus", "Kios Kuliner Ikan"],
    routes: ["route-city-tour"]
  }
];
