/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, Orbit, RefreshCw, Volume2, VolumeX, Disc, Search, 
  ArrowRight, X, Globe, Compass, Activity, Info, Milestone
} from 'lucide-react';
import { SimMode } from './types';
import CosmicCanvas from './components/CosmicCanvas';
import { CosmicTelemetryStream } from './components/CosmicTelemetryStream';
import { audioManager } from './utils/audio';
import { generateCatalogGalaxies } from './data/galaxies';
import GalaxyMap from './components/GalaxyMap';
import HumanExploration from './components/HumanExploration';
import { LineChart, Line } from 'recharts';

const SPARKLINE_DATA = [
  { value: 10 },
  { value: 14 },
  { value: 12 },
  { value: 18 },
  { value: 15 },
  { value: 22 },
  { value: 19 },
  { value: 28 },
  { value: 24 },
  { value: 32 },
  { value: 29 },
  { value: 38 },
];

export default function App() {
  const [mode, setMode] = useState<SimMode>('passive');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMuted, setIsMuted] = useState(() => audioManager.isMuted);

  // Simulation time management
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Dynamic state-based sparkline data for cosmic entropy visualization
  const [sparklineData, setSparklineData] = useState<{ value: number }[]>(SPARKLINE_DATA);

  useEffect(() => {
    const interval = setInterval(() => {
      setSparklineData((prev) => {
        const nextData = [...prev.slice(1)];
        let newValue = 15;
        
        if (mode === 'blackhole') {
          // Intense wild fluctuations under gravitational breakdown
          newValue = Math.floor(Math.random() * 55) + 5;
        } else if (mode === 'whitehole') {
          // Extremely sharp volatile peaks during explosive genesis
          newValue = Math.round(35 + Math.sin(Date.now() / 200) * 20 + (Math.random() - 0.5) * 35);
          newValue = Math.max(4, Math.min(75, newValue));
        } else {
          // Gentle tranquil cosmic fluctuation
          const lastValue = prev[prev.length - 1]?.value ?? 15;
          const delta = (Math.random() - 0.5) * 4;
          newValue = Math.max(8, Math.min(24, lastValue + delta));
        }
        
        return [...nextData, { value: Math.round(newValue) }];
      });
    }, 400);

    return () => clearInterval(interval);
  }, [mode]);

  // Galaxy catalog & interaction state
  const catalogGalaxies = useMemo(() => generateCatalogGalaxies(), []);
  const [activeGalaxyId, setActiveGalaxyId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected galaxy model matching
  const selectedGalaxy = useMemo(() => {
    if (activeGalaxyId === null) return null;
    return catalogGalaxies.find(g => g.id === activeGalaxyId) || null;
  }, [activeGalaxyId, catalogGalaxies]);

  // Handle active countdown for Whitehole Mode
  const whiteholeCountdown = useMemo(() => {
    return Math.max(0, 10 - secondsElapsed);
  }, [secondsElapsed]);

  // Trigger cosmic singularity event
  const triggerSingularity = (selectedMode: SimMode) => {
    if (mode !== 'passive') return;

    // Automatic gentle initial volume activation on user intent
    setIsMuted(false);
    audioManager.setVolume(0.5);

    setIsTransitioning(true);
    setMode(selectedMode);
    setSecondsElapsed(0);

    // Default select first galaxy upon Blackhole entrance for immediate feedback
    if (selectedMode === 'blackhole') {
      setActiveGalaxyId(0);
    } else {
      setActiveGalaxyId(null);
    }

    // Instantly play specialized high energy acoustic synthesis loops
    if (selectedMode === 'blackhole') {
      audioManager.playBlackholeSingularity();
    } else if (selectedMode === 'whitehole') {
      audioManager.playWhiteholeSingularity();
    }
  };

  // Exit simulation and safely transition state back to ambient drone
  const handleSimulationEnd = () => {
    setMode('passive');
    setIsTransitioning(false);
    setSecondsElapsed(0);
    setActiveGalaxyId(null);
    setSearchQuery('');

    // Safely cease and fade out active simulation sounds
    audioManager.stopActiveFX(0.8);
    // Re-engage passive warm space wind with gorgeous melody pad
    if (!isMuted) {
      audioManager.startPassiveDrone();
    }
  };

  // Synchronize audio output state when mute is actively clicked
  useEffect(() => {
    audioManager.setMuted(isMuted);
    if (isMuted) {
      audioManager.stopPassiveDrone(0.4);
      audioManager.stopActiveFX(0.4);
    } else {
      if (mode === 'passive') {
        audioManager.startPassiveDrone();
      } else if (mode === 'blackhole') {
        audioManager.playBlackholeSingularity();
      } else if (mode === 'whitehole') {
        audioManager.playWhiteholeSingularity();
      }
    }
  }, [isMuted, mode]);
  
  // Interactive global trigger to kick off passive background atmosphere upon first user interaction
  useEffect(() => {
    const startIntroAmbience = () => {
      if (!isMuted && mode === 'passive') {
        audioManager.startPassiveDrone();
      }
    };

    // Listen to most common interactive client events
    window.addEventListener('click', startIntroAmbience, { once: true });
    window.addEventListener('keydown', startIntroAmbience, { once: true });
    window.addEventListener('mousemove', startIntroAmbience, { once: true });
    window.addEventListener('touchstart', startIntroAmbience, { once: true });

    return () => {
      window.removeEventListener('click', startIntroAmbience);
      window.removeEventListener('keydown', startIntroAmbience);
      window.removeEventListener('mousemove', startIntroAmbience);
      window.removeEventListener('touchstart', startIntroAmbience);
    };
  }, [isMuted, mode]);

  // Dynamically calculate time-to-singularity countdown for any given galaxy
  const getGalaxyTimeRemaining = (galaxyInitialDistance: number) => {
    // Closer galaxies have shorter lifespans under blackhole pull
    const singularityLimit = galaxyInitialDistance * 0.15;
    const remaining = Math.max(0, singularityLimit - secondsElapsed);
    return remaining;
  };

  // Format a seconds value into beautiful scientific ticking display MM:SS.CC
  const formatTimeRemaining = (totalSecs: number) => {
    if (totalSecs <= 0) return '00m:00s.00';
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    const ms = Math.floor((totalSecs % 1) * 100);
    return `${mins.toString().padStart(2, '0')}m:${secs.toString().padStart(2, '0')}s.${ms.toString().padStart(2, '0')}`;
  };

  // Filter Catalog galaxies in real-time
  const filteredCatalog = useMemo(() => {
    return catalogGalaxies.filter(g => 
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [catalogGalaxies, searchQuery]);

  const isWhiteView = mode === 'whitehole';

  return (
    <div className={`relative w-screen h-screen transition-colors duration-1000 ${isWhiteView ? 'bg-white text-black' : 'bg-[#020205] text-white'} flex flex-col items-center justify-between overflow-hidden font-sans`}>
      
      {/* Background ambient gradients layer */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isWhiteView ? 'opacity-0' : 'opacity-45'}`}>
        <div className="absolute rounded-full filter blur-[120px] opacity-10 bg-indigo-500 w-[500px] h-[500px] -top-[10%] -left-[10%]" />
        <div className="absolute rounded-full filter blur-[140px] opacity-10 bg-purple-600 w-[600px] h-[600px] -bottom-[10%] -right-[15%]" />
      </div>

      {/* Dynamic Cosmic Background Canvas Simulation */}
      <CosmicCanvas 
        mode={mode} 
        activeGalaxyId={activeGalaxyId} 
        onSecondsElapsed={setSecondsElapsed}
        whiteholeCountdown={whiteholeCountdown}
      />

      {/* Atmospheric vignette shadow ring to enhance depth of field and core focal contrast */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isWhiteView ? 'bg-[radial-gradient(circle_at_center,transparent_50%,rgba(255,255,255,1)_100%)] opacity-50' : 'bg-[radial-gradient(circle_at_center,transparent_50%,rgba(2,2,5,0.98)_100%)] opacity-100'} pointer-events-none z-10`} />

      {/* Elegant minimalist audio toggler overlay */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <button
          id="audio-mute-toggle-btn"
          onMouseEnter={() => audioManager.playHover()}
          onClick={() => {
            audioManager.playClick();
            setIsMuted(!isMuted);
          }}
          className={`p-3 rounded-full transition-all duration-300 backdrop-blur-md cursor-pointer flex items-center justify-center group ${
            isWhiteView 
              ? 'bg-black/[0.03] hover:bg-black/10 border border-black/10 text-black/60 hover:text-black' 
              : 'bg-white/[0.03] hover:bg-white/10 border border-white/10 hover:border-white/30 text-white/60 hover:text-white'
          }`}
          title={isMuted ? "Unmute Space Audio" : "Mute Space Audio"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 group-hover:scale-105 transition-transform" />
          ) : (
            <Volume2 className={`w-4 h-4 group-hover:scale-105 transition-transform animate-pulse ${isWhiteView ? 'text-black/80' : 'text-indigo-300'}`} />
          )}
        </button>
      </div>

      {/* PRIMARY CONTAINER BLOCK */}
      <div className="relative z-20 flex flex-col items-center justify-between h-full w-full py-10 px-8">
        
        {/* HEADER */}
        <header className="text-center w-full z-20 select-none">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-[10px] uppercase tracking-[0.6em] mb-2 font-mono transition-colors duration-500 ${isWhiteView ? 'text-black/40' : 'text-white/40'}`}
            id="app-version-subtitle"
          >
            Cosmic Event Horizon v2.5
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, letterSpacing: "-0.05em" }}
            animate={{ opacity: 1, letterSpacing: "-0.01em" }}
            transition={{ duration: 1, delay: 0.1 }}
            className={`text-4xl md:text-5xl font-extralight tracking-tighter transition-colors duration-500 ${isWhiteView ? 'text-black' : 'text-white'}`}
            id="app-main-title"
          >
            {mode === 'passive' ? 'SINGULARITY' : mode === 'blackhole' ? 'GRAVITATIONAL COLLAPSE' : mode === 'human_exploration' ? 'HUMAN EXCURSION' : 'BIG BANG EXPULSOR'}
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "36px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`h-[1px] mx-auto mt-6 transition-colors duration-500 ${isWhiteView ? 'bg-black/20' : 'bg-white/20'}`}
            id="header-divider"
          />
        </header>

        {/* INTERACTIVE HUB WORKSPACE */}
        <div className="w-full h-[58vh] flex items-center justify-center my-4 overflow-visible relative">
          <AnimatePresence mode="wait">
            
            {/* 1. PASSIVE INITIAL SCREEN: CHOOSE YOUR PORTAL */}
            {mode === 'passive' && (
              <motion.main 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row md:flex-wrap xl:flex-nowrap gap-5 lg:gap-8 items-center justify-center w-full max-w-6xl"
                id="minimal-portals-wrapper"
              >
                {/* PORTAL A: BLACKHOLE */}
                <div className="flex flex-col items-center group">
                  <button
                    id="trigger-blackhole-btn"
                    onMouseEnter={() => audioManager.playHover()}
                    onClick={() => {
                      audioManager.playNavigate();
                      triggerSingularity('blackhole');
                    }}
                    className="w-48 h-48 md:w-52 md:h-52 lg:w-56 lg:h-56 rounded-full flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-white/[0.02] hover:bg-black/90 border border-white/10 hover:border-orange-500/30 hover:shadow-[0_0_50px_rgba(249,115,22,0.15)] hover:scale-101 transition-all duration-500 ease-out backdrop-blur-md mb-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-black border border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)] mb-3 transition-all duration-500 group-hover:scale-90 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-radial-gradient from-transparent to-orange-500/20 animate-pulse" />
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/90 group-hover:text-amber-300 transition-colors">
                      BLACKHOLE PULSAR
                    </span>
                  </button>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 group-hover:text-white/70 group-hover:tracking-[0.3em] transition-all duration-300">
                    PHASE: ABSORB CLUSTERS
                  </p>
                </div>

                {/* INTER-PORTAL DIVIDER */}
                <div className="hidden md:block h-24 w-[1px] bg-white/10" />

                {/* PORTAL B: WHITEHOLE */}
                <div className="flex flex-col items-center group">
                  <button
                    id="trigger-whitehole-btn"
                    onMouseEnter={() => audioManager.playHover()}
                    onClick={() => {
                      audioManager.playNavigate();
                      triggerSingularity('whitehole');
                    }}
                    className="w-48 h-48 md:w-52 md:h-52 lg:w-56 lg:h-56 rounded-full flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-white/[0.02] hover:bg-white hover:text-black border border-white/10 hover:border-white hover:shadow-[0_0_50px_rgba(168,85,247,0.35)] hover:scale-101 transition-all duration-500 ease-out backdrop-blur-md mb-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-white border border-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-3 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,1)] flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white ring-8 ring-purple-100/10" />
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/90 group-hover:text-black transition-colors">
                      WHITEHOLE GENESIS
                    </span>
                  </button>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 group-hover:text-white/70 group-hover:tracking-[0.3em] transition-all duration-300">
                    PHASE: COSMIC BIG BANG
                  </p>
                </div>

                {/* INTER-PORTAL DIVIDER */}
                <div className="hidden md:block h-24 w-[1px] bg-white/10" />

                {/* PORTAL C: GALAXY ATLAS MAP */}
                <div className="flex flex-col items-center group">
                  <button
                    id="trigger-galaxymap-btn"
                    onMouseEnter={() => audioManager.playHover()}
                    onClick={() => {
                      audioManager.playNavigate();
                      setMode('galaxymap');
                    }}
                    className="w-48 h-48 md:w-52 md:h-52 lg:w-56 lg:h-56 rounded-full flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-white/[0.02] hover:bg-white border border-white/10 hover:border-teal-500/40 hover:shadow-[0_0_50px_rgba(20,184,166,0.25)] hover:scale-101 transition-all duration-500 ease-out backdrop-blur-md mb-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.05)] mb-3 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(20,184,166,0.45)] flex items-center justify-center">
                      <Compass className="w-6 h-6 text-teal-400 group-hover:text-teal-600 transition-colors" />
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/90 group-hover:text-black transition-colors">
                      GALAXY MAPS
                    </span>
                  </button>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 group-hover:text-white/70 group-hover:tracking-[0.3em] transition-all duration-300">
                    PHASE: ATLAS DEEP VIEW
                  </p>
                </div>

                {/* INTER-PORTAL DIVIDER */}
                <div className="hidden md:block h-24 w-[1px] bg-white/10" />

                {/* PORTAL D: HUMAN SPACE EXPLORATION TIMELINE */}
                <div className="flex flex-col items-center group">
                  <button
                    id="trigger-humanexploration-btn"
                    onMouseEnter={() => audioManager.playHover()}
                    onClick={() => {
                      audioManager.playNavigate();
                      setMode('human_exploration');
                    }}
                    className="w-48 h-48 md:w-52 md:h-52 lg:w-56 lg:h-56 rounded-full flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-white/[0.02] hover:bg-white border border-white/10 hover:border-emerald-500/40 hover:shadow-[0_0_50px_rgba(16,185,129,0.25)] hover:scale-101 transition-all duration-500 ease-out backdrop-blur-md mb-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.05)] mb-3 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] flex items-center justify-center">
                      <Milestone className="w-6 h-6 text-emerald-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/90 group-hover:text-black transition-colors">
                      HUMAN EXPLORATION
                    </span>
                  </button>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/30 group-hover:text-white/70 group-hover:tracking-[0.3em] transition-all duration-300">
                    PHASE: COGNITIVE EXODUS
                  </p>
                </div>
              </motion.main>
            )}

            {/* 2. BLACKHOLE ACTIVE STATE: SIDEBAR MENU + TELEMETRY */}
            {mode === 'blackhole' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col md:flex-row gap-6 relative"
                id="blackhole-interactive-hud"
              >
                {/* LEFT SIDE GALAXY SELECTOR MENU: 110 GALAXIES */}
                <div className="w-full md:w-80 lg:w-96 bg-black/60 border border-white/10 rounded-xl flex flex-col overflow-hidden backdrop-blur-lg backdrop-saturate-150 z-30">
                  
                  {/* SEARCH FIELD */}
                  <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]" onMouseEnter={() => audioManager.playHover()}>
                    <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <input 
                      id="galaxy-search-input"
                      type="text" 
                      placeholder="SEARCH 110 GALAXIES CATALOG..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => audioManager.playHover()}
                      className="w-full bg-transparent border-0 text-white placeholder-white/35 text-xs font-mono tracking-wider focus:ring-0 focus:outline-none"
                    />
                    {searchQuery && (
                      <button 
                        onMouseEnter={() => audioManager.playHover()}
                        onClick={() => {
                          audioManager.playClick();
                          setSearchQuery('');
                        }} 
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <X className="w-3 h-3 text-white/50" />
                      </button>
                    )}
                  </div>

                  {/* SCROLLABLE CATALOG LIST */}
                  <div className="flex-1 overflow-y-auto space-y-1 p-3 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="text-[9px] uppercase tracking-[0.25em] text-amber-400/80 mb-2 px-2 font-mono flex items-center justify-between">
                      <span>CRITICAL GRAVITY FORECAST</span>
                      <span>{filteredCatalog.length} MATCHES</span>
                    </div>

                    {filteredCatalog.map((galaxy) => {
                      const idDistance = getGalaxyTimeRemaining(galaxy.initialDistance);
                      const isCollapsed = idDistance <= 0;
                      const isGSelected = activeGalaxyId === galaxy.id;

                      return (
                        <button
                          key={galaxy.id}
                          id={`galaxy-catalog-item-${galaxy.id}`}
                          onMouseEnter={() => audioManager.playHover()}
                          onClick={() => {
                            audioManager.playClick();
                            setActiveGalaxyId(galaxy.id);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all duration-300 flex items-center justify-between cursor-pointer group ${
                            isGSelected 
                              ? 'bg-amber-500/[0.08] border-amber-500/50 text-white shadow-[inset_0_0_12px_rgba(245,158,11,0.05)]' 
                              : 'bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-mono tracking-wide flex items-center gap-1.5 font-medium">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isCollapsed ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
                              }`} />
                              {galaxy.name}
                            </span>
                            <span className="text-[9px] text-white/30 font-mono">
                              DIST: {galaxy.initialDistance.toFixed(0)} BN LY
                            </span>
                          </div>

                          <div className="text-right flex flex-col gap-0.5">
                            <span className={`text-[10px] font-mono tracking-wider ${
                              isCollapsed ? 'text-red-500 font-semibold' : 'text-amber-500 group-hover:scale-102 transition-transform'
                            }`}>
                              {isCollapsed ? 'COLLAPSED' : formatTimeRemaining(idDistance)}
                            </span>
                            <span className="text-[8px] text-white/30 font-mono tracking-widest uppercase">
                              {isCollapsed ? 'ABSORBED' : 'ACCELERATING'}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {filteredCatalog.length === 0 && (
                      <div className="text-center py-12 text-white/30 text-xs font-mono">
                        NO GALAXIES MATCHING FILTER
                      </div>
                    )}
                  </div>
                </div>

                {/* CENTER/RIGHT GALAXY DETAIL DISPLAY HUD CARD */}
                <div className="flex-1 flex flex-col justify-between p-4 relative z-20">
                  <AnimatePresence mode="wait">
                    {selectedGalaxy ? (
                      <motion.div
                        key={selectedGalaxy.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-md self-start md:self-end bg-black/60 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-2xl flex flex-col gap-6"
                        id="galaxy-telemetry-hud-card"
                      >
                        {/* Header metadata layout */}
                        <div className="border-b border-white/10 pb-4 flex items-start justify-between">
                          <div>
                            <span className="text-[9px] uppercase tracking-[0.3em] text-amber-500 font-mono block mb-1">
                              COSMOLOGICAL TELEMETRY UNIT
                            </span>
                            <h2 className="text-xl font-light tracking-wide text-white">
                              {selectedGalaxy.name}
                            </h2>
                          </div>
                          <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono uppercase tracking-widest">
                            INDEX: #{selectedGalaxy.id + 1}
                          </span>
                        </div>

                        {/* Singularity Live-Ticker Countdown */}
                        <div className="p-4 rounded-lg bg-orange-500/[0.04] border border-orange-500/20 text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 bg-orange-500/20 text-orange-400 font-mono text-[8px] px-1.5 py-0.5 rounded-br border-b border-r border-orange-500/10">
                            LIVE TIME DEVIATION
                          </div>
                          
                          <span className="text-[10px] text-white/40 font-mono tracking-[0.25em] uppercase block mb-1.5">
                            Time Remaining For Singularity
                          </span>
                          
                          <div id="countdown-timer-live-tick" className="text-2xl md:text-3xl font-mono tracking-widest font-light text-amber-400 select-all">
                            {getGalaxyTimeRemaining(selectedGalaxy.initialDistance) <= 0 
                              ? 'SINGULARITY INTEGRATED' 
                              : formatTimeRemaining(getGalaxyTimeRemaining(selectedGalaxy.initialDistance))}
                          </div>

                          <div className="text-[8px] uppercase tracking-widest text-white/30 font-mono mt-1.5">
                            {getGalaxyTimeRemaining(selectedGalaxy.initialDistance) <= 0 
                              ? 'TOTAL SPAGHETTIFICATION DEVOURED' 
                              : 'GRAVITATIONAL TIDAL FORCES TEARING LOOPS'}
                          </div>
                        </div>

                        {/* Statistical core properties */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest text-white/40 font-mono flex items-center gap-1.5">
                              <Globe className="w-3 h-3 text-indigo-400" />
                              POLAR POPULATION
                            </span>
                            <span className="font-mono text-[11px] font-semibold mt-1.5 text-white/80">
                              {selectedGalaxy.population}
                            </span>
                          </div>

                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest text-white/40 font-mono flex items-center gap-1.5">
                              <Compass className="w-3 h-3 text-cyan-400" />
                              STAR SYSTEM DEPTH
                            </span>
                            <span className="font-mono text-[11px] font-semibold mt-1.5 text-white/80">
                              {selectedGalaxy.starsCount} Stars
                            </span>
                          </div>

                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest text-white/40 font-mono flex items-center gap-1.5">
                              <Activity className="w-3 h-3 text-pink-400" />
                              PLANETS MASS MATRIX
                            </span>
                            <span className="font-mono text-[11px] font-semibold mt-1.5 text-white/80">
                              {selectedGalaxy.planetsCount} Planets
                            </span>
                          </div>

                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest text-white/40 font-mono flex items-center gap-1.5">
                              <Info className="w-3 h-3 text-blue-400" />
                              CORE VECTOR
                            </span>
                            <span className="font-mono text-[11px] font-semibold mt-1.5 text-white/80">
                              {selectedGalaxy.colorTheme.toUpperCase()} SWIRL
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center md:text-right p-6 text-white/40 font-mono text-xs max-w-sm self-end bg-black/40 rounded-xl border border-white/5"
                        id="galaxy-selector-fallback-message"
                      >
                        [SELECT A GALAXY IN THE LEFT CATALOG MENU TO EXPEDITE EVENT HORIZON SHORELINE ABSORB METRE]
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* 3. WHITEHOLE ACTIVE STATE: TICKER TIMELINE UNDERNEATH AXIS CONTAINER */}
            {mode === 'whitehole' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center relative pointer-events-none"
                id="whitehole-interactive-hud"
              >
                {/* Visual anchor placing the timer precisely below the rotating sphere context */}
                <div className="absolute top-[64%] text-center flex flex-col items-center gap-1.5">
                  <AnimatePresence mode="wait">
                    {whiteholeCountdown > 0 ? (
                      <motion.div
                        key="whitehole-countdown-ticker"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center gap-1"
                      >
                        <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-600 mb-1 font-mono">
                          SINGULARITY EXPULSION CRITICAL POINT
                        </span>
                        <div className="text-3xl md:text-4xl font-mono text-black tracking-widest font-extralight bg-black/[0.03] px-6 py-2 rounded-lg border border-black/10 backdrop-blur-xs select-all">
                          {whiteholeCountdown.toFixed(2)}s
                        </div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-mono">
                          AXIS ROTATING FURIOSLY • CHARGING PLASMA WINGS
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="whitehole-burst-ticker"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <span className="text-[10px] uppercase tracking-[0.4em] text-black font-semibold mb-1 font-mono">
                          QUANTUM EXPLOSION COMPLETE
                        </span>
                        <div className="text-xl md:text-2xl font-mono text-black tracking-wide font-light bg-black/[0.03] px-6 py-2.5 rounded-lg border border-black/15 backdrop-blur-xs">
                          COSMIC INFLATION IN PLANE ACTIVE
                        </div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-mono mt-1">
                          GALAXIES GENERATED • ETERNAL EXPANSION SIMULATED
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* BOTTOM SECTION AREA: EXIT SUB-CONTROLLER OR TELEMETRY PANEL */}
        <div className="w-full flex flex-col items-center justify-center z-40 select-none">
          {mode === 'passive' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full flex justify-center"
            >
              <CosmicTelemetryStream />
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            {mode === 'passive' ? (
              <motion.footer 
                key="telemetry-footer-menu"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-4 w-full max-w-4xl text-center border-t border-white/10 pt-8 px-4"
                id="simulation-telemetry-panel"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-mono">GRAVITY FLUX</span>
                  <span className="font-mono text-sm md:text-base mt-1 text-white/95" id="telemetry-flux">
                    0.887 G/s
                  </span>
                </div>
                <div className="flex flex-col border-r border-white/5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-mono">LIGHT DISTANCE</span>
                  <span className="font-mono text-sm md:text-base mt-1 text-white/95" id="telemetry-distance">
                    14.22 BN LY
                  </span>
                </div>
                <div className="flex flex-col border-r border-white/5 items-center">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-mono">ENTROPY LEVEL</span>
                  <div className="flex items-center gap-2 justify-center mt-1">
                    <span 
                      className={`font-mono text-sm md:text-base ${
                        mode === 'blackhole' ? 'text-red-400' : mode === 'whitehole' ? 'text-amber-400' : 'text-white/95'
                      }`} 
                      id="telemetry-entropy"
                    >
                      {mode === 'blackhole' ? 'DECAYING' : mode === 'whitehole' ? 'SPIKED' : 'STABLE'}
                    </span>
                    <div className="w-12 h-5 flex items-center justify-center opacity-70">
                      <LineChart width={48} height={16} data={sparklineData}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={mode === 'blackhole' ? '#ef4444' : mode === 'whitehole' ? '#fbbf24' : '#34d399'}
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-mono">CIVILIZATION TYPE</span>
                  <span className="font-mono text-sm md:text-base mt-1 text-white/95" id="telemetry-civ-type">
                    Type 0.73 Civilization
                  </span>
                </div>
              </motion.footer>
            ) : (
              <motion.div
                key="exit-button-footer-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-3 pt-6"
                id="exit-button-footer-block"
              >
                {/* Dynamically adjust labels for both active modes */}
                <motion.button
                  id="exit-simulation-btn"
                  onMouseEnter={() => audioManager.playHover()}
                  onClick={() => {
                    audioManager.playNavigate();
                    handleSimulationEnd();
                  }}
                  className={`px-8 py-3 rounded-full transition-all duration-300 font-mono text-[11px] uppercase tracking-[0.25em] flex items-center gap-2 backdrop-blur-md cursor-pointer pointer-events-auto ${
                    isWhiteView
                      ? 'bg-black/[0.04] text-black/80 hover:text-black border border-black/10 hover:border-black/30 hover:bg-black/5'
                      : 'bg-white/[0.04] text-white/80 hover:text-white border border-white/10 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <X className={`w-4 h-4 ${isWhiteView ? 'text-black/60' : 'text-neutral-400'}`} />
                  <span>Exit Simulation</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* FULL SCREEN DEDICATED GALAXY MAP OVERLAY */}
      {mode === 'galaxymap' && (
        <GalaxyMap onBack={handleSimulationEnd} />
      )}

      {/* FULL SCREEN DEDICATED HUMAN EXPLORATION OVERLAY */}
      {mode === 'human_exploration' && (
        <HumanExploration onBack={handleSimulationEnd} />
      )}
    </div>
  );
}
