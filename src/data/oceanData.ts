import { DepthLevel, SeasonPreset, ArgoFloat, MooringStation, TransectLine } from '../types/ocean';
import { isPointAccurateLand } from '../utils/indiaGeo';

export const DEPTH_LEVELS: DepthLevel[] = [
  { depth: 0, label: '0 m (Surface)', zone: 'Surface Layer', description: 'Directly sensed by satellite infrared and microwave radiometers (SST)' },
  { depth: 10, label: '10 m', zone: 'Surface Layer', description: 'Upper euphotic zone, strongly mixed by surface wind stress' },
  { depth: 20, label: '20 m', zone: 'Mixed Layer', description: 'Within isothermal mixed layer across most of the basin' },
  { depth: 50, label: '50 m', zone: 'Mixed Layer', description: 'Mixed layer base in monsoon season; upper thermocline in calm periods' },
  { depth: 75, label: '75 m', zone: 'Upper Thermocline', description: 'Sharp vertical temperature gradient start in Bay of Bengal' },
  { depth: 100, label: '100 m', zone: 'Upper Thermocline', description: 'Core of the seasonal thermocline; sensitive to planetary waves' },
  { depth: 150, label: '150 m', zone: 'Main Thermocline', description: 'Main thermocline, depth of the 20°C isotherm (D20) in southern basin' },
  { depth: 200, label: '200 m', zone: 'Main Thermocline', description: 'Permanent thermocline level, below wind-driven mixing' },
  { depth: 300, label: '300 m', zone: 'Intermediate Water', description: 'Subsurface Arabian Sea High Salinity Water (ASHSW) mass influence' },
  { depth: 500, label: '500 m', zone: 'Intermediate Water', description: 'Red Sea and Persian Gulf outflow water mass intrusion depth' },
  { depth: 750, label: '750 m', zone: 'Deep Ocean', description: 'Deep intermediate water with stable thermal stratification' },
  { depth: 1000, label: '1000 m', zone: 'Deep Ocean', description: 'Deep bathyal layer (~6-7°C), unperturbed by atmospheric seasonality' },
];

export const SEASON_PRESETS: SeasonPreset[] = [
  {
    id: 'sw-monsoon',
    date: '2024-07-15',
    name: 'Peak Southwest Monsoon',
    monsoonPhase: 'Summer Monsoon (JJAS)',
    description: 'Vigorous Findlater Jet drives intense coastal upwelling off Somalia and Oman (SST drops to 22-25°C). Strong thermocline shoaling in western Arabian Sea and deep warm pool in eastern Bay of Bengal.',
  },
  {
    id: 'ne-monsoon',
    date: '2025-01-15',
    name: 'Peak Northeast Monsoon',
    monsoonPhase: 'Winter Monsoon (DJF)',
    description: 'Dry, cool continental northeasterly winds trigger convective cooling and deep winter mixing in the Northern Arabian Sea (SST ~24°C, mixed layer deepens to 80-100m).',
  },
  {
    id: 'pre-monsoon',
    date: '2024-05-15',
    name: 'Spring Pre-Monsoon Peak',
    monsoonPhase: 'Spring Transition (MAM)',
    description: 'Maximum incoming insolation with light winds creates the warmest ocean surface in the world (SST > 30.5°C), high Tropical Cyclone Heat Potential (TCHP) in Bay of Bengal.',
  },
  {
    id: 'post-monsoon',
    date: '2024-10-15',
    name: 'Autumn Post-Monsoon',
    monsoonPhase: 'Autumn Transition (ON)',
    description: 'Calm winds and decaying summer circulation. Significant river discharge in Bay of Bengal produces strong salinity stratification and barrier layer formation.',
  },
];

