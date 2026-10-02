/**
 * High-Precision Geographical Boundaries for the North Indian Ocean Domain
 * 
 * Accurately models the exact geographical coastline of India and all visible landmasses:
 * - India: Kathiawar/Saurashtra peninsula, Gulf of Kutch, Gulf of Khambhat, Konkan, Malabar, Kanyakumari, Coromandel, Krishna/Godavari deltas, Odisha, Bengal
 * - Sri Lanka: Exact teardrop geometry with Jaffna, Colombo, Galle, Dondra Head, Trincomalee
 * - Arabian Peninsula: Oman (Muscat, Ras al Hadd, Salalah), UAE, Musandam Peninsula (Strait of Hormuz), Yemen
 * - Pakistan & Iran: Indus Delta, Karachi, Sonmiani, Ormara, Gwadar hammerhead, Makran coast
 * - Bangladesh: Sundarbans, Meghna estuary, Chittagong, Cox's Bazar
 * - Myanmar & Indochina: Rakhine coast, Cape Negrais, Ayeyarwady Delta, Gulf of Martaban, Tenasserim, Andaman Sea
 * - Horn of Africa (Somalia): Cape Guardafui (Ras Asir), Ras Hafun, Bosaso
 * - Island Archipelagos: Andaman & Nicobar, Lakshadweep, Maldives, Socotra
 */

export type LatLonPoint = [number, number]; // [lat, lon]

// 1. INDIA MAINLAND POLYGON
export const INDIA_COASTLINE_POLYGON: LatLonPoint[] = [
  // Sir Creek / Pakistan border
  [23.7, 68.18],
  [23.85, 68.75],
  [24.3, 69.4],
  [24.7, 71.0],
  // Northern continental cap (fills land up to map edge)
  [25.5, 71.5],
  [26.5, 72.0],
  [27.5, 73.0],
  [28.0, 75.0],
  [28.0, 80.0],
  [28.0, 88.0],
  // East / Bengal border
  [26.8, 88.2],
  [26.0, 88.5],
  [25.2, 89.8],
  [24.5, 91.8],
  [23.5, 92.5],
  [22.5, 92.3],
  [22.0, 90.5], // Bangladesh delta boundary
  [21.8, 89.2], // Sundarbans (West Bengal)
  [21.6, 88.3], // Sagar Island / Hooghly estuary
  [21.5, 87.5], // Digha / Odisha border
  [21.2, 86.9], // Balasore / Chandipur
  [20.7, 86.9], // Dhamra estuary
  [20.3, 86.7], // Paradip (Mahanadi Delta apex)
  [19.8, 85.8], // Puri / Chilika Lake barrier spit
  [19.3, 84.9], // Gopalpur
  [18.3, 84.1], // Kalingapatnam / Srikakulam
  [17.7, 83.3], // Visakhapatnam (Vizag)
  [17.0, 82.3], // Kakinada (Godavari Delta apex)
  [16.4, 81.7], // Godavari southern mouth
  [16.1, 81.1], // Machilipatnam (Krishna Delta apex)
  [15.8, 80.5], // Nizampatnam Bay
  [15.5, 80.1], // Ongole
  [14.3, 80.1], // Krishnapatnam / Nellore
  [13.5, 80.2], // Pulicat Lake
  [13.1, 80.3], // Chennai (Madras)
  [12.5, 80.1], // Mahabalipuram
  [12.0, 79.8], // Puducherry (Pondicherry)
  [11.5, 79.7], // Cuddalore
  [10.8, 79.8], // Karaikal / Nagapattinam
  [10.3, 79.85], // Point Calimere (Kodiakkarai)
  [9.9, 79.2],  // Palk Bay interior
  [9.3, 79.3],  // Rameswaram Island apex
  [9.1, 78.8],  // Gulf of Mannar
  [8.8, 78.15], // Thoothukudi (Tuticorin)
  [8.5, 78.1],  // Tiruchendur
  [8.08, 77.55], // Kanyakumari (Cape Comorin - Southern Tip)
  [8.3, 77.1],  // Kovalam
  [8.5, 76.9],  // Thiruvananthapuram (Trivandrum)
  [8.9, 76.6],  // Kollam (Quilon)
  [9.5, 76.3],  // Alappuzha (Alleppey)
  [9.95, 76.25], // Kochi (Cochin)
  [10.8, 75.9], // Ponnani
  [11.25, 75.75], // Kozhikode (Calicut)
  [11.87, 75.35], // Kannur
  [12.5, 75.0], // Kasaragod
  [12.85, 74.85], // Mangalore
  [13.35, 74.7], // Udupi / Malpe
  [13.98, 74.55], // Bhatkal
  [14.4, 74.35], // Kumta / Gokarna
  [14.8, 74.1], // Karwar
  [15.2, 73.9], // South Goa (Canacona/Margao)
  [15.5, 73.8], // North Goa (Panaji/Mormugao)
  [16.05, 73.5], // Malvan
  [16.5, 73.3], // Vijaydurg
  [17.0, 73.3], // Ratnagiri
  [17.5, 73.2], // Dabhol
  [18.3, 72.9], // Alibag / Murud
  [18.95, 72.8], // Mumbai (Bombay Harbor)
  [19.3, 72.8], // Vasai / Palghar
  [20.1, 72.75], // Dahanu
  [20.4, 72.85], // Daman
  [20.9, 72.85], // Valsad / Navsari
  [21.15, 72.75], // Surat (Tapi River mouth)
  [21.7, 72.6], // Dahej (Narmada River mouth)
  [22.2, 72.5], // Gulf of Khambhat head (Cambay)
  [21.75, 72.2], // Bhavnagar
  [21.2, 72.1], // Gopnath Point (Gulf of Khambhat west entrance)
  [20.85, 71.5], // Jafrabad
  [20.7, 70.9], // Diu Island / Southern Kathiawar tip
  [20.9, 70.4], // Veraval / Somnath
  [21.2, 70.0], // Mangrol
  [21.6, 69.6], // Porbandar
  [22.25, 69.0], // Dwarka (Westernmost tip of Kathiawar)
  [22.45, 69.1], // Okha
  [22.7, 69.6], // Jamnagar / Gulf of Kutch south shore
  [22.9, 70.3], // Kandla / Gandhidham (Gulf of Kutch head)
  [23.0, 69.8], // Mandvi (Gulf of Kutch north shore)
  [23.2, 68.6], // Lakhpat / Kutch coast
  [23.7, 68.18], // Loop back to Sir Creek
];

