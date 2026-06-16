/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Calendar, Rocket, Compass, Sparkles, 
  Globe, Eye, Milestone, Flame, ShieldAlert, Cpu, Zap
} from 'lucide-react';
import { audioManager } from '../utils/audio';

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  typeIndex: number; // Kardashev Type advancement during this period
  energyRating: string; // e.g. "1.1 x 10^12 Watts"
  classification: string; // classification of civilization at this event
  imageUrl: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'sputnik',
    year: '1957',
    title: 'Sputnik 1 Launch',
    subtitle: 'Humanity\'s First Artificial Satellite',
    description: 'On October 4, 1957, the Soviet Union launched Sputnik 1 into a low Earth orbit. Beeping back to Earth, this spherical radio transmitter shocked the global scientific community and fired the starting pistol for the ultimate Space Race, proving humanity could break Earth\'s gravity well.',
    typeIndex: 0.712,
    energyRating: '4.8 x 10^12 W',
    classification: 'Type 0.71 - Fossil Fuel Base',
    imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'yuri',
    year: '1961',
    title: 'Vostok 1 Flight',
    subtitle: 'First Human in Space',
    description: 'Soviet cosmonaut Yuri Gagarin crossed the Karman line on April 12, 1961, completing a single orbit of the Earth in 108 minutes. His simple declaration, "I see Earth! It is so beautiful," permanently altered our species\' perspective on our place in the cosmos.',
    typeIndex: 0.716,
    energyRating: '5.2 x 10^12 W',
    classification: 'Type 0.71 - Sub-Orbital Inception',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'apollo',
    year: '1969',
    title: 'Apollo 11 Landing',
    subtitle: 'Humanity Walks on the Moon',
    description: 'On July 20, 1969, American astronauts Neil Armstrong and Buzz Aldrin landed the Eagle lunar module at Tranquility Base. To look back and see the entire human population hanging as a fragile blue marble in hostile vacuum revolutionized ecology, philosophy, and stellar ambition.',
    typeIndex: 0.720,
    energyRating: '6.1 x 10^12 W',
    classification: 'Type 0.72 - Extraterrestrial Transit',
    imageUrl: 'https://images.unsplash.com/photo-1532664189809-02133fee698d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'voyager',
    year: '1977',
    title: 'Voyager 1 Departure',
    subtitle: 'Entering Interstellar Space',
    description: 'Launched to explore the outer solar system, Voyager 1 carried the Golden Record—a letter in a bottle containing Earth\'s sounds and cultures. It passed the heliopause in 2012, becoming the first human-engineered artifact to wade into the endless interstellar pristine sea.',
    typeIndex: 0.722,
    energyRating: '7.4 x 10^12 W',
    classification: 'Type 0.72 - Deep Heliopause Probe',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hubble',
    year: '1990',
    title: 'Hubble Space Telescope',
    subtitle: 'Universal Visual Awakening',
    description: 'Released from the Space Shuttle Discovery, Hubble peered deep into cosmic history, bypassing Earth\'s atmospheric blur. It calculated the Hubble constant, discovered the rate of cosmological expansion, and brought the majestic, hyperdense deep nebulae directly to human consciousness.',
    typeIndex: 0.725,
    energyRating: '9.8 x 10^12 W',
    classification: 'Type 0.72 - Orbital Spectrum Anchor',
    imageUrl: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'iss',
    year: '1998',
    title: 'International Space Station',
    subtitle: 'Continuous Human Space Habitation',
    description: 'An unprecedented engineering collaboration between nations previously locked in ideological warfare. The ISS represents a micro-oasis of humanity keeping vigil 250 miles above our skies, generating invaluable biophysical research on bone degradation and Zero-G cultivation.',
    typeIndex: 0.727,
    energyRating: '1.2 x 10^13 W',
    classification: 'Type 0.72 - Persistent Off-world Colony',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'curiosity',
    year: '2012',
    title: 'Curiosity Rover Landing',
    subtitle: 'Robotic Martian Colonologist',
    description: 'Using the revolutionary "Sky Crane" maneuver, Curiosity completed an elaborate pinpoint landing inside Gale Crater. It immediately began parsing geological strata and clay minerals to prove that ancient Mars harbored fresh-water streams, oxygen profiles, and organic compounds.',
    typeIndex: 0.729,
    energyRating: '1.4 x 10^13 W',
    classification: 'Type 0.73 - Automated Planetary Survey',
    imageUrl: 'https://images.unsplash.com/photo-1612892483236-42d68a57623d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'jameswebb',
    year: '2021',
    title: 'James Webb Deployment',
    subtitle: 'Infrared Temporal Sight',
    description: 'Equipped with a giant gold-plated beryllium reflector and sitting 1.5 million kilometers away at the L2 Lagrange point, JWST pierces interstellar clouds of dust to show us the very first stars ignited after the Big Bang, revolutionizing astrophysical models of early galactic structures.',
    typeIndex: 0.731,
    energyRating: '1.8 x 10^13 W',
    classification: 'Type 0.73 - Lagrange Obscura Sight',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'artemis',
    year: '2026',
    title: 'Artemis and Starship Era',
    subtitle: 'Deep Space Return and High-Throughput Reusability',
    description: 'Humanity establishes permanent infrastructure on the Lunar surface while launching the ultra-heavy fully reusable Starship vectors. This shift from scientific outpost to persistent industrial presence represents the true birth of a multiplanetary species.',
    typeIndex: 0.734,
    energyRating: '2.1 x 10^13 W',
    classification: 'Type 0.73 - Early Multiplanetary Gen',
    imageUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=800&q=80'
  }
];

