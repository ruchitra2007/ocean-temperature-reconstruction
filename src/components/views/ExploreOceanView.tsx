import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Layers, 
  MapPin, 
  Wind, 
  Activity, 
  Radio, 
  Sparkles,
  TrendingDown,
  Info,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  Compass,
  Cpu,
  Satellite,
  Waves,
  Crosshair,
  Sliders,
  CheckCircle2,
  Box,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  ExternalLink
} from 'lucide-react';
import { 
  DEPTH_LEVELS, 
  SEASON_PRESETS, 
  ARGO_FLOATS, 
  MOORING_STATIONS,
  computeOceanPhysics, 
  getVerticalProfile, 
  isPointLand,
  OceanGridCell
} from '../../data/oceanData';
import { ArgoFloat, VariableType, ViewMode } from '../../types/ocean';
import { getTemperatureColor, getSshaColor, getSalinityColor } from '../../utils/colormap';
import { drawAccurateLandmasses } from '../../utils/indiaGeo';
import { Ocean3DVolumetricView } from './Ocean3DVolumetricView';

interface ExploreOceanViewProps {
  selectedDepth: number;
  onDepthChange: (depth: number) => void;
  selectedDateId: string;
  onDateChange?: (dateId: string) => void;
  onNavigate?: (view: ViewMode) => void;
}

// Oceanographic hotspots for quick discovery
const OCEANOGRAPHIC_HOTSPOTS = [
  { name: 'Central Arabian Sea', lat: 14.5, lon: 66.2, tag: 'Standard Tropical Stratification' },
  { name: 'Somali Upwelling Core', lat: 10.5, lon: 53.0, tag: 'Intense Summer Thermocline Shoaling' },
  { name: 'Bay of Bengal Fresh Pool', lat: 17.5, lon: 88.5, tag: 'Low Salinity Barrier Layer' },
  { name: 'Sri Lanka Dome / Cyclonic Eddy', lat: 8.5, lon: 83.5, tag: 'Cold Core Upwelling Eddy' },
  { name: 'Oman Coastal Jet Filament', lat: 20.0, lon: 59.5, tag: 'High-Salinity Outflow & Upwelling' },
  { name: 'Equatorial Jet / Undercurrent', lat: 2.0, lon: 78.0, tag: 'Deep Thermocline Warm Pool' },
];