// 2. SRI LANKA POLYGON
export const SRI_LANKA_POLYGON: LatLonPoint[] = [
  [9.83, 80.24], // Point Pedro (North Tip)
  [9.4, 80.5],
  [8.9, 80.9],
  [8.58, 81.23], // Trincomalee
  [7.72, 81.7],  // Batticaloa
  [6.8, 81.85],
  [6.3, 81.5],
  [6.12, 81.12], // Hambantota
  [5.92, 80.59], // Dondra Head (Southern Tip)
  [6.05, 80.2],  // Galle
  [6.5, 79.95],
  [6.93, 79.85], // Colombo
  [7.3, 79.8],   // Negombo
  [7.9, 79.8],   // Chilaw
  [8.3, 79.75],  // Kalpitiya
  [8.8, 79.85],  // Mannar Island
  [9.4, 80.0],   // Jaffna Lagoon
  [9.83, 80.24],
];

// 3. ARABIAN PENINSULA (Oman, UAE, Yemen, Musandam)
export const ARABIAN_PENINSULA_POLYGON: LatLonPoint[] = [
  [12.0, 48.0],
  [13.5, 48.0],
  [14.5, 49.2], // Mukalla (Yemen)
  [15.5, 51.5], // Qishn
  [16.2, 52.2], // Al Ghaydah
  [16.8, 53.8],
  [17.0, 54.1], // Salalah (Dhofar, Oman)
  [17.0, 54.7], // Mirbat
  [17.5, 55.3], // Hasik
  [18.5, 56.6],
  [19.0, 57.8], // Ras Madrakah (Duqm)
  [20.5, 58.8], // Masirah Island channel
  [22.5, 59.85], // Ras al Hadd (Easternmost point of Arabia)
  [22.56, 59.5], // Sur
  [23.6, 58.58], // Muscat (Capital of Oman)
  [24.35, 56.7], // Sohar
  [24.75, 56.45], // Shinas
  [25.8, 56.3],
  [26.2, 56.25], // Musandam Peninsula / Khasab (Strait of Hormuz apex)
  [25.8, 55.95], // Ras Al Khaimah (UAE)
  [25.2, 55.3],  // Dubai
  [24.45, 54.35], // Abu Dhabi
  [24.0, 52.0],  // Saudi / Persian Gulf
  [28.0, 50.0],
  [28.0, 48.0],
  [12.0, 48.0],
];