interface HumanExplorationProps {
  onBack: () => void;
}

export default function HumanExploration({ onBack }: HumanExplorationProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>('sputnik');

  const selectedEvent = TIMELINE_EVENTS.find(e => e.id === selectedEventId) || TIMELINE_EVENTS[0];

  useEffect(() => {
    // Softly start passive drone on portal load to establish immersive backdrop
    if (!audioManager.isMuted) {
      audioManager.startPassiveDrone();
    }
  }, []);

  const handleSelectEvent = (eventId: string) => {
    audioManager.playExplorationBeep();
    setSelectedEventId(eventId);
  };

  return (
    <div className="absolute inset-0 bg-[#020205] text-white z-40 overflow-y-auto overflow-x-hidden flex flex-col justify-between font-sans">
      
      {/* Background ambient light layout */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute rounded-full filter blur-[150px] opacity-15 bg-blue-600 w-[500px] h-[500px] -top-10 -left-10" />
        <div className="absolute rounded-full filter blur-[160px] opacity-15 bg-teal-500 w-[600px] h-[600px] -bottom-20 -right-20" />
      </div>

      {/* HEADER BAR */}
      <div className="relative w-full max-w-7xl mx-auto px-6 pt-6 z-10 flex-shrink-0">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <button 
            onMouseEnter={() => audioManager.playHover()}
            onClick={() => {
              audioManager.playNavigate();
              onBack();
            }}
            className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-neutral-400 hover:text-teal-400 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            BACK TO STELLAR CORE
          </button>
          
          <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            HISTORIC TIMELINE PORTAL
          </div>
        </div>
      </div>

      {/* CORE TIMELINE WORKSPACE */}
      <main className="relative w-full max-w-7xl mx-auto px-6 py-8 z-10 flex-1 flex flex-col items-center justify-center gap-8">
        
        {/* Title area */}
        <div className="text-center w-full max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.52em] text-teal-400 font-mono font-semibold block mb-2">
            MORTAL BOUNDARIES • THE EXODUS
          </span>
          <h1 className="text-3xl md:text-4xl font-extralight tracking-tight text-white mb-2">
            HUMAN SPACE EXPLORATION
          </h1>
          <p className="text-xs text-neutral-400 font-mono tracking-wider">
            Tracing our journey from biosphere confinement to celestial seeding.
          </p>
        </div>

        {/* 1. HORIZONTAL SCROLLABLE TIMELINE TRACK */}
        <div className="w-full relative py-6 flex flex-col items-center">
          
          {/* Centered line */}
          <div className="absolute top-[48px] left-8 right-8 h-[2px] bg-white/10" />
          
          <div className="w-full overflow-x-auto overflow-y-hidden px-8 pb-4 scrollbar-thin scrollbar-thumb-white/10 flex items-center justify-between gap-6 md:gap-10">
            {TIMELINE_EVENTS.map((event) => {
              const isSelected = event.id === selectedEventId;
              return (
                <div 
                  key={event.id}
                  className="flex flex-col items-center min-w-[110px] md:min-w-[130px] relative z-10"
                >
                  {/* Point date box */}
                  <span className={`text-xs font-mono tracking-widest font-semibold mb-3 ${
                    isSelected ? 'text-teal-400 text-sm scale-110' : 'text-neutral-500'
                  } transition-all duration-300`}>
                    {event.year}
                  </span>

                  {/* Pulsing focal node orb */}
                  <button
                    onMouseEnter={() => audioManager.playHover()}
                    onClick={() => handleSelectEvent(event.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 relative ${
                      isSelected 
                        ? 'bg-teal-500 border border-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.6)] scale-120' 
                        : 'bg-neutral-900 border border-white/20 hover:border-teal-400/50 hover:bg-neutral-800'
                    }`}
                  >
                    <Rocket className={`w-3.5 h-3.5 transition-colors ${
                      isSelected ? 'text-black' : 'text-neutral-400 hover:text-white'
                    }`} />
                  </button>

                  {/* Shorter Title label below bubble */}
                  <span className={`text-[9px] text-center font-mono uppercase tracking-wider mt-3 truncate w-full px-1 ${
                    isSelected ? 'text-white font-semibold' : 'text-neutral-500'
                  } transition-colors duration-300`}>
                    {event.title.split(' ')[0]} {event.title.split(' ')[1] || ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. DETAIL BOX: SHOWS SELECTED EVENT TEXT AND BEAUTIFUL STYLED IMAGE */}
        <div className="w-full max-w-5xl bg-neutral-950/80 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedEvent.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              
              {/* IMAGE COLUMN (SPAN 5) */}
              <div className="md:col-span-5 relative w-full aspect-video md:aspect-square rounded-xl overflow-hidden border border-white/10 group">
                {/* Visual accent backdrop element */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10 pointer-events-none" />
                <img 
                  src={selectedEvent.imageUrl} 
                  alt={selectedEvent.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Tiny image status flag */}
                <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-neutral-950/90 border border-white/15 px-2.5 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                  <span className="text-[8px] font-mono tracking-widest text-neutral-300 uppercase">
                    STATION GRAPHICS LIVE
                  </span>
                </div>
              </div>

              {/* DETAILS COLUMN (SPAN 7) */}
              <div className="md:col-span-7 flex flex-col gap-4">
                
                {/* Year Badge */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-teal-500/10 border border-teal-500/20 text-xs font-mono text-teal-400">
                    ANNO DOMINI {selectedEvent.year}
                  </span>
                  <span className="w-1.5 h-[1px] bg-white/20" />
                  <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                    COGNITIVE HORIZON SHIFT
                  </span>
                </div>

                {/* Event titles */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-light tracking-wide text-white">
                    {selectedEvent.title}
                  </h2>
                  <p className="text-xs font-mono tracking-wider text-teal-500 mt-1 uppercase font-semibold">
                    {selectedEvent.subtitle}
                  </p>
                </div>

                {/* Core description */}
                <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-sans font-light">
                  {selectedEvent.description}
                </p>

                {/* Period Telemetry Sub-panel */}
                <div className="grid grid-cols-2 gap-4 mt-2 border-t border-white/5 pt-4">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                    <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-mono block mb-1">
                      KARDASHEV COGNITIVE LEVEL
                    </span>
                    <span className="font-mono text-xs font-bold text-white tracking-widest">
                      CIV TYPE ~{selectedEvent.typeIndex.toFixed(3)}
                    </span>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                    <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-mono block mb-1">
                      TERRESTRIAL POWER UTILIZATION
                    </span>
                    <span className="font-mono text-xs font-bold text-teal-400 tracking-wider">
                      {selectedEvent.energyRating}
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. CIVILIZATION GENERATION INDEX (BOTTOM METRIC DASHBOARD PANEL) */}
        <div className="w-full max-w-5xl bg-neutral-900/60 border border-white/10 rounded-xl p-5 md:p-6 backdrop-blur-sm relative overflow-hidden" id="species-advancement-metric-box">
          
          {/* Neon side accent border */}
          <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-gradient-to-b from-teal-400 to-indigo-500" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center relative z-10">
            
            {/* Title / Classification */}
            <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 md:pr-4 flex flex-col">
              <span className="text-[9px] tracking-widest text-neutral-500 font-mono uppercase mb-0.5">
                CLASSIFIED STATUS TYPE
              </span>
              <span className="text-sm font-mono text-teal-400 font-bold uppercase tracking-wider">
                Type 0.73 Civilization
              </span>
              <span className="text-[10px] text-neutral-400 italic font-light mt-1">
                "Early Sub-Planetary Generation"
              </span>
            </div>

            {/* Current Metrics progress */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-wider">
                <span className="text-white/60">TERRESTRIAL EXHAUSTIVE LIMITS</span>
                <span className="text-teal-400">73.4% TO TYPE I CIVILIZATION</span>
              </div>
              
              {/* Sleek gauge meter bar */}
              <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "73.4%" }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500 rounded-full"
                />
              </div>

              <div className="flex justify-between text-[8px] font-mono text-neutral-500 mt-1">
                <span>TYPE 0 (FOSSIL FUELS DISCHARGE)</span>
                <span>TYPE I (TOTAL PLANETARY SPECTRUM GENERATION)</span>
              </div>
            </div>

            {/* Futuristic Tech Spec Box */}
            <div className="md:col-span-1 bg-black/40 border border-white/5 rounded-lg p-3 flex items-center gap-3">
              <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Zap className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-neutral-500 font-mono tracking-widest uppercase">
                  TOTAL SOLAR HARVEST
                </span>
                <span className="text-[11px] text-white font-mono font-semibold tracking-wider">
                  ~2.1 x 10^13 Watts
                </span>
                <span className="text-[7px] text-neutral-500 font-mono uppercase mt-0.5">
                  L2 COGNITIVE BOUNDS
                </span>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