export const ARGO_FLOATS: ArgoFloat[] = [
  {
    id: 'argo-2902144',
    wmoId: '2902144',
    lat: 14.5,
    lon: 66.2,
    region: 'Arabian Sea',
    deploymentDate: '2021-08-14',
    lastProfileDate: '2024-07-14',
    maxDepth: 2000,
    surfaceTemp: 28.4,
    salinitySurface: 36.4,
    mld: 48,
    d20: 112,
  },
  {
    id: 'argo-2902150',
    wmoId: '2902150',
    lat: 16.2,
    lon: 89.4,
    region: 'Bay of Bengal',
    deploymentDate: '2022-03-10',
    lastProfileDate: '2024-07-13',
    maxDepth: 2000,
    surfaceTemp: 29.3,
    salinitySurface: 32.1,
    mld: 32,
    d20: 95,
  },
  {
    id: 'argo-2902162',
    wmoId: '2902162',
    lat: 10.8,
    lon: 72.5,
    region: 'Arabian Sea',
    deploymentDate: '2020-11-22',
    lastProfileDate: '2024-07-15',
    maxDepth: 2000,
    surfaceTemp: 28.8,
    salinitySurface: 35.8,
    mld: 42,
    d20: 125,
  },
  {
    id: 'argo-2902170',
    wmoId: '2902170',
    lat: 3.5,
    lon: 80.2,
    region: 'Equatorial Indian Ocean',
    deploymentDate: '2023-01-18',
    lastProfileDate: '2024-07-12',
    maxDepth: 2000,
    surfaceTemp: 29.1,
    salinitySurface: 34.9,
    mld: 55,
    d20: 135,
  },
  {
    id: 'argo-2902188',
    wmoId: '2902188',
    lat: 21.4,
    lon: 63.8,
    region: 'Arabian Sea',
    deploymentDate: '2021-05-04',
    lastProfileDate: '2024-07-14',
    maxDepth: 2000,
    surfaceTemp: 27.6,
    salinitySurface: 36.9,
    mld: 62,
    d20: 108,
  },
  {
    id: 'argo-2902195',
    wmoId: '2902195',
    lat: 11.2,
    lon: 92.8,
    region: 'Bay of Bengal',
    deploymentDate: '2022-09-17',
    lastProfileDate: '2024-07-15',
    maxDepth: 2000,
    surfaceTemp: 29.0,
    salinitySurface: 33.2,
    mld: 38,
    d20: 104,
  },
  {
    id: 'argo-2902203',
    wmoId: '2902203',
    lat: 8.5,
    lon: 58.6,
    region: 'Arabian Sea',
    deploymentDate: '2023-04-11',
    lastProfileDate: '2024-07-15',
    maxDepth: 2000,
    surfaceTemp: 25.1, // coastal upwelling zone
    salinitySurface: 35.7,
    mld: 28,
    d20: 72,
  },
  {
    id: 'argo-2902214',
    wmoId: '2902214',
    lat: 5.2,
    lon: 91.5,
    region: 'Equatorial Indian Ocean',
    deploymentDate: '2022-07-29',
    lastProfileDate: '2024-07-13',
    maxDepth: 2000,
    surfaceTemp: 29.4,
    salinitySurface: 34.6,
    mld: 50,
    d20: 128,
  },
];

export const MOORING_STATIONS: MooringStation[] = [
  {
    id: 'rama-15n-90e',
    name: 'RAMA 15°N, 90°E',
    network: 'RAMA / INCOIS',
    lat: 15.0,
    lon: 90.0,
    waterDepth: 2850,
    region: 'Central Bay of Bengal',
    description: 'Continuous surface meteorological and subsurface acoustic Doppler current/temperature array monitoring monsoon air-sea interactions and cyclogenesis.',
  },
  {
    id: 'rama-12n-68e',
    name: 'RAMA 12°N, 68°E',
    network: 'RAMA / INCOIS',
    lat: 12.0,
    lon: 68.0,
    waterDepth: 3950,
    region: 'Eastern Arabian Sea',
    description: 'Captures the Lakshadweep High and Low eddy systems, monsoon onset vortex formation, and salinity intrusion.',
  },
  {
    id: 'rama-0n-80e',
    name: 'RAMA 0°N, 80.5°E',
    network: 'RAMA / PMEL',
    lat: 0.0,
    lon: 80.5,
    waterDepth: 4500,
    region: 'Equatorial Indian Ocean',
    description: 'Equatorial wave dynamics monitor tracking eastward Wyrtki Jets and Dipole Mode Index (DMI) subsurface thermocline tilt.',
  },
  {
    id: 'omni-bd08',
    name: 'OMNI BD08 18.2°N, 89.7°E',
    network: 'OMNI / MoES India',
    lat: 18.2,
    lon: 89.7,
    waterDepth: 2100,
    region: 'Northern Bay of Bengal',
    description: 'Moored buoy capturing strong seasonal Ganges river freshwater runoff, high salinity stratification, and cyclone passage tracks.',
  },
];

