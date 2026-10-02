import React from 'react';
import { 
  BookOpen, 
  Satellite, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight,
  Target,
  Sparkles,
  Award
} from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E6EF] pb-4">
        <div>
          <div className="text-[11px] font-bold text-[#0B4F6C] uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#20C4D9]" />
            Judge-Ready Overview
          </div>
          <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Scientific Methodology & Problem Statement
          </h2>
          <p className="text-xs text-[#627D98] mt-0.5">
            Smart India Hackathon (SIH) Problem Statement 4: AI-Based Reconstruction of Subsurface Ocean Temperature
          </p>
        </div>

        <span className="text-xs font-mono text-[#0B4F6C] bg-[#EBF5FA] px-2.5 py-1 rounded border border-[#D9E6EF] font-semibold">
          INCOIS Operational Concept
        </span>
      </div>

      {/* 4 Clean Pillars: Problem, Solution, Output, Validation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Pillar 1: PROBLEM */}
        <div className="bg-white rounded-xl border border-[#D9E6EF] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold text-xs mb-3 border border-red-200">
              01
            </div>
            <h3 className="text-sm font-extrabold text-[#102A43] uppercase tracking-wide">
              The Problem
            </h3>
            <p className="text-xs text-[#486581] mt-2 leading-relaxed">
              Satellites continuously observe the <strong>ocean surface</strong> (temperature, altimetry, salinity, winds), but direct subsurface measurements from ARGO profiling floats and moored buoys are sparse in space and time.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#EBF2F7] text-[11px] font-semibold text-red-800">
            Surface is continuous; depth is dark & sparse.
          </div>
        </div>

        {/* Pillar 2: SOLUTION */}
        <div className="bg-white rounded-xl border border-[#D9E6EF] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FA] text-[#0B4F6C] flex items-center justify-center font-bold text-xs mb-3 border border-[#D9E6EF]">
              02
            </div>
            <h3 className="text-sm font-extrabold text-[#102A43] uppercase tracking-wide">
              The AI Solution
            </h3>
            <p className="text-xs text-[#486581] mt-2 leading-relaxed">
              Learn the nonlinear physical coupling between surface signals (SST, altimetry height, wind stress, salinity) and subsurface baroclinic modes using a <strong>Spatio-Temporal 3D-UNet PINN</strong> model.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#EBF2F7] text-[11px] font-semibold text-[#0B4F6C]">
            Physics-constrained deep neural mapping.
          </div>
        </div>

        {/* Pillar 3: OUTPUT */}
        <div className="bg-white rounded-xl border border-[#D9E6EF] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs mb-3 border border-teal-200">
              03
            </div>
            <h3 className="text-sm font-extrabold text-[#102A43] uppercase tracking-wide">
              The Output
            </h3>
            <p className="text-xs text-[#486581] mt-2 leading-relaxed">
              A <strong>continuous 3D volumetric temperature grid</strong> across the North Indian Ocean at 28 standard depth levels (0m to 1000m) with calibrated uncertainty intervals and mixed layer diagnostics.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#EBF2F7] text-[11px] font-semibold text-teal-800">
            Daily 3D ocean state estimation.
          </div>
        </div>

        {/* Pillar 4: VALIDATION */}
        <div className="bg-white rounded-xl border border-[#D9E6EF] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3 border border-emerald-200">
              04
            </div>
            <h3 className="text-sm font-extrabold text-[#102A43] uppercase tracking-wide">
              Validation
            </h3>
            <p className="text-xs text-[#486581] mt-2 leading-relaxed">
              Evaluate against <strong>independent in-situ ARGO floats</strong> and RAMA mooring buoys not seen during training, benchmarking RMSE, MAE, bias, and correlation stratified across oceanic depth layers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#EBF2F7] text-[11px] font-semibold text-emerald-800">
            Rigorous independent verification.
          </div>
        </div>

      </div>

      {/* Why Deep Learning Succeeds Where Linear Methods Fail */}
      <div className="bg-white rounded-xl border border-[#D9E6EF] p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#102A43] mb-1">
          Why Deep Learning Overcomes Traditional Climatological Limitations
        </h3>
        <p className="text-xs text-[#627D98] mb-5">
          Key oceanographic mechanisms captured by our AI architecture
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F5F9FC] rounded-lg border border-[#D9E6EF]">
            <h4 className="font-bold text-xs text-[#102A43] mb-1">
              1. Non-linear Altimetry Coupling
            </h4>
            <p className="text-xs text-[#627D98] leading-relaxed">
              Sea Surface Height Anomaly (SSHA) integrates vertical thermal expansion. Classical linear regression smears the sharp thermocline transition, while 3D-UNet PINN resolves the exact non-linear inflection depth.
            </p>
          </div>

          <div className="p-4 bg-[#F5F9FC] rounded-lg border border-[#D9E6EF]">
            <h4 className="font-bold text-xs text-[#0B4F6C] mb-1">
              2. 7-Day Wind Forcing Lag
            </h4>
            <p className="text-xs text-[#627D98] leading-relaxed">
              Coastal upwelling off Somalia and Oman lags wind stress bursts by 2 to 5 days. Our temporal attention mechanism tracks this memory, predicting thermocline shoaling before surface cooling becomes apparent.
            </p>
          </div>

          <div className="p-4 bg-[#F5F9FC] rounded-lg border border-[#D9E6EF]">
            <h4 className="font-bold text-xs text-amber-800 mb-1">
              3. Salinity Barrier Layer Resolution
            </h4>
            <p className="text-xs text-[#627D98] leading-relaxed">
              Enormous freshwater discharge in the Bay of Bengal traps heat underneath a buoyant low-salinity surface lid. Using satellite salinity (SMAP) allows the model to predict internal heat traps invisible to infrared SST radiometers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
