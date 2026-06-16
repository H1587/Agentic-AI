/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, Orbit, Volume2, VolumeX, Sparkles, Compass, 
  Globe, Info, ArrowLeft, ZoomIn, ZoomOut, Check, ArrowRight
} from 'lucide-react';
import { generateGalaxyMapList, MapGalaxy } from '../data/galaxyMapList';
import { audioManager } from '../utils/audio';

interface GalaxyMapProps {
  onBack: () => void;
}

export default function GalaxyMap({ onBack }: GalaxyMapProps) {
  const galaxies = useMemo(() => generateGalaxyMapList(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number>(-1); // Default to overview (-1) for hyper-real screen
  const [isZoomed, setIsZoomed] = useState(false);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [hoveredNebula, setHoveredNebula] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(() => audioManager.isMuted);
  
  // Sol system orbital animation state tick
  const [orbitTick, setOrbitTick] = useState(0);

  const selectedGalaxy = useMemo(() => {
    if (selectedId === -1) return null;
    return galaxies.find((g) => g.id === selectedId) || null;
  }, [selectedId, galaxies]);

  const filteredGalaxies = useMemo(() => {
    return galaxies.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [galaxies, searchQuery]);

  // Sync mute state and background ambient hum
  useEffect(() => {
    audioManager.setMuted(isMuted);
    if (!isMuted) {
      audioManager.startPassiveDrone();
    } else {
      audioManager.stopPassiveDrone(0.4);
    }
  }, [isMuted]);

  // Clean play on unmount / mount
  useEffect(() => {
    const resumeAudio = () => {
      if (!audioManager.isMuted) {
        audioManager.startPassiveDrone();
      }
    };
    window.addEventListener('click', resumeAudio, { once: true });
    return () => {
      window.removeEventListener('click', resumeAudio);
      audioManager.stopPassiveDrone(0.4);
    };
  }, []);

  // Request orbital ticker loop
  useEffect(() => {
    let animFrame: number;
    const tick = () => {
      setOrbitTick((prev) => (prev + 1) % 3600);
      animFrame = requestAnimationFrame(tick);
    };
    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Handle galaxy selection
  const handleGalaxySelect = (id: number) => {
    setSelectedId(id);
    setIsZoomed(false); // Reset zoom on galaxy change
    setHoveredPlanet(null);
    audioManager.playClick();
  };

  const handleHoverPlanet = (name: string | null) => {
    setHoveredPlanet(name);
    if (name) {
      audioManager.playHover();
    }
  };

  const triggerZoom = (zoomed: boolean) => {
    setIsZoomed(zoomed);
    if (zoomed) {
      audioManager.playZoomIn();
    } else {
      audioManager.playZoomOut();
    }
  };

  // Planets data for Sol System
  const solarPlanets = useMemo(() => {
    return [
      {
        name: 'Mercury',
        color: '#9E9E9E', // Gray
        radius: 3,
        orbitRadius: 18,
        speed: 4.1,
        age: '4.503 billion years',
        desc: 'Small rocky planet closest to Sol. Experience swings of scorching heat & freezing darkness.'
      },
      {
        name: 'Venus',
        color: '#E0A96D', // Pale gold
        radius: 5,
        orbitRadius: 28,
        speed: 1.6,
        age: '4.503 billion years',
        desc: 'Extremely dense greenhouse gas shroud traps thermal radiation inside a volatile sulfur crust.'
      },
      {
        name: 'Earth',
        color: '#3B82F6', // Blue marble
        radius: 5.5,
        orbitRadius: 38,
        speed: 1.0,
        age: '4.543 billion years',
        desc: 'Life-bearing liquid water oasis shielded by a protective nitrogen-oxygen atmospheric envelope.'
      },
      {
        name: 'Mars',
        color: '#EF4444', // Red oxide
        radius: 4.5,
        orbitRadius: 48,
        speed: 0.53,
        age: '4.603 billion years',
        desc: 'Iron-rich frozen desert with polar dry ice caps, dead volcanoes, and ancient dried valleys.'
      },
      {
        name: 'Jupiter',
        color: '#D4A373', // Orange/beige stripey gas giant
        radius: 10,
        orbitRadius: 62,
        speed: 0.24,
        age: '4.503 billion years',
        desc: 'The solar system\'s largest gas giant, famed for its massive swirling storms.'
      },
      {
        name: 'Saturn',
        color: '#E9C46A', // Pale gold gas giant
        radius: 8.5,
        orbitRadius: 76,
        speed: 0.15,
        age: '4.503 billion years',
        desc: 'Crowned by high-velocity rings of ancient ice crystals and planetary dust.'
      },
      {
        name: 'Uranus',
        color: '#A8DADC', // Ice blue
        radius: 7,
        orbitRadius: 88,
        speed: 0.08,
        age: '4.503 billion years',
        desc: 'An ice giant with an aquamarine hue that rotates completely on its side.'
      },
      {
        name: 'Neptune',
        color: '#457B9D', // Deep blue
        radius: 7,
        orbitRadius: 98,
        speed: 0.05,
        age: '4.503 billion years',
        desc: 'The outermost massive ice giant, swept by the fastest winds in the local system.'
      },
      {
        name: 'Pluto',
        color: '#CDB4DB', // Distant pale gray-pink dwarf
        radius: 2.5,
        orbitRadius: 108,
        speed: 0.02,
        age: '4.460 billion years',
        desc: 'An icy dwarf planet with a solid surface operating in the outermost Kuiper Belt.'
      }
    ];
  }, []);

  return (
    <div className="absolute inset-0 z-30 bg-white text-black flex flex-col md:flex-row overflow-hidden font-sans select-none animate-fade-in">
      
      {/* 1. LEFT SIDE PANEL: SEARCH & LIST VIEW (Exactly 100 Galaxies) */}
      <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-neutral-50 border-r border-neutral-200 flex flex-col h-full z-40" id="galaxy-map-sidebar">
        
        {/* SIDEBAR HEADER */}
        <div className="p-4 border-b border-neutral-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={() => {
                audioManager.playNavigate();
                onBack();
              }}
              className="flex items-center gap-1 text-xs font-mono font-bold tracking-wider text-neutral-600 hover:text-black transition-colors cursor-pointer group"
              id="galaxy-map-back-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              BACK TO HUB
            </button>
            <span className="p-1 rounded bg-neutral-100 text-neutral-600 border border-neutral-200 text-[9px] font-mono uppercase tracking-widest font-semibold">
              MAP SYSTEM
            </span>
          </div>

          <h2 className="text-xl font-extralight tracking-tight text-neutral-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-neutral-500 animate-spin-slow" />
            Galactic Atlas
          </h2>
          <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider mt-1">
            Systematic Classification Core • 100 Galaxies
          </p>
        </div>

        {/* SEARCH BOX */}
        <div className="p-4 bg-white border-b border-neutral-150 flex items-center gap-2">
          <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <input 
            id="map-catalog-search-input"
            type="text"
            placeholder="SEARCH ATLAS CATALOG (100)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 text-black placeholder-neutral-300 text-xs font-mono tracking-wide focus:ring-0 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-neutral-100 rounded">
              <X className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          )}
        </div>

        {/* 100 GALAXIES LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
          <p className="text-[9px] text-neutral-400 font-mono tracking-widest uppercase mb-2 px-2">
            CATALOG CLUSTER ({filteredGalaxies.length} FOUND)
          </p>

          <div className="space-y-1">
            {filteredGalaxies.map((galaxy) => {
              const isSelected = selectedId === galaxy.id;
              const isMilkyWay = galaxy.name === 'Milkyway Galaxy';
              
              return (
                <button
                  key={galaxy.id}
                  id={`map-galaxy-item-${galaxy.id}`}
                  onClick={() => handleGalaxySelect(galaxy.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-250 flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-neutral-900 border-neutral-900 text-white shadow-md'
                      : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isMilkyWay ? 'bg-amber-500 animate-pulse' : isSelected ? 'bg-white' : 'bg-neutral-400'}`} />
                      <span className="text-[11px] font-mono tracking-wide font-medium truncate block">
                        {galaxy.name}
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>
                      {galaxy.type} • {galaxy.distance}
                    </span>
                  </div>

                  {isMilkyWay && (
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase tracking-widest font-bold shrink-0">
                      SOL SYSTEM
                    </span>
                  )}
                </button>
              );
            })}

            {filteredGalaxies.length === 0 && (
              <div className="text-center py-12 text-neutral-400 text-xs font-mono">
                NO CLASSIFICATIONS MATCHING FILTER
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE / VIEWER (Crisp high-precision layout with high contrast Whitehole themes) */}
      <main className="flex-1 relative bg-[#030206] flex flex-col justify-between p-6 z-30 overflow-hidden" id="galaxy-map-viewport">
        
        {/* Subtle hyper-real cosmic starfield texture in backdrop */}
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:24px_24px] z-0" />
        <div className="absolute inset-x-0 bottom-0 top-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(111,86,220,0.15)_0%,transparent_80%)] z-0" />

        {/* HYPER-REAL COSMIC NEBULAS & DUST CLOUDS BACKDROP */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Magenta/Purple Orion-like Nebula Cluster */}
          <div 
            className="absolute -top-12 -left-16 w-[450px] h-[450px] rounded-full bg-radial-gradient from-violet-600/35 via-fuchsia-500/10 to-transparent filter mix-blend-screen animate-nebula-violet"
          />
          {/* Emerald/Teal Carina-like Gaseous Dust Cloud */}
          <div 
            className="absolute -bottom-24 -right-24 w-[550px] h-[550px] rounded-full bg-radial-gradient from-teal-500/30 via-emerald-500/10 to-transparent filter mix-blend-screen animate-nebula-teal"
          />
          {/* Warm Amber Core Ignition Cloud */}
          <div 
            className="absolute top-1/3 left-1/3 w-[350px] h-[350px] rounded-full bg-radial-gradient from-amber-500/20 via-pink-500/5 to-transparent filter mix-blend-screen animate-nebula-amber"
          />
        </div>

        {/* TOP STATUS NAVIGATION BAR */}
        <div className="flex items-center justify-between z-30 select-none text-white">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.3em] font-mono text-teal-300">
              {selectedId === 0 ? 'SOL SYSTEM LOCATOR ACTIVE' : 'INTELLIGENT NEBULA SURVEY'}
            </span>
            <span className="text-[15px] font-light tracking-wide text-white flex items-center gap-1.5 mt-0.5">
              TARGETING OBJECT: <strong className="font-semibold text-amber-200">{selectedGalaxy ? selectedGalaxy.name : 'COSMIC ATLAS EXPLORER'}</strong>
            </span>
          </div>

          {/* Quick Stats & Audio Control Panel */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className="p-2 rounded-lg bg-neutral-900/85 border border-white/10 hover:border-teal-400 flex items-center gap-2 backdrop-blur transition-all active:scale-95 cursor-pointer max-xs:p-1.5"
              title={isMuted ? "Unmute Space Synths" : "Mute Space Synths"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              )}
              <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-300 font-semibold hidden sm:inline">
                {isMuted ? 'MUTE ON' : 'SYNTH LIVE'}
              </span>
            </button>

            <div className="p-2 rounded-lg bg-neutral-900/80 border border-white/10 flex items-center gap-2 backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider font-semibold">
                {selectedId === 0 ? 'Milky Way Core Lock-In' : 'Atlas Live Stream'}
              </span>
            </div>
          </div>
        </div>

        {/* CELESTIAL STAGE CONTAINER */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-10">
          
          {/* CASE A: MILKYWAY SELECTED (Blur the screen container and overlay the precise Sol System visualizers) */}
          {selectedId === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-full h-[60vh] flex items-center justify-center backdrop-blur-[14px] bg-black/65 rounded-2xl border border-white/10 p-6 mx-6 overflow-hidden shadow-2xl"
            >
              {/* Core swirling radar background under the Sol System */}
              <div className="absolute opacity-20 w-[420px] h-[420px] rounded-full border border-dashed border-white/40 flex items-center justify-center pointer-events-none">
                <div className="w-[300px] h-[300px] rounded-full border border-white/10" />
                <div className="w-[180px] h-[180px] rounded-full border border-dashed border-white/20" />
              </div>

              {/* SPECIAL PORTAL: MILKY WAY & SOLAR SYSTEM VIEW */}
              <div className="relative flex items-center justify-center z-10">
                
                {/* Interactive Sol System Center anchor */}
                <div className="relative flex items-center justify-center">
                  
                  {/* Solar system viewport with smooth 200% zoom transition */}
                  <motion.div
                    animate={{ 
                      scale: isZoomed ? 2.0 : 1.0,
                    }}
                    transition={{ type: 'spring', stiffness: 90, damping: 20 }}
                    className="relative w-56 h-56 flex items-center justify-center rounded-full bg-transparent border border-dashed border-white/20 cursor-pointer"
                    onClick={() => !isZoomed && triggerZoom(true)}
                  >
                    {/* Central Sun core with hover support */}
                    <div 
                      className="relative flex items-center justify-center z-20 pointer-events-auto"
                      onMouseEnter={() => isZoomed && handleHoverPlanet('Sun')}
                      onMouseLeave={() => isZoomed && handleHoverPlanet(null)}
                    >
                      {/* Shimmering corona */}
                      <motion.div 
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        className="absolute w-12 h-12 rounded-full bg-amber-400/20 filter blur-md pointer-events-none" 
                      />
                      <div className={`w-6 h-6 rounded-full bg-amber-400 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center justify-center ${isZoomed ? 'scale-50' : ''}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      </div>
                    </div>

                    {/* PLANET ORBITS: Render orbiting planets when Zoomed in 200% */}
                    {isZoomed && (
                      <div className="absolute inset-0 pointer-events-none">
                        {solarPlanets.map((planet) => {
                          const angle = (orbitTick * 0.0008 * planet.speed) % (Math.PI * 2);
                          const x = 112 + Math.cos(angle) * planet.orbitRadius;
                          const y = 112 + Math.sin(angle) * planet.orbitRadius;

                          const isEarth = planet.name === 'Earth';

                          return (
                            <React.Fragment key={planet.name}>
                              {/* Orbit line */}
                              <div 
                                className="absolute rounded-full border border-white/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                style={{ 
                                  width: `${planet.orbitRadius * 2}px`, 
                                  height: `${planet.orbitRadius * 2}px` 
                                }} 
                              />

                              {/* Interactive Planet Marble */}
                              <div
                                className="absolute pointer-events-auto cursor-pointer"
                                style={{
                                  left: `${x}px`,
                                  top: `${y}px`,
                                  transform: 'translate(-50%, -50%)',
                                  zIndex: 30
                                }}
                                onMouseEnter={() => handleHoverPlanet(planet.name)}
                                onMouseLeave={() => handleHoverPlanet(null)}
                              >
                                <div
                                  className="relative rounded-full aspect-square flex items-center justify-center transition-transform hover:scale-150 duration-200 shadow-md"
                                  style={{
                                    width: `${planet.radius}px`,
                                    height: `${planet.radius}px`,
                                    backgroundColor: planet.color,
                                    border: isEarth ? '1px solid #3B82F6' : '1px solid #78716c',
                                  }}
                                >
                                  {isEarth && (
                                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-neutral-200 animate-spin-slow shadow" />
                                  )}
                                  {planet.name === 'Saturn' && (
                                    <div className="absolute w-[220%] h-[40%] rounded-full border border-amber-200/50 bg-amber-400/5 -rotate-[22deg] pointer-events-none shadow-[0_0_4px_rgba(233,196,106,0.3)]" />
                                  )}
                                </div>


                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>

                  {/* Unzoomed indicator helper rings & pulse scanner */}
                  {!isZoomed && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-1 pointer-events-none text-center">
                      <div className="w-16 h-16 rounded-full border border-amber-400/50 animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-amber-200 bg-neutral-950/90 border border-white/20 px-2.5 py-1 rounded shadow-lg whitespace-nowrap mt-24 block font-bold font-mono">
                        SOL SYSTEM CORE
                      </span>
                      <span className="text-[7px] text-neutral-400 font-mono tracking-widest mt-1 block uppercase">
                        [Click central core to zoom 200%]
                      </span>
                    </div>
                  )}
                </div>

                {/* ACTIVE ZOOM CONTROLS OVERLAY (Click to Zoom Out) */}
                {isZoomed && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-24 bg-neutral-900 border border-white/20 p-2 rounded-xl shadow-2xl flex items-center gap-3 z-50 whitespace-nowrap text-white"
                  >
                    <button 
                      onClick={() => triggerZoom(false)}
                      className="p-1 px-3 text-[10px] font-mono text-red-400 border border-red-500/30 hover:border-red-400 hover:bg-red-950/40 rounded-lg cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <ZoomOut className="w-3 h-3" />
                      MINIMIZE VIEW (200% Active)
                    </button>

                    <div className="w-[1px] h-4 bg-white/10" />
                    
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wide">
                      Hover planets to read telemetry and age variables
                    </span>
                  </motion.div>
                )}
              </div>

              {/* DETAILED PLANET TELEMETRY OVERLAY VIEW */}
              <AnimatePresence>
                {isZoomed && hoveredPlanet && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-10 pointer-events-none bg-neutral-950/95 border border-white/20 p-4 rounded-xl shadow-2xl z-50 w-72 flex flex-col gap-2 transition-all text-white"
                    id="planet-hover-telemetry-card"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="text-xs font-mono font-bold tracking-widest text-white flex items-center gap-1.5 uppercase">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredPlanet === 'Sun' ? '#fbbf24' : solarPlanets.find(p => p.name === hoveredPlanet)?.color }} />
                        Sol.{hoveredPlanet}
                      </span>
                      <span className="text-[8px] font-mono px-1 bg-white text-black font-bold rounded">
                        TELEMETRY DECODED
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-teal-300 leading-tight">
                      {hoveredPlanet === 'Sun' ? (
                        <span>Age of Sun: <strong className="text-amber-200 underline decoration-amber-300 decoration-2 font-bold font-mono">4.603 billion years</strong></span>
                      ) : (
                        (() => {
                          const hoveredPlanetObj = solarPlanets.find(p => p.name === hoveredPlanet);
                          return (
                            <span>Age of {hoveredPlanet}: <strong className="text-amber-200 underline decoration-amber-300 decoration-2 font-bold font-mono">{hoveredPlanetObj?.age || '4.5 billion years'}</strong></span>
                          );
                        })()
                      )}
                    </p>

                    <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
                      {hoveredPlanet === 'Sun' ? 'The parent star of the Sol System, a yellow dwarf containing 99.86% of all system mass.' : solarPlanets.find(p => p.name === hoveredPlanet)?.desc}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t border-white/10 text-[8px] font-mono text-neutral-400 uppercase">
                      <div>
                        <span>Orbit Radius:</span>
                        <span className="block font-semibold text-white mt-0.5">
                          {hoveredPlanet === 'Sun' ? '0' : solarPlanets.find(p => p.name === hoveredPlanet)?.orbitRadius}M KM
                        </span>
                      </div>
                      <div>
                        <span>Velocity Vector:</span>
                        <span className="block font-semibold text-white mt-0.5">
                          {hoveredPlanet === 'Sun' ? '220 KM/S (Galactic)' : `${((solarPlanets.find(p => p.name === hoveredPlanet)?.speed ?? 0) * 29.78).toFixed(1)} KM/S`}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            
            /* CASE B: HYPER-REAL DEEP SPACE MAP WITH MULTIPLE GLOWING NEBULAS & DISTANT GALAXIES */
            <div className="relative w-full h-full flex items-center justify-center overflow-visible">

              {/* Dynamic Spiral arms of other galaxies pulsing and swirling */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 120, ease: 'linear' }}
                className="absolute w-[500px] h-[500px] pointer-events-none opacity-45 flex items-center justify-center"
              >
                <svg className="w-full h-full" viewBox="0 0 400 400">
                  <g transform="translate(200, 200)">
                    {[...Array(60)].map((_, i) => {
                      const angle = (i / 60) * Math.PI * 6;
                      const r = 20 + (i / 60) * 140;
                      const tx = r * Math.cos(angle);
                      const ty = r * Math.sin(angle) * 0.7;
                      return (
                        <circle 
                          key={i} 
                          cx={tx} 
                          cy={ty} 
                          r={1 + Math.random() * 2} 
                          fill={i % 2 === 0 ? '#ec4899' : '#38bdf8'} 
                          className="animate-pulse"
                        />
                      );
                    })}
                  </g>
                </svg>
              </motion.div>

              {/* DYNAMIC SCATTERED FLOATING GALAXIES ARCHITECTURE */}
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto">
                
                {/* Andromeda Giant Hub */}
                <motion.div 
                  whileHover={{ scale: 1.08 }}
                  onClick={() => handleGalaxySelect(1)}
                  className="absolute top-[25%] left-[20%] flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Perpetual counter-rotating lock-on target ring if selected */}
                    {selectedId === 1 && (
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                        className="absolute -inset-2.5 rounded-full border border-dashed border-pink-400/70 z-10 pointer-events-none"
                      />
                    )}
                    {/* Slow perpetual 360-degree rotation when selected */}
                    <motion.div 
                      animate={selectedId === 1 ? { rotate: 360 } : { rotate: 0 }}
                      transition={selectedId === 1 ? { repeat: Infinity, duration: 32, ease: 'linear' } : { duration: 0.5 }}
                      className="w-12 h-12 rounded-full bg-radial-gradient from-pink-500 via-pink-600/30 to-transparent flex items-center justify-center filter blur-sm group-hover:blur-0 transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-mono text-pink-300 tracking-wider uppercase mt-1 font-bold">Andromeda M31</span>
                  <span className="text-[8px] font-mono text-neutral-400">Spiral • 2.537M ly</span>
                </motion.div>

                {/* Triangulum Star Burst */}
                <motion.div 
                  whileHover={{ scale: 1.08 }}
                  onClick={() => handleGalaxySelect(2)}
                  className="absolute bottom-[35%] left-[15%] flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Perpetual counter-rotating lock-on target ring if selected */}
                    {selectedId === 2 && (
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                        className="absolute -inset-2.5 rounded-full border border-dashed border-emerald-400/70 z-10 pointer-events-none"
                      />
                    )}
                    {/* Slow perpetual 360-degree rotation when selected */}
                    <motion.div 
                      animate={selectedId === 2 ? { rotate: 360 } : { rotate: 0 }}
                      transition={selectedId === 2 ? { repeat: Infinity, duration: 28, ease: 'linear' } : { duration: 0.5 }}
                      className="w-10 h-10 rounded-full bg-radial-gradient from-emerald-400 via-emerald-600/20 to-transparent flex items-center justify-center filter blur-sm group-hover:blur-0 transition-all shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                    >
                      <div className="w-2 h-2 rounded-full bg-neutral-100" />
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 tracking-wider uppercase mt-1 font-bold">Triangulum M33</span>
                  <span className="text-[8px] font-mono text-neutral-400">Spiral • 2.73M ly</span>
                </motion.div>

                {/* Sombrero Hub */}
                <motion.div 
                  whileHover={{ scale: 1.08 }}
                  onClick={() => handleGalaxySelect(3)}
                  className="absolute top-[18%] right-[22%] flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Perpetual counter-rotating lock-on target ring if selected */}
                    {selectedId === 3 && (
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                        className="absolute -inset-2.5 rounded-full border border-dashed border-amber-400/70 z-10 pointer-events-none"
                      />
                    )}
                    {/* Slow perpetual 360-degree rotation when selected */}
                    <motion.div 
                      animate={selectedId === 3 ? { rotate: 360 } : { rotate: 0 }}
                      transition={selectedId === 3 ? { repeat: Infinity, duration: 25, ease: 'linear' } : { duration: 0.5 }}
                      className="w-14 h-14 rounded-full bg-radial-gradient from-amber-400 via-amber-600/10 to-transparent flex items-center justify-center filter blur-sm group-hover:blur-0 transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)]"
                    >
                      <div className="w-3 h-1.5 rounded-full bg-white transform rotate-12" />
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-200 tracking-wider uppercase mt-1 font-bold">Sombrero M104</span>
                  <span className="text-[8px] font-mono text-neutral-400">Unbarred Spiral • 28M ly</span>
                </motion.div>

                {/* Centaurus Hub */}
                <motion.div 
                  whileHover={{ scale: 1.08 }}
                  onClick={() => handleGalaxySelect(4)}
                  className="absolute bottom-[20%] right-[18%] flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Perpetual counter-rotating lock-on target ring if selected */}
                    {selectedId === 4 && (
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                        className="absolute -inset-2.5 rounded-full border border-dashed border-violet-400/70 z-10 pointer-events-none"
                      />
                    )}
                    {/* Slow perpetual 360-degree rotation when selected */}
                    <motion.div 
                      animate={selectedId === 4 ? { rotate: 360 } : { rotate: 0 }}
                      transition={selectedId === 4 ? { repeat: Infinity, duration: 22, ease: 'linear' } : { duration: 0.5 }}
                      className="w-11 h-11 rounded-full bg-radial-gradient from-violet-500 via-violet-700/20 to-transparent flex items-center justify-center filter blur-sm group-hover:blur-0 transition-all shadow-[0_0_18px_rgba(139,92,246,0.5)]"
                    >
                      <div className="w-2 h-2 rounded-full bg-violet-100" />
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-mono text-violet-300 tracking-wider uppercase mt-1 font-bold">Centaurus A</span>
                  <span className="text-[8px] font-mono text-neutral-400">Lenticular • 11M ly</span>
                </motion.div>

                {/* CENTERED MILKY WAY GLOW PREVIEW RING */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleGalaxySelect(0)}
                  className="absolute top-[42%] left-[45%] flex flex-col items-center cursor-pointer group z-20"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Perpetual counter-rotating lock-on target ring if selected */}
                    {selectedId === 0 && (
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                        className="absolute -inset-3.5 rounded-full border-2 border-dashed border-amber-400/60 z-10 pointer-events-none"
                      />
                    )}
                    {/* Slow perpetual 360-degree rotation when selected */}
                    <motion.div 
                      animate={selectedId === 0 ? { rotate: 360 } : { rotate: 0 }}
                      transition={selectedId === 0 ? { repeat: Infinity, duration: 25, ease: 'linear' } : { duration: 0.5 }}
                      className="relative w-20 h-20 rounded-full border border-amber-400/20 bg-radial-gradient from-amber-500/20 via-neutral-900/40 to-transparent flex items-center justify-center animate-pulse"
                    >
                      <div className="w-8 h-8 rounded-full border border-dashed border-amber-400/30 flex items-center justify-center animate-spin-slow">
                        <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-[11px] font-mono text-amber-300 font-bold tracking-widest uppercase mt-2 group-hover:scale-105 transition-transform flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                    MILKYWAY GALAXY
                  </span>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest mt-0.5">
                    [Click to Blur & Enter Sol System]
                  </span>
                </motion.div>

              </div>

              {/* Cosmic dust overlay information labels */}
              <div className="absolute bottom-8 left-8 p-3 rounded-lg bg-black/60 border border-white/5 backdrop-blur-md max-w-sm font-mono text-neutral-300 pointer-events-none">
                <span className="text-[8px] uppercase tracking-widest text-teal-400 block font-semibold">Active Nebula Gas:</span>
                <span className="text-[10px] text-white mt-1 block">Carina & Orion Molecular Clusters detected. Swirling star formation density is extremely high across standard pathways.</span>
              </div>

              <div className="absolute top-8 right-8 p-3 rounded-lg bg-black/60 border border-white/5 backdrop-blur-md font-mono text-right pointer-events-none">
                <span className="text-[8px] uppercase tracking-widest text-pink-400 block font-semibold">COSMIC ATLAS STATUS</span>
                <span className="text-[10px] text-white mt-1 block">100 catalogued galaxies rendering in hyper-real perspective</span>
              </div>

            </div>
          )}
        </div>

        {/* SCALE BAR HUD */}
        <div 
          className="absolute bottom-24 right-8 z-30 flex flex-col items-end pointer-events-none font-mono text-white/80 bg-neutral-950/75 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md shadow-2xl space-y-1" 
          id="galaxy-reference-scale"
        >
          <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest text-teal-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            GRID SCALE
          </div>
          
          <div className="flex flex-col items-center justify-center py-1">
            {/* Horizontal line with end ticks */}
            <motion.div 
              animate={{ 
                width: selectedId === 0 
                  ? (isZoomed ? 60 : 110) 
                  : (selectedId === -1 ? 140 : 95) 
              }}
              transition={{ type: 'spring', stiffness: 90, damping: 14 }}
              className="flex items-center h-2"
            >
              <div className="w-[1px] h-2 bg-teal-400" />
              <div className="flex-1 h-[1px] bg-teal-400/80" />
              <div className="w-[1px] h-2 bg-teal-400" />
            </motion.div>
            
            {/* Dynamic Label */}
            <motion.span 
              key={`${selectedId}-${isZoomed}`}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[9px] font-bold text-white mt-1 tracking-wide"
            >
              {selectedId === 0 
                ? (isZoomed ? '20 AU' : '100 AU') 
                : (selectedId === 1 
                    ? '2.5M LY' 
                    : (selectedId === 2 
                        ? '2.7M LY' 
                        : (selectedId === 3 
                            ? '28M LY' 
                            : (selectedId === 4 
                                ? '11M LY' 
                                : '35M LY'))))}
            </motion.span>
          </div>
          
          <div className="text-[7px] text-neutral-400 uppercase tracking-widest leading-none">
            {selectedId === 0 
              ? (isZoomed ? 'SOLAR SYSTEM • ZOOM 2.0X' : 'SOL CORE LOCK • ZOOM 1.0X') 
              : (selectedId === 1 
                  ? 'ANDROMEDA SECTOR • SURVEY 1.0X' 
                  : (selectedId === 2 
                      ? 'TRIANGULUM CO-SECTOR • SURVEY 1.0X' 
                      : (selectedId === 3 
                          ? 'SOMBRERO SYSTEM • SURVEY 1.0X' 
                          : (selectedId === 4 
                              ? 'CENTAURUS FIELD • SURVEY 1.0X' 
                              : 'COSMIC SECTOR ARCHIVE • ATLAS GLOBAL'))))}
          </div>
        </div>

        {/* BOTTOM ANALYSIS BAR (Scientific details & description atlas info) */}
        <div className="w-full bg-neutral-950/80 border border-white/10 rounded-xl p-4 z-30 select-none flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-white backdrop-blur">
          <div className="flex-1 max-w-xl">
            <span className="text-[8px] uppercase tracking-widest font-mono text-teal-400 block mb-1">
              Cosmological Abstract Archive
            </span>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              {selectedGalaxy ? (
                <span><strong>{selectedGalaxy.name} Overview:</strong> {selectedGalaxy.description}</span>
              ) : (
                <span>Please select any galaxy classified in the left list or click direct celestial coordinate tags on the map. Select <strong>Milkyway Galaxy</strong> to unlock direct Sol System live telemetry and planet scales.</span>
              )}
            </p>
          </div>

          {selectedGalaxy && (
            <div className="grid grid-cols-3 gap-6 sm:gap-10 shrink-0 border-l border-white/15 pl-6 h-10 items-center font-mono">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-[0.15em] text-neutral-400">Diameter</span>
                <span className="text-xs font-semibold text-white mt-0.5">
                  {selectedGalaxy.diameter}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-[0.15em] text-neutral-400">Density</span>
                <span className="text-xs font-semibold text-white mt-0.5 animate-pulse">
                  {selectedGalaxy.starsCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-[0.15em] text-neutral-400">Constellation</span>
                <span className="text-xs font-semibold text-white mt-0.5 truncate max-w-[90px]">
                  {selectedGalaxy.constellation}
                </span>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
