import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  Layers, 
  Thermometer, 
  ShieldAlert,
  Calendar,
  Compass
} from 'lucide-react';
import { MOORING_STATIONS, computeOceanPhysics } from '../../data/oceanData';
import { getTemperatureColor } from '../../utils/colormap';

export const TimeDepthView: React.FC = () => {
  const [selectedStationId, setSelectedStationId] = useState<string>('rama-15n-90e');
  const [depthMax, setDepthMax] = useState<number>(300); // 300m or 1000m
  const [hoverCell, setHoverCell] = useState<{
    month: string;
    depth: number;
    temp: number;
    mld: number;
    d20: number;
  } | null>(null);

  const station = MOORING_STATIONS.find((s) => s.id === selectedStationId) || MOORING_STATIONS[0];

  const months = useMemo(() => [
    { name: 'Jan', seasonId: 'ne-monsoon', dayOfYear: 15 },
    { name: 'Feb', seasonId: 'ne-monsoon', dayOfYear: 45 },
    { name: 'Mar', seasonId: 'pre-monsoon', dayOfYear: 75 },
    { name: 'Apr', seasonId: 'pre-monsoon', dayOfYear: 105 },
    { name: 'May', seasonId: 'pre-monsoon', dayOfYear: 135 },
    { name: 'Jun', seasonId: 'sw-monsoon', dayOfYear: 165 },
    { name: 'Jul', seasonId: 'sw-monsoon', dayOfYear: 195 },
    { name: 'Aug', seasonId: 'sw-monsoon', dayOfYear: 225 },
    { name: 'Sep', seasonId: 'sw-monsoon', dayOfYear: 255 },
    { name: 'Oct', seasonId: 'post-monsoon', dayOfYear: 285 },
    { name: 'Nov', seasonId: 'post-monsoon', dayOfYear: 315 },
    { name: 'Dec', seasonId: 'ne-monsoon', dayOfYear: 345 },
  ], []);

  // Depth sampling
  const depths = useMemo(() => {
    const list: number[] = [];
    const step = depthMax === 300 ? 10 : 25;
    for (let d = 0; d <= depthMax; d += step) {
      list.push(d);
    }
    return list;
  }, [depthMax]);

  // Compute 2D Hovmöller matrix [depthIndex][monthIndex]
  const hovmollerMatrix = useMemo(() => {
    return depths.map((depth) => {
      return months.map((m, mIdx) => {
        // Base physics from season
        const cell = computeOceanPhysics(station.lat, station.lon, depth, m.seasonId);
        // Add smooth monthly harmonic variations
        const annualPhase = (mIdx / 12) * Math.PI * 2;
        const seasonalHarmonic = Math.cos(annualPhase - 2.2) * 0.7;
        const smoothedTemp = Math.round((cell.temp + seasonalHarmonic) * 10) / 10;
        return {
          month: m.name,
          depth,
          temp: Math.max(5.5, Math.min(32, smoothedTemp)),
          mld: cell.mld,
          d20: cell.d20,
        };
      });
    });
  }, [depths, months, station]);

  const svgWidth = 720;
  const svgHeight = 360;
  const margin = { top: 25, right: 30, bottom: 40, left: 60 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const monthToX = (mIdx: number) => {
    return margin.left + (mIdx / (months.length - 1)) * plotWidth;
  };

  const depthToY = (depth: number) => {
    return margin.top + (depth / depthMax) * plotHeight;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E6EF] pb-4">
        <div>
          <div className="text-[11px] font-bold text-[#0B4F6C] uppercase tracking-wider">
            Temporal Depth Evolution
          </div>
          <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Time–Depth Hovmöller Diagram
          </h2>
          <p className="text-xs text-[#627D98] mt-1">
            Reconstructed annual cycle of vertical ocean thermal structure at key moored buoy observation sites
          </p>
        </div>

        {/* Station Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-[#D9E6EF] rounded-lg shadow-2xs">
          {MOORING_STATIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStationId(s.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedStationId === s.id
                  ? 'bg-[#071A2B] text-white shadow-xs'
                  : 'text-[#627D98] hover:text-[#102A43]'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Station Meta & Depth Range Selector */}
      <div className="bg-white rounded-xl border border-[#D9E6EF] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#102A43]">{station.name}</span>
            <span className="text-[#D9E6EF]">·</span>
            <span className="text-xs font-mono font-semibold text-[#0B4F6C]">{station.lat}°N, {station.lon}°E</span>
            <span className="text-[#D9E6EF]">·</span>
            <span className="text-xs text-[#627D98]">{station.network}</span>
          </div>
          <p className="text-xs text-[#486581] mt-1">
            {station.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-[#627D98]">Depth Scope:</span>
          <button
            onClick={() => setDepthMax(300)}
            className={`px-3 py-1 text-xs font-mono rounded-md border transition-colors ${
              depthMax === 300
                ? 'bg-[#071A2B] text-[#20C4D9] border-[#071A2B] font-bold'
                : 'bg-[#F5F9FC] text-[#102A43] border-[#D9E6EF]'
            }`}
          >
            0–300m (Thermocline)
          </button>
          <button
            onClick={() => setDepthMax(1000)}
            className={`px-3 py-1 text-xs font-mono rounded-md border transition-colors ${
              depthMax === 1000
                ? 'bg-[#071A2B] text-[#20C4D9] border-[#071A2B] font-bold'
                : 'bg-[#F5F9FC] text-[#102A43] border-[#D9E6EF]'
            }`}
          >
            0–1000m (Full)
          </button>
        </div>
      </div>

      {/* Main Hovmöller Plot */}
      <div className="bg-white rounded-xl border border-[#D9E6EF] p-6 shadow-xs relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#102A43]">
            Annual Time–Depth Thermal Matrix (Jan–Dec)
          </span>

          {hoverCell && (
            <div className="flex items-center gap-3 text-xs font-mono bg-[#EBF5FA] text-[#071A2B] px-3 py-1 rounded-md border border-[#D9E6EF]">
              <span>Month: {hoverCell.month}</span>
              <span>·</span>
              <span>Depth: {hoverCell.depth}m</span>
              <span>·</span>
              <span className="font-bold text-[#0B4F6C]">Temp: {hoverCell.temp}°C</span>
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            className="w-full h-auto min-w-[700px] select-none block"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          >
            {/* Background */}
            <rect
              x={margin.left}
              y={margin.top}
              width={plotWidth}
              height={plotHeight}
              fill="#071A2B"
            />

            {/* Grid Cells */}
            {depths.slice(0, -1).map((d, dIdx) => {
              const nextD = depths[dIdx + 1];
              const y1 = depthToY(d);
              const y2 = depthToY(nextD);
              const h = y2 - y1;

              return months.slice(0, -1).map((m, mIdx) => {
                const x1 = monthToX(mIdx);
                const x2 = monthToX(mIdx + 1);
                const w = x2 - x1;

                const cell = hovmollerMatrix[dIdx][mIdx];

                return (
                  <rect
                    key={`${dIdx}-${mIdx}`}
                    x={x1}
                    y={y1}
                    width={w + 0.5}
                    height={h + 0.5}
                    fill={getTemperatureColor(cell.temp)}
                    onMouseEnter={() => setHoverCell(cell)}
                    className="cursor-crosshair transition-opacity hover:opacity-90"
                  />
                );
              });
            })}

            {/* Depth axis ticks */}
            {[0, 50, 100, 150, 200, 250, 300, 500, 750, 1000]
              .filter((d) => d <= depthMax)
              .map((d) => {
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

            {/* Month labels */}
            {months.map((m, idx) => {
              const x = monthToX(idx);
              return (
                <g key={m.name}>
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
                    y={margin.top + plotHeight + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="500"
                    fill="#829AB1"
                    fontFamily="monospace"
                  >
                    {m.name}
                  </text>
                </g>
              );
            })}

            {/* 20°C Isotherm Depth Curve */}
            {(() => {
              const points = months
                .map((m, idx) => {
                  const cell = computeOceanPhysics(station.lat, station.lon, 0, m.seasonId);
                  const x = monthToX(idx);
                  const y = depthToY(Math.min(depthMax, cell.d20));
                  return `${x},${y}`;
                })
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
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-[#EBF2F7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-1.5 text-[#102A43]">
              <span className="w-3 h-0.5 bg-amber-400 inline-block border-t border-dashed" />
              <span>D20 Isotherm</span>
            </div>
          </div>
          <div className="text-[11px] text-[#627D98]">
            Hover over matrix cells to inspect monthly thermal depths.
          </div>
        </div>
      </div>
    </div>
  );
};
