import fs from "fs";
import path from "path";
import type { ScenePlan, VisualStyle, AspectRatio, Character } from "../src/types.ts";

interface Dimension {
  width: number;
  height: number;
}

export function getDimensions(aspectRatio: AspectRatio): Dimension {
  if (aspectRatio === '9:16') return { width: 720, height: 1280 };
  if (aspectRatio === '1:1') return { width: 720, height: 720 };
  return { width: 1280, height: 720 };
}

/**
 * Generates an SVG visual frame representing the 3D cinematic scene
 */
export function generateSceneSvg(
  scene: ScenePlan,
  style: VisualStyle,
  aspectRatio: AspectRatio,
  characters: Character[]
): string {
  const { width, height } = getDimensions(aspectRatio);
  const isLandscape = width >= height;

  // Visual style palette and ambiance
  let bg1 = "#07090e";
  let bg2 = "#0f172a";
  let accent1 = "#38bdf8";
  let accent2 = "#818cf8";
  let horizonY = Math.floor(height * 0.62);

  if (style === 'Sci-Fi') {
    bg1 = "#04060b";
    bg2 = "#0a192f";
    accent1 = "#00f2fe";
    accent2 = "#4facfe";
  } else if (style === 'Fantasy') {
    bg1 = "#090514";
    bg2 = "#1e1035";
    accent1 = "#c084fc";
    accent2 = "#34d399";
  } else if (style === 'Cinematic 3D') {
    bg1 = "#080a0f";
    bg2 = "#1c1917";
    accent1 = "#fb923c";
    accent2 = "#38bdf8";
  } else if (style === 'Realistic') {
    bg1 = "#0a0c10";
    bg2 = "#18202b";
    accent1 = "#94a3b8";
    accent2 = "#38bdf8";
  } else if (style === 'Anime-inspired') {
    bg1 = "#0d0b18";
    bg2 = "#2e1065";
    accent1 = "#f43f5e";
    accent2 = "#38bdf8";
  } else if (style === 'Cartoon') {
    bg1 = "#0b0f19";
    bg2 = "#1e293b";
    accent1 = "#fbbf24";
    accent2 = "#f97316";
  } else if (style === 'Animated 3D') {
    bg1 = "#070c18";
    bg2 = "#172554";
    accent1 = "#60a5fa";
    accent2 = "#ec4899";
  }

  // Generate 3D grid lines on ground plane
  let gridLines = '';
  const vpX = width / 2;
  const vpY = horizonY;
  for (let x = -width; x <= width * 2; x += width * 0.15) {
    gridLines += `<line x1="${vpX}" y1="${vpY}" x2="${x}" y2="${height}" stroke="${accent1}" stroke-opacity="0.18" stroke-width="1.5" />`;
  }
  for (let y = horizonY + 20; y < height; y += (height - horizonY) * 0.16) {
    gridLines += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${accent1}" stroke-opacity="0.14" stroke-width="1.2" />`;
  }

  // Characters present in the scene
  const activeChars = characters.filter(c => scene.characterIds.includes(c.id));
  let charElements = '';

  const charPositions = [
    { x: width * 0.38, scale: 0.95 },
    { x: width * 0.62, scale: 0.9 },
    { x: width * 0.5, scale: 1.05 }
  ];

  activeChars.slice(0, 3).forEach((char, idx) => {
    const pos = charPositions[idx] || { x: width * 0.5, scale: 1 };
    const charColor = char.colorTone || accent1;
    const charY = horizonY - 10;

    // Character silhouette with rim-light contour and identity emblem
    charElements += `
      <g transform="translate(${pos.x}, ${charY}) scale(${pos.scale})">
        <!-- Ground Shadow -->
        <ellipse cx="0" cy="120" rx="45" ry="12" fill="#000000" opacity="0.65" filter="blur(6px)" />
        
        <!-- Character Body Silhouette -->
        <path d="M -22 35 L -16 -40 L 0 -55 L 16 -40 L 22 35 L 14 115 L -14 115 Z" fill="#0b0e14" stroke="${charColor}" stroke-width="2" stroke-opacity="0.8" />
        
        <!-- Cloak / Coat flow -->
        <path d="M -18 10 Q -38 65 -25 110 L 25 110 Q 38 65 18 10 Z" fill="#0e131d" opacity="0.9" />

        <!-- Head / Visor -->
        <circle cx="0" cy="-68" r="16" fill="#0b0e14" stroke="${charColor}" stroke-width="2" />
        <rect x="-8" y="-72" width="16" height="6" rx="3" fill="${charColor}" opacity="0.95" filter="drop-shadow(0 0 8px ${charColor})" />

        <!-- Luminescent Chest Core -->
        <circle cx="0" cy="-10" r="5" fill="${charColor}" opacity="0.9" filter="drop-shadow(0 0 10px ${charColor})" />

        <!-- Character Name Label -->
        <rect x="-60" y="132" width="120" height="22" rx="4" fill="#000000" fill-opacity="0.7" stroke="${charColor}" stroke-width="1" stroke-opacity="0.4" />
        <text x="0" y="147" fill="#ffffff" font-size="11" font-weight="600" text-anchor="middle" font-family="'Outfit', sans-serif" letter-spacing="1">
          ${escapeXml(char.name.toUpperCase())}
        </text>
      </g>
    `;
  });

  // Floating atmospheric dust / star motes
  let particles = '';
  for (let p = 0; p < 25; p++) {
    const px = Math.sin(p * 99) * (width * 0.45) + (width * 0.5);
    const py = Math.cos(p * 77) * (height * 0.35) + (height * 0.4);
    const pr = 1.2 + (p % 3) * 0.8;
    const popac = 0.2 + ((p * 13) % 70) / 100;
    particles += `<circle cx="${px}" cy="${py}" r="${pr}" fill="#ffffff" opacity="${popac}" filter="drop-shadow(0 0 4px ${accent1})" />`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- Background Depth Gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bg1}" />
      <stop offset="60%" stop-color="${bg2}" />
      <stop offset="100%" stop-color="${bg1}" />
    </linearGradient>

    <!-- Celestial Horizon Glow -->
    <radialGradient id="celestialGlow" cx="50%" cy="55%" r="60%">
      <stop offset="0%" stop-color="${accent1}" stop-opacity="0.35" />
      <stop offset="50%" stop-color="${accent2}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Volumetric Light Beam -->
    <linearGradient id="lightBeam" x1="0.2" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="${accent1}" stop-opacity="0.28" />
      <stop offset="100%" stop-color="${accent1}" stop-opacity="0.0" />
    </linearGradient>

    <!-- Vignette filter -->
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="65%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
    </radialGradient>
  </defs>

  <!-- Sky Canvas -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />

  <!-- Volumetric Beams -->
  <polygon points="${width * 0.1},0 ${width * 0.4},0 ${width * 0.7},${height} ${width * 0.2},${height}" fill="url(#lightBeam)" />
  <polygon points="${width * 0.7},0 ${width * 0.95},0 ${width * 0.85},${height} ${width * 0.45},${height}" fill="url(#lightBeam)" opacity="0.6" />

  <!-- Celestial Horizon Sphere / Sun -->
  <circle cx="${width * 0.5}" cy="${horizonY - 20}" r="${width * 0.22}" fill="url(#celestialGlow)" />

  <!-- Distant Mountain / Megastructure Silhouettes -->
  <path d="M 0 ${horizonY} 
           L ${width * 0.15} ${horizonY - 80} 
           L ${width * 0.32} ${horizonY - 40} 
           L ${width * 0.5} ${horizonY - 120} 
           L ${width * 0.68} ${horizonY - 50} 
           L ${width * 0.85} ${horizonY - 95} 
           L ${width} ${horizonY} 
           L ${width} ${height} 
           L 0 ${height} Z" 
        fill="#080b12" opacity="0.85" />

  <!-- 3D Perspective Ground Plane -->
  <g>${gridLines}</g>

  <!-- Atmospheric Motes -->
  <g>${particles}</g>

  <!-- Characters -->
  <g>${charElements}</g>

  <!-- Cinema Vignette -->
  <rect width="100%" height="100%" fill="url(#vignette)" />

  <!-- Cinema HUD & Metadata Framing -->
  <!-- Top Left: Scene Number & Shot -->
  <rect x="28" y="24" width="220" height="42" rx="6" fill="#000000" fill-opacity="0.6" stroke="${accent1}" stroke-width="1" stroke-opacity="0.3" />
  <text x="42" y="44" fill="${accent1}" font-size="11" font-weight="700" font-family="'JetBrains Mono', monospace" letter-spacing="1.5">
    SCENE ${scene.sceneNumber} • ${escapeXml(scene.cameraShot.toUpperCase())}
  </text>
  <text x="42" y="58" fill="#94a3b8" font-size="10" font-family="'Outfit', sans-serif">
    ${escapeXml(scene.cameraMovement)}
  </text>

  <!-- Top Right: Style & Aspect Ratio Badge -->
  <rect x="${width - 190}" y="24" width="162" height="32" rx="6" fill="#000000" fill-opacity="0.6" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
  <text x="${width - 109}" y="45" fill="#f8fafc" font-size="11" font-weight="600" text-anchor="middle" font-family="'Outfit', sans-serif" letter-spacing="0.5">
    ${escapeXml(style)} • ${aspectRatio}
  </text>

  <!-- Bottom Banner: Scene Action Title -->
  <rect x="28" y="${height - 64}" width="${width - 56}" height="42" rx="6" fill="#000000" fill-opacity="0.7" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
  <text x="45" y="${height - 38}" fill="#ffffff" font-size="14" font-weight="600" font-family="'Outfit', sans-serif">
    ${escapeXml(scene.title)}
  </text>
  <text x="${width - 45}" y="${height - 38}" fill="${accent1}" font-size="12" font-weight="500" text-anchor="end" font-family="'JetBrains Mono', monospace">
    ${scene.durationSeconds}s
  </text>
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Saves scene SVG files to storage
 */
export async function renderSceneVisuals(
  scenes: ScenePlan[],
  style: VisualStyle,
  aspectRatio: AspectRatio,
  characters: Character[],
  outputDir: string
): Promise<string[]> {
  await fs.promises.mkdir(outputDir, { recursive: true });
  const filePaths: string[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const svgContent = generateSceneSvg(scene, style, aspectRatio, characters);
    const svgPath = path.join(outputDir, `scene_${scene.sceneNumber}.svg`);
    await fs.promises.writeFile(svgPath, svgContent, "utf-8");
    filePaths.push(svgPath);
  }

  return filePaths;
}
