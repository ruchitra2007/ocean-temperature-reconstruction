import React, { useState } from 'react';
import { 
  Cpu, 
  Satellite, 
  Binary, 
  Eye, 
  Clock, 
  Layers, 
  GitBranch, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowDown, 
  Info,
  Code2,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ArchitectureBlock {
  id: string;
  step: number;
  name: string;
  category: 'Input' | 'Encoder' | 'Attention' | 'Decoder' | 'Head' | 'Output';
  summary: string;
  whatItDoes: string;
  whyItExists: string;
  inputTensor: string;
  outputTensor: string;
  formula?: string;
  highlights: string[];
}

export const AIArchitectureView: React.FC = () => {
  const [selectedBlockId, setSelectedBlockId] = useState<string>('temporal-attention');

  const blocks: ArchitectureBlock[] = [
    {
      id: 'surface-obs',
      step: 1,
      name: 'Surface Observations Ingestion',
      category: 'Input',
      summary: 'Multi-satellite surface telemetry feeds (SST, SSHA, SSS, Wind)',
      whatItDoes: 'Ingests high-resolution satellite remote sensing products: GHRSST skin temperature, CMEMS multi-mission altimetry (SSHA), SMAP L-band salinity, and ASCAT scatterometer surface wind stress.',
      whyItExists: 'Subsurface in-situ buoys and Argo floats are too sparse in space and time. Satellite remote sensing provides continuous basin-wide coverage of the North Indian Ocean.',
      inputTensor: 'Multi-mission L3/L4 Raw Feeds (NetCDF-4 format)',
      outputTensor: 'Raw Multimodal Spatial Tensors [Batch, Channel=5, Height, Width]',
      highlights: ['0.05° SST daily', '0.25° SSHA altimetry', 'SMAP 8-day salinity', 'ASCAT wind vectors (τx, τy)'],
    },
    {
      id: 'preproc-qc',
      step: 2,
      name: 'Preprocessing & Quality Control',
      category: 'Input',
      summary: 'Spatiotemporal harmonization, land masking & cloud imputation',
      whatItDoes: 'Regrids all satellite variables onto a standardized 0.25° x 0.25° Mercator grid over the North Indian Ocean (0°–26°N, 50°–100°E). Fills infrared cloud gaps using optimal interpolation, masks landmasses, and standardizes via Z-score normalization.',
      whyItExists: 'Disparate satellite swaths have varying spatial resolutions, projection systems, missing swaths, and cloud-mask gaps that would destabilize deep neural networks without harmonized preprocessing.',
      inputTensor: 'Raw Multimodal Spatial Tensors',
      outputTensor: 'Harmonized 4D Tensor X ∈ ℝ^[B, T=7, C=5, H=105, W=201]',
      formula: 'X_{norm} = \\frac{X - \\mu_{WOA23}}{\\sigma_{WOA23}}',
      highlights: ['Land-sea mask enforcement', 'Optimal spatial interpolation', 'Z-score normalization', 'Temporal 12:00 UTC synchronization'],
    },
    {
      id: 'spatial-cnn',
      step: 3,
      name: 'Spatial CNN Feature Encoder',
      category: 'Encoder',
      summary: 'Hierarchical multi-scale spatial feature extraction',
      whatItDoes: 'Applies deep residual convolutional blocks with spectral normalization to extract multiscale spatial oceanographic patterns such as coastal upwelling filaments, mesoscale eddies, and river plumes.',
      whyItExists: 'Oceanic dynamics are spatially correlated. Mesoscale eddy circulations and frontal gradients have characteristic spatial scales of 50–200 km that must be compressed into latent baroclinic representations.',
      inputTensor: 'Harmonized 4D Tensor X [B, 7, 5, H, W]',
      outputTensor: 'Spatial Feature Map Z_s ∈ ℝ^[B, 7, 256, H/4, W/4]',
      formula: 'Z_s = \\text{ResNet2D-Enc}(X)',
      highlights: ['Spectral normalization for gradient stability', 'Extracts mesoscale eddy signatures', 'Downsamples spatial dimensions 4x', 'Preserves boundary gradients'],
    },
    {
      id: 'temporal-attention',
      step: 4,
      name: '7-Day Temporal Attention Module',
      category: 'Attention',
      summary: 'Captures baroclinic memory and wind-lagged oceanic response',
      whatItDoes: 'Processes a rolling window of the past 7 days using multi-head self-attention. Computes attention weights between the current state and lagged surface conditions.',
      whyItExists: 'The subsurface ocean reacts with temporal inertia: wind stress forcing at the surface takes 2 to 5 days to trigger Ekman suction and thermocline upwelling. Temporal attention learns this dynamic phase lag.',
      inputTensor: 'Spatial Feature Sequence Z_s [B, 7, 256, H/4, W/4]',
      outputTensor: 'Temporal Context Tensor Z_t ∈ ℝ^[B, 256, H/4, W/4]',
      formula: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
      highlights: ['7-day sliding observation window', 'Learns wind-forced upwelling lag', 'Multi-head attention (h=8)', 'Dynamic baroclinic wave tracking'],
    },
    {
      id: 'spatial-attention',
      step: 5,
      name: 'Spatial Self-Attention Mechanism',
      category: 'Attention',
      summary: 'Long-range basin teleconnections and planetary wave tracking',
      whatItDoes: 'Calculates global receptive field dependencies across the entire North Indian Ocean basin, connecting equatorial Kelvin wave propagation to coastal Kelvin and Rossby wave reflections along the Bay of Bengal.',
      whyItExists: 'Ocean waves traverse thousands of kilometers across the basin. Standard local convolutions have finite receptive fields that miss teleconnections between equatorial winds and remote coastal upwelling.',
      inputTensor: 'Temporal Context Tensor Z_t',
      outputTensor: 'Teleconnection-Aware Representation Z_{attn}',
      formula: 'A_{i,j} = \\frac{\\exp(s_{i,j})}{\\sum_k \\exp(s_{i,k})}',
      highlights: ['Basin-scale teleconnection modeling', 'Captures remote wind-driven waves', 'Cross-basin information routing', 'Global receptive field'],
    },
    {
      id: 'unet-decoder',
      step: 6,
      name: 'U-Net Spatial Decoder',
      category: 'Decoder',
      summary: 'High-resolution spatial upsampling with skip connections',
      whatItDoes: 'Progressively reconstructs full spatial resolution (0.25°) using transpose convolutions and skip connections from early encoder stages to restore localized boundary details.',
      whyItExists: 'Preserves sharp spatial boundaries, coastlines, and island channels (e.g., Palk Strait, Eight Degree Channel) while translating latent features toward vertical reconstruction channels.',
      inputTensor: 'Latent Representation Z_{attn}',
      outputTensor: 'Decoded Dense Representation D ∈ ℝ^[B, 128, H, W]',
      formula: 'D = \\text{Decoder}(Z_{attn}) \\oplus \\text{SkipConnections}',
      highlights: ['Skip connections preserve high-frequency features', 'Transposed convolutional upsampling', 'Sharp coastline delineation', '128-channel dense latent field'],
    },
    {
      id: 'eof-residual',
      step: 7,
      name: 'EOF Basis + Nonlinear Residual Decomposition',
      category: 'Head',
      summary: 'Physical modal decomposition into empirical orthogonal functions',
      whatItDoes: 'Decomposes vertical temperature profiles into leading Empirical Orthogonal Functions (EOFs / baroclinic vertical modes) plus a nonlinear residual neural correction network.',
      whyItExists: 'In physical oceanography, the first 3 EOF vertical modes account for over 90% of thermal variance. Constraining the model to predict mode amplitudes guarantees physical thermal profiles while the residual network captures non-modal local anomalies.',
      inputTensor: 'Decoded Representation D [B, 128, H, W]',
      outputTensor: 'Reconstructed Temperature T(z) ∈ ℝ^[B, 28, H, W]',
      formula: 'T(z) = \\sum_{k=1}^K \\alpha_k(x,y,t) \\phi_k(z) + \\mathcal{R}_{PINN}(z, x, y)',
      highlights: ['Predicts EOF mode coefficients α_k', 'Ensures smooth vertical stratification', 'Residual network captures non-modal fronts', 'Hydrostatic stability enforcement'],
    },
    {
      id: 'uncertainty-head',
      step: 8,
      name: 'Laplacian Uncertainty Head',
      category: 'Head',
      summary: 'Heteroscedastic aleatoric uncertainty estimation',
      whatItDoes: 'Jointly outputs the predictive mean temperature μ(z) and the local uncertainty scale parameter b(z) parameterized as a Laplace or Gaussian distribution.',
      whyItExists: 'Scientific practitioners and judges must know where the model is confident (e.g. well-mixed surface or deep isothermal water) versus where uncertainty is elevated (e.g. sharp seasonal thermoclines or persistent cloud cover).',
      inputTensor: 'Decoded Representation D',
      outputTensor: 'Uncertainty Scale b(z) ∈ ℝ^[B, 28, H, W]',
      formula: '\\mathcal{L}_{NLL} = \\frac{|T_{obs} - \\mu|}{\\sigma} + \\ln(2\\sigma)',
      highlights: ['Heteroscedastic error estimation', 'Calibrated 95% confidence bands', 'Identifies high-uncertainty thermoclines', 'Provides conformal prediction bounds'],
    },
    {
      id: 'observer-correction',
      step: 9,
      name: 'Observer Correction & Physics-Loss Enforcement',
      category: 'Output',
      summary: 'Hydrostatic stability filtering & in-situ Kalman nudging',
      whatItDoes: 'Passes predictions through a physics filter that verifies vertical density stability (dρ/dz ≥ 0, prohibiting unphysical density inversions) and incorporates nearby in-situ Argo observations within a spatial covariance radius.',
      whyItExists: 'Pure data-driven neural networks can occasionally produce unphysical negative density gradients (convective overturn) in calm seas. The physics loss strictly penalizes hydrostatic violations.',
      inputTensor: 'Predicted Profiles μ(z), Uncertainty b(z)',
      outputTensor: 'Final 3D Volumetric Ocean Temperature Grid [28 Levels, 0°–26°N, 50°–100°E]',
      formula: '\\mathcal{L}_{total} = \\mathcal{L}_{MSE} + \\lambda_1 \\mathcal{L}_{d\\rho/dz} + \\lambda_2 \\mathcal{L}_{NLL}',
      highlights: ['Strict dρ/dz ≥ 0 density constraint', 'Zero unphysical temperature inversions', 'In-situ Kalman observation nudging', 'CF-1.8 compliant 3D NetCDF export'],
    },
  ];

  const activeBlock = blocks.find((b) => b.id === selectedBlockId) || blocks[3];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E6EF] pb-4">
        <div>
          <div className="text-[11px] font-bold text-[#0B4F6C] uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#20C4D9]" />
            Deep Learning Specification
          </div>
          <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            AI Inversion Architecture & Neural Flow
          </h2>
          <p className="text-xs text-[#627D98] mt-0.5">
            End-to-end spatio-temporal neural architecture mapping surface satellite observations to 3D subsurface temperature
          </p>
        </div>

        <span className="text-xs font-mono text-[#0B4F6C] bg-[#EBF5FA] px-2.5 py-1 rounded border border-[#D9E6EF] font-semibold">
          Model: 3D-UNet + Temporal Attention + PINN
        </span>
      </div>

      {/* Main Two-Column Stage: Left Interactive Pipeline Diagram, Right Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Flow Steps (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-bold text-[#102A43] uppercase tracking-wider mb-2">
            Architecture Pipeline Stages (Click to Inspect):
          </div>

          <div className="space-y-1.5">
            {blocks.map((block) => {
              const isSelected = selectedBlockId === block.id;
              return (
                <button
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-all relative flex items-center justify-between ${
                    isSelected
                      ? 'border-[#0B4F6C] bg-[#EBF5FA] ring-2 ring-[#20C4D9]/40 shadow-xs'
                      : 'border-[#D9E6EF] bg-white hover:border-[#20C4D9] hover:bg-[#F5F9FC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                      isSelected ? 'bg-[#071A2B] text-[#20C4D9]' : 'bg-[#F5F9FC] text-[#627D98] border border-[#D9E6EF]'
                    }`}>
                      {block.step}
                    </span>

                    <div>
                      <div className="text-xs font-bold text-[#102A43] leading-tight">
                        {block.name}
                      </div>
                      <div className="text-[10px] text-[#627D98] mt-0.5 line-clamp-1">
                        {block.summary}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                    isSelected
                      ? 'bg-white text-[#0B4F6C] border-[#D9E6EF]'
                      : 'bg-[#F5F9FC] text-[#829AB1] border-[#D9E6EF]'
                  }`}>
                    {block.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Architectural Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#D9E6EF] p-6 shadow-xs space-y-5">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-[#EBF2F7]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#071A2B] bg-[#EBF5FA] px-2 py-0.5 rounded border border-[#D9E6EF]">
                  Stage {activeBlock.step} of 9
                </span>
                <span className="text-[11px] font-mono text-[#0B4F6C] uppercase font-semibold">
                  {activeBlock.category} Stage
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#102A43] mt-1.5">
                {activeBlock.name}
              </h3>
              <p className="text-xs text-[#627D98] mt-0.5">
                {activeBlock.summary}
              </p>
            </div>
          </div>

          {/* Section: What it does */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B4F6C] mb-1">
              What it does:
            </h4>
            <p className="text-xs text-[#486581] leading-relaxed">
              {activeBlock.whatItDoes}
            </p>
          </div>

          {/* Section: Why it exists */}
          <div className="p-3 bg-[#F5F9FC] rounded-lg border border-[#D9E6EF]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#102A43] mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#0B4F6C]" />
              Why this component exists in the scientific pipeline:
            </h4>
            <p className="text-xs text-[#627D98] leading-relaxed">
              {activeBlock.whyItExists}
            </p>
          </div>

          {/* Tensor Contracts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-white rounded-lg border border-[#D9E6EF]">
              <div className="text-[10px] font-bold text-[#829AB1] uppercase font-sans">Input Tensor</div>
              <div className="text-xs text-[#102A43] mt-1 break-all font-semibold">
                {activeBlock.inputTensor}
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#D9E6EF]">
              <div className="text-[10px] font-bold text-[#829AB1] uppercase font-sans">Output Tensor</div>
              <div className="text-xs text-[#0B4F6C] mt-1 break-all font-semibold">
                {activeBlock.outputTensor}
              </div>
            </div>
          </div>

          {/* Mathematical formulation if applicable */}
          {activeBlock.formula && (
            <div className="p-3 bg-[#071A2B] text-white rounded-lg font-mono text-xs border border-[#0B4F6C]">
              <div className="text-[10px] uppercase font-bold text-[#20C4D9] mb-1 font-sans">
                Mathematical Formulation
              </div>
              <div className="text-slate-200">
                {activeBlock.formula}
              </div>
            </div>
          )}

          {/* Key Engineering Highlights */}
          <div className="pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#627D98] mb-2">
              Key Engineering Features:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activeBlock.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#486581]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
