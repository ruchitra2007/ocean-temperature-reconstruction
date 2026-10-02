import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, 
  Layers, 
  MapPin, 
  HelpCircle,
  Thermometer,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { 
  TRANSECT_PRESETS, 
  computeOceanPhysics, 
  isPointLand,
  SEASON_PRESETS 
} from '../../data/oceanData';
import { getTemperatureColor } from '../../utils/colormap';
import { TransectLine } from '../../types/ocean';

interface VerticalSectionViewProps {
  selectedDateId: string;
}

export const VerticalSectionView: React.FC<VerticalSectionViewProps> = ({ selectedDateId }) => {
  const [selectedTransectId, setSelectedTransectId] = useState<string>('transect-10n');
  const [hoverData, setHoverData] = useState<{
    coordVal: number;
    depth: number;
    temp: number;
    mld: number;
    d20: number;
  } | null>(null);

  const transect = TRANSECT_PRESETS.find((t) => t.id === selectedTransectId) || TRANSECT_PRESETS[0];
  const season = SEASON_PRESETS.find((s) => s.id === selectedDateId);

  // Depth sampling steps (dense in top 300m to capture thermocline resolution)
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
        const cell = computeOceanPhysics(lat, lon, depth, selectedDateId);
        return cell;
      });
    });
  }, [depths, coordPoints, transect, selectedDateId]);

  // Surface physics along transect (MLD and D20 lines)
  const surfacePhysics = useMemo(() => {
    return coordPoints.map((coord) => {
      const lat = transect.type === 'zonal' ? transect.fixedValue : coord;
      const lon = transect.type === 'zonal' ? coord : transect.fixedValue;
      return computeOceanPhysics(lat, lon, 0, selectedDateId);
    });
  }, [coordPoints, transect, selectedDateId]);

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 360;
  const margin = { top: 25, right: 30, bottom: 40, left: 60 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  // Non-linear depth scaling function to give upper 300m prominent visual weight
  // y_scaled = (depth <= 300) ? (depth / 300) * 0.65 : 0.65 + ((depth - 300) / 700) * 0.35
  const depthToY = (depth: number) => {
    const norm = depth <= 300 
      ? (depth / 300) * 0.65 
      : 0.65 + ((depth - 300) / 700) * 0.35;
    return margin.top + norm * plotHeight;
  };

  const coordToX = (index: number) => {
    return margin.left + (index / (coordPoints.length - 1)) * plotWidth;
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < margin.left || x > svgWidth - margin.right || y < margin.top || y > svgHeight - margin.bottom) {
      setHoverData(null);
      return;
    }

    // Reverse X to coordIndex
    const xRel = (x - margin.left) / plotWidth;
    const coordIdx = Math.max(0, Math.min(coordPoints.length - 1, Math.round(xRel * (coordPoints.length - 1))));
    const coordVal = coordPoints[coordIdx];

    // Reverse Y to depth
    const yRel = (y - margin.top) / plotHeight;
    let depthVal = 0;
    if (yRel <= 0.65) {
      depthVal = Math.round((yRel / 0.65) * 300);
    } else {
      depthVal = Math.round(300 + ((yRel - 0.65) / 0.35) * 700);
    }

    const lat = transect.type === 'zonal' ? transect.fixedValue : coordVal;
    const lon = transect.type === 'zonal' ? coordVal : transect.fixedValue;
    const cell = computeOceanPhysics(lat, lon, depthVal, selectedDateId);

    setHoverData({
      coordVal,
      depth: depthVal,
      temp: cell.temp,
      mld: cell.mld,
      d20: cell.d20,
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E6EF] pb-4">
        <div>
          <div className="text-[11px] font-bold text-[#0B4F6C] uppercase tracking-wider">
            Subsurface Cross-Sections
          </div>
          <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Vertical Oceanographic Transects
          </h2>
          <p className="text-xs text-[#627D98] mt-1">
            Volumetric temperature structure from surface (0m) to bathyal depth (1000m) across the North Indian Ocean
          </p>
        </div>

        {/* Transect Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-[#D9E6EF] rounded-lg shadow-2xs">
          {TRANSECT_PRESETS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTransectId(t.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedTransectId === t.id
                  ? 'bg-[#071A2B] text-white shadow-xs'
                  : 'text-[#627D98] hover:text-[#102A43]'
              }`}
            >
              {t.name.split(' ')[0]} {t.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Transect Summary Banner */}
      <div className="bg-[#F5F9FC] border border-[#D9E6EF] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-[#102A43]">
            Active Section: {transect.name}
          </div>
          <p className="text-xs text-[#627D98] mt-0.5">
            {transect.description}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs shrink-0">
          <span className="flex items-center gap-1.5 text-[#102A43]">
            <span className="w-3 h-0.5 bg-amber-400 inline-block border-t border-dashed" />
            <span>20°C Isotherm (D20)</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#102A43]">
            <span className="w-3 h-0.5 bg-[#20C4D9] inline-block" />
            <span>Mixed Layer (MLD)</span>
          </span>
        </div>
      </div>

      {/* Main High-Resolution Vertical Section SVG Plot */}
      <div className="bg-white rounded-xl border border-[#D9E6EF] p-6 shadow-xs relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#102A43]">
            Vertical Temperature Contour Section (°C)
          </span>
          {hoverData && (
            <div className="flex items-center gap-3 text-xs font-mono bg-[#EBF5FA] text-[#071A2B] px-3 py-1 rounded-md border border-[#D9E6EF]">
              <span>{transect.type === 'zonal' ? `Lon: ${hoverData.coordVal}°E` : `Lat: ${hoverData.coordVal}°N`}</span>
              <span>·</span>
              <span>Depth: {hoverData.depth}m</span>
              <span>·</span>
              <span className="font-bold text-[#0B4F6C]">Temp: {hoverData.temp.toFixed(2)}°C</span>
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            className="w-full h-auto min-w-[700px] select-none cursor-crosshair block"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            onMouseMove={handleSvgMouseMove}
            onMouseLeave={() => setHoverData(null)}
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
              return (
                <g key={idx}>
                  <line
                    x1={x}
                    y1={margin.top}
                    x2={x}
                    y2={margin.top + plotHeight}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="0.5"
                  />
                  <text
                    x={x}
                    y={margin.top + plotHeight + 16}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#829AB1"
                    fontFamily="monospace"
                  >
                    {transect.type === 'zonal' ? `${c}°E` : `${c}°N`}
                  </text>
                </g>
              );
            })}

            {/* 20°C Isotherm (D20) Contour Line */}
            {(() => {
              const points = surfacePhysics
                .map((cell, idx) => {
                  if (cell.isLand) return null;
                  const x = coordToX(idx);
                  const y = depthToY(cell.d20);
                  return `${x},${y}`;
                })
                .filter(Boolean)
                .join(' ');
              return (
                <polyline
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  points={points}
                />
              );
            })()}

            {/* Mixed Layer Depth (MLD) Contour Line */}
            {(() => {
              const points = surfacePhysics
                .map((cell, idx) => {
                  if (cell.isLand) return null;
                  const x = coordToX(idx);
                  const y = depthToY(cell.mld);
                  return `${x},${y}`;
                })
                .filter(Boolean)
                .join(' ');
              return (
                <polyline
                  fill="none"
                  stroke="#20C4D9"
                  strokeWidth="2"
                  points={points}
                />
              );
            })()}

            {/* Hover Crosshair */}
            {hoverData && (
              <g>
                <line
                  x1={margin.left}
                  y1={depthToY(hoverData.depth)}
                  x2={margin.left + plotWidth}
                  y2={depthToY(hoverData.depth)}
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Colorbar & Explanation */}
        <div className="mt-4 pt-3 border-t border-[#EBF2F7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#102A43]">Scientific Temperature Scale:</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-[#627D98]">6°C</span>
              <div 
                className="w-44 h-3 rounded"
                style={{
                  background: 'linear-gradient(to right, rgb(10,25,100), rgb(25,75,195), rgb(32,196,217), rgb(46,175,90), rgb(238,205,30), rgb(242,115,25), rgb(215,30,35))'
                }}
              />
              <span className="text-[#627D98]">32°C</span>
            </div>
          </div>
          <div className="text-[11px] text-[#627D98]">
            *Vertical axis uses logarithmic emphasis on the upper 0–300m thermocline zone.
          </div>
        </div>
      </div>
    </div>
  );
};
