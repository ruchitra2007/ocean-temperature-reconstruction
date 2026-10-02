import React from 'react';
import { 
  Compass, 
  Layers, 
  GitCompare, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  Database,
  Info,
  Waves,
  ShieldCheck,
  Split,
  Cpu,
  BookOpen,
  Anchor,
  Globe2
} from 'lucide-react';
import { ViewMode } from '../../types/ocean';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenInfo: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: ViewMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onOpenInfo }) => {
  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Dashboard', icon: Compass },
        { id: 'explore', label: 'Explore Ocean', icon: Layers, badge: 'Live 3D' },
        { id: 'compare', label: 'Compare Dates', icon: GitCompare },
      ],
    },
    {
      title: 'ANALYSIS',
      items: [
        { id: 'vertical', label: 'Vertical Profile', icon: TrendingDown },
        { id: 'timedepth', label: 'Time & Depth', icon: Clock },
        { id: 'transect', label: 'Transect', icon: Split },
        { id: 'validation', label: 'Validation', icon: CheckCircle2, badge: 'Judge Demo' },
      ],
    },
    {
      title: 'DATA',
      items: [
        { id: 'provenance', label: 'Data & Provenance', icon: Database },
      ],
    },
    {
      title: 'SCIENCE',
      items: [
        { id: 'architecture', label: 'AI Architecture', icon: Cpu },
        { id: 'methodology', label: 'Methodology', icon: BookOpen },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#D9E6EF] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-20">
      <div className="flex-1 overflow-y-auto">
        {/* Brand identity lockup - INCOIS & MoES India Inspiration */}
        <div className="p-4 border-b border-[#D9E6EF] bg-linear-to-b from-[#F5F9FC] to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#071A2B] flex items-center justify-center text-[#20C4D9] shadow-xs ring-1 ring-[#0B4F6C]/40 shrink-0">
              <Waves className="w-5 h-5 text-[#20C4D9]" />
            </div>
            <div>
              <div className="text-[13px] font-extrabold text-[#102A43] leading-tight tracking-tight">
                Ocean Reconstruct
              </div>
              <div className="text-[10px] font-bold text-[#0B4F6C] tracking-wider uppercase">
                INCOIS · MoES Partner
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#627D98] pt-2 border-t border-[#EBF2F7]">
            <span className="flex items-center gap-1 font-semibold text-[#102A43]">
              <Globe2 className="w-3 h-3 text-[#20C4D9]" />
              North Indian Ocean
            </span>
            <span className="font-mono text-[10px] bg-[#EBF5FA] text-[#0B4F6C] px-1.5 py-0.5 rounded border border-[#D9E6EF]">
              0.25° Grid
            </span>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="p-3 space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold tracking-wider text-[#829AB1] uppercase">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left relative group ${
                      isActive
                        ? 'bg-[#EBF5FA] text-[#071A2B] font-bold shadow-2xs'
                        : 'text-[#627D98] hover:text-[#102A43] hover:bg-[#F5F9FC]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#20C4D9] rounded-r-full" />
                    )}
                    
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#0B4F6C]' : 'text-[#829AB1] group-hover:text-[#0B4F6C]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        isActive
                          ? 'bg-[#071A2B] text-[#20C4D9] border-[#071A2B]'
                          : 'bg-[#F5F9FC] text-[#0B4F6C] border-[#D9E6EF]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Honest Scientific Disclosure & Institutional Footprint */}
      <div className="p-3.5 border-t border-[#D9E6EF] bg-[#F5F9FC]">
        <div className="p-2.5 rounded-lg border border-[#D9E6EF] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-[#071A2B] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              SIH-2024 MVP
            </div>
            <span className="text-[9px] font-mono text-[#0B4F6C] bg-[#EBF5FA] px-1.5 py-0.5 rounded border border-[#D9E6EF]">
              Demo Mode
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#627D98] leading-tight">
            INCOIS Problem Statement 4: Continuous Subsurface Inversion.
          </p>
          <button
            onClick={onOpenInfo}
            className="mt-2 w-full flex items-center justify-center gap-1.5 text-[10px] font-semibold text-[#0B4F6C] hover:text-[#071A2B] pt-1.5 border-t border-[#EBF2F7] transition-colors"
          >
            <Info className="w-3 h-3 text-[#20C4D9]" />
            <span>Problem Audit & Disclosures</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