export const TRANSECT_PRESETS: TransectLine[] = [
  {
    id: 'transect-10n',
    name: '10°N Zonal Section (Arabian Sea to Bay of Bengal)',
    type: 'zonal',
    description: 'Crosses from 52°E (off Somalia/Yemen) across the Arabian Sea, passes south of India/Sri Lanka, through central Bay of Bengal to 96°E (Andaman Sea).',
    start: { lat: 10, lon: 52, name: 'Western Arabian Sea' },
    end: { lat: 10, lon: 96, name: 'Andaman Basin' },
    fixedValue: 10,
  },
  {
    id: 'transect-15n',
    name: '15°N Zonal Section (Mid-Basin Cross Section)',
    type: 'zonal',
    description: 'Crosses Central Arabian Sea (58°E to 73°E) and Central Bay of Bengal (82°E to 93°E), contrasting the saline west with the fresh eastern basin.',
    start: { lat: 15, lon: 58, name: 'Central Arabian Sea' },
    end: { lat: 15, lon: 93, name: 'East Bay of Bengal' },
    fixedValue: 15,
  },
  {
    id: 'transect-65e',
    name: '65°E Meridional Section (Arabian Sea)',
    type: 'meridional',
    description: 'Extends from the Equator (0°N) northward across the Arabian Sea to the Makran coast (23°N), capturing the transition from equatorial currents to winter cooling.',
    start: { lat: 0, lon: 65, name: 'Equatorial Basin' },
    end: { lat: 23, lon: 65, name: 'Northern Arabian Sea' },
    fixedValue: 65,
  },
  {
    id: 'transect-88e',
    name: '88°E Meridional Section (Bay of Bengal)',
    type: 'meridional',
    description: 'Runs from 2°N through Sri Lanka outflow, central cyclogenesis zone, up to 21°N off the Ganga delta, showing dramatic freshwater barrier layer capping.',
    start: { lat: 2, lon: 88, name: 'South Bay of Bengal' },
    end: { lat: 21, lon: 88, name: 'Head of Bay' },
    fixedValue: 88,
  },
];

// Physical oceanographic calculation helper for point data
// Uses high-precision polygon boundaries for India, Sri Lanka, and surrounding coasts
export function isPointLand(lat: number, lon: number): boolean {
  return isPointAccurateLand(lat, lon);
}

export interface OceanGridCell {
  lat: number;
  lon: number;
  isLand: boolean;
  temp: number; // at selected depth
  surfaceTemp: number;
  mld: number;
  d20: number;
  ssha: number; // m
  salinity: number; // PSU
  uWind: number; // m/s
  vWind: number; // m/s
}

