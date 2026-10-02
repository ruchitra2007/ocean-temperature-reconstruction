import React, { useState } from 'react';
import { ViewMode } from './types/ocean';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { SettingsModal } from './components/layout/SettingsModal';

// Views
import { OverviewView } from './components/views/OverviewView';
import { ExploreOceanView } from './components/views/ExploreOceanView';
import { CompareDatesView } from './components/views/CompareDatesView';
import { VerticalProfileView } from './components/views/VerticalProfileView';
import { TimeDepthView } from './components/views/TimeDepthView';
import { TransectView } from './components/views/TransectView';
import { ValidationView } from './components/views/ValidationView';
import { DataProvenanceView } from './components/views/DataProvenanceView';
import { AIArchitectureView } from './components/views/AIArchitectureView';
import { MethodologyView } from './components/views/MethodologyView';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [selectedDepth, setSelectedDepth] = useState<number>(50); // Default to 50m (mixed layer base)
  const [selectedDateId, setSelectedDateId] = useState<string>('sw-monsoon'); // Default to Southwest Monsoon
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#F5F9FC] text-[#102A43] flex flex-row font-sans antialiased selection:bg-[#20C4D9]/25 selection:text-[#071A2B]">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        onOpenInfo={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Institutional & Navigation Top Bar */}
        <TopBar
          selectedDepth={selectedDepth}
          onDepthChange={setSelectedDepth}
          selectedDateId={selectedDateId}
          onDateChange={setSelectedDateId}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* View Switcher Container */}
        <main className="flex-1 overflow-y-auto">
          {currentView === 'overview' && (
            <OverviewView 
              onNavigate={(view) => setCurrentView(view)} 
              selectedDepth={selectedDepth}
              selectedDateId={selectedDateId}
            />
          )}

          {currentView === 'explore' && (
            <ExploreOceanView
              selectedDepth={selectedDepth}
              onDepthChange={setSelectedDepth}
              selectedDateId={selectedDateId}
              onDateChange={setSelectedDateId}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'compare' && (
            <CompareDatesView
              selectedDepth={selectedDepth}
              onDepthChange={setSelectedDepth}
            />
          )}

          {currentView === 'vertical' && (
            <VerticalProfileView 
              selectedDateId={selectedDateId} 
            />
          )}

          {currentView === 'timedepth' && (
            <TimeDepthView />
          )}

          {currentView === 'transect' && (
            <TransectView 
              selectedDateId={selectedDateId} 
            />
          )}

          {currentView === 'validation' && (
            <ValidationView />
          )}

          {currentView === 'provenance' && (
            <DataProvenanceView />
          )}

          {currentView === 'architecture' && (
            <AIArchitectureView />
          )}

          {currentView === 'methodology' && (
            <MethodologyView />
          )}
        </main>
      </div>

      {/* Methodology & SIH Problem Audit Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
