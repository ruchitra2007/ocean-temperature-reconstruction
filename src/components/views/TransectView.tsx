import React, { useState, useMemo } from 'react';
import { 
  Split, 
  MapPin, 
  Layers, 
  Thermometer, 
  ShieldAlert, 
  ArrowRight,
  Info,
  Compass,
  Navigation
} from 'lucide-react';
import { TRANSECT_PRESETS, computeOceanPhysics, isPointLand, SEASON_PRESETS } from '../../data/oceanData';
import { getTemperatureColor } from '../../utils/colormap';

interface TransectViewProps {
  selectedDateId: string;
}

export const TransectView: React.FC<TransectViewProps> = ({ selectedDateId }) => {
  const [selectedTransectId, setSelectedTransectId] = useState<string>('transect-10n');
  const [hoverSample, setHoverSample] = useState<{
    coordVal: number;
    depth: number;
    temp: number;
    distKm: number;
  } | null>(null);

  const transect = TRANSECT_PRESETS.find((t) => t.id === selectedTransectId) || TRANSECT_PRESETS[0];
  const season = SEASON_PRESETS.find((s) => s.id === selectedDateId);

  // Depth sampling steps from surface to 1000m
  const depths = useMemo(() => [
    0, 10, 20, 30, 40, 50, 65, 80, 100, 120, 140, 160, 190, 220, 260, 300, 350, 400, 500, 600, 700, 800, 900, 1000
  ], []);

  // Coordinate sampling points along the transect line
  const coordPoints = useMemo(() => {
    const points: number[] = [];
    const isZonal = transect.type === 'zonal';
    const start = isZonal ? transect.start.lon : transect.start.lat;
    const end = isZonal ? transect.end.lon : transect.end.lat;
    const step = 0.8;

    for (let c = start; c <= end; c += step) {
      points.push(Math.round(c * 10) / 10);
    }
    return points;
  }, [transect]);

  // Compute 2D matrix of temperatures [depthIndex][coordIndex]
  const matrix = useMemo(() => {
    return depths.map((depth) => {
      return coordPoints.map((coord) => {
        const lat = transect.type === 'zonal' ? transect.fixedValue : coord;
        const lon = transect.type === 'zonal' ? coord : transect.fixedValue;
        const isLand = isPointLand(lat, lon);
        const cell = computeOceanPhysics(lat, lon, depth, selectedDateId);
        return {
          coord,
          lat,
          lon,
          temp: cell.temp,
          isLand,
          mld: cell.mld,
          d20: cell.d20,
        };
      });
    });
  }, [depths, coordPoints, transect, selectedDateId]);

  // Calculate approximate transect distance
  const totalDistanceKm = useMemo(() => {
    const isZonal = transect.type === 'zonal';
    const deltaDeg = Math.abs(coordPoints[coordPoints.length - 1] - coordPoints[0]);
    if (isZonal) {
      return Math.round(deltaDeg * 111 * Math.cos((transect.fixedValue * Math.PI) / 180));
    }
    return Math.round(deltaDeg * 111);
  }, [coordPoints, transect]);

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 360;
  const margin = { top: 25, right: 35, bottom: 45, left: 60 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  // Coordinate mapper functions
  const coordToX = (idx: number) => {
    return margin.left + (idx / (coordPoints.length - 1)) * plotWidth;
  };

  const depthToY = (depth: number) => {
    // Non-linear depth scaling: upper 200m gets 50% of vertical height
    if (depth <= 200) {
      return margin.top + (depth / 200) * (plotHeight * 0.52);
    }
    const rem = (depth - 200) / 800;
    return margin.top + (plotHeight * 0.52) + rem * (plotHeight * 0.48);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E6EF] pb-4">
        <div>
          <div className="text-[11px] font-bold text-[#0B4F6C] uppercase tracking-wider flex items-center gap-1.5">
            <Split className="w-3.5 h-3.5 text-[#20C4D9]" />
            Geographic Transect Interaction
          </div>
          <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Depth-vs-Distance Transect Section
          </h2>
          <p className="text-xs text-[#627D98] mt-0.5">
            Volumetric vertical slices revealing thermocline slope, coastal upwelling, and basin asymmetry
          </p>
        </div>

        {/* Transect Preset Selector */}
        <div className="flex items-center gap-2 bg-white border border-[#D9E6EF] rounded-lg p-1 shadow-2xs">
          <span className="text-xs font-bold text-[#102A43] pl-2 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-[#0B4F6C]" />
            Transect Line:
          </span>
          <select
            value={selectedTransectId}
            onChange={(e) => setSelectedTransectId(e.target.value)}
            className="text-xs font-semibold text-[#0B4F6C] bg-[#F5F9FC] border border-[#D9E6EF] rounded-md px-2.5 py-1 focus:outline-hidden cursor-pointer"
          >
            {TRANSECT_PRESETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transect Metadata & Point A to Point B Card */}
      <div className="bg-white rounded-xl border border-[#D9E6EF] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#071A2B]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B4F6C]" />
              <span>Point A: {transect.start.name}</span>
              <span className="font-mono text-[#627D98]">({transect.start.lat}°N, {transect.start.lon}°E)</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#20C4D9]" />
            <div className="flex items-center gap-1.5 font-bold text-[#071A2B]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#20C4D9]" />
              <span>Point B: {transect.end.name}</span>
              <span className="font-mono text-[#627D98]">({transect.end.lat}°N, {transect.end.lon}°E)</span>
            </div>
          </div>
          <p className="text-xs text-[#486581] mt-1.5 leading-relaxed">
            {transect.description}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-[#F5F9FC] rounded-lg border border-[#D9E6EF] text-center">
            <div className="text-[10px] uppercase font-bold text-[#627D98]">Transect Length</div>
            <div className="text-base font-bold font-mono text-[#071A2B]">{totalDistanceKm} km</div>
          </div>
          <div className="p-2 bg-[#F5F9FC] rounded-lg border border-[#D9E6EF] text-center">
            <div className="text-[10px] uppercase font-bold text-[#627D98]">Depth Range</div>
            <div className="text-base font-bold font-mono text-[#0B4F6C]">0–1000 m</div>
          </div>
        </div>
      </div>

      {/* Main Transect Vertical Heatmap Contour */}
      <div className="bg-white rounded-xl border border-[#D9E6EF] p-5 shadow-xs relative">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-[#102A43]">
            Vertical Temperature Contour Section ({season?.name})
          </span>

          {hoverSample && (
            <div className="flex items-center gap-3 font-mono bg-[#EBF5FA] text-[#071A2B] px-3 py-1 rounded-md border border-[#D9E6EF] text-xs">
              <span>Coord: {hoverSample.coordVal}°</span>
              <span>·</span>
              <span>Depth: {hoverSample.depth}m</span>
              <span>·</span>
              <span className="font-bold text-[#0B4F6C]">Temp: {hoverSample.temp.toFixed(2)}°C</span>
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            className="w-full h-auto min-w-[700px] select-none cursor-crosshair block"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          >
            {/* Background grid */}
            <rect
              x={margin.left}
              y={margin.top}
              width={plotWidth}
              height={plotHeight}
              fill="#071A2B"
            />

            {/* Render 2D Colormap Quads */}
            {depths.slice(0, -1).map((d, dIdx) => {
              const nextD = depths[dIdx + 1];
              const y1 = depthToY(d);
              const y2 = depthToY(nextD);
              const h = y2 - y1;

              return coordPoints.slice(0, -1).map((c, cIdx) => {
                const x1 = coordToX(cIdx);
                const x2 = coordToX(cIdx + 1);
                const w = x2 - x1;

                const cell = matrix[dIdx][cIdx];
                if (cell.isLand) {
                  return (
                    <rect
                      key={`${dIdx}-${cIdx}`}
                      x={x1}
                      y={y1}
                      width={w + 0.5}
                      height={h + 0.5}
                      fill="#BCCCDC"
                    />
                  );
                }

                return (
                  <rect
                    key={`${dIdx}-${cIdx}`}
                    x={x1}
                    y={y1}
                    width={w + 0.5}
                    height={h + 0.5}
                    fill={getTemperatureColor(cell.temp)}
                    onMouseEnter={() => setHoverSample({
                      coordVal: c,
                      depth: d,
                      temp: cell.temp,
                      distKm: Math.round((cIdx / (coordPoints.length - 1)) * totalDistanceKm),
                    })}
                  />
                );
              });
            })}

            {/* Depth axis tick lines & labels */}
            {[0, 50, 100, 200, 300, 500, 750, 1000].map((d) => {
              const y = depthToY(d);
              return (
                <g key={d}>
                  <line
                    x1={margin.left}
                    y1={y}
                    x2={margin.left + plotWidth}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={margin.left - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="10"
                    fill="#829AB1"
                    fontFamily="monospace"
                  >
                    {d}m
                  </text>
                </g>
              );
            })}

            {/* Coordinate axis tick labels on bottom */}
            {coordPoints.filter((_, idx) => idx % 6 === 0).map((c, idx) => {
              const actualIdx = coordPoints.indexOf(c);
              const x = coordToX(actualIdx);
              const dist = Math.round((actualIdx / (coordPoints.length - 1)) * totalDistanceKm);
              return (
                <g key={idx}>
                  <line
                    x1={x}
                    y1={margin.top}
                    x2={x}
                    y2={margin.top + plotHeight}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={x}
                    y={margin.top + plotHeight + 16}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#486581"
                    fontFamily="monospace"
                  >
                    {c}°{transect.type === 'zonal' ? 'E' : 'N'}
                  </text>
                  <text
                    x={x}
                    y={margin.top + plotHeight + 28}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#829AB1"
                    fontFamily="monospace"
                  >
                    {dist}km
                  </text>
                </g>
              );
            })}

            {/* D20 Isotherm Polyline Overlay across the transect */}
            {(() => {
              const d20Points = coordPoints
                .map((_, cIdx) => {
                  const cell = matrix[0][cIdx];
                  if (cell.isLand) return null;
                  const x = coordToX(cIdx);
                  const y = depthToY(cell.d20);
                  return `${x},${y}`;
                })
                .filter(Boolean)
                .join(' ');

              if (!d20Points) return null;
              return (
                <polyline
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  points={d20Points}
                />
              );
            })()}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-[#EBF2F7] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#102A43]">Temperature (°C):</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-[#627D98]">6°C</span>
              <div 
                className="w-48 h-3 rounded"
                style={{
                  background: 'linear-gradient(to right, rgb(10,25,100), rgb(25,75,195), rgb(32,196,217), rgb(46,175,90), rgb(238,205,30), rgb(242,115,25), rgb(215,30,35))'
                }}
              />
              <span className="text-[#627D98]">32°C</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#627D98]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-white border border-dashed border-slate-700" />
              20°C Isotherm (D20)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#BCCCDC] rounded-xs" />
              Land Barrier
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