export function computeOceanPhysics(
  lat: number,
  lon: number,
  depth: number,
  dateId: string
): OceanGridCell {
  const isLand = isPointLand(lat, lon);
  if (isLand) {
    return {
      lat,
      lon,
      isLand: true,
      temp: 0,
      surfaceTemp: 0,
      mld: 0,
      d20: 0,
      ssha: 0,
      salinity: 0,
      uWind: 0,
      vWind: 0,
    };
  }

  const isArabianSea = lon < 77.5;
  const isBayOfBengal = lon >= 77.5 && lon <= 98.0 && lat >= 5.0;
  const isEquatorial = lat < 5.0;

  // Baseline surface temperature (°C)
  let sstBase = 28.5;
  let ssha = 0.04;
  let salinity = 35.0;
  let mld = 45; // meters
  let d20 = 110; // meters

  // Wind vectors (u: zonal, v: meridional)
  let uWind = 4.0;
  let vWind = 2.0;

  // Seasonal modulation
  if (dateId === 'sw-monsoon') {
    // Summer SW monsoon: Findlater Jet, intense upwelling off Somalia & Oman
    uWind = 11.0;
    vWind = 8.5;

    if (isArabianSea) {
      salinity = 36.2 + (lat / 25) * 0.8;
      // Upwelling zone near western boundary (Somalia: 5°N-11°N, 50°E-55°E; Oman: 16°N-21°N, 55°E-60°E)
      const distToSomalia = Math.hypot(lat - 9, lon - 52);
      const distToOman = Math.hypot(lat - 18, lon - 57);
      if (distToSomalia < 5.5 || distToOman < 4.5) {
        // Upwelling cool wedge
        sstBase = 23.5 + Math.min(distToSomalia, distToOman) * 0.9;
        ssha = -0.18 + Math.min(distToSomalia, distToOman) * 0.02;
        mld = 25;
        d20 = 65; // very shallow cold thermocline
      } else {
        sstBase = 28.0 - (lat / 25) * 1.5;
        mld = 60 + Math.sin((lon - 65) / 10) * 15;
        d20 = 115;
        ssha = 0.02;
      }
    } else if (isBayOfBengal) {
      // Warm pool in eastern Bay of Bengal, fresh water starting to layer
      sstBase = 29.2 + Math.cos(lat / 15) * 0.6;
      salinity = 33.2 - (lat / 22) * 2.8; // Fresher towards north
      mld = 32;
      d20 = 98;
      ssha = 0.08 + Math.sin(lat / 8) * 0.05;
      uWind = 7.0;
      vWind = 4.0;
    } else {
      // Equatorial
      sstBase = 28.8;
      mld = 50;
      d20 = 125;
      ssha = 0.05;
      uWind = 5.0;
      vWind = 1.0;
    }
  } else if (dateId === 'ne-monsoon') {
    // Winter NE monsoon: Northeasterly cool dry winds
    uWind = -5.5;
    vWind = -4.0;

    if (isArabianSea) {
      // Winter convective cooling in north (lat > 18°N)
      if (lat > 16) {
        sstBase = 24.2 + (24 - lat) * 0.6;
        mld = 85 + (lat - 16) * 5; // deep winter convection
        d20 = 110;
        ssha = -0.06;
      } else {
        sstBase = 27.5;
        mld = 55;
        d20 = 120;
      }
      salinity = 36.4;
    } else if (isBayOfBengal) {
      sstBase = 26.8 + (15 - lat) * 0.3;
      salinity = 32.5 - (lat / 20) * 2.0;
      mld = 40;
      d20 = 90;
      ssha = -0.02;
    } else {
      sstBase = 28.5;
      mld = 45;
      d20 = 130;
      ssha = 0.02;
    }
  } else if (dateId === 'pre-monsoon') {
    // Spring Pre-monsoon: maximum heating, calm winds
    uWind = 2.0;
    vWind = 1.5;
    sstBase = 30.2 + Math.sin(lat / 12) * 0.6;
    mld = 22; // very thin warm surface layer
    d20 = 105;
    ssha = 0.12;
    salinity = isBayOfBengal ? 33.5 : 36.0;
  } else {
    // Post-monsoon: freshwater barrier layers in Bay of Bengal
    uWind = -2.0;
    vWind = -1.0;
    sstBase = 28.6;
    if (isBayOfBengal && lat > 14) {
      salinity = 30.2; // intense freshwater plume
      mld = 20; // thin barrier layer capping
      d20 = 92;
      ssha = 0.07;
    } else {
      salinity = isArabianSea ? 36.2 : 33.8;
      mld = 38;
      d20 = 110;
      ssha = 0.03;
    }
  }

  // Modulate SSHA and depth profile with mesoscale eddy simulation
  const eddySignal = Math.sin(lat * 0.7 + lon * 0.4) * 0.08 + Math.cos(lat * 0.5 - lon * 0.6) * 0.06;
  ssha += eddySignal;
  // Dynamic height directly tilts the thermocline (1m SSHA ≈ 250m thermocline displacement in reduced gravity)
  d20 += eddySignal * 220;
  d20 = Math.max(50, Math.min(180, d20));

  // Compute depth-wise temperature using two-layer thermocline model:
  // T(z) = T_deep + (T_surf - T_deep) / (1 + exp((z - D20) / scale))
  const tDeep = 6.2; // Deep ocean temperature at 1000m
  let tempAtDepth = sstBase;

  if (depth <= mld) {
    // In mixed layer: quasi-isothermal with tiny diurnal decay
    tempAtDepth = sstBase - (depth / Math.max(1, mld)) * 0.25;
  } else {
    // In thermocline and deep layer
    // Scale parameter controls thermocline sharpness (sharper in Bay of Bengal)
    const thermoclineSharpness = isBayOfBengal ? 34 : 45;
    const zNorm = (depth - d20) / thermoclineSharpness;
    const sigmoid = 1 / (1 + Math.exp(zNorm));
    tempAtDepth = tDeep + (sstBase - tDeep) * sigmoid;

    // Small boundary layer adjustment for deep ocean (> 700m)
    if (depth >= 750) {
      tempAtDepth = tDeep + (1000 - depth) * 0.003;
    }
  }

  // Clamp within reasonable physical bounds
  tempAtDepth = Math.round(Math.max(5.5, Math.min(32.5, tempAtDepth)) * 100) / 100;

  return {
    lat,
    lon,
    isLand: false,
    temp: tempAtDepth,
    surfaceTemp: Math.round(sstBase * 10) / 10,
    mld: Math.round(mld),
    d20: Math.round(d20),
    ssha: Math.round(ssha * 100) / 100,
    salinity: Math.round(salinity * 10) / 10,
    uWind: Math.round(uWind * 10) / 10,
    vWind: Math.round(vWind * 10) / 10,
  };
}

