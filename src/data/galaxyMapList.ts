/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MapGalaxy {
  id: number;
  name: string;
  type: string;
  distance: string;
  constellation: string;
  diameter: string;
  starsCount: string;
  colorTheme: string;
  description: string;
}

export const generateGalaxyMapList = (): MapGalaxy[] => {
  const famousGalaxies = [
    {
      name: 'Milkyway Galaxy',
      type: 'Barred Spiral (SBbc)',
      distance: '0 LY (Home)',
      constellation: 'Sagittarius',
      diameter: '100,000 LY',
      starsCount: '400 Billion',
      colorTheme: 'gold',
      description: 'Our home galaxy, containing our Solar System and Earth at its local Gould Belt core.'
    },
    {
      name: 'Andromeda Galaxy (M31)',
      type: 'Spiral (Sb)',
      distance: '2.537 Million LY',
      constellation: 'Andromeda',
      diameter: '220,000 LY',
      starsCount: '1 Trillion',
      colorTheme: 'blue',
      description: 'The largest member of the Local Group, currently on a collision course with the Milky Way.'
    },
    {
      name: 'Triangulum Galaxy (M33)',
      type: 'Spiral (Sc)',
      distance: '2.73 Million LY',
      constellation: 'Triangulum',
      diameter: '60,000 LY',
      starsCount: '40 Billion',
      colorTheme: 'pink',
      description: 'The third-largest galaxy in our Local Group, showing intense starburst activity.'
    },
    {
      name: 'Sombrero Galaxy (M104)',
      type: 'Unbarred Spiral (Sa)',
      distance: '31.1 Million LY',
      constellation: 'Virgo',
      diameter: '50,000 LY',
      starsCount: '800 Billion',
      colorTheme: 'white',
      description: 'Famous for its unusually large central bulge and deep dark dust lane in its disk.'
    },
    {
      name: 'Whirlpool Galaxy (M51)',
      type: 'Grand Design Spiral',
      distance: '23 Million LY',
      constellation: 'Canis Venatici',
      diameter: '76,000 LY',
      starsCount: '100 Billion',
      colorTheme: 'purple',
      description: 'A classic spiral galaxy interacting with its smaller companion dwarf, NGC 5195.'
    },
    {
      name: 'Cigar Galaxy (M82)',
      type: 'Starburst Galaxy',
      distance: '12 Million LY',
      constellation: 'Ursa Major',
      diameter: '37,000 LY',
      starsCount: '30 Billion',
      colorTheme: 'pink',
      description: 'An extremely active starburst galaxy, glowing intensely from gravitational encounters.'
    },
    {
      name: 'Black Eye Galaxy (M64)',
      type: 'Spiral Galaxy',
      distance: '17 Million LY',
      constellation: 'Coma Berenices',
      diameter: '54,000 LY',
      starsCount: '100 Billion',
      colorTheme: 'gold',
      description: 'Renowned for its massive spectular dark band of absorbing dust in front of its bright nucleus.'
    },
    {
      name: 'Sunflower Galaxy (M63)',
      type: 'Flocculent Spiral',
      distance: '27 Million LY',
      constellation: 'Canis Venatici',
      diameter: '98,000 LY',
      starsCount: '150 Billion',
      colorTheme: 'blue',
      description: 'Features a tight bright core surrounded by numerous short spiral arm segments.'
    },
    {
      name: 'Cartwheel Galaxy (ESO 350-40)',
      type: 'Ring Galaxy',
      distance: '500 Million LY',
      constellation: 'Sculptor',
      diameter: '150,000 LY',
      starsCount: '200 Billion',
      colorTheme: 'purple',
      description: 'Formed from a high-speed collision of two galaxies, producing a massive expanding ring of stars.'
    },
    {
      name: 'Pinwheel Galaxy (M101)',
      type: 'Grand Design Spiral',
      distance: '21 Million LY',
      constellation: 'Ursa Major',
      diameter: '170,000 LY',
      starsCount: '1 Trillion',
      colorTheme: 'blue',
      description: 'A grand-design spiral galaxy with high-contrast, prominent spiral arms rich in nebula gas.'
    }
  ];

  const prefixes = [
    'NGC', 'IC', 'Leo', 'Pegasus', 'Fornax', 'UGC', 'Segue', 'Sculptor', 'Carina',
    'Zwicky', 'Antlia', 'Sextans', 'Phoenix', 'ESO', 'Abell', 'Macmillan', 'Arp', 'Cosmos'
  ];

  const catalogs = [
    'Cluster', 'Dwarf', 'Spiral', 'Irregular', 'Ellipsoid', 'Void', 'Stream', 'Vortex', 'Quasar'
  ];

  const colors = ['blue', 'pink', 'gold', 'purple', 'white'];

  const list: MapGalaxy[] = famousGalaxies.map((g, idx) => ({
    id: idx,
    ...g
  }));

  // Generate 90 more galaxies to complete the 100 list
  for (let i = 10; i < 100; i++) {
    const pref = prefixes[i % prefixes.length];
    const cat = catalogs[(i * 3) % catalogs.length];
    const suffix = (i * 13 + 301) % 8999;
    const name = `${pref} ${suffix} (${cat})`;

    const distanceNum = (15 + i * 4.5).toFixed(1);
    const diameterNum = (20 + (i % 7) * 25).toFixed(0);
    const starsNum = (5 + (i % 9) * 45).toFixed(0);

    list.push({
      id: i,
      name,
      type: `${cat} Galaxy`,
      distance: `${distanceNum} Million LY`,
      constellation: prefixes[(i + 2) % prefixes.length],
      diameter: `${diameterNum},000 LY`,
      starsCount: `${starsNum} Billion`,
      colorTheme: colors[i % colors.length],
      description: `Deep sky celestial body categorized under systematic index catalog referencing cluster group ${i + 15}.`
    });
  }

  return list;
};
