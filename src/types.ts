/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Galaxy {
  id: number;
  name: string;
  cx: number; // Center coords
  cy: number;
  cz: number; // Depth coordinate
  radius: number;
  arms: number;
  rotation: number;
  rotationSpeed: number;
  colorTheme: string; // 'blue', 'pink', 'gold', 'purple', etc.
  population: string;
  starsCount: string;
  planetsCount: string;
  initialDistance: number; // For time-to-singularity math
}

export type SimMode = 'passive' | 'blackhole' | 'whitehole' | 'galaxymap' | 'human_exploration';

export interface Star {
  id: number;
  x: number; // 3D local X
  y: number; // 3D local Y
  z: number; // Depth coordinate (0.1 to 10 for Z-depth)
  size: number;
  color: string;
  alpha: number;
  
  // Drift/Rotational motion in passive mode
  vx: number;
  vy: number;
  angle: number;
  distance: number; // distance from center if in a sub-galaxy or absolute
  angularSpeed: number;
  
  // Spiral galaxy relation
  galaxyId?: number;
  
  // Distortion vectors during singularity event
  stretchAngle?: number;
  stretchFactor?: number;
}

export interface SimulationParams {
  starCount: number;
  galaxyCount: number;
}
