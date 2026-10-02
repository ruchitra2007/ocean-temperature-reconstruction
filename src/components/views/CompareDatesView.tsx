import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  GitCompare, 
  Calendar, 
  Layers, 
  MapPin, 
  ArrowRight,
  ShieldAlert,
  Thermometer
} from 'lucide-react';
import { 
  DEPTH_LEVELS, 
  SEASON_PRESETS, 
  computeOceanPhysics, 
  getVerticalProfile, 
  isPointLand,
  OceanGridCell
} from '../../data/oceanData';
import { getTemperatureColor } from '../../utils/colormap';
import { drawAccurateLandmasses } from '../../utils/indiaGeo';

interface CompareDatesViewProps {
  selectedDepth: number;
  onDepthChange: (depth: number) => void;
}

export const CompareDatesView: React.FC<CompareDatesViewProps> = ({
  selectedDepth,
  onDepthChange,
}) => {
  const [date1Id, setDate1Id] = useState<string>('sw-monsoon'); // July
  const [date2Id, setDate2Id] = useState<string>('ne-monsoon'); // January
  const [viewMode, setViewMode] = useState<'split' | 'delta'>('split');

  const [probeCoord, setProbeCoord] = useState<{ lat: number; lon: number; name: string }>({
    lat: 16.0,
    lon: 64.0,
    name: 'Arabian Sea (Seasonal Upwelling Zone)',
  });

  const canvas1Ref = useRef<HTMLCanvasElement | null>(null);
  const canvas2Ref = useRef<HTMLCanvasElement | null>(null);
  const deltaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const minLon = 50;
  const maxLon = 100;
  const minLat = 0;
  const maxLat = 26;
  const gridResolution = 1.0;

  // Preset definitions
  const season1 = SEASON_PRESETS.find((p) => p.id === date1Id);
  const season2 = SEASON_PRESETS.find((p) => p.id === date2Id);

  // Profile data for both dates at probe coordinate
  const profile1 = useMemo(() => getVerticalProfile(probeCoord.lat, probeCoord.lon, date1Id), [probeCoord, date1Id]);
  const profile2 = useMemo(() => getVerticalProfile(probeCoord.lat, probeCoord.lon, date2Id), [probeCoord, date2Id]);

  const physics1 = useMemo(() => computeOceanPhysics(probeCoord.lat, probeCoord.lon, selectedDepth, date1Id), [probeCoord, selectedDepth, date1Id]);
  const physics2 = useMemo(() => computeOceanPhysics(probeCoord.lat, probeCoord.lon, selectedDepth, date2Id), [probeCoord, selectedDepth, date2Id]);

  // Render maps
  useEffect(() => {
    const drawGrid = (canvas: HTMLCanvasElement | null, dateId: string) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Clean plain ocean blue base
      const oceanGrad = ctx.createLinearGradient(0, 0, width, height);
      oceanGrad.addColorStop(0, '#0C4475');
      oceanGrad.addColorStop(0.5, '#125C99');
      oceanGrad.addColorStop(1, '#1A7BBF');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      const lonToX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * width;
      const latToY = (lat: number) => height - ((lat - minLat) / (maxLat - minLat)) * height;

      // Smooth continuous thermal field without square boxes
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
            const cell = computeOceanPhysics(lat, lon, selectedDepth, dateId);
            offCtx.fillStyle = getTemperatureColor(cell.temp);
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

      // Draw accurate India and landmass vector outlines
      drawAccurateLandmasses(ctx, lonToX, latToY);

      // Draw probe marker
      const px = lonToX(probeCoord.lon);
      const py = latToY(probeCoord.lat);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#20C4D9';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    if (viewMode === 'split') {
      drawGrid(canvas1Ref.current, date1Id);
      drawGrid(canvas2Ref.current, date2Id);
    } else {
      // Draw Delta Map (T2 - T1)
      const canvas = deltaCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Clean plain ocean blue base
      const oceanGrad = ctx.createLinearGradient(0, 0, width, height);
      oceanGrad.addColorStop(0, '#0C4475');
      oceanGrad.addColorStop(0.5, '#125C99');
      oceanGrad.addColorStop(1, '#1A7BBF');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      const lonToX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * width;
      const latToY = (lat: number) => height - ((lat - minLat) / (maxLat - minLat)) * height;

      // Smooth continuous differential field without square boxes
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
            const cell1 = computeOceanPhysics(lat, lon, selectedDepth, date1Id);
            const cell2 = computeOceanPhysics(lat, lon, selectedDepth, date2Id);
            const deltaT = cell2.temp - cell1.temp;
            const norm = Math.max(-1, Math.min(1, deltaT / 4.0));
            if (norm < 0) {
              const f = Math.abs(norm);
              offCtx.fillStyle = `rgb(${Math.round(230 - f * 200)}, ${Math.round(240 - f * 150)}, ${Math.round(255 - f * 30)})`;
            } else {
              const f = norm;
              offCtx.fillStyle = `rgb(${Math.round(230 + f * 25)}, ${Math.round(240 - f * 130)}, ${Math.round(240 - f * 200)})`;
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

      // Draw accurate India and landmass vector outlines
      drawAccurateLandmasses(ctx, lonToX, latToY);

      // Draw probe marker
      const px = lonToX(probeCoord.lon);
      const py = latToY(probeCoord.lat);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#20C4D9';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [date1Id, date2Id, selectedDepth, probeCoord, viewMode]);

  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lon = Math.round((minLon + (x / canvas.width) * (maxLon - minLon)) * 10) / 10;
    const lat = Math.round((minLat + (1 - y / canvas.height) * (maxLat - minLat)) * 10) / 10;

    if (isPointLand(lat, lon)) return;

    let region = 'North Indian Ocean';
    if (lon < 77.5) region = 'Arabian Sea';
    else if (lat >= 5) region = 'Bay of Bengal';
    else region = 'Equatorial Indian Ocean';

    setProbeCoord({
      lat,
      lon,
      name: `${region} [${lat}°N, ${lon}°E]`,
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E6EF] pb-4">
        <div>
          <div className="text-[11px] font-bold text-[#0B4F6C] uppercase tracking-wider">
            Comparative Reconstructions
          </div>
          <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Seasonal Temperature Differential
          </h2>
          <p className="text-xs text-[#627D98] mt-1">
            Compare reconstructed ocean temperatures across monsoon regimes at <strong className="text-[#102A43]">{selectedDepth} m depth</strong>
          </p>
        </div>

        {/* View Mode Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#D9E6EF] rounded-lg shadow-2xs">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'split' ? 'bg-[#071A2B] text-white shadow-xs' : 'text-[#627D98] hover:text-[#102A43]'
            }`}
          >
            Side-by-Side Split
          </button>
          <button
            onClick={() => setViewMode('delta')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'delta' ? 'bg-[#071A2B] text-white shadow-xs' : 'text-[#627D98] hover:text-[#102A43]'
            }`}
          >
            Difference Map (ΔT)
          </button>
        </div>
      </div>

      {/* Season Selection Header Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 bg-white rounded-xl border border-[#D9E6EF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B4F6C]" />
            <span className="text-xs font-bold text-[#102A43]">Baseline Epoch (Date 1):</span>
          </div>
          <select
            value={date1Id}
            onChange={(e) => setDate1Id(e.target.value)}
            className="text-xs font-semibold text-[#102A43] bg-[#F5F9FC] border border-[#D9E6EF] rounded-md px-2 py-1 focus:outline-hidden"
          >
            {SEASON_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.date})
              </option>
            ))}
          </select>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#D9E6EF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#20C4D9]" />
            <span className="text-xs font-bold text-[#102A43]">Comparison Epoch (Date 2):</span>
          </div>
          <select
            value={date2Id}
            onChange={(e) => setDate2Id(e.target.value)}
            className="text-xs font-semibold text-[#102A43] bg-[#F5F9FC] border border-[#D9E6EF] rounded-md px-2 py-1 focus:outline-hidden"
          >
            {SEASON_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Comparative View */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map 1 */}
          <div className="bg-white rounded-xl border border-[#D9E6EF] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0B4F6C]">{season1?.name}</span>
              <span className="text-[11px] font-mono text-[#627D98]">Depth: {selectedDepth}m</span>
            </div>
            <div className="relative border border-[#D9E6EF] rounded-lg overflow-hidden bg-[#0B2B4A] cursor-crosshair">
              <canvas
                ref={canvas1Ref}
                width={480}
                height={300}
                onClick={handleMapClick}
                className="w-full h-auto block"
              />
            </div>
          </div>

          {/* Map 2 */}
          <div className="bg-white rounded-xl border border-[#D9E6EF] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#20C4D9]">{season2?.name}</span>
              <span className="text-[11px] font-mono text-[#627D98]">Depth: {selectedDepth}m</span>
            </div>
            <div className="relative border border-[#D9E6EF] rounded-lg overflow-hidden bg-[#0B2B4A] cursor-crosshair">
              <canvas
                ref={canvas2Ref}
                width={480}
                height={300}
                onClick={handleMapClick}
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Delta Map */
        <div className="bg-white rounded-xl border border-[#D9E6EF] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#102A43]">
                Temperature Differential: {season2?.name} minus {season1?.name}
              </h3>
              <p className="text-xs text-[#627D98]">
                Blue indicates cooling; Amber-red indicates warming in comparison epoch at {selectedDepth}m
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-blue-700">-4.0°C</span>
              <div className="w-32 h-3 rounded bg-linear-to-r from-blue-700 via-slate-100 to-amber-600" />
              <span className="text-amber-700">+4.0°C</span>
            </div>
          </div>

          <div className="relative border border-[#D9E6EF] rounded-lg overflow-hidden bg-[#0B2B4A] cursor-crosshair max-w-3xl mx-auto">
            <canvas
              ref={deltaCanvasRef}
              width={650}
              height={390}
              onClick={handleMapClick}
              className="w-full h-auto block"
            />
          </div>
        </div>
      )}

      {/* Dual Comparative Profile Probe at Selected Location */}
      <div className="bg-white rounded-xl border border-[#D9E6EF] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EBF2F7] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-[#0B4F6C]" />
              <h3 className="text-sm font-bold text-[#102A43]">
                Comparative Vertical CTD Profile
              </h3>
            </div>
            <div className="text-xs font-mono text-[#627D98] mt-0.5">
              Probing: {probeCoord.name}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-[#0B4F6C]">
              <span className="w-3 h-0.5 bg-[#0B4F6C] inline-block" /> {season1?.name}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[#20C4D9]">
              <span className="w-3 h-0.5 bg-[#20C4D9] inline-block" /> {season2?.name}
            </span>
          </div>
        </div>

        {/* Comparison Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
          <div className="p-3 bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg">
            <div className="text-[10px] font-bold text-[#627D98] uppercase">MLD Date 1</div>
            <div className="text-base font-bold font-mono text-[#0B4F6C] tabular-nums">
              {physics1.mld} <span className="text-[10px] text-[#627D98]">m</span>
            </div>
          </div>
          <div className="p-3 bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg">
            <div className="text-[10px] font-bold text-[#627D98] uppercase">MLD Date 2</div>
            <div className="text-base font-bold font-mono text-[#20C4D9] tabular-nums">
              {physics2.mld} <span className="text-[10px] text-[#627D98]">m</span>
            </div>
          </div>
          <div className="p-3 bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg">
            <div className="text-[10px] font-bold text-[#627D98] uppercase">D20 Date 1</div>
            <div className="text-base font-bold font-mono text-[#0B4F6C] tabular-nums">
              {physics1.d20} <span className="text-[10px] text-[#627D98]">m</span>
            </div>
          </div>
          <div className="p-3 bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg">
            <div className="text-[10px] font-bold text-[#627D98] uppercase">D20 Date 2</div>
            <div className="text-base font-bold font-mono text-[#20C4D9] tabular-nums">
              {physics2.d20} <span className="text-[10px] text-[#627D98]">m</span>
            </div>
          </div>
        </div>

        {/* Dual Curve SVG Chart */}
        <div className="w-full h-64 bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg p-3 relative">
          <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
            {/* Depth grid */}
            {[0, 100, 200, 500, 1000].map((d) => {
              const y = (d / 1000) * 190 + 15;
              return (
                <g key={d}>
                  <line x1="40" y1={y} x2="580" y2={y} stroke="#D9E6EF" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="32" y={y + 3} textAnchor="end" fontSize="9" fill="#829AB1" fontFamily="monospace">
                    {d}m
                  </text>
                </g>
              );
            })}

            {/* Temperature grid */}
            {[10, 15, 20, 25, 30].map((t) => {
              const x = 40 + ((t - 5) / 28) * 540;
              return (
                <g key={t}>
                  <line x1={x} y1="15" x2={x} y2="205" stroke="#D9E6EF" strokeWidth="1" />
                  <text x={x} y="218" textAnchor="middle" fontSize="9" fill="#829AB1" fontFamily="monospace">
                    {t}°C
                  </text>
                </g>
              );
            })}

            {/* Curve 1 (Date 1) */}
            {(() => {
              const points = profile1
                .map((p) => {
                  const x = 40 + ((p.reconstructedTemp - 5) / 28) * 540;
                  const y = (p.depth / 1000) * 190 + 15;
                  return `${x},${y}`;
                })
                .join(' ');
              return <polyline fill="none" stroke="#0B4F6C" strokeWidth="2.5" points={points} />;
            })()}

            {/* Curve 2 (Date 2) */}
            {(() => {
              const points = profile2
                .map((p) => {
                  const x = 40 + ((p.reconstructedTemp - 5) / 28) * 540;
                  const y = (p.depth / 1000) * 190 + 15;
                  return `${x},${y}`;
                })
                .join(' ');
              return <polyline fill="none" stroke="#20C4D9" strokeWidth="2.5" points={points} />;
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
};
