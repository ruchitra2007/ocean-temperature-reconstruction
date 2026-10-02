import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, 
  MapPin, 
  Thermometer, 
  Activity, 
  ShieldAlert, 
  Eye, 
  Compass, 
  CheckCircle2, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ARGO_FLOATS, MOORING_STATIONS, computeOceanPhysics, getVerticalProfile } from '../../data/oceanData';

interface VerticalProfileViewProps {
  selectedDateId: string;
}

export const VerticalProfileView: React.FC<VerticalProfileViewProps> = ({ selectedDateId }) => {
  // Preset stations or custom coordinate
  const [selectedStationId, setSelectedStationId] = useState<string>('argo-2902144');
  const [activeDepthHover, setActiveDepthHover] = useState<number | null>(null);
  const [showUncertaintyBand, setShowUncertaintyBand] = useState<boolean>(true);
  const [showClimatology, setShowClimatology] = useState<boolean>(true);

  // Selected station metadata
  const currentFloat = ARGO_FLOATS.find(f => f.id === selectedStationId) || ARGO_FLOATS[0];

  // Vertical CTD profile data
  const profilePoints = useMemo(() => {
    const raw = getVerticalProfile(currentFloat.lat, currentFloat.lon, selectedDateId);
    return raw.map(p => {
      // Climatology baseline (WOA23)
      const climDelta = Math.sin((p.depth / 200) * Math.PI) * 0.9;
      const climatologyTemp = Math.round((p.reconstructedTemp + climDelta) * 10) / 10;
      
      // Uncertainty envelope
      const depthFactor = Math.exp(-Math.pow((p.depth - 110) / 70, 2));
      const uncertainty = Math.round((0.25 + depthFactor * 0.65) * 100) / 100;

      return {
        ...p,
        climatologyTemp,
        uncertainty,
      };
    });
  }, [currentFloat, selectedDateId]);

  const physics = useMemo(() => {
    return computeOceanPhysics(currentFloat.lat, currentFloat.lon, 0, selectedDateId);
  }, [currentFloat, selectedDateId]);

  const deepWater = profilePoints.find(p => p.depth === 1000) || profilePoints[profilePoints.length - 1];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E6EF] pb-4">
        <div>
          <div className="text-[11px] font-bold text-[#0B4F6C] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-[#20C4D9]" />
            High-Resolution Column Sounding
          </div>
          <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Vertical Temperature Profile Analysis
          </h2>
          <p className="text-xs text-[#627D98] mt-0.5">
            Continuous CTD thermal sounding from surface (0m) to deep bathyal (1000m) with uncertainty calibration
          </p>
        </div>

        {/* Station Selector */}
        <div className="flex items-center gap-2 bg-white border border-[#D9E6EF] rounded-lg p-1 shadow-2xs">
          <span className="text-xs font-bold text-[#102A43] pl-2 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#0B4F6C]" />
            Station:
          </span>
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="text-xs font-semibold text-[#0B4F6C] bg-[#F5F9FC] border border-[#D9E6EF] rounded-md px-2.5 py-1 focus:outline-hidden cursor-pointer"
          >
            {ARGO_FLOATS.map((float) => (
              <option key={float.id} value={float.id}>
                ARGO #{float.wmoId} ({float.region} · {float.lat}°N, {float.lon}°E)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#D9E6EF] shadow-2xs">
          <div className="text-[10px] font-bold text-[#627D98] uppercase">Surface Temp (SST)</div>
          <div className="text-lg font-bold font-mono text-[#102A43] mt-0.5">
            {physics.surfaceTemp.toFixed(1)} <span className="text-xs font-normal text-[#627D98]">°C</span>
          </div>
          <div className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Directly Sensed
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#D9E6EF] shadow-2xs">
          <div className="text-[10px] font-bold text-[#627D98] uppercase">Mixed Layer (MLD)</div>
          <div className="text-lg font-bold font-mono text-[#0B4F6C] mt-0.5">
            {physics.mld} <span className="text-xs font-normal text-[#627D98]">m</span>
          </div>
          <div className="text-[10px] text-[#627D98] mt-1">
            Isothermal surface pool
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#D9E6EF] shadow-2xs">
          <div className="text-[10px] font-bold text-[#627D98] uppercase">Thermocline (D20)</div>
          <div className="text-lg font-bold font-mono text-amber-700 mt-0.5">
            {physics.d20} <span className="text-xs font-normal text-[#627D98]">m</span>
          </div>
          <div className="text-[10px] text-[#627D98] mt-1">
            20°C Isotherm Depth
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#D9E6EF] shadow-2xs">
          <div className="text-[10px] font-bold text-[#627D98] uppercase">Deep Temp (1000m)</div>
          <div className="text-lg font-bold font-mono text-blue-900 mt-0.5">
            {deepWater.reconstructedTemp.toFixed(1)} <span className="text-xs font-normal text-[#627D98]">°C</span>
          </div>
          <div className="text-[10px] text-[#627D98] mt-1">
            Bathyal stable water
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#D9E6EF] shadow-2xs">
          <div className="text-[10px] font-bold text-[#627D98] uppercase">Mean Uncertainty</div>
          <div className="text-lg font-bold font-mono text-[#20C4D9] mt-0.5">
            ±0.42 <span className="text-xs font-normal text-[#627D98]">°C</span>
          </div>
          <div className="text-[10px] text-[#0B4F6C] mt-1">
            95% Confidence Interval
          </div>
        </div>
      </div>

      {/* Main Two-Column Analysis Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Geographic Station Locator (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-[#D9E6EF] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBF2F7]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0B4F6C]" />
                <h3 className="text-sm font-bold text-[#102A43]">
                  Collocation Position
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#0B4F6C] bg-[#EBF5FA] px-2 py-0.5 rounded border border-[#D9E6EF]">
                WMO #{currentFloat.wmoId}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs text-[#627D98]">
              <div className="flex justify-between py-1 border-b border-[#F5F9FC]">
                <span>Coordinates:</span>
                <span className="font-mono font-bold text-[#102A43]">{currentFloat.lat}°N, {currentFloat.lon}°E</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F9FC]">
                <span>Ocean Basin:</span>
                <span className="font-semibold text-[#0B4F6C]">{currentFloat.region}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F9FC]">
                <span>Sampling Depth:</span>
                <span className="font-mono text-[#102A43]">{currentFloat.maxDepth} meters</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F9FC]">
                <span>Salinity at Surface:</span>
                <span className="font-mono text-[#102A43]">{currentFloat.salinitySurface} PSU</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Last Observation:</span>
                <span className="font-mono text-[#102A43]">{currentFloat.lastProfileDate}</span>
              </div>
            </div>

            {/* Layer Toggles for the chart */}
            <div className="mt-4 pt-3 border-t border-[#EBF2F7] space-y-2">
              <span className="text-[11px] font-bold text-[#102A43] uppercase tracking-wider block mb-1">
                Chart Trace Controls:
              </span>

              <label className="flex items-center justify-between text-xs text-[#486581] cursor-pointer p-1.5 rounded hover:bg-[#F5F9FC]">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-[#0B4F6C]" />
                  AI PINN Reconstruction
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded">Primary</span>
              </label>

              <label className="flex items-center justify-between text-xs text-[#486581] cursor-pointer p-1.5 rounded hover:bg-[#F5F9FC]">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showUncertaintyBand}
                    onChange={(e) => setShowUncertaintyBand(e.target.checked)}
                    className="accent-[#0B4F6C] rounded"
                  />
                  Uncertainty Envelope (±σ)
                </span>
                <span className="text-[10px] font-mono text-[#627D98]">95% CI</span>
              </label>

              <label className="flex items-center justify-between text-xs text-[#486581] cursor-pointer p-1.5 rounded hover:bg-[#F5F9FC]">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showClimatology}
                    onChange={(e) => setShowClimatology(e.target.checked)}
                    className="accent-[#0B4F6C] rounded"
                  />
                  Climatology (WOA23)
                </span>
                <span className="text-[10px] font-mono text-[#829AB1]">Baseline</span>
              </label>
            </div>
          </div>

          <div className="p-4 bg-[#F5F9FC] rounded-xl border border-[#D9E6EF] text-xs text-[#627D98] leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-[#102A43] mb-1">
              <Info className="w-4 h-4 text-[#0B4F6C]" />
              Thermocline Mechanics
            </div>
            In the North Indian Ocean, the thermocline (region of steepest vertical temperature gradient) typically occurs between 60m and 180m. The AI PINN model learns to resolve this sharp boundary using sea surface height anomaly (SSHA) and wind stress without smearing.
          </div>
        </div>

        {/* Right Column: High-Precision Sounding Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#D9E6EF] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBF2F7] mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#102A43]">
                CTD Thermal Profile T(z) vs Depth
              </h3>
              <p className="text-[11px] text-[#627D98]">
                X-Axis: Temperature (5°C to 32°C) · Y-Axis: Depth (0m to 1000m)
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#0B4F6C] font-semibold">
                <span className="w-3 h-0.5 bg-[#0B4F6C] inline-block" /> AI Reconstruction
              </span>
              <span className="flex items-center gap-1.5 text-[#829AB1]">
                <span className="w-3 h-0.5 bg-[#829AB1] inline-block border-t border-dashed" /> In-Situ Observation
              </span>
            </div>
          </div>

          {/* SVG Chart Stage */}
          <div className="w-full h-96 bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg p-3 relative">
            <svg className="w-full h-full" viewBox="0 0 500 320" preserveAspectRatio="none">
              
              {/* Mixed Layer Shaded Zone */}
              {(() => {
                const mldY = (physics.mld / 1000) * 270;
                return (
                  <g>
                    <rect x="45" y="20" width="440" height={mldY} fill="#EBF5FA" opacity="0.85" />
                    <text x="480" y={mldY + 14} textAnchor="end" fontSize="10" fill="#0B4F6C" fontFamily="monospace" fontWeight="bold">
                      MLD = {physics.mld}m
                    </text>
                  </g>
                );
              })()}

              {/* Depth Grid Lines (Y-Axis) */}
              {[0, 50, 100, 200, 300, 500, 750, 1000].map((d) => {
                const y = (d / 1000) * 270 + 20;
                return (
                  <g key={d}>
                    <line x1="45" y1={y} x2="485" y2={y} stroke="#D9E6EF" strokeWidth="1" strokeDasharray="3,3" />
                    <text x="38" y={y + 3.5} textAnchor="end" fontSize="10" fill="#829AB1" fontFamily="monospace">
                      {d}m
                    </text>
                  </g>
                );
              })}

              {/* Temperature Grid Lines (X-Axis) */}
              {[5, 10, 15, 20, 25, 30].map((t) => {
                const x = 45 + ((t - 5) / 27) * 440;
                return (
                  <g key={t}>
                    <line x1={x} y1="20" x2={x} y2="290" stroke="#D9E6EF" strokeWidth="1" />
                    <text x={x} y="306" textAnchor="middle" fontSize="10" fill="#829AB1" fontFamily="monospace">
                      {t}°C
                    </text>
                  </g>
                );
              })}

              {/* 20°C Isotherm Highlight */}
              {(() => {
                const d20Y = (physics.d20 / 1000) * 270 + 20;
                return (
                  <g>
                    <line x1="45" y1={d20Y} x2="485" y2={d20Y} stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="4,2" />
                    <text x="480" y={d20Y - 4} textAnchor="end" fontSize="10" fill="#D97706" fontFamily="monospace">
                      D20 = {physics.d20}m (20°C Isotherm)
                    </text>
                  </g>
                );
              })()}

              {/* Uncertainty Confidence Band (±σ) */}
              {showUncertaintyBand && (() => {
                const upperPoints = profilePoints.map(p => {
                  const x = 45 + (((p.reconstructedTemp + p.uncertainty) - 5) / 27) * 440;
                  const y = (p.depth / 1000) * 270 + 20;
                  return `${x},${y}`;
                });
                const lowerPoints = [...profilePoints].reverse().map(p => {
                  const x = 45 + (((p.reconstructedTemp - p.uncertainty) - 5) / 27) * 440;
                  const y = (p.depth / 1000) * 270 + 20;
                  return `${x},${y}`;
                });
                const polygon = [...upperPoints, ...lowerPoints].join(' ');
                return <polygon points={polygon} fill="#20C4D9" fillOpacity="0.18" stroke="#20C4D9" strokeWidth="0.5" strokeDasharray="2,2" />;
              })()}

              {/* Climatology Baseline Curve */}
              {showClimatology && (() => {
                const points = profilePoints.map(p => {
                  const x = 45 + ((p.climatologyTemp - 5) / 27) * 440;
                  const y = (p.depth / 1000) * 270 + 20;
                  return `${x},${y}`;
                }).join(' ');
                return <polyline fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4,4" points={points} />;
              })()}

              {/* In-Situ ARGO Observation Curve */}
              {(() => {
                const points = profilePoints.map(p => {
                  const x = 45 + (((p.argoTemp || p.reconstructedTemp) - 5) / 27) * 440;
                  const y = (p.depth / 1000) * 270 + 20;
                  return `${x},${y}`;
                }).join(' ');
                return <polyline fill="none" stroke="#627D98" strokeWidth="2" strokeDasharray="5,3" points={points} />;
              })()}

              {/* AI Reconstructed PINN Curve */}
              {(() => {
                const points = profilePoints.map(p => {
                  const x = 45 + ((p.reconstructedTemp - 5) / 27) * 440;
                  const y = (p.depth / 1000) * 270 + 20;
                  return `${x},${y}`;
                }).join(' ');
                return <polyline fill="none" stroke="#0B4F6C" strokeWidth="3" points={points} />;
              })()}

              {/* Hover depth indicator if user hovers on depth level */}
              {profilePoints.map((pt) => {
                const px = 45 + ((pt.reconstructedTemp - 5) / 27) * 440;
                const py = (pt.depth / 1000) * 270 + 20;
                const isHovered = activeDepthHover === pt.depth;
                return (
                  <g 
                    key={pt.depth}
                    onMouseEnter={() => setActiveDepthHover(pt.depth)}
                    onMouseLeave={() => setActiveDepthHover(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={px}
                      cy={py}
                      r={isHovered ? 6 : 3}
                      fill={isHovered ? '#20C4D9' : '#071A2B'}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    {isHovered && (
                      <g>
                        <rect x={px + 8} y={py - 12} width="85" height="24" rx="4" fill="#071A2B" opacity="0.95" />
                        <text x={px + 14} y={py + 3} fontSize="10" fill="#20C4D9" fontFamily="monospace" fontWeight="bold">
                          {pt.depth}m: {pt.reconstructedTemp}°C
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Depth Level Ticks Bar below */}
          <div className="mt-4 pt-3 border-t border-[#EBF2F7] flex flex-wrap items-center justify-between text-xs">
            <span className="font-semibold text-[#102A43]">
              Standard Inversion Levels:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[0, 50, 100, 150, 200, 300, 500, 750, 1000].map(d => (
                <button
                  key={d}
                  onClick={() => setActiveDepthHover(d)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors ${
                    activeDepthHover === d
                      ? 'bg-[#071A2B] text-[#20C4D9] border-[#071A2B]'
                      : 'bg-[#F5F9FC] text-[#627D98] border-[#D9E6EF] hover:border-[#20C4D9]'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