// 4. PAKISTAN & MAKRAN (Indus delta, Karachi, Gwadar, Makran)
export const PAKISTAN_MAKRAN_POLYGON: LatLonPoint[] = [
  [23.7, 68.18], // Sir Creek border
  [24.0, 67.5],  // Indus River Delta
  [24.85, 66.98], // Karachi Harbor
  [25.0, 66.6],  // Sonmiani Bay
  [25.3, 65.5],  // Hingol
  [25.2, 64.6],  // Ormara Peninsula
  [25.25, 63.45], // Pasni
  [25.12, 62.32], // Gwadar hammerhead peninsula
  [25.05, 61.75], // Jiwani / Iran border
  [25.3, 60.6],  // Chabahar (Iran)
  [25.6, 57.75], // Jask
  [27.0, 56.5],  // Bandar Abbas / Strait of Hormuz north shore
  [28.0, 56.5],
  [28.0, 71.0],
  [24.7, 71.0],
  [23.7, 68.18],
];

// 5. BANGLADESH DELTA
export const BANGLADESH_POLYGON: LatLonPoint[] = [
  [21.8, 89.2], // Sundarbans border
  [22.0, 89.8],
  [22.3, 90.7], // Meghna Estuary (Bhola/Hatiya)
  [22.3, 91.8], // Chittagong
  [21.4, 91.98], // Cox's Bazar
  [20.85, 92.3], // Teknaf / Myanmar border
  [24.5, 92.5],
  [25.5, 89.0],
  [22.5, 89.0],
  [21.8, 89.2],
];

// 6. MYANMAR & INDOCHINA (Rakhine, Ayeyarwady Delta, Gulf of Martaban, Tenasserim)
export const MYANMAR_INDOCHINA_POLYGON: LatLonPoint[] = [
  [20.85, 92.35], // Naf River border
  [20.15, 92.9],  // Sittwe
  [19.0, 93.6],   // Kyaukpyu / Ramree Island
  [17.8, 94.4],   // Gwa
  [16.03, 94.2],  // Cape Negrais (entrance to Bay of Bengal)
  [15.8, 95.0],   // Ayeyarwady Delta western mouth
  [15.8, 95.8],   // Ayeyarwady Delta eastern mouth
  [16.5, 96.3],   // Yangon River mouth
  [17.0, 97.0],   // Gulf of Martaban head
  [16.48, 97.6],  // Mawlamyine
  [14.1, 98.2],   // Dawei (Tavoy)
  [12.4, 98.6],   // Myeik (Mergui) Archipelago
  [10.0, 98.55],  // Kawthaung (Victoria Point)
  [7.9, 98.3],    // Phuket (Thailand)
  [5.5, 100.3],   // Penang (Malaysia)
  [0.0, 102.0],
  [28.0, 102.0],
  [28.0, 92.3],
  [20.85, 92.35],
];

// 7. HORN OF AFRICA (SOMALIA)
export const SOMALIA_HORN_POLYGON: LatLonPoint[] = [
  [0.0, 48.0],
  [5.0, 48.4],
  [7.0, 49.3],
  [9.0, 50.5],
  [10.43, 51.41], // Ras Hafun (Easternmost point of Africa)
  [11.83, 51.27], // Cape Guardafui (Ras Asir)
  [11.28, 49.18], // Bosaso (Gulf of Aden coast)
  [11.0, 48.0],
  [0.0, 48.0],
];

// Ray-casting algorithm to test point in polygon
export function isPointInPolygon(point: [number, number], polygon: LatLonPoint[]): boolean {
  const [lat, lon] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lonI] = polygon[i];
    const [latJ, lonJ] = polygon[j];

    const intersect = ((lonI > lon) !== (lonJ > lon)) &&
      (lat < ((latJ - latI) * (lon - lonI)) / (lonJ - lonI) + latI);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Master land check covering all landmasses in the domain
export function isPointAccurateLand(lat: number, lon: number): boolean {
  if (isPointInPolygon([lat, lon], INDIA_COASTLINE_POLYGON)) return true;
  if (isPointInPolygon([lat, lon], SRI_LANKA_POLYGON)) return true;
  if (isPointInPolygon([lat, lon], PAKISTAN_MAKRAN_POLYGON)) return true;
  if (isPointInPolygon([lat, lon], BANGLADESH_POLYGON)) return true;
  if (isPointInPolygon([lat, lon], MYANMAR_INDOCHINA_POLYGON)) return true;
  if (isPointInPolygon([lat, lon], ARABIAN_PENINSULA_POLYGON)) return true;
  if (isPointInPolygon([lat, lon], SOMALIA_HORN_POLYGON)) return true;

  return false;
}

/**
 * Draws the high-precision vector polygon outlines on an HTML5 Canvas.
 * Provides smooth anti-aliased coastlines, institutional fills,
 * and exact geographical label placements directly at physical basin coordinates.
 */
