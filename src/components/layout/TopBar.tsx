import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Layers, 
  Settings, 
  AlertCircle, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight,
  Radio,
  Globe2,
  Cpu
} from 'lucide-react';
import { DEPTH_LEVELS, SEASON_PRESETS } from '../../data/oceanData';

interface TopBarProps {
  selectedDepth: number;
  onDepthChange: (depth: number) => void;
  selectedDateId: string;
  onDateChange: (dateId: string) => void;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  selectedDepth,
  onDepthChange,
  selectedDateId,
  onDateChange,
  onOpenSettings,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play through seasonal dates when user hits play
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const currentIndex = SEASON_PRESETS.findIndex((p) => p.id === selectedDateId);
      const nextIndex = (currentIndex + 1) % SEASON_PRESETS.length;
      onDateChange(SEASON_PRESETS[nextIndex].id);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying, selectedDateId, onDateChange]);

  const handleStepDate = (direction: 'prev' | 'next') => {
    const currentIndex = SEASON_PRESETS.findIndex((p) => p.id === selectedDateId);
    let targetIndex: number;
    if (direction === 'prev') {
      targetIndex = (currentIndex - 1 + SEASON_PRESETS.length) % SEASON_PRESETS.length;
    } else {
      targetIndex = (currentIndex + 1) % SEASON_PRESETS.length;
    }
    onDateChange(SEASON_PRESETS[targetIndex].id);
  };

  const currentSeason = SEASON_PRESETS.find((p) => p.id === selectedDateId) || SEASON_PRESETS[0];

  return (
    <div className="sticky top-0 z-30 select-none bg-white">
      {/* 1. Official Government & Institutional Emblem Strip */}
      <div className="bg-[#071A2B] text-white px-6 py-1.5 flex items-center justify-between text-[11px] border-b border-[#0B4F6C]">
        <div className="flex items-center gap-2">
          {/* Subtle India flag color accent badge */}
          <div className="flex h-3 w-4 rounded-xs overflow-hidden shadow-2xs border border-white/20">
            <span className="w-full h-1/3 bg-[#FF9933]" />
            <span className="w-full h-1/3 bg-white flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-[#000080]" />
            </span>
            <span className="w-full h-1/3 bg-[#138808]" />
          </div>

          <span className="font-semibold text-slate-200 tracking-wide">
            Ministry of Earth Sciences (MoES) · Govt. of India
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-[#20C4D9] font-medium hidden sm:inline">
            INCOIS (Indian National Centre for Ocean Information Services)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-emerald-300 font-semibold">AI Inversion Active</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-[10px] text-slate-400 hidden md:inline">
            Grid: 0.25° · 28 Vertical Levels
          </span>
        </div>
      </div>

      {/* 2. Primary Navigation Bar */}
      <header className="h-14 border-b border-[#D9E6EF] bg-white/95 backdrop-blur-xs px-6 flex items-center justify-between">
        
        {/* Left: Product Title, Subtitle, and Region */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[14px] font-extrabold text-[#102A43] tracking-tight">
                Ocean Temperature Reconstruction
              </h1>
              <span className="text-[#D9E6EF]">/</span>
              <span className="text-xs font-semibold text-[#0B4F6C] flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5 text-[#20C4D9]" />
                North Indian Ocean
              </span>
            </div>
            <p className="text-[10px] font-medium text-[#627D98]">
              AI-based subsurface temperature estimation from surface observations
            </p>
          </div>
        </div>

        {/* Right: Date player, Depth selector, Status, and Settings */}
        <div className="flex items-center gap-2.5">
          
          {/* Interactive Date Player Control */}
          <div className="flex items-center bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg p-0.5 text-xs shadow-2xs">
            <button
              onClick={() => handleStepDate('prev')}
              title="Previous seasonal epoch"
              className="p-1 text-[#627D98] hover:text-[#102A43] hover:bg-white rounded transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause auto-play' : 'Play seasonal time transition'}
              className={`p-1 rounded font-bold transition-colors flex items-center gap-1 px-1.5 ${
                isPlaying ? 'bg-[#071A2B] text-[#20C4D9]' : 'text-[#0B4F6C] hover:bg-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="text-[11px] font-mono">{currentSeason.name.split(' ')[1]}</span>
            </button>

            <button
              onClick={() => handleStepDate('next')}
              title="Next seasonal epoch"
              className="p-1 text-[#627D98] hover:text-[#102A43] hover:bg-white rounded transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <div className="border-l border-[#D9E6EF] ml-1 pl-1.5 pr-2 py-0.5 flex items-center gap-1 text-[11px] font-mono text-[#102A43]">
              <Calendar className="w-3 h-3 text-[#0B4F6C]" />
              <span>{currentSeason.date}</span>
            </div>
          </div>

          {/* Depth Selector */}
          <div className="flex items-center gap-1.5 bg-[#F5F9FC] border border-[#D9E6EF] rounded-lg px-2.5 py-1 text-xs text-[#102A43] hover:border-[#20C4D9] transition-colors shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-[#20C4D9] shrink-0" />
            <span className="text-[#627D98] font-medium hidden sm:inline">Depth:</span>
            <select
              value={selectedDepth}
              onChange={(e) => onDepthChange(Number(e.target.value))}
              className="bg-transparent font-bold font-mono text-[#071A2B] focus:outline-hidden cursor-pointer"
            >
              {DEPTH_LEVELS.map((dl) => (
                <option key={dl.depth} value={dl.depth}>
                  {dl.label}
                </option>
              ))}
            </select>
          </div>

          {/* Demo Mode Badge */}
          <div 
            title="Demonstration prototype adhering to SIH Problem Statement 4."
            className="hidden lg:flex items-center gap-1.5 bg-amber-50/90 border border-amber-200 text-amber-900 text-[11px] font-semibold px-2 py-1 rounded-md"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Prototype Demo</span>
          </div>

          {/* Settings / Audit modal launcher */}
          <button
            onClick={onOpenSettings}
            title="Model architecture, SIH audit & methodology"
            className="p-1.5 text-[#627D98] hover:text-[#071A2B] hover:bg-[#F5F9FC] rounded-lg border border-[#D9E6EF] transition-colors shadow-2xs"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>
    </div>
  );
};
