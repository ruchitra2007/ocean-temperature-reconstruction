export type ViewMode = 
  | 'overview'       // Dashboard
  | 'explore'        // Explore Ocean
  | 'compare'        // Compare Dates
  | 'vertical'       // Vertical Profile
  | 'timedepth'      // Time & Depth
  | 'transect'       // Transect
  | 'validation'     // Validation & Challenge Mode
  | 'provenance'     // Data & Provenance
  | 'architecture'   // AI Architecture
  | 'methodology';   // Methodology

export type VariableType = 'temperature' | 'ssha' | 'salinity' | 'wind';

export interface DepthLevel {
  depth: number; // in meters (0, 10, 20, 50, 75, 100, 150, 200, 300, 500, 750, 1000)
  label: string;
  zone: 'Surface Layer' | 'Mixed Layer' | 'Upper Thermocline' | 'Main Thermocline' | 'Intermediate Water' | 'Deep Ocean';
  description: string;
}

export interface SeasonPreset {
  id: string;
  date: string;
  name: string;
  monsoonPhase: string;
  description: string;
}

export interface OceanCoordinate {
  lat: number;
  lon: number;
  name?: string;
  region?: 'Arabian Sea' | 'Bay of Bengal' | 'Equatorial Indian Ocean';
}

export interface VerticalProfilePoint {
  depth: number;
  reconstructedTemp: number; // °C
  argoTemp?: number;         // °C (synthetic baseline for validation view)
  salinity: number;          // PSU
  density: number;           // sigma-theta kg/m3
  gradient: number;          // °C / 10m
}

export interface ArgoFloat {
  id: string;
  wmoId: string;
  lat: number;
  lon: number;
  region: 'Arabian Sea' | 'Bay of Bengal' | 'Equatorial Indian Ocean';
  deploymentDate: string;
  lastProfileDate: string;
  maxDepth: number;
  surfaceTemp: number;
  salinitySurface: number;
  mld: number; // mixed layer depth in meters
  d20: number; // 20-degree isotherm depth in meters
}

export interface TransectLine {
  id: string;
  name: string;
  type: 'zonal' | 'meridional' | 'custom';
  description: string;
  start: OceanCoordinate;
  end: OceanCoordinate;
  fixedValue: number; // fixed latitude or longitude
}

export interface MooringStation {
  id: string;
  name: string;
  network: string; // e.g., RAMA
  lat: number;
  lon: number;
  waterDepth: number;
  region: string;
  description: string;
}
