// Oceanographic Colormaps (Scientific Marine Blue Spectrum, Haline, SSHA Divergent)

/**
 * Scientific Ocean Temperature Colormap
 * Calibrated for a rich, vibrant oceanic blue spectrum:
 * Deep Navy Blue -> Marine Sapphire -> Vivid Azure -> Cyan -> Turquoise/Aqua -> Tropical Gold
 */
export function getTemperatureColor(temp: number, min = 6, max = 32): string {
  // Normalize between 0 and 1
  const t = Math.max(0, Math.min(1, (temp - min) / (max - min)));

  if (t < 0.22) {
    // 6°C to ~11.7°C: Deep Abyssal Ocean Navy (12, 35, 90) -> Marine Royal Blue (18, 70, 175)
    const f = t / 0.22;
    const r = Math.round(12 + f * 6);
    const g = Math.round(35 + f * 35);
    const b = Math.round(90 + f * 85);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (t < 0.45) {
    // ~11.7°C to ~17.7°C: Marine Royal Blue (18, 70, 175) -> Vivid Cobalt/Azure (22, 115, 220)
    const f = (t - 0.22) / 0.23;
    const r = Math.round(18 + f * 4);
    const g = Math.round(70 + f * 45);
    const b = Math.round(175 + f * 45);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (t < 0.68) {
    // ~17.7°C to ~23.7°C: Vivid Azure (22, 115, 220) -> Bright Ocean Cyan (32, 196, 235)
    const f = (t - 0.45) / 0.23;
    const r = Math.round(22 + f * 10);
    const g = Math.round(115 + f * 81);
    const b = Math.round(220 + f * 15);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (t < 0.88) {
    // ~23.7°C to ~28.9°C: Bright Ocean Cyan (32, 196, 235) -> Luminous Turquoise Aqua (60, 225, 215)
    const f = (t - 0.68) / 0.20;
    const r = Math.round(32 + f * 28);
    const g = Math.round(196 + f * 29);
    const b = Math.round(235 - f * 20);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // ~28.9°C to 32.0°C: Turquoise Aqua (60, 225, 215) -> Tropical Sunlit Amber (240, 195, 60)
    const f = (t - 0.88) / 0.12;
    const r = Math.round(60 + f * 180);
    const g = Math.round(225 - f * 30);
    const b = Math.round(215 - f * 155);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function getSshaColor(ssha: number): string {
  // SSHA range typically -0.20m to +0.20m
  // Diverging: negative (cyclonic/upwelling cold) = deep ocean blue; 0 = pale cyan-slate; positive = warm amber-orange
  const val = Math.max(-0.25, Math.min(0.25, ssha));
  if (val < 0) {
    const f = Math.abs(val) / 0.25;
    const r = Math.round(225 - f * 190);
    const g = Math.round(235 - f * 165);
    const b = Math.round(245 - f * 95);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const f = val / 0.25;
    const r = Math.round(225 + f * 25);
    const g = Math.round(235 - f * 125);
    const b = Math.round(245 - f * 215);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function getSalinityColor(salinity: number, min = 31, max = 37): string {
  // Salinity: Bay of Bengal is fresh (31-33 PSU, teal/cyan); Arabian Sea is saline (36-37 PSU, deep indigo)
  const s = Math.max(0, Math.min(1, (salinity - min) / (max - min)));
  const r = Math.round(45 - s * 30);
  const g = Math.round(210 - s * 145);
  const b = Math.round(195 - s * 105);
  return `rgb(${r}, ${g}, ${b})`;
}
