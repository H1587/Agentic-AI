/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Galaxy } from '../types';

// Generate 110 unique cosmological catalog galaxies
export const generateCatalogGalaxies = (): Galaxy[] => {
  const prefixes = [
    'Andromeda', 'Messier', 'Centaurus', 'Sombrero', 'Kepler', 'NGC', 'Cosmos', 'Elysium', 'Aurelia', 
    'Cassiopeia', 'Orion', 'Nebula', 'Cygnus', 'Vela', 'Antlia', 'Phoenix', 'Hydra', 'Lyra', 'Pegasus',
    'Perseus', 'Triangulum', 'Carina', 'Sagittarius', 'Canis Major', 'Taurus', 'Auriga', 'Draco'
  ];
  
  const midfixes = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Sigma', 'Omega', 'Zeta', 'Theta', 'X-Prime', 'Vortex', 
    'Cluster', 'Majoris', 'Minoris', 'Nova', 'Void', 'Ring', 'Helix', 'Horizon', 'Egress', 'Void'
  ];

  const colors = ['blue', 'pink', 'gold', 'purple', 'white'];

  const list: Galaxy[] = [];

  for (let i = 0; i < 110; i++) {
    const prefix = prefixes[i % prefixes.length];
    const midfix = midfixes[(i * 3) % midfixes.length];
    const suffix = (i * 7 + 101) % 999;
    const name = `${prefix} ${midfix}-${suffix}`;

    // Unique coordinates in 3D relative simulation space
    const initialDistance = 250 + (i * 12.5) + (Math.random() * 40); // 250 to 1800 units away
    const angle = (i * 137.5) * (Math.PI / 180); // golden angle distribution
    
    // Population helper
    let popVal = '';
    const groupType = i % 5;
    if (groupType === 0) {
      popVal = `${(5.4 + (i * 0.4)).toFixed(2)} Trillion Carbonoids`;
    } else if (groupType === 1) {
      popVal = `${(220 + (i * 4)).toFixed(1)} Billion Siliconoids`;
    } else if (groupType === 2) {
      popVal = '0 (Sterile Nebula)';
    } else if (groupType === 3) {
      popVal = `${(1.2 + (i * 0.08)).toFixed(3)} Quadrillion Biospheres`;
    } else {
      popVal = `${(42 + (i * 1.5)).toFixed(1)} Billion Synthetic Nodes`;
    }

    const starsCount = `${(12 + i * 4.5).toFixed(1)} Billion`;
    const planetsCount = `${(45 + i * 18.2).toFixed(1)} Billion`;

    list.push({
      id: i,
      name,
      cx: initialDistance * Math.cos(angle),
      cy: initialDistance * Math.sin(angle) * 0.5,
      cz: 1.0 + (i % 6) * 0.8,
      radius: 100 + (i % 6) * 30,
      arms: 2 + (i % 3),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (0.002 + Math.random() * 0.003) * (Math.random() > 0.5 ? 1 : -1),
      colorTheme: colors[i % colors.length],
      population: popVal,
      starsCount,
      planetsCount,
      initialDistance
    });
  }

  return list;
};
