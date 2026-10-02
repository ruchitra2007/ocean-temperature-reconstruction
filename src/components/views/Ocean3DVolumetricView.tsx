import React, { useRef, useEffect, useState, useMemo } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Compass, Info, Sliders, Layers } from 'lucide-react';
import { DEPTH_LEVELS } from '../../data/oceanData';

interface Ocean3DVolumetricViewProps {
  selectedDepth: number;
  onDepthChange: (depth: number) => void;
  probeCoord: { lat: number; lon: number; name?: string };
  onProbeCoordChange?: (coord: { lat: number; lon: number }) => void;
  surfaceTemp?: number;
}

interface DepthSliceConfig {
  depth: number;
  label: string;
  zPercent: number; // 0 (top) to 1 (bottom)
  baseColor: string;
  accentColor: string;
  opacity: number;
}

export const Ocean3DVolumetricView: React.FC<Ocean3DVolumetricViewProps> = ({
  selectedDepth,
  onDepthChange,
  probeCoord,
  onProbeCoordChange,
  surfaceTemp = 28.6,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rotation angles (interactive drag)
  const [yaw, setYaw] = useState<number>(32); // degrees
  const [pitch, setPitch] = useState<number>(28); // degrees
  const [zoom, setZoom] = useState<number>(1.0);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number }>({
    x: 0,
    y: 0,
    yaw: 32,
    pitch: 28,
  });

  // Discrete depth levels shown as floating planes exactly as in the user reference
  const depthSlices: DepthSliceConfig[] = useMemo(() => [
    {
      depth: 0,
      label: '0m',
      zPercent: 0.0,
      baseColor: 'rgba(235, 100, 45, 0.45)', // Warm sunlit surface
      accentColor: '#F97316',
      opacity: 0.65,
    },
    {
      depth: 50,
      label: '50m',
      zPercent: 0.12,
      baseColor: 'rgba(75, 205, 140, 0.55)', // Mixed layer green/cyan
      accentColor: '#10B981',
      opacity: 0.70,
    },
    {
      depth: 100,
      label: '100m',
      zPercent: 0.24,
      baseColor: 'rgba(30, 165, 175, 0.50)', // Upper thermocline teal
      accentColor: '#14B8A6',
      opacity: 0.65,
    },
    {
      depth: 200,
      label: '200m',
      zPercent: 0.42,
      baseColor: 'rgba(25, 115, 195, 0.45)', // Main thermocline blue
      accentColor: '#3B82F6',
      opacity: 0.60,
    },
    {
      depth: 500,
      label: '500m',
      zPercent: 0.70,
      baseColor: 'rgba(15, 65, 150, 0.40)', // Intermediate dark blue
      accentColor: '#2563EB',
      opacity: 0.55,
    },
    {
      depth: 1000,
      label: '1000m',
      zPercent: 1.0,
      baseColor: 'rgba(10, 30, 80, 0.35)', // Abyssal base
      accentColor: '#1E3A8A',
      opacity: 0.50,
    },
  ], []);

  // Main 3D Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background with dark abyss
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#061220';
    ctx.fillRect(0, 0, width, height);

    // Subtle dark radial ocean vignette
    const bgRad = ctx.createRadialGradient(width * 0.5, height * 0.4, 50, width * 0.5, height * 0.5, width * 0.7);
    bgRad.addColorStop(0, '#091E36');
    bgRad.addColorStop(1, '#040C16');
    ctx.fillStyle = bgRad;
    ctx.fillRect(0, 0, width, height);

    // 3D Geometry parameters
    const cx = width * 0.5;
    const cy = height * 0.38;
    const boxW = 190 * zoom;
    const boxD = 150 * zoom;
    const boxH = 260 * zoom;

    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    const cosY = Math.cos(yawRad);
    const sinY = Math.sin(yawRad);
    const cosP = Math.cos(pitchRad);
    const sinP = Math.sin(pitchRad);

    // 3D Point to 2D Screen Projection
    // x: [-1, 1], y: [-1, 1], z: [0, 1] (0 is surface, 1 is 1000m)
    const project = (xNorm: number, yNorm: number, zNorm: number): [number, number] => {
      const x = xNorm * boxW;
      const y = yNorm * boxD;

      // Rotate around vertical Z axis (yaw)
      const rx = x * cosY - y * sinY;
      const ry = x * sinY + y * cosY;

      // Isometric tilt (pitch)
      const screenX = cx + rx;
      const screenY = cy + ry * sinP + zNorm * boxH;

      return [screenX, screenY];
    };

    // 1. Draw Bounding 3D Prism Dotted Pillars (4 vertical corners)
    const corners = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ];

    ctx.save();
    ctx.strokeStyle = 'rgba(70, 110, 150, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);

    for (const [cxn, cyn] of corners) {
      const [topX, topY] = project(cxn, cyn, 0);
      const [botX, botY] = project(cxn, cyn, 1);
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(botX, botY);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Draw 1000m Abyssal Bottom Wireframe Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(40, 80, 120, 0.25)';
    ctx.lineWidth = 0.8;
    const gridDivs = 6;
    for (let i = 0; i <= gridDivs; i++) {
      const t = -1 + (i / gridDivs) * 2;
      // Along X
      const [p1x, p1y] = project(t, -1, 1);
      const [p2x, p2y] = project(t, 1, 1);
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.stroke();

      // Along Y
      const [q1x, q1y] = project(-1, t, 1);
      const [q2x, q2y] = project(1, t, 1);
      ctx.beginPath();
      ctx.moveTo(q1x, q1y);
      ctx.lineTo(q2x, q2y);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Normalized probe position inside [-1, 1] range
    // Domain: lon [50, 100], lat [5, 25]
    const probeXNorm = Math.max(-0.85, Math.min(0.85, ((probeCoord.lon - 75) / 25) * 1.5));
    const probeYNorm = Math.max(-0.85, Math.min(0.85, -((probeCoord.lat - 15) / 10) * 1.5));

    // Calculate probe surface screen coordinates
    const [probeTopX, probeTopY] = project(probeXNorm, probeYNorm, 0);
    const [probeBotX, probeBotY] = project(probeXNorm, probeYNorm, 1);

    // 4. Render Floating Planar Depth Slices (drawn from bottom to top for correct occlusion)
    const reversedSlices = [...depthSlices].reverse();

    for (const slice of reversedSlices) {
      const isSelected = selectedDepth === slice.depth;
      const zNorm = slice.zPercent;

      // Plane 4 corners
      const [c0x, c0y] = project(-1, -1, zNorm);
      const [c1x, c1y] = project(1, -1, zNorm);
      const [c2x, c2y] = project(1, 1, zNorm);
      const [c3x, c3y] = project(-1, 1, zNorm);

      ctx.save();

      // Plane Fill
      ctx.beginPath();
      ctx.moveTo(c0x, c0y);
      ctx.lineTo(c1x, c1y);
      ctx.lineTo(c2x, c2y);
      ctx.lineTo(c3x, c3y);
      ctx.closePath();

      if (isSelected) {
        // Active selected plane: luminous glow
        const glowGrad = ctx.createLinearGradient(c0x, c0y, c2x, c2y);
        glowGrad.addColorStop(0, 'rgba(32, 196, 217, 0.70)');
        glowGrad.addColorStop(0.5, 'rgba(74, 222, 128, 0.65)');
        glowGrad.addColorStop(1, 'rgba(234, 179, 8, 0.60)');
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Neon glowing border
        ctx.strokeStyle = '#20C4D9';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#20C4D9';
        ctx.shadowBlur = 10;
        ctx.stroke();
      } else {
        // Standard plane fill
        ctx.fillStyle = slice.baseColor;
        ctx.fill();

        // Subtle slice border
        ctx.strokeStyle = slice.accentColor;
        ctx.lineWidth = 1.0;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
      }
      ctx.restore();

      // Internal planar grid lines (mesh pattern on planes)
      ctx.save();
      ctx.strokeStyle = isSelected ? 'rgba(255, 255, 255, 0.40)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 0.6;
      for (let g = 1; g < gridDivs; g++) {
        const gt = -1 + (g / gridDivs) * 2;
        const [gx1, gy1] = project(gt, -1, zNorm);
        const [gx2, gy2] = project(gt, 1, zNorm);
        ctx.beginPath();
        ctx.moveTo(gx1, gy1);
        ctx.lineTo(gx2, gy2);
        ctx.stroke();

        const [gy1x, gy1y] = project(-1, gt, zNorm);
        const [gy2x, gy2y] = project(1, gt, zNorm);
        ctx.beginPath();
        ctx.moveTo(gy1x, gy1y);
        ctx.lineTo(gy2x, gy2y);
        ctx.stroke();
      }
      ctx.restore();

      // Right-side Depth Axis Label (aligned with right corner c2)
      ctx.save();
      const labelX = c2x + 24;
      const labelY = c2y;

      ctx.font = isSelected ? 'bold 13px monospace' : '11px monospace';
      ctx.fillStyle = isSelected ? '#20C4D9' : 'rgba(148, 163, 184, 0.75)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      if (isSelected) {
        ctx.shadowColor = '#20C4D9';
        ctx.shadowBlur = 8;
      }
      ctx.fillText(slice.label, labelX, labelY);

      // Connecting tick line to slice corner
      ctx.beginPath();
      ctx.moveTo(c2x + 4, c2y);
      ctx.lineTo(labelX - 6, labelY);
      ctx.strokeStyle = isSelected ? '#20C4D9' : 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Draw Vertical CTD Laser Line Cast (from surface 0m to 1000m)
    ctx.save();
    ctx.strokeStyle = '#20C4D9';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#20C4D9';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(probeTopX, probeTopY);
    ctx.lineTo(probeBotX, probeBotY);
    ctx.stroke();
    ctx.restore();

    // 6. Draw Probe Sensor Bead at Selected Depth
    const currentSlice = depthSlices.find((s) => s.depth === selectedDepth) || depthSlices[1];
    const [beadX, beadY] = project(probeXNorm, probeYNorm, currentSlice.zPercent);

    ctx.save();
    // Glowing active depth marker ring
    ctx.beginPath();
    ctx.arc(beadX, beadY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#20C4D9';
    ctx.shadowColor = '#20C4D9';
    ctx.shadowBlur = 12;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(beadX, beadY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 7. Draw Surface Marker & Tooltip Badge at Top
    ctx.save();
    // Surface ring marker
    ctx.beginPath();
    ctx.arc(probeTopX, probeTopY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FB923C'; // Warm orange
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.stroke();

    // Coordinate Tooltip Badge: "15.2°N, 88.5°E"
    const coordText = `${probeCoord.lat.toFixed(1)}°N, ${probeCoord.lon.toFixed(1)}°E`;
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(coordText, probeTopX + 10, probeTopTopYOffset(probeTopY));
    ctx.restore();

  }, [yaw, pitch, zoom, selectedDepth, probeCoord, depthSlices]);

  const probeTopTopYOffset = (topY: number) => Math.max(20, topY - 8);

  // Mouse drag handlers to orbit/rotate the 3D volume
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      yaw,
      pitch,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const newYaw = (dragStartRef.current.yaw + deltaX * 0.45) % 360;
    const newPitch = Math.max(12, Math.min(65, dragStartRef.current.pitch - deltaY * 0.35));

    setYaw(newYaw);
    setPitch(newPitch);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Reset view to default isometric camera
  const handleResetCamera = () => {
    setYaw(32);
    setPitch(28);
    setZoom(1.0);
  };

  return (
    <div className="flex-1 relative border border-[#D9E6EF] rounded-lg overflow-hidden bg-[#061220] h-[410px] flex flex-col justify-between select-none">
      
      {/* Top Header Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 z-10 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#061220]/80 backdrop-blur-xs px-2.5 py-1 rounded border border-[#20C4D9]/40">
          <Layers className="w-3.5 h-3.5 text-[#20C4D9]" />
          <span className="font-bold text-white font-mono">3D Volumetric Water Column</span>
          <span className="text-slate-400">·</span>
          <span className="text-[#20C4D9] font-mono font-semibold">z = {selectedDepth} m</span>
        </div>

        {/* Orbit Hint */}
        <div className="flex items-center gap-1.5 bg-[#061220]/80 backdrop-blur-xs px-2.5 py-1 rounded border border-slate-700 text-[11px] font-mono text-slate-400">
          <Compass className="w-3 h-3 text-[#20C4D9]" />
          <span>Click & Drag to Rotate</span>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <canvas
        ref={canvasRef}
        width={650}
        height={410}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        
        {/* Quick Depth Plane Buttons */}
        <div className="flex items-center gap-1.5 bg-[#061220]/90 backdrop-blur-xs p-1 rounded-lg border border-slate-800 pointer-events-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1.5">
            Depth Slices:
          </span>
          {[0, 50, 100, 200, 500, 1000].map((d) => (
            <button
              key={d}
              onClick={() => onDepthChange(d)}
              className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition-all ${
                selectedDepth === d
                  ? 'bg-[#20C4D9] text-[#061220] shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {d}m
            </button>
          ))}
        </div>

        {/* Camera Reset & Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-[#061220]/90 backdrop-blur-xs p-1 rounded-lg border border-slate-800 pointer-events-auto">
          <button
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            title="Zoom In"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            title="Zoom Out"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetCamera}
            title="Reset Camera View"
            className="p-1 text-slate-400 hover:text-[#20C4D9] rounded hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
