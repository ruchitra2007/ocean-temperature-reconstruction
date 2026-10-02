import React from 'react';
import { X, ShieldAlert, Cpu, Database, Award, BookOpen, Layers } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A2B]/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-[#D9E6EF] shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#829AB1] hover:text-[#102A43] p-1 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#071A2B] flex items-center justify-center text-[#20C4D9] ring-1 ring-[#0B4F6C]/40">
            <BookOpen className="w-4 h-4 text-[#20C4D9]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#102A43]">
              Project Methodology & Disclosures
            </h2>
            <p className="text-xs font-semibold text-[#0B4F6C]">
              AI-based Subsurface Ocean Temperature Reconstruction
            </p>
          </div>
        </div>

        {/* Mandatory Honesty Rule Section */}
        <div className="mt-5 p-4 rounded-lg bg-amber-50/90 border border-amber-200">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Scientific Honesty & Prototype Disclosure
              </h3>
              <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                This MVP is a working concept demonstration developed for presentation and academic evaluation. <strong>The deep learning system is not yet in operational deployment.</strong> Displayed subsurface temperature fields and validation curves represent synthetic physical oceanographic simulations adhering to North Indian Ocean climatological dynamics (WOA23 / Copernicus Marine Physics).
              </p>
            </div>
          </div>
        </div>

        {/* Scientific Context */}
        <div className="mt-5 space-y-4 text-xs text-[#627D98]">
          <div>
            <h4 className="font-bold text-sm text-[#102A43] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0B4F6C]" />
              The Problem & Core Hypothesis
            </h4>
            <p className="mt-1 text-[#486581] leading-relaxed">
              Satellites continuously measure surface parameters (Sea Surface Temperature, Sea Surface Height Anomaly, Sea Surface Salinity, and Surface Wind Stress) at high spatial and temporal resolutions. However, subsurface ocean measurements (via in-situ ARGO profiling floats and moorings) are sparse in space and time. Our proposed AI model learns the physical coupling between surface expressions and vertical baroclinic modes to reconstruct full 3D temperature profiles down to 1000m depth across the North Indian Ocean.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-lg border border-[#D9E6EF] bg-[#F5F9FC]">
              <div className="flex items-center gap-2 font-bold text-[#102A43] mb-1">
                <Cpu className="w-4 h-4 text-[#0B4F6C]" />
                Target AI Architecture
              </div>
              <p className="text-[11px] leading-relaxed text-[#627D98]">
                Spatio-temporal 3D-UNet & Physics-Informed Neural Network (PINN) incorporating vertical density stability constraints ($d\rho/dz \ge 0$) and geostrophic balance.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#D9E6EF] bg-[#F5F9FC]">
              <div className="flex items-center gap-2 font-bold text-[#102A43] mb-1">
                <Database className="w-4 h-4 text-[#20C4D9]" />
                Surface Inputs (4 Variables)
              </div>
              <p className="text-[11px] leading-relaxed text-[#627D98]">
                1. Satellite SST (°C) <br/>
                2. Satellite Altimetry SSHA (m) <br/>
                3. Microwave Salinity SSS (PSU) <br/>
                4. Scatterometer Wind Stress ($\tau_x, \tau_y$)
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-[#102A43] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#0B4F6C]" />
              North Indian Ocean Specifics
            </h4>
            <p className="mt-1 text-[#486581] leading-relaxed">
              The North Indian Ocean exhibits unique oceanographic behavior: seasonal reversal of the Indian Ocean monsoon, intense summer coastal upwelling off Somalia and Oman, deep winter convection in the northern Arabian Sea, and heavy river runoff in the Bay of Bengal creating thick freshwater barrier layers that trap subsurface heat.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#D9E6EF] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#071A2B] text-white text-xs font-semibold rounded-lg hover:bg-[#0B4F6C] transition-colors"
          >
            Close & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

