import React, { useState } from 'react';
import { 
  Database, 
  Satellite, 
  Binary, 
  FileCode2, 
  CheckCircle2, 
  Download, 
  ExternalLink,
  ShieldAlert,
  Server
} from 'lucide-react';

export const DataProvenanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inputs' | 'insitu' | 'netcdf'>('inputs');

  const satelliteInputs = [
    {
      variable: 'Sea Surface Temperature (SST)',
      symbol: 'T_surf',
      source: 'Group for High Resolution Sea Surface Temperature (GHRSST)',
      satellite: 'MODIS, VIIRS, AVHRR & AMSR2 multi-sensor blend',
      resolution: '0.05° spatial, daily temporal',
      role: 'Direct upper boundary thermal condition and boundary layer heat content anchor.',
      status: 'Harmonized',
    },
    {
      variable: 'Sea Surface Height Anomaly (SSHA)',
      symbol: 'η',
      source: 'Copernicus Marine Environment Monitoring Service (CMEMS)',
      satellite: 'Sentinel-3A/B, Jason-3, CryoSat-2 multi-satellite altimeter blend',
      resolution: '0.25° spatial, daily temporal',
      role: 'Crucial proxy for thermocline displacement and baroclinic mode dynamic height via reduced gravity dynamics.',
      status: 'Harmonized',
    },
    {
      variable: 'Sea Surface Salinity (SSS)',
      symbol: 'S_surf',
      source: 'NASA Jet Propulsion Laboratory (JPL) / SMAP',
      satellite: 'Soil Moisture Active Passive (SMAP) L-band radiometer',
      resolution: '0.25° spatial, 8-day running mean',
      role: 'Resolves freshwater plumes from the Ganga-Brahmaputra in Bay of Bengal and barrier layer formation.',
      status: 'Harmonized',
    },
    {
      variable: 'Surface Wind Stress Vector',
      symbol: 'τ_x, τ_y',
      source: 'EUMETSAT OSI SAF / ECMWF ERA5',
      satellite: 'Advanced Scatterometer (ASCAT) on MetOp-B/C',
      resolution: '0.25° spatial, daily mean',
      role: 'Forces Ekman pumping, coastal upwelling along Somalia/Oman, and monsoon drift currents.',
      status: 'Harmonized',
    },
  ];

  const inSituSources = [
    {
      network: 'ARGO Profiling Float Array',
      agency: 'INCOIS, NOAA, Coriolis GDAC',
      coverage: '~250 active autonomous profiling floats in North Indian Ocean',
      sampling: 'Every 10 days, 0 to 2000m continuous CTD profiles',
      accuracy: 'Temperature ±0.002°C, Salinity ±0.01 PSU, Pressure ±2 dbar',
      role: 'Primary training ground-truth and hold-out spatial validation benchmarks.',
    },
    {
      network: 'RAMA Moored Buoy Array',
      agency: 'PMEL / INCOIS / JAMSTEC joint initiative',
      coverage: '38 tropical moored buoy stations across equatorial & monsoon basins',
      sampling: 'High-frequency hourly surface meteorology and discrete subsurface CTD sensors (1m to 500m)',
      accuracy: 'Research-grade acoustic and thermistor accuracy',
      role: 'High-resolution temporal benchmarking for resolving diurnal and intra-seasonal Madden-Julian Oscillation (MJO) cycles.',
    },
    {
      network: 'Indian Ocean OMNI Array',
      agency: 'Ministry of Earth Sciences (MoES) / NIOT, India',
      coverage: '12 deep-sea moorings in Arabian Sea and Bay of Bengal',
      sampling: 'Continuous subsurface telemetry through thermistor chains',
      accuracy: 'Standard oceanographic precision',
      role: 'Critical validation for rapid tropical cyclone passage response.',
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E6EF] pb-4">
        <div>
          <div className="text-[11px] font-bold text-[#0B4F6C] uppercase tracking-wider">
            Dataset Curation & Lineage
          </div>
          <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Data Architecture & Provenance
          </h2>
          <p className="text-xs text-[#627D98] mt-1">
            Comprehensive specification of satellite surface feeds, in-situ ground truth, and grid harmonization protocols
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#D9E6EF] rounded-lg shadow-2xs">
          <button
            onClick={() => setActiveTab('inputs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'inputs' ? 'bg-[#071A2B] text-white shadow-xs' : 'text-[#627D98] hover:text-[#102A43]'
            }`}
          >
            Satellite Surface Feeds
          </button>
          <button
            onClick={() => setActiveTab('insitu')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'insitu' ? 'bg-[#071A2B] text-white shadow-xs' : 'text-[#627D98] hover:text-[#102A43]'
            }`}
          >
            In-Situ Ground Truth
          </button>
          <button
            onClick={() => setActiveTab('netcdf')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'netcdf' ? 'bg-[#071A2B] text-white shadow-xs' : 'text-[#627D98] hover:text-[#102A43]'
            }`}
          >
            NetCDF-4 Schema
          </button>
        </div>
      </div>

      {/* Honest Scientific Disclosure Notice */}
      <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 leading-relaxed">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Provenance Notice: </span>
            The data specifications below outline the planned operational data ingestion pipeline. In this prototype MVP, data values are simulated using physical oceanographic models matching the standard North Indian Ocean climatology (World Ocean Atlas 2023). Real NetCDF-4 download manifests and ingestion pipelines are documented for architecture review.
          </div>
        </div>
      </div>

      {/* Tab 1: Satellite Surface Inputs */}
      {activeTab === 'inputs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {satelliteInputs.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#D9E6EF] p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#EBF2F7]">
                  <div className="flex items-center gap-2">
                    <Satellite className="w-4 h-4 text-[#0B4F6C]" />
                    <h3 className="text-xs font-bold text-[#102A43]">
                      {item.variable}
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#0B4F6C] bg-[#EBF5FA] px-2 py-0.5 rounded border border-[#D9E6EF]">
                    {item.symbol}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-[#627D98]">
                  <div>
                    <span className="font-semibold text-[#102A43]">Source: </span>
                    <span>{item.source}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#102A43]">Constellation: </span>
                    <span>{item.satellite}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#102A43]">Resolution: </span>
                    <span className="font-mono text-[#0B4F6C]">{item.resolution}</span>
                  </div>
                  <div className="pt-2 text-[#486581] leading-relaxed">
                    {item.role}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EBF2F7] flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Standardized on 0.25° Grid
                </span>
                <span className="font-mono text-[#829AB1]">CF-1.8 Compliant</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: In-Situ Ground Truth */}
      {activeTab === 'insitu' && (
        <div className="space-y-4">
          {inSituSources.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#D9E6EF] p-5 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#EBF2F7] gap-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#0B4F6C]" />
                  <h3 className="text-sm font-bold text-[#102A43]">
                    {item.network}
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#627D98]">
                  {item.agency}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs text-[#627D98]">
                <div>
                  <span className="font-semibold text-[#102A43] block mb-0.5">Coverage in Basin:</span>
                  <span>{item.coverage}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#102A43] block mb-0.5">Sensor Accuracy:</span>
                  <span className="font-mono text-[#0B4F6C]">{item.accuracy}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-[#102A43] block mb-0.5">Sampling Protocol & AI Role:</span>
                  <span className="text-[#486581] leading-relaxed">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: NetCDF Schema Inspector */}
      {activeTab === 'netcdf' && (
        <div className="bg-white rounded-xl border border-[#D9E6EF] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBF2F7] mb-4">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-[#0B4F6C]" />
              <h3 className="text-sm font-bold text-[#102A43]">
                Standardized NetCDF-4 Dataset Architecture (CDL Representation)
              </h3>
            </div>
            <span className="text-xs font-mono text-[#627D98]">
              ocean_reconstruction_north_indian.nc
            </span>
          </div>

          <div className="p-4 bg-[#071A2B] rounded-lg text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-[#0B4F6C]/50 shadow-inner">
            <pre>{`netcdf ocean_reconstruction_north_indian {
dimensions:
    time = UNLIMITED ; // (daily intervals)
    depth = 28 ;       // (standard levels: 0, 5, 10, 20, 30, 50, ..., 1000m)
    lat = 105 ;        // (0.0°N to 26.0°N at 0.25° spacing)
    lon = 201 ;        // (50.0°E to 100.0°E at 0.25° spacing)

variables:
    double time(time) ;
        time:standard_name = "time" ;
        time:units = "days since 2002-01-01 00:00:00" ;
        time:calendar = "proleptic_gregorian" ;

    float depth(depth) ;
        depth:standard_name = "depth" ;
        depth:units = "m" ;
        depth:positive = "down" ;
        depth:axis = "Z" ;

    float lat(lat) ;
        lat:standard_name = "latitude" ;
        lat:units = "degrees_north" ;

    float lon(lon) ;
        lon:standard_name = "longitude" ;
        lon:units = "degrees_east" ;

    // Reconstructed 3D Subsurface Temperature Field
    float temp_reconstructed(time, depth, lat, lon) ;
        temp_reconstructed:long_name = "AI Reconstructed Subsurface Ocean Temperature" ;
        temp_reconstructed:standard_name = "sea_water_potential_temperature" ;
        temp_reconstructed:units = "degrees_C" ;
        temp_reconstructed:_FillValue = -9999.0f ;
        temp_reconstructed:coordinates = "time depth lat lon" ;

    // Surface Input Parameters
    float sst_observed(time, lat, lon) ;
        sst_observed:long_name = "Satellite Observed Sea Surface Temperature" ;
        sst_observed:units = "degrees_C" ;

    float ssha_observed(time, lat, lon) ;
        ssha_observed:long_name = "Satellite Altimetry Sea Surface Height Anomaly" ;
        ssha_observed:units = "m" ;

// Global Attributes
:title = "North Indian Ocean AI Subsurface Temperature Reconstruction" ;
:institution = "Ocean Intelligence Research Lab" ;
:conventions = "CF-1.8" ;
:source = "Satellite Radiometry + Altimetry coupled with 3D-UNet PINN Model" ;
:references = "Research Prototype MVP for Hackathon Evaluation" ;
}`}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
