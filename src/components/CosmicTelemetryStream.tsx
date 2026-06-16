import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Wifi, Zap } from 'lucide-react';

interface TelemetryLog {
  id: string;
  timestamp: string;
  category: string;
  message: string;
  source: string;
  type: 'info' | 'success' | 'warning' | 'critical';
}

const SCIENCE_MESSAGES = [
  { message: "COSMIC BACKGROUND RADIATION AT 2.73 K MEASURED EXPECTED LIMIT", type: "info", source: "COSMO-WMAP" },
  { message: "SUPERNOVA CANDIDATE CONFIRMED IN NGC-424", type: "warning", source: "HUBBLE-LINS" },
  { message: "GRAVITATIONAL WAVE PULSE RECIEVED AT -45dB", type: "critical", source: "LIGO-VIRGO-3" },
  { message: "PULSAR CRAB FREQUENCY DRIFT CAPTURED AT 29.98 Hz (+0.04mHz)", type: "success", source: "CHANDRA-X" },
  { message: "NEUTRINO BURST CORRELATED: DETECTOR ICECUBE-GRID STABLE", type: "info", source: "ICECUBE-GRID" },
  { message: "DARK MATTER FILAMENT DETECTED BY WEAK LENSING ANOMALY", type: "success", source: "EUCLID-SPEC" },
  { message: "SCHWARZSCHILD RAD FLUX DETECTED EN ROUTE TO CORE EPSILON", type: "critical", source: "EVENT-HORIZON" },
  { message: "HAWKING QUANTUM EVAPORATION COEFFICIENT AT PLANK LIMIT CONST", type: "info", source: "COSMO-CORE" },
  { message: "KEPLER TRANSIT SURVEY: CONFIRMED 3 ECLIPSING GAS GIANTS IN SEC-B2", type: "success", source: "KEPLER-GRID" },
  { message: "LANIAKEA TIDAL DIVERGENCE COMPILING: VEL_RECES = 630 KM/S", type: "success", source: "ATLAS-3D" },
  { message: "SOL SYSTEM HELIOPAUSE DETECTOR SHIELD RATIO STATUS: 99.42%", type: "info", source: "VOYAGER-CORE" },
  { message: "INTERSTELLAR MEDIUM DEUT-HYDROGEN DECREMENT DETERMINED", type: "warning", source: "JWST-NIR" },
  { message: "CO-SECTOR REIONIZATION EMISSION LINE SCAN COMPLETE (OXYGEN-III)", type: "success", source: "ALMA-INT" },
  { message: "X-RAY TRANSIENT BURST RECORDED IN CENTAURUS COMPACT REGION", type: "warning", source: "SWIFT-BAT" },
  { message: "COSMIC STRINGS VIBRATIONAL FREQUENCY HARMONY MEASURED (-12dB)", type: "info", source: "GWAN-SPEC" },
  { message: "BARYON ACOUSTIC OSCILLATION METRIC RATIO SECURED AT 1.0454", type: "success", source: "SDSS-BOSS" },
  { message: "MERCURY PERIHELION PRECESSION DRIFT SECURED AND STABLE", type: "info", source: "MESSENGER" },
  { message: "STELLAR WINDS VELOCITY IN GALAXY M31 CLUSTER SPIKED", type: "warning", source: "SPITZER-IR" },
  { message: "EXTRAGALACTIC BACKGROUND LIGHT INTERACTION FLUX ANOMALY DETECTED", type: "warning", source: "FERMI-LAT" },
  { message: "MAGNETAR MAGNETOSPHERE DECAY ACCORDING TO RYDBERG INTENSIFIER", type: "critical", source: "HESS-II" }
];

export function CosmicTelemetryStream() {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const logIdCounter = useRef(0);

  // Generate initial set of logs
  useEffect(() => {
    const initialLogs: TelemetryLog[] = [];
    for (let i = 0; i < 4; i++) {
      const entry = SCIENCE_MESSAGES[Math.floor(Math.random() * SCIENCE_MESSAGES.length)];
      const now = new Date();
      now.setSeconds(now.getSeconds() - (4 - i) * 3); // stagger past logs
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      const timeStr = `${now.toTimeString().split(' ')[0]}.${ms}`;
      
      initialLogs.unshift({
        id: `init-${logIdCounter.current++}`,
        timestamp: timeStr,
        category: "TELEMETRY",
        message: entry.message,
        source: entry.source,
        type: entry.type as any,
      });
    }
    setLogs(initialLogs);
  }, []);

  // Set up interval to push new science log messages
  useEffect(() => {
    const interval = setInterval(() => {
      const entry = SCIENCE_MESSAGES[Math.floor(Math.random() * SCIENCE_MESSAGES.length)];
      const now = new Date();
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      const timeStr = `${now.toTimeString().split(' ')[0]}.${ms}`;

      setLogs((prev) => {
        const next = [
          {
            id: `log-${logIdCounter.current++}`,
            timestamp: timeStr,
            category: "CORE_LOG",
            message: entry.message,
            source: entry.source,
            type: entry.type as any,
          },
          ...prev,
        ];
        // Keep at most 4 items for perfect spacing and aesthetics
        if (next.length > 4) {
          next.pop();
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl bg-black/35 border border-white/5 rounded-xl p-4 select-none backdrop-blur-md mb-6 relative overflow-hidden flex flex-col gap-2.5">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-teal-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
      
      {/* Header telemetry info bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[8px] font-mono tracking-[0.3em] text-white/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-teal-400 animate-pulse" />
          <span>COSMIC OBSERVED GEOMETRIES LIVE LOG</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Wifi className="w-2.5 h-2.5 text-teal-500" /> SEC-LINK: SECURED
          </span>
          <span className="flex items-center gap-1 animate-pulse">
            <Zap className="w-2.5 h-2.5 text-amber-400" /> TELEMETRIC_FEED
          </span>
        </div>
      </div>

      {/* Scrolling Text panel */}
      <div className="h-[95px] overflow-hidden flex flex-col justify-end">
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {logs.map((log) => {
              // Color badges based on log entry type
              let badgeStyle = "text-indigo-400 border-indigo-400/20 bg-indigo-500/5";
              let textStyle = "text-white/60";
              
              if (log.type === "success") {
                badgeStyle = "text-teal-400 border-teal-400/20 bg-teal-500/5";
                textStyle = "text-teal-200/80";
              } else if (log.type === "warning") {
                badgeStyle = "text-amber-400 border-amber-400/20 bg-amber-500/5";
                textStyle = "text-amber-200/80";
              } else if (log.type === "critical") {
                badgeStyle = "text-red-400 border-red-400/20 bg-red-500/5";
                textStyle = "text-red-200/80";
              }

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 12, height: 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 16 }}
                  className="flex items-center gap-3 text-[10px] font-mono leading-none py-0.5 overflow-hidden"
                >
                  <span className="text-white/20 select-all font-light flex-shrink-0">
                    [{log.timestamp}]
                  </span>
                  <span className={`px-1.5 py-0.5 rounded border text-[7.5px] tracking-widest uppercase font-semibold flex-shrink-0 ${badgeStyle}`}>
                    {log.source}
                  </span>
                  <span className={`truncate tracking-wide ${textStyle}`}>
                    {log.message}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