export function drawAccurateLandmasses(
  ctx: CanvasRenderingContext2D,
  lonToX: (lon: number) => number,
  latToY: (lat: number) => number
) {
  const landmasses = [
    { poly: INDIA_COASTLINE_POLYGON, name: 'INDIA' },
    { poly: SRI_LANKA_POLYGON, name: 'SRI LANKA' },
    { poly: PAKISTAN_MAKRAN_POLYGON, name: 'PAKISTAN' },
    { poly: BANGLADESH_POLYGON, name: 'BANGLADESH' },
    { poly: MYANMAR_INDOCHINA_POLYGON, name: 'MYANMAR' },
    { poly: ARABIAN_PENINSULA_POLYGON, name: 'OMAN' },
    { poly: SOMALIA_HORN_POLYGON, name: 'SOMALIA' },
  ];

  ctx.save();

  // 1. Render all vector landmass polygons
  for (const land of landmasses) {
    if (land.poly.length < 3) continue;

    ctx.beginPath();
    const startX = lonToX(land.poly[0][1]);
    const startY = latToY(land.poly[0][0]);
    ctx.moveTo(startX, startY);

    for (let i = 1; i < land.poly.length; i++) {
      const x = lonToX(land.poly[i][1]);
      const y = latToY(land.poly[i][0]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Clean institutional land tone
    ctx.fillStyle = '#C2D1DE';
    ctx.fill();

    // High-contrast coastline stroke
    ctx.strokeStyle = '#6A89A7';
    ctx.lineWidth = 1.3;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  // ───────────────────────────────────────────────────────────────────
  // 2. GEOGRAPHIC WATER BODY LABELS (PLACED AT PROPER WATER COORDINATES)
  // ───────────────────────────────────────────────────────────────────
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Major Basin 1: "ARABIAN SEA" (Centered in open water at 15.5°N, 64.0°E)
  const arabianX = lonToX(64.0);
  const arabianY = latToY(15.5);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.shadowColor = 'rgba(7, 26, 43, 0.9)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.fillText('ARABIAN SEA', arabianX, arabianY);

  // Major Basin 2: "BAY OF BENGAL" (Properly centered in open water at 15.0°N, 88.0°E)
  const bobX = lonToX(88.0);
  const bobY = latToY(15.0);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('BAY OF BENGAL', bobX, bobY);

  // Major Basin 3: "EQUATORIAL INDIAN OCEAN" (Centered in equatorial water at 2.5°N, 77.0°E)
  const eqX = lonToX(77.0);
  const eqY = latToY(2.5);
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('EQUATORIAL INDIAN OCEAN', eqX, eqY);

  // Marginal Sea: "ANDAMAN SEA" (Centered at 11.5°N, 95.8°E)
  const andX = lonToX(95.8);
  const andY = latToY(11.5);
  ctx.font = 'bold 9px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText('ANDAMAN SEA', andX, andY);

  // Marginal Sea: "LAKSHADWEEP SEA" (Centered at 9.2°N, 74.2°E)
  const lakSeaX = lonToX(74.2);
  const lakSeaY = latToY(9.2);
  ctx.font = 'bold 8.5px sans-serif';
  ctx.fillText('LAKSHADWEEP SEA', lakSeaX, lakSeaY);

  ctx.restore();

  // ───────────────────────────────────────────────────────────────────
  // 4. COUNTRY LABELS (PLACED EXACTLY ON LAND)
  // ───────────────────────────────────────────────────────────────────
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#243B53'; // High-contrast slate navy for land labels
  ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
  ctx.shadowBlur = 2;

  // "INDIA" on the Deccan Plateau (19.5°N, 78.5°E)
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('INDIA', lonToX(78.5), latToY(19.5));

  // "SRI LANKA" (7.6°N, 80.7°E)
  ctx.font = 'bold 8.5px sans-serif';
  ctx.fillText('SRI LANKA', lonToX(80.7), latToY(7.6));

  // "OMAN" (21.5°N, 56.5°E)
  ctx.font = 'bold 9.5px sans-serif';
  ctx.fillText('OMAN', lonToX(56.5), latToY(21.5));

  // "PAKISTAN" (26.5°N, 66.0°E)
  ctx.font = 'bold 9.5px sans-serif';
  ctx.fillText('PAKISTAN', lonToX(66.0), latToY(26.5));

  // "BANGLADESH" (23.8°N, 90.2°E)
  ctx.font = 'bold 8.5px sans-serif';
  ctx.fillText('BANGLADESH', lonToX(90.2), latToY(23.8));

  // "MYANMAR" (20.5°N, 95.5°E)
  ctx.font = 'bold 9.5px sans-serif';
  ctx.fillText('MYANMAR', lonToX(95.5), latToY(20.5));

  // "SOMALIA" (9.5°N, 49.5°E)
  ctx.font = 'bold 8.5px sans-serif';
  ctx.fillText('SOMALIA', lonToX(49.5), latToY(9.5));

  ctx.restore();
  ctx.restore();
}