// Generate vertical profile at specific coordinates
export function getVerticalProfile(lat: number, lon: number, dateId: string) {
  const profileDepths = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000];
  const points = profileDepths.map((depth, idx) => {
    const ocean = computeOceanPhysics(lat, lon, depth, dateId);
    // Synthetic ARGO baseline with small realistic oceanographic noise (+/- 0.18°C)
    // to illustrate validation comparison
    const noise = Math.sin(depth * 0.04 + lat) * 0.16 + Math.cos(depth * 0.08) * 0.12;
    const argoTemp = Math.round((ocean.temp + noise) * 100) / 100;
    
    // Approximate density (sigma-theta) using linear equation of state
    // sigma_t ≈ 28.0 - 0.25 * (T - 10) + 0.75 * (S - 35)
    const approxDensity = 28.0 - 0.25 * (ocean.temp - 10) + 0.75 * (ocean.salinity - 35);

    return {
      depth,
      reconstructedTemp: ocean.temp,
      argoTemp: Math.max(5.5, argoTemp),
      salinity: ocean.salinity + (depth > 200 ? 0.4 : 0),
      density: Math.round(approxDensity * 100) / 100,
      gradient: idx > 0 ? Math.round(((ocean.temp - computeOceanPhysics(lat, lon, profileDepths[idx - 1], dateId).temp) / (depth - profileDepths[idx - 1])) * 1000) / 100 : 0,
    };
  });

  return points;
}