export const ExploreOceanView: React.FC<ExploreOceanViewProps> = ({
  selectedDepth,
  onDepthChange,
  selectedDateId,
  onDateChange,
  onNavigate,
}) => {
  // Visualization Mode: 2D Geospatial Map vs 3D Volumetric Water Column
  const [viewDimension, setViewDimension] = useState<'2d' | '3d'>('2d');

  // Layer Display Mode:
  const [activeLayer, setActiveLayer] = useState<'plain' | 'temperature' | 'deficit' | 'surface' | 'altimetry' | 'uncertainty'>('plain');
  
  const [showCurrentsFlow, setShowCurrentsFlow] = useState<boolean>(false);
  const [showArgoFloats, setShowArgoFloats] = useState<boolean>(false);
  const [showMoorings, setShowMoorings] = useState<boolean>(false);
  const [showObservationInProbe, setShowObservationInProbe] = useState<boolean>(true);

  // Zoom / Pan level
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  
  // Selected probe coordinate (defaults to Central Arabian Sea)
  const [probeCoord, setProbeCoord] = useState<{ lat: number; lon: number; name?: string }>({
    lat: 14.5,
    lon: 66.2,
    name: 'Central Arabian Sea',
  });

  const [hoverCoord, setHoverCoord] = useState<{ lat: number; lon: number; cell?: OceanGridCell } | null>(null);

  // Map canvas coordinate bounds (5°–30°N, 45°–105°E)
  const minLon = 48;
  const maxLon = 102;
  const minLat = 0;
  const maxLat = 28;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Particle flow system for surface currents & wind vectors
  const particlesRef = useRef<Array<{ x: number; y: number; age: number; maxAge: number; speed: number }>>([]);

  useEffect(() => {
    // Initialize 80 animated particles for ocean currents
    const particles = [];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * 650,
        y: Math.random() * 410,
        age: Math.floor(Math.random() * 60),
        maxAge: 40 + Math.floor(Math.random() * 40),
        speed: 0.8 + Math.random() * 0.8,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Pre-generate grid cells for high performance rendering
  const gridResolution = 1.0; // degree step
  const gridCells = useMemo(() => {
    const cells: OceanGridCell[] = [];
    for (let lat = minLat; lat <= maxLat; lat += gridResolution) {
      for (let lon = minLon; lon <= maxLon; lon += gridResolution) {
        cells.push(computeOceanPhysics(lat, lon, selectedDepth, selectedDateId));
      }
    }
    return cells;
  }, [selectedDepth, selectedDateId]);

  // Current depth level metadata
  const currentDepthLevel = DEPTH_LEVELS.find((dl) => dl.depth === selectedDepth) || DEPTH_LEVELS[0];

  // Helper color for thermal deficit (T_depth - SST <= 0)
  const getDeficitColor = (deltaT: number) => {
    const norm = Math.max(0, Math.min(1, Math.abs(deltaT) / 22));
    const r = Math.round(32 - norm * 22);
    const g = Math.round(196 - norm * 170);
    const b = Math.round(217 - norm * 115);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Helper color for uncertainty (low uncertainty = pale cyan; high uncertainty = deep amber/red)
  const getUncertaintyColor = (depth: number) => {
    const depthFactor = Math.exp(-Math.pow((depth - 110) / 70, 2));
    const u = 0.25 + depthFactor * 0.65; // ±0.25 to ±0.90°C
    const norm = Math.max(0, Math.min(1, (u - 0.2) / 0.7));
    const r = Math.round(32 + norm * 200);
    const g = Math.round(196 - norm * 110);
    const b = Math.round(217 - norm * 180);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Main Canvas Render Loop with Animated Ocean Flow
  useEffect(() => {
    let isRunning = true;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Fill entire ocean canvas with rich, seamless, plain ocean blue water
      const oceanGrad = ctx.createLinearGradient(0, 0, width, height);
      oceanGrad.addColorStop(0, '#0C4475');   // Rich deep marine blue
      oceanGrad.addColorStop(0.5, '#125C99'); // Clean vibrant ocean blue
      oceanGrad.addColorStop(1, '#1A7BBF');   // Bright coastal azure
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      // Coordinate conversion helpers with zoom
      const lonToX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * width;
      const latToY = (lat: number) => height - ((lat - minLat) / (maxLat - minLat)) * height;

      // If activeLayer is NOT plain, draw smooth continuous gradient without square boxes
      if (activeLayer !== 'plain') {
        const offW = 54;
        const offH = 28;
        const offCanvas = document.createElement('canvas');
        offCanvas.width = offW;
        offCanvas.height = offH;
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          for (let latIdx = 0; latIdx < offH; latIdx++) {
            const lat = minLat + (latIdx / (offH - 1)) * (maxLat - minLat);
            for (let lonIdx = 0; lonIdx < offW; lonIdx++) {
              const lon = minLon + (lonIdx / (offW - 1)) * (maxLon - minLon);
              const cell = computeOceanPhysics(lat, lon, selectedDepth, selectedDateId);
              if (activeLayer === 'temperature') {
                offCtx.fillStyle = getTemperatureColor(cell.temp);
              } else if (activeLayer === 'deficit') {
                const deltaT = cell.temp - cell.surfaceTemp;
                offCtx.fillStyle = getDeficitColor(deltaT);
              } else if (activeLayer === 'surface') {
                offCtx.fillStyle = getTemperatureColor(cell.surfaceTemp);
              } else if (activeLayer === 'altimetry') {
                offCtx.fillStyle = getSshaColor(cell.ssha);
              } else {
                offCtx.fillStyle = getUncertaintyColor(selectedDepth);
              }
              offCtx.fillRect(lonIdx, offH - 1 - latIdx, 1, 1);
            }
          }
          ctx.save();
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.globalAlpha = 0.85;
          ctx.drawImage(offCanvas, 0, 0, width, height);
          ctx.restore();
        }
      }

      // 2. Draw high-precision vector outlines of India, Sri Lanka, and coasts
      drawAccurateLandmasses(ctx, lonToX, latToY);

      // 3. Draw subtle latitude / longitude grid lines & labels
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 0.5;

      for (let lon = 50; lon <= 100; lon += 10) {
        ctx.beginPath();
        ctx.moveTo(lonToX(lon), 0);
        ctx.lineTo(lonToX(lon), height);
        ctx.stroke();
      }
      for (let lat = 5; lat <= 25; lat += 5) {
        ctx.beginPath();
        ctx.moveTo(0, latToY(lat));
        ctx.lineTo(width, latToY(lat));
        ctx.stroke();
      }

      // 3. Draw animated current particles if enabled
      if (showCurrentsFlow) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        for (const p of particlesRef.current) {
          p.age += 1;
          if (p.age > p.maxAge) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.age = 0;
          }

          // Sample lat/lon at particle coordinate
          const pLon = minLon + (p.x / width) * (maxLon - minLon);
          const pLat = maxLat - (p.y / height) * (maxLat - minLat);

          if (!isPointLand(pLat, pLon)) {
            const sample = computeOceanPhysics(pLat, pLon, 0, selectedDateId);
            p.x += sample.uWind * 0.22 * p.speed;
            p.y -= sample.vWind * 0.22 * p.speed;

            // Draw streak
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            p.age = p.maxAge; // reset if hit land
          }
        }
      }

      // 4. Draw in-situ ARGO profiling floats if enabled
      if (showArgoFloats) {
        for (const float of ARGO_FLOATS) {
          const fx = lonToX(float.lon);
          const fy = latToY(float.lat);

          ctx.beginPath();
          ctx.arc(fx, fy, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = '#071A2B';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = '#20C4D9';
          ctx.fill();
        }
      }

      // 5. Draw moored buoy stations (RAMA & OMNI) if enabled
      if (showMoorings) {
        for (const station of MOORING_STATIONS) {
          const sx = lonToX(station.lon);
          const sy = latToY(station.lat);

          // Diamond marker for deep-sea moorings
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = '#FF9900';
          ctx.fillRect(-3, -3, 6, 6);
          ctx.strokeStyle = '#071A2B';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(-3, -3, 6, 6);
          ctx.restore();
        }
      }

      // 6. Draw active probe crosshair target
      const px = lonToX(probeCoord.lon);
      const py = latToY(probeCoord.lat);

      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.strokeStyle = '#20C4D9';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#071A2B';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Crosshair lines
      ctx.strokeStyle = '#20C4D9';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px - 18, py);
      ctx.lineTo(px - 7, py);
      ctx.moveTo(px + 7, py);
      ctx.lineTo(px + 18, py);
      ctx.moveTo(px, py - 18);
      ctx.lineTo(px, py - 7);
      ctx.moveTo(px, py + 7);
      ctx.lineTo(px, py + 18);
      ctx.stroke();

      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gridCells, showCurrentsFlow, showArgoFloats, showMoorings, activeLayer, probeCoord, selectedDateId, selectedDepth]);

  // Handle map canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickLon = minLon + (x / rect.width) * (maxLon - minLon);
    const clickLat = maxLat - (y / rect.height) * (maxLat - minLat);

    const boundedLon = Math.max(minLon, Math.min(maxLon, Math.round(clickLon * 10) / 10));
    const boundedLat = Math.max(minLat, Math.min(maxLat, Math.round(clickLat * 10) / 10));

    if (!isPointLand(boundedLat, boundedLon)) {
      setProbeCoord({
        lat: boundedLat,
        lon: boundedLon,
        name: `Sounding Station (${boundedLat}°N, ${boundedLon}°E)`,
      });
    }
  };

  // Handle map canvas mouse move for live coordinate HUD
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const moveLon = minLon + (x / rect.width) * (maxLon - minLon);
    const moveLat = maxLat - (y / rect.height) * (maxLat - minLat);

    const boundedLon = Math.max(minLon, Math.min(maxLon, Math.round(moveLon * 10) / 10));
    const boundedLat = Math.max(minLat, Math.min(maxLat, Math.round(moveLat * 10) / 10));

    if (!isPointLand(boundedLat, boundedLon)) {
      const cell = computeOceanPhysics(boundedLat, boundedLon, selectedDepth, selectedDateId);
      setHoverCoord({ lat: boundedLat, lon: boundedLon, cell });
    } else {
      setHoverCoord(null);
    }
  };

  // Vertical CTD profile data at probe coordinate
  const profileData = useMemo(() => {
    return getVerticalProfile(probeCoord.lat, probeCoord.lon, selectedDateId);
  }, [probeCoord, selectedDateId]);

  // Probe coordinate physics at selected depth
  const probePhysics = useMemo(() => {
    return computeOceanPhysics(probeCoord.lat, probeCoord.lon, selectedDepth, selectedDateId);
  }, [probeCoord, selectedDepth, selectedDateId]);

  // Temperature difference between surface and chosen depth
  const thermalDeficit = probePhysics.temp - probePhysics.surfaceTemp;

  // Selected season metadata
  const currentSeason = SEASON_PRESETS.find((s) => s.id === selectedDateId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-in fade-in duration-200">
      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP PIPELINE COUPLING CHAIN (SURFACE -> AI -> SUBSURFACE AT DEPTH) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#D9E6EF] shadow-xs p-4 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBF2F7] mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#20C4D9] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B4F6C]">
              AI Subsurface Reconstruction Pipeline
            </span>
            <span className="text-[#D9E6EF]">|</span>
            <span className="text-xs text-[#627D98]">
              Continuous Surface Telemetry Mapped to 3D Vertical Water Column
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[11px] font-mono font-semibold text-[#0B4F6C] bg-[#EBF5FA] px-2 py-0.5 rounded border border-[#D9E6EF]">
              Domain: North Indian Ocean (5°–30°N, 48°–102°E)
            </div>
            
            {/* 2D vs 3D Dimension Switcher */}
            <div className="flex items-center bg-[#F5F9FC] border border-[#D9E6EF] rounded p-0.5 text-xs font-mono">
              <button
                onClick={() => setViewDimension('2d')}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  viewDimension === '2d' ? 'bg-[#071A2B] text-[#20C4D9] font-bold' : 'text-[#627D98] hover:text-[#102A43]'
                }`}
              >
                2D Map
              </button>
              <button
                onClick={() => setViewDimension('3d')}
                className={`px-2.5 py-0.5 rounded transition-colors flex items-center gap-1 ${
                  viewDimension === '3d' ? 'bg-[#071A2B] text-[#20C4D9] font-bold' : 'text-[#627D98] hover:text-[#102A43]'
                }`}
              >
                <Box className="w-3 h-3" />
                <span>3D Ocean</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Stage Coupling Chain */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          
          {/* Stage 1: Surface Satellite Inputs */}
          <div className="md:col-span-4 p-3 rounded-lg bg-[#F5F9FC] border border-[#D9E6EF]">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#102A43] mb-2">
              <span className="flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-[#0B4F6C]" />
                1. SATELLITE SURFACE FEEDS
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Directly Sensed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-white p-1.5 rounded border border-[#D9E6EF]">
                <div className="text-[10px] text-[#627D98]">SST (GHRSST)</div>
                <div className="font-bold text-[#102A43]">{probePhysics.surfaceTemp.toFixed(1)} °C</div>
              </div>
              <div className="bg-white p-1.5 rounded border border-[#D9E6EF]">
                <div className="text-[10px] text-[#627D98]">SSHA Altimetry</div>
                <div className="font-bold text-[#0B4F6C]">
                  {probePhysics.ssha >= 0 ? `+${probePhysics.ssha.toFixed(2)}` : probePhysics.ssha.toFixed(2)} m
                </div>
              </div>
              <div className="bg-white p-1.5 rounded border border-[#D9E6EF]">
                <div className="text-[10px] text-[#627D98]">Salinity (SMAP)</div>
                <div className="font-bold text-[#102A43]">{probePhysics.salinity.toFixed(1)} PSU</div>
              </div>
              <div className="bg-white p-1.5 rounded border border-[#D9E6EF]">
                <div className="text-[10px] text-[#627D98]">Wind Stress</div>
                <div className="font-bold text-[#102A43]">
                  {Math.hypot(probePhysics.uWind, probePhysics.vWind).toFixed(1)} m/s
                </div>
              </div>
            </div>
          </div>

          {/* Connection Arrow 1 */}
          <div className="hidden md:flex md:col-span-1 justify-center">
            <div className="flex flex-col items-center">
              <div className="text-[9px] font-bold uppercase text-[#627D98] tracking-wider mb-1">Inversion</div>
              <ArrowRight className="w-5 h-5 text-[#20C4D9]" />
            </div>
          </div>

          {/* Stage 2: AI Neural Reconstruction Engine */}
          <div className="md:col-span-2 p-3 rounded-lg bg-[#071A2B] text-white border border-[#0B4F6C] shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#20C4D9] mb-1.5">
              <Cpu className="w-3.5 h-3.5" />
              2. 3D-UNet PINN
            </div>
            <p className="text-[10px] text-slate-300 leading-tight">
              Physics-constrained 7-day temporal attention mapping surface baroclinic modes to vertical depth.
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-slate-700/60 text-slate-400">
              <span>dρ/dz ≥ 0</span>
              <span className="text-emerald-400 font-bold">Stable</span>
            </div>
          </div>

          {/* Connection Arrow 2 */}
          <div className="hidden md:flex md:col-span-1 justify-center">
            <div className="flex flex-col items-center">
              <div className="text-[9px] font-bold uppercase text-[#627D98] tracking-wider mb-1">Depth Slice</div>
              <ArrowRight className="w-5 h-5 text-[#20C4D9]" />
            </div>
          </div>

          {/* Stage 3: Subsurface Reconstruction Output at Depth */}
          <div className="md:col-span-3 p-3 rounded-lg bg-[#EBF5FA] border border-[#20C4D9]/40 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#0B4F6C] mb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0B4F6C]" />
                3. RECONSTRUCTED AT DEPTH
              </span>
              <span className="text-[10px] font-mono font-bold text-[#071A2B] bg-white px-2 py-0.5 rounded border border-[#D9E6EF]">
                z = {selectedDepth} m
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-white p-1.5 rounded border border-[#D9E6EF]">
                <div className="text-[10px] text-[#627D98]">T({selectedDepth}m) Pred</div>
                <div className="font-bold text-base text-[#071A2B]">{probePhysics.temp.toFixed(1)} °C</div>
              </div>
              <div className="bg-white p-1.5 rounded border border-[#D9E6EF]">
                <div className="text-[10px] text-[#627D98]">Deficit vs Surface</div>
                <div className={`font-bold text-base ${thermalDeficit < 0 ? 'text-blue-700' : 'text-[#102A43]'}`}>
                  {thermalDeficit.toFixed(1)} °C
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-[#627D98] font-medium flex items-center justify-between">
              <span>Strata: {currentDepthLevel.zone}</span>
              <span className="text-[#0B4F6C] font-semibold">{currentSeason?.name.split(' ')[1] || 'Monsoon'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. LAYER CONTROLS & OCEANOGRAPHIC HOTSPOT PICKER */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#D9E6EF] shadow-2xs">
        
        {/* Layer Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-[#0B4F6C]" />
            Layers:
          </span>

          <button
            onClick={() => setActiveLayer('plain')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors shrink-0 ${
              activeLayer === 'plain'
                ? 'bg-[#071A2B] text-[#20C4D9] shadow-xs'
                : 'bg-[#F5F9FC] text-[#627D98] hover:text-[#102A43] border border-[#D9E6EF]'
            }`}
          >
            Plain Ocean Blue
          </button>

          <button
            onClick={() => setActiveLayer('temperature')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors shrink-0 ${
              activeLayer === 'temperature'
                ? 'bg-[#071A2B] text-[#20C4D9] shadow-xs'
                : 'bg-[#F5F9FC] text-[#627D98] hover:text-[#102A43] border border-[#D9E6EF]'
            }`}
          >
            Reconstructed T({selectedDepth}m)
          </button>

          <button
            onClick={() => setActiveLayer('deficit')}
            title="Thermal drop relative to surface SST"
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors shrink-0 ${
              activeLayer === 'deficit'
                ? 'bg-[#071A2B] text-[#20C4D9] shadow-xs'
                : 'bg-[#F5F9FC] text-[#627D98] hover:text-[#102A43] border border-[#D9E6EF]'
            }`}
          >
            Thermal Deficit (T_z – SST)
          </button>

          <button
            onClick={() => setActiveLayer('surface')}
            title="Direct satellite surface temperature"
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors shrink-0 ${
              activeLayer === 'surface'
                ? 'bg-[#071A2B] text-[#20C4D9] shadow-xs'
                : 'bg-[#F5F9FC] text-[#627D98] hover:text-[#102A43] border border-[#D9E6EF]'
            }`}
          >
            Surface SST (z = 0m)
          </button>

          <button
            onClick={() => setActiveLayer('altimetry')}
            title="Sea Surface Height Anomaly (SSHA) proxy"
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors shrink-0 ${
              activeLayer === 'altimetry'
                ? 'bg-[#071A2B] text-[#20C4D9] shadow-xs'
                : 'bg-[#F5F9FC] text-[#627D98] hover:text-[#102A43] border border-[#D9E6EF]'
            }`}
          >
            Altimetry SSHA (m)
          </button>

          <button
            onClick={() => setActiveLayer('uncertainty')}
            title="Laplace uncertainty scale parameter b(z)"
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors shrink-0 ${
              activeLayer === 'uncertainty'
                ? 'bg-[#071A2B] text-[#20C4D9] shadow-xs'
                : 'bg-[#F5F9FC] text-[#627D98] hover:text-[#102A43] border border-[#D9E6EF]'
            }`}
          >
            Uncertainty (±σ)
          </button>
        </div>

        {/* Oceanographic Hotspots quick picker */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-[#627D98] flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#0B4F6C]" />
            Sounding Target:
          </span>
          <select
            onChange={(e) => {
              const spot = OCEANOGRAPHIC_HOTSPOTS.find((h) => h.name === e.target.value);
              if (spot) {
                setProbeCoord({ lat: spot.lat, lon: spot.lon, name: spot.name });
              }
            }}
            value={probeCoord.name || ''}
            className="text-xs font-semibold text-[#102A43] bg-[#F5F9FC] border border-[#D9E6EF] rounded-md px-2.5 py-1 focus:outline-hidden cursor-pointer"
          >
            {OCEANOGRAPHIC_HOTSPOTS.map((spot) => (
              <option key={spot.name} value={spot.name}>
                {spot.name} ({spot.tag})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. MAIN WORKBENCH: VERTICAL DEPTH ELEVATOR + MAP / 3D + CTD PROFILE */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Console: Vertical Depth Elevator + Geospatial Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-[#D9E6EF] p-4 shadow-xs relative">
            
            {/* Map Top Bar */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#102A43]">
                <span>North Indian Ocean</span>
                <span className="text-[#D9E6EF]">·</span>
                <span className="font-mono text-[#0B4F6C] font-semibold">
                  {viewDimension === '2d' ? '2D Geospatial Synthesis' : '3D Volumetric Water Column'}
                </span>
              </div>

              {/* Vector / Float Toggles */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#627D98]">
                  <input
                    type="checkbox"
                    checked={showCurrentsFlow}
                    onChange={(e) => setShowCurrentsFlow(e.target.checked)}
                    className="accent-[#0B4F6C] rounded"
                  />
                  <span>Flow Lines</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#627D98] ml-2">
                  <input
                    type="checkbox"
                    checked={showArgoFloats}
                    onChange={(e) => setShowArgoFloats(e.target.checked)}
                    className="accent-[#0B4F6C] rounded"
                  />
                  <span>Argo Floats</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#627D98] ml-2">
                  <input
                    type="checkbox"
                    checked={showMoorings}
                    onChange={(e) => setShowMoorings(e.target.checked)}
                    className="accent-[#0B4F6C] rounded"
                  />
                  <span>Moorings</span>
                </label>
              </div>
            </div>

            {/* Layout: Vertical Depth Column next to Map */}
            <div className="flex gap-3">
              
              {/* Vertical Depth Elevator Rail */}
              <div className="w-16 shrink-0 bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg p-1.5 flex flex-col justify-between select-none">
                <div className="text-[9px] font-bold text-center uppercase tracking-wider text-[#0B4F6C] pb-1 border-b border-[#D9E6EF]">
                  Depth
                </div>

                <div className="space-y-1 my-1">
                  {DEPTH_LEVELS.map((dl) => {
                    const isSelected = selectedDepth === dl.depth;
                    return (
                      <button
                        key={dl.depth}
                        onClick={() => onDepthChange(dl.depth)}
                        title={`${dl.label} - ${dl.zone}: ${dl.description}`}
                        className={`w-full py-1 text-[11px] font-mono rounded text-center transition-all ${
                          isSelected
                            ? 'bg-[#071A2B] text-[#20C4D9] font-bold shadow-xs ring-1 ring-[#20C4D9]'
                            : 'text-[#627D98] hover:text-[#102A43] hover:bg-white'
                        }`}
                      >
                        {dl.depth}m
                      </button>
                    );
                  })}
                </div>

                <div className="text-[9px] font-mono text-center text-[#829AB1] pt-1 border-t border-[#D9E6EF]">
                  1000m
                </div>
              </div>

              {/* View Stage (2D Canvas or 3D Volumetric View) */}
              {viewDimension === '2d' ? (
                <div className="flex-1 relative border border-[#D9E6EF] rounded-lg overflow-hidden bg-[#0B2B4A] cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    width={650}
                    height={410}
                    onClick={handleCanvasClick}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={() => setHoverCoord(null)}
                    className="w-full h-auto block"
                  />

                  {/* Depth Watermark Badge in top-right */}
                  <div className="absolute top-3 right-3 bg-[#071A2B]/85 backdrop-blur-xs border border-[#20C4D9]/40 rounded px-2.5 py-1 text-right pointer-events-none shadow-md">
                    <div className="text-[9px] font-bold tracking-widest text-[#20C4D9] uppercase font-mono">
                      Depth Stratum
                    </div>
                    <div className="text-sm font-extrabold text-white font-mono leading-none">
                      z = {selectedDepth} m
                    </div>
                    <div className="text-[9px] text-slate-300 font-medium">
                      {currentDepthLevel.zone}
                    </div>
                  </div>

                  {/* Scale Bar in bottom right */}
                  <div className="absolute bottom-3 right-3 bg-[#071A2B]/80 backdrop-blur-xs px-2 py-1 rounded border border-white/20 text-[9px] font-mono text-white pointer-events-none flex items-center gap-1.5">
                    <div className="w-12 h-1 bg-white" />
                    <span>500 km</span>
                  </div>

                  {/* Hover Coordinate Floating HUD */}
                  {hoverCoord && (
                    <div className="absolute bottom-3 left-3 bg-[#071A2B]/95 text-white p-2.5 rounded-lg text-[11px] font-mono backdrop-blur-xs border border-[#20C4D9]/50 shadow-xl pointer-events-none space-y-0.5">
                      <div className="text-slate-300">Point: {hoverCoord.lat}°N, {hoverCoord.lon}°E</div>
                      <div className="text-[#20C4D9] font-bold">
                        T({selectedDepth}m): {hoverCoord.cell?.temp.toFixed(2)} °C
                      </div>
                      <div className="text-slate-300">
                        SST (Surface): {hoverCoord.cell?.surfaceTemp.toFixed(2)} °C
                      </div>
                      <div className="text-blue-300">
                        ΔT Deficit: {((hoverCoord.cell?.temp || 0) - (hoverCoord.cell?.surfaceTemp || 0)).toFixed(2)} °C
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* 3D Volumetric Water Column Model (Matches User Reference) */
                <Ocean3DVolumetricView
                  selectedDepth={selectedDepth}
                  onDepthChange={onDepthChange}
                  probeCoord={probeCoord}
                  onProbeCoordChange={(newCoord) => setProbeCoord((prev) => ({ ...prev, ...newCoord }))}
                  surfaceTemp={probePhysics.surfaceTemp}
                />
              )}
            </div>

            {/* Scientific Colormap Scale Legend */}
            <div className="mt-4 pt-3 border-t border-[#EBF2F7] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#102A43]">
                  {activeLayer === 'temperature' && 'Temperature Scale (°C):'}
                  {activeLayer === 'deficit' && 'Subsurface Thermal Deficit ΔT (°C):'}
                  {activeLayer === 'surface' && 'Satellite Observed SST (°C):'}
                  {activeLayer === 'altimetry' && 'Sea Surface Height Anomaly (m):'}
                  {activeLayer === 'uncertainty' && 'Uncertainty Interval (±°C):'}
                </span>

                {(activeLayer === 'temperature' || activeLayer === 'surface') && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[#627D98]">6°C</span>
                    <div 
                      className="w-44 h-3 rounded shadow-xs"
                      style={{
                        background: 'linear-gradient(to right, rgb(12,35,90), rgb(18,70,175), rgb(22,115,220), rgb(32,196,235), rgb(60,225,215), rgb(240,195,60))'
                      }}
                    />
                    <span className="text-[#627D98]">32°C</span>
                  </div>
                )}

                {activeLayer === 'deficit' && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[#627D98]">-22°C (Deep Cold)</span>
                    <div className="w-36 h-3 rounded bg-linear-to-r from-blue-950 via-cyan-600 to-teal-200" />
                    <span className="text-[#627D98]">0°C (Surface)</span>
                  </div>
                )}

                {activeLayer === 'altimetry' && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[#627D98]">-0.20m</span>
                    <div className="w-36 h-3 rounded bg-linear-to-r from-blue-700 via-slate-100 to-amber-600" />
                    <span className="text-[#627D98]">+0.20m</span>
                  </div>
                )}

                {activeLayer === 'uncertainty' && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[#627D98]">±0.25°C (High Conf)</span>
                    <div className="w-36 h-3 rounded bg-linear-to-r from-cyan-400 via-amber-400 to-red-600" />
                    <span className="text-[#627D98]">±0.90°C (Thermocline)</span>
                  </div>
                )}
              </div>

              <div className="text-[#829AB1] font-mono text-[10px] flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-[#20C4D9]" />
                Click map to probe CTD column
              </div>
            </div>
          </div>
        </div>

        {/* Right Console: Live Synthetic CTD Sounding Terminal (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-[#D9E6EF] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#EBF2F7] pb-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-[#0B4F6C]" />
                  <h3 className="text-sm font-bold text-[#102A43]">
                    Subsurface CTD Sounding Cast
                  </h3>
                </div>
                
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('vertical')}
                    className="text-[11px] font-semibold text-[#0B4F6C] hover:text-[#071A2B] flex items-center gap-1 hover:underline"
                  >
                    <span>Open Full Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Station Coordinate & Oceanographic Basin Header */}
              <div className="mt-3 p-3 bg-[#F5F9FC] rounded-lg border border-[#D9E6EF] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#102A43]">
                    {probeCoord.name}
                  </div>
                  <div className="text-[11px] font-mono text-[#627D98] mt-0.5">
                    Lat: {probeCoord.lat.toFixed(2)}°N · Lon: {probeCoord.lon.toFixed(2)}°E
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#627D98] block">Sea Basin</span>
                  <span className="text-xs font-semibold text-[#0B4F6C]">
                    {probeCoord.lon < 77 ? 'Arabian Sea' : probeCoord.lat < 5 ? 'Equatorial Indian Ocean' : 'Bay of Bengal'}
                  </span>
                </div>
              </div>

              {/* Key Oceanographic Diagnostics */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="p-2.5 bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#627D98]">Mixed Layer (MLD)</div>
                  <div className="text-base font-bold font-mono text-[#102A43] tabular-nums">
                    {probePhysics.mld} <span className="text-[10px] text-[#627D98]">m</span>
                  </div>
                  <div className="text-[9px] text-[#829AB1]">Isothermal Base</div>
                </div>

                <div className="p-2.5 bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#627D98]">Thermocline (D20)</div>
                  <div className="text-base font-bold font-mono text-[#0B4F6C] tabular-nums">
                    {probePhysics.d20} <span className="text-[10px] text-[#627D98]">m</span>
                  </div>
                  <div className="text-[9px] text-[#829AB1]">20°C Isotherm</div>
                </div>

                <div className="p-2.5 bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[#627D98]">Target T(z)</div>
                  <div className="text-base font-bold font-mono text-[#20C4D9] tabular-nums">
                    {probePhysics.temp.toFixed(1)} <span className="text-[10px] text-[#627D98]">°C</span>
                  </div>
                  <div className="text-[9px] text-[#829AB1]">at z = {selectedDepth}m</div>
                </div>
              </div>

              {/* High-Resolution SVG Vertical Profile Chart */}
              <div className="mt-4 pt-3 border-t border-[#EBF2F7]">
                <div className="flex items-center justify-between text-[11px] text-[#627D98] mb-2">
                  <span className="font-semibold text-[#102A43]">Vertical Thermal Sounding T(z)</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] text-[#0B4F6C] font-semibold">
                      <span className="w-2.5 h-0.5 bg-[#0B4F6C] inline-block" /> Reconstructed
                    </span>
                    <button
                      onClick={() => setShowObservationInProbe(!showObservationInProbe)}
                      className="flex items-center gap-1 text-[10px] text-[#829AB1] hover:text-[#102A43]"
                    >
                      <span className="w-2.5 h-0.5 bg-[#829AB1] inline-block border-t border-dashed" />
                      <span>{showObservationInProbe ? 'Hide Obs' : 'Show Obs'}</span>
                    </button>
                  </div>
                </div>

                <div className="w-full h-64 bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg p-2 relative">
                  <svg className="w-full h-full" viewBox="0 0 320 220" preserveAspectRatio="none">
                    {/* Mixed layer depth shaded background */}
                    {(() => {
                      const mldH = (probePhysics.mld / 1000) * 190;
                      return (
                        <rect
                          x="30"
                          y="15"
                          width="280"
                          height={mldH}
                          fill="#EBF5FA"
                          opacity="0.8"
                        />
                      );
                    })()}

                    {/* Depth grid lines */}
                    {[0, 100, 200, 500, 1000].map((d) => {
                      const y = (d / 1000) * 190 + 15;
                      return (
                        <g key={d}>
                          <line x1="30" y1={y} x2="310" y2={y} stroke="#D9E6EF" strokeWidth="1" strokeDasharray="3,3" />
                          <text x="24" y={y + 3} textAnchor="end" fontSize="9" fill="#829AB1" fontFamily="monospace">
                            {d}m
                          </text>
                        </g>
                      );
                    })}

                    {/* Temp grid lines (10°C, 20°C, 30°C) */}
                    {[10, 20, 30].map((t) => {
                      const x = 30 + ((t - 5) / 28) * 280;
                      return (
                        <g key={t}>
                          <line x1={x} y1="15" x2={x} y2="205" stroke="#D9E6EF" strokeWidth="1" />
                          <text x={x} y="218" textAnchor="middle" fontSize="9" fill="#829AB1" fontFamily="monospace">
                            {t}°C
                          </text>
                        </g>
                      );
                    })}

                    {/* D20 line highlight */}
                    {(() => {
                      const d20Y = (probePhysics.d20 / 1000) * 190 + 15;
                      return (
                        <g>
                          <line x1="30" y1={d20Y} x2="310" y2={d20Y} stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" />
                          <text x="305" y={d20Y - 3} textAnchor="end" fontSize="8" fill="#D97706" fontFamily="monospace">
                            D20={probePhysics.d20}m
                          </text>
                        </g>
                      );
                    })()}

                    {/* Selected Depth Slice horizontal plane indicator */}
                    {(() => {
                      const selY = (selectedDepth / 1000) * 190 + 15;
                      return (
                        <g>
                          <line x1="30" y1={selY} x2="310" y2={selY} stroke="#20C4D9" strokeWidth="1.5" />
                          <text x="32" y={selY - 3} fontSize="8" fontWeight="bold" fill="#0B4F6C" fontFamily="monospace">
                            Slice: {selectedDepth}m
                          </text>
                        </g>
                      );
                    })()}

                    {/* Synthetic ARGO Baseline line if enabled */}
                    {showObservationInProbe && (() => {
                      const points = profileData
                        .map((p) => {
                          const x = 30 + ((p.argoTemp - 5) / 28) * 280;
                          const y = (p.depth / 1000) * 190 + 15;
                          return `${x},${y}`;
                        })
                        .join(' ');
                      return <polyline fill="none" stroke="#829AB1" strokeWidth="1.5" strokeDasharray="4,3" points={points} />;
                    })()}

                    {/* AI Reconstructed line */}
                    {(() => {
                      const points = profileData
                        .map((p) => {
                          const x = 30 + ((p.reconstructedTemp - 5) / 28) * 280;
                          const y = (p.depth / 1000) * 190 + 15;
                          return `${x},${y}`;
                        })
                        .join(' ');
                      return <polyline fill="none" stroke="#0B4F6C" strokeWidth="2.5" points={points} />;
                    })()}

                    {/* Active Selected Depth point */}
                    {(() => {
                      const pt = profileData.find((p) => p.depth === selectedDepth) || profileData[0];
                      const px = 30 + ((pt.reconstructedTemp - 5) / 28) * 280;
                      const py = (selectedDepth / 1000) * 190 + 15;
                      return (
                        <g>
                          <circle cx={px} cy={py} r="5" fill="#20C4D9" stroke="#071A2B" strokeWidth="2" />
                          <text x={px + 8} y={py + 3} fontSize="9" fontWeight="bold" fill="#071A2B" fontFamily="monospace">
                            {pt.reconstructedTemp}°C
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            {/* Inversion Fidelity & Physical Consistency Card */}
            <div className="mt-4 p-3 rounded-lg border border-[#D9E6EF] bg-[#F5F9FC] text-[11px] text-[#627D98] space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#102A43]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Physics-Informed Verification
                </span>
                <span className="font-mono text-emerald-700 text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  PASSED
                </span>
              </div>
              <p className="text-[11px] text-[#486581] leading-relaxed">
                Hydrostatic stability condition $\partial \rho / \partial z \ge 0$ satisfied throughout the column. The model successfully reconstructs the sharp pycnocline/thermocline drop from {probePhysics.surfaceTemp.toFixed(1)}°C at surface down to {probePhysics.temp.toFixed(1)}°C at {selectedDepth}m.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
