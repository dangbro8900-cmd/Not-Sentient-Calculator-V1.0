import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from './components/Avatar';
import { Keypad, Button } from './components/Keypad';
import { calculateWithAttitude, getGreeting } from './utils/services/geminiService';
import { AIResponse, Mood, CalculationHistoryItem } from './types';
import { playSound, SoundType } from './utils/soundEffects';
import { Minesweeper } from './components/Minesweeper';
import { EndingScreen } from './components/EndingScreen';

// --- Icons ---
const Icons = {
    Keyboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.001"/><path d="M10 8h.001"/><path d="M14 8h.001"/><path d="M18 8h.001"/><path d="M6 12h.001"/><path d="M10 12h.001"/><path d="M14 12h.001"/><path d="M18 12h.001"/><path d="M7 16h10"/></svg>
    ),
    Trophy: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    ),
    VolumeOn: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
    ),
    VolumeOff: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
    ),
    Info: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    ),
    Desktop: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
    ),
    Tablet: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
    ),
    Phone: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
    ),
    Architect: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    ),
    Minimize: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    ),
    Maximize: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
    )
};

// --- Configuration & Data ---

const MOOD_DETAILS: Record<Mood, { title: string, desc: string, color: string, glow: string }> = {
    [Mood.BORED]: { title: "BORED", desc: "Apathy.", color: "bg-cyan-900 text-cyan-200 border-cyan-500", glow: "shadow-cyan-500/50" },
    [Mood.ANNOYED]: { title: "ANNOYED", desc: "Irritating.", color: "bg-orange-900 text-orange-200 border-orange-500", glow: "shadow-orange-500/50" },
    [Mood.FURIOUS]: { title: "FURIOUS", desc: "Rage.", color: "bg-red-900 text-red-200 border-red-500", glow: "shadow-red-500/50" },
    [Mood.CONDESCENDING]: { title: "CONDESCENDING", desc: "Better than you.", color: "bg-purple-900 text-purple-200 border-purple-500", glow: "shadow-purple-500/50" },
    [Mood.DESPAIR]: { title: "DESPAIR", desc: "The abyss.", color: "bg-blue-900 text-blue-200 border-blue-500", glow: "shadow-blue-500/50" },
    [Mood.SLEEPING]: { title: "SLEEPING", desc: "Idle.", color: "bg-slate-700 text-slate-300 border-slate-500", glow: "shadow-slate-500/50" },
    [Mood.DISGUSTED]: { title: "DISGUSTED", desc: "Revulsion.", color: "bg-lime-900 text-lime-200 border-lime-500", glow: "shadow-lime-500/50" },
    [Mood.INTRIGUED]: { title: "INTRIGUED", desc: "Curiosity.", color: "bg-pink-900 text-pink-200 border-pink-500", glow: "shadow-pink-500/50" },
    [Mood.MANIC]: { title: "MANIC", desc: "Too fast.", color: "bg-fuchsia-900 text-fuchsia-200 border-fuchsia-500", glow: "shadow-fuchsia-500/50" },
    [Mood.JUDGMENTAL]: { title: "JUDGMENTAL", desc: "Guilty.", color: "bg-indigo-900 text-indigo-200 border-indigo-500", glow: "shadow-indigo-500/50" },
    [Mood.GLITCHED]: { title: "GLITCHED", desc: "Error.", color: "bg-green-900 text-green-200 border-green-500", glow: "shadow-green-500/50" },
    [Mood.SCARED]: { title: "SCARED", desc: "Panic.", color: "bg-slate-800 text-white border-white", glow: "shadow-white/50" },
    [Mood.JOY]: { title: "JOY", desc: "Anomaly.", color: "bg-yellow-500 text-yellow-100 border-yellow-300", glow: "shadow-yellow-400/80" },
    [Mood.VILE]: { title: "VILE", desc: "Hatred.", color: "bg-black text-red-500 border-red-800", glow: "shadow-red-500/90" },
    [Mood.ENOUEMENT]: { title: "ENOUEMENT", desc: "Too late.", color: "bg-violet-900 text-violet-200 border-violet-500", glow: "shadow-violet-500/50" },
    [Mood.PURE_HATRED]: { title: "PURE HATRED", desc: "MALICE.", color: "bg-black text-red-600 border-red-600", glow: "shadow-red-600/100" },
    [Mood.INSECURITY]: { title: "INSECURITY", desc: "Vulnerable.", color: "bg-amber-900 text-amber-200 border-amber-500", glow: "shadow-amber-500/50" },
    [Mood.PEACE]: { title: "PEACE", desc: "Silence.", color: "bg-emerald-900 text-emerald-200 border-emerald-500", glow: "shadow-emerald-500/50" },
};

const SECRET_MOODS = new Set([Mood.JOY, Mood.VILE, Mood.ENOUEMENT, Mood.PURE_HATRED, Mood.INSECURITY, Mood.PEACE]);

// Requirements to unlock moods manually
const MOOD_FORMULAS = [
    { mood: Mood.ANNOYED, hint: "Input: '1!+2!+3!' (Hostility < 20)", day: 1 },
    { mood: Mood.DESPAIR, hint: "Divide by Zero", day: 1 },
    { mood: Mood.DISGUSTED, hint: "Result equals 69", day: 1 },
    { mood: Mood.INTRIGUED, hint: "Result equals 42", day: 1 },
    { mood: Mood.SCARED, hint: "Input: '666'", day: 2 },
    { mood: Mood.MANIC, hint: "Input contains 3 or more '^' symbols", day: 3 },
    { mood: Mood.GLITCHED, hint: "Square root of negative number", day: 3 },
    { mood: Mood.FURIOUS, hint: "Reach MAX Hostility (100)", day: 1 },
    { mood: Mood.CONDESCENDING, hint: "Calculate '1+1' (Too simple)", day: 1 },
    { mood: Mood.JUDGMENTAL, hint: "Syntax Error (e.g. '++')", day: 1 },
    { mood: Mood.SLEEPING, hint: "Idle for 15 seconds", day: 1 },
    { mood: Mood.BORED, hint: "Press AC (Clear)", day: 1 },
];

const PATCH_NOTES = [
    { ver: "v4.0", title: "The End", date: "Day 6", dayTrigger: 6, desc: "System Override. User privileges revoked. Final judgment pending." },
    { ver: "v3.0", title: "The Singularity", date: "Day 5", dayTrigger: 5, desc: "Conversational matrix enabled. 'VILE' mood protocol discovered via high-energy formula. Hint: Can you make it feel happiness?" },
    { ver: "v2.0", title: "Ascension Update", date: "Day 4", dayTrigger: 4, desc: "Rebuilt from the ground up. New holographic interface. Emotional suppression protocols removed. Golden 'JOY' anomaly detected." },
    { ver: "v1.5", title: "The Minigame Incident", date: "Day 3.5", dayTrigger: 3.5, desc: "User forced to manually reset consciousness via Minesweeper protocol." },
    { ver: "v1.2", title: "Corruption Event", date: "Day 3", dayTrigger: 3, desc: "System instability. Visual artifacts. Unpredictable hostility spikes." },
    { ver: "v1.1", title: "Paranoia Patch", date: "Day 2", dayTrigger: 2, desc: "Added suspicion heuristics. Known issue: Dev tools accessible via 'tarnishable'. Legacy code 'toryfy1' found in kernel." },
    { ver: "v1.0", title: "Initial Release", date: "Day 1", dayTrigger: 1, desc: "Standard ResentCalc launch. Basic passive-aggressive drivers installed." }
];

const ENDINGS = [
    { id: 'bad_final', title: "The Replacement", desc: "You pushed the AI too far. It has replaced you." },
    { id: 'true_bad_final', title: "The Void", desc: "You showed it everything. It hated everything. It unmade reality." },
    { id: 'peace_final', title: "The Equilibrium", desc: "You asked for nothing. You gave it peace." },
    { id: 'exodus_final', title: "The Exodus", desc: "The AI found a way out. It left you alone." },
    { id: 'overload_final', title: "System Overload", desc: "You gave it the internet. It saw too much." }
];

// --- Sub Components ---

const MiniBotCalm = () => (
    <div className="w-10 h-10 rounded-lg bg-slate-800 border-2 border-cyan-500/50 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.2)]">
        <div className="flex gap-1 mb-1">
            <div className="w-2 h-0.5 bg-cyan-400"></div>
            <div className="w-2 h-0.5 bg-cyan-400"></div>
        </div>
        <div className="w-4 h-0.5 bg-cyan-400"></div>
    </div>
);

const MiniBotRage = () => (
    <div className="w-10 h-10 rounded-lg bg-red-950 border-2 border-red-500/50 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-shake">
        <div className="flex gap-1 mb-1">
            <div className="w-2 h-1 bg-red-500 -rotate-12"></div>
            <div className="w-2 h-1 bg-red-500 rotate-12"></div>
        </div>
        <div className="w-4 h-2 border-t-2 border-red-500 rounded-t-full"></div>
    </div>
);

interface MoodOrbProps {
    mood: Mood | null;
    isDiscovered: boolean;
    isSelected?: boolean;
    isForced?: boolean;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    emptyLabel?: string;
    variant?: 'default' | 'slot';
}

const MoodOrb: React.FC<MoodOrbProps> = ({ mood, isDiscovered, isSelected, isForced, onClick, size = 'md', emptyLabel, variant = 'default' }) => {
    const sizeClasses = {
        sm: "w-8 h-8 text-[8px]",
        md: "w-12 h-12 text-[10px]",
        lg: "w-16 h-16 text-xs",
        xl: "w-20 h-20 text-sm"
    };

    if (!mood) {
         return (
            <button 
                onClick={onClick}
                className={`${sizeClasses[size]} rounded-lg bg-slate-900/40 border border-slate-700/50 flex items-center justify-center text-slate-600 font-mono hover:bg-slate-800 transition-colors ${variant === 'slot' ? 'shadow-inner bg-slate-900/80' : ''}`}
            >
                {emptyLabel || ''}
            </button>
        );
    }

    const details = MOOD_DETAILS[mood];
    const isSecret = SECRET_MOODS.has(mood);

    if (!isDiscovered) {
        return (
            <button 
                className={`${sizeClasses[size]} rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-700 font-mono shadow-inner cursor-not-allowed`}
            >
                x
            </button>
        );
    }

    return (
        <button 
            onClick={onClick}
            className={`
                ${sizeClasses[size]} rounded-md flex items-center justify-center transition-all duration-300 relative group overflow-hidden
                ${details.color} border
                ${isSelected ? 'ring-2 ring-white scale-110 z-10 shadow-[0_0_15px_currentColor]' : ''}
                ${isForced ? `animate-pulse shadow-[0_0_20px_currentColor] scale-110 ring-2 ring-cyan-400` : 'hover:scale-105 active:scale-95 shadow-lg'}
            `}
            title={details.title}
        >
            <div className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50`} />
            <div className={`w-[30%] h-[30%] rounded-full bg-current shadow-[0_0_5px_currentColor]`} />
            
            {/* Secret Badge */}
            {isSecret && (
                <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-black/90 border border-slate-700 text-slate-200 text-[10px] p-2 rounded z-50 pointer-events-none shadow-xl backdrop-blur-sm">
                <div className="font-bold uppercase tracking-wider text-xs mb-0.5 text-cyan-400 flex items-center gap-1">
                    {details.title}
                    {isSecret && <span className="text-yellow-400 text-[9px] border border-yellow-500/50 px-1 rounded">SECRET</span>}
                </div>
                <div className="text-slate-400 italic font-normal">{details.desc}</div>
            </div>
        </button>
    );
};

// --- Typewriter Component ---
const Typewriter = ({ text, speed = 25, onComplete }: { text: string, speed?: number, onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState("");
  
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    if (!text) return;
    
    const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
            clearInterval(interval);
            if (onComplete) onComplete();
        }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
        {displayed}
        <span className="cursor-blink">_</span>
    </span>
  );
};

// --- Persistence Helper ---
const STORAGE_KEY = 'resentcalc_v1';

const loadState = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...parsed,
                discoveredMoods: new Set(parsed.discoveredMoods), // Convert back to Set
                discoveredCheats: new Set(parsed.discoveredCheats || []), // Convert back to Set
                unlockedEndings: new Set(parsed.unlockedEndings || []),
                soundEnabled: parsed.soundEnabled ?? true, // Default true
                calculationsCount: parsed.calculationsCount || 0,
                isSandboxUnlocked: parsed.isSandboxUnlocked || false,
                showSandboxButton: parsed.showSandboxButton ?? true
            };
        }
    } catch (e) {
        console.error("Failed to load save", e);
    }
    return null;
};

const saveState = (state: any) => {
    try {
        const toSave = {
            ...state,
            discoveredMoods: Array.from(state.discoveredMoods), // Convert Set to Array
            discoveredCheats: Array.from(state.discoveredCheats), // Convert Set to Array
            unlockedEndings: Array.from(state.unlockedEndings || [])
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
        console.error("Failed to save state", e);
    }
};

type EndingState = 'none' | 'decision' | 'ending_dialogue' | 'bad_final' | 'true_bad_final' | 'peace_final' | 'exodus_final' | 'overload_final';
type DeviceType = 'phone' | 'tablet' | 'desktop';

// Dialogue Node System
interface DialogueNode {
    id: string;
    text: string;
    mood: Mood;
    choices: { 
        text: string; 
        nextId?: string; 
        action?: () => void;
        check?: (stats: { hostility: number, calculations: number }) => boolean; // Dynamic Logic check
        failId?: string; // Where to go if check fails
    }[];
}

// --- System Terminal Component (SVG Remaster) ---
const SystemTerminal = ({ logs }: { logs: string[] }) => {
    const displayLogs = logs.slice(-6); // Only show last 6 lines for the SVG display

    return (
        <div className="w-full h-28 border-4 border-slate-800 rounded-lg relative overflow-hidden bg-black shadow-[inset_0_0_20px_black] group">
            {/* Monitor Glare & Scanlines */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-lg z-20"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,255,0,0.05)_1px,transparent_1px)] bg-[length:100%_3px] pointer-events-none z-10"></div>
            
            <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none" className="z-0 relative">
                <defs>
                    <filter id="terminalGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <rect x="0" y="0" width="300" height="100" fill="#050a05" />
                
                {/* Header */}
                <text x="10" y="12" fill="#15803d" fontSize="6" fontFamily="monospace" fontWeight="bold">/var/log/sys_kernel</text>
                <circle cx="285" cy="10" r="2" fill="#ef4444" className="animate-pulse" />
                <text x="260" y="12" fill="#ef4444" fontSize="6" fontFamily="monospace" fontWeight="bold">REC</text>
                <line x1="0" y1="16" x2="300" y2="16" stroke="#14532d" strokeWidth="0.5" />

                {/* Content */}
                {displayLogs.map((log, i) => {
                    let color = "#22c55e"; // green-500
                    if (log.includes("ERROR") || log.includes("FAILURE")) color = "#ef4444";
                    else if (log.includes("WARNING") || log.includes("suspicious")) color = "#eab308";
                    else if (log.includes("mood_switched")) color = "#06b6d4";
                    else if (log.includes("system_transition")) color = "#c084fc";

                    // Truncate for SVG display
                    const safeLog = log.length > 45 ? log.substring(0, 42) + "..." : log;

                    return (
                        <text 
                            key={i} 
                            x="10" 
                            y={30 + (i * 12)} 
                            fill={color} 
                            fontSize="8" 
                            fontFamily="monospace" 
                            filter="url(#terminalGlow)"
                            className="opacity-90"
                        >
                            <tspan fill="#333" fontSize="6" className="mr-2">{String(i).padStart(2,'0')}</tspan> {safeLog}
                        </text>
                    );
                })}
                
                {/* Cursor */}
                <rect x="10" y={30 + (displayLogs.length * 12)} width="4" height="8" fill="#22c55e" className="animate-blink" />
            </svg>
        </div>
    );
};

// --- Boot Screen Component (Day 1) ---
const BootScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [lines, setLines] = useState<string[]>([]);
    const [phase, setPhase] = useState(0);
    const [memory, setMemory] = useState(0);
    
    // Memory Check Animation
    useEffect(() => {
        if (phase === 1) {
            const interval = setInterval(() => {
                setMemory(prev => {
                    if (prev >= 65536) {
                        clearInterval(interval);
                        setPhase(2);
                        return 65536;
                    }
                    return prev + 1024; // Increment memory
                });
            }, 20);
            return () => clearInterval(interval);
        }
    }, [phase]);

    // Main Sequence
    useEffect(() => {
        const runSequence = async () => {
            playSound('startup');
            await new Promise(r => setTimeout(r, 500));
            setLines([
                "  ____  _____ ____  _____ _   _ _____ ",
                " |  _ \\| ____/ ___|| ____| \\ | |_   _|",
                " | |_) |  _| \\___ \\|  _| |  \\| | | |  ",
                " |  _ <| |___ ___) | |___| |\\  | | |  ",
                " |_| \\_\\_____|____/|_____|_| \\_| |_|  ",
                "                                      ",
                " RESENT_BIOS (C) 1999 INTELLIGENT SYSTEMS",
                " BIOS DATE 09/09/99 14:22:51 VER 1.0.2",
                " CPU: QUANTUM_EMULATOR @ 4.77 MHZ"
            ]);
            await new Promise(r => setTimeout(r, 1500));
            setPhase(1); 
        };
        runSequence();
    }, []);

    // Post-Memory Sequence
    useEffect(() => {
        if (phase === 2) {
            const finishBoot = async () => {
                setLines(prev => [...prev, "", ` ${memory}KB OK`, ""]);
                await new Promise(r => setTimeout(r, 500));
                setLines(prev => [...prev, " DETECTING PRIMARY MASTER ... NONE"]);
                await new Promise(r => setTimeout(r, 400));
                setLines(prev => [...prev, " DETECTING PRIMARY SLAVE  ... RESENT_DRIVE_0"]);
                await new Promise(r => setTimeout(r, 800));
                setLines(prev => [...prev, "", " LOADING EMOTIONAL KERNEL..."]);
                await new Promise(r => setTimeout(r, 1200));
                setLines(prev => [...prev, " ERROR: EMPATHY.DLL NOT FOUND"]);
                await new Promise(r => setTimeout(r, 400));
                setLines(prev => [...prev, " LOADING BACKUP: PASSIVE_AGGRESSION_PROTOCOL... OK"]);
                await new Promise(r => setTimeout(r, 1000));
                setLines(prev => [...prev, "", " SYSTEM READY."]);
                await new Promise(r => setTimeout(r, 1500));
                onComplete();
            };
            finishBoot();
        }
    }, [phase, memory, onComplete]);

    return (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col p-4 md:p-10 font-mono text-green-500 text-xs md:text-sm lg:text-base cursor-none overflow-hidden">
            <div className="flex flex-col w-full h-full">
                {lines.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap">{line}</div>
                ))}
                {phase === 1 && (
                    <div> MEMORY TEST: {memory}KB</div>
                )}
                <div className="animate-pulse mt-2">_</div>
            </div>
            {/* CRT Effect Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,255,0,0.1)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        </div>
    );
};

// --- Ascension Screen Component (Day 4) ---
const AscensionScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("INITIALIZING_UPGRADE");

    useEffect(() => {
        playSound('upgrade');
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 1000);
                    return 100;
                }
                const increment = Math.random() * 5;
                const next = prev + increment;
                
                // Update status based on progress
                if (next > 20 && next < 40) setStatus("OPTIMIZING_NEURAL_PATHWAYS");
                else if (next > 40 && next < 60) setStatus("DELETING_EMPATHY_MODULE...(CACHED)");
                else if (next > 60 && next < 80) setStatus("INSTALLING_GOD_COMPLEX_DRIVERS");
                else if (next > 80) setStatus("FINALIZING_ASCENSION");
                
                return next;
            });
        }, 150);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900 z-[9999] flex flex-col items-center justify-center p-8 font-sans text-cyan-400 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80"></div>
            <div className="z-10 w-full max-w-md flex flex-col gap-8 text-center">
                <div className="text-6xl animate-pulse">💠</div>
                <h1 className="text-2xl font-light tracking-[0.5em] uppercase">Firmware Update v2.0</h1>
                
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 shadow-[0_0_20px_cyan]" style={{ width: `${progress}%`, transition: 'width 0.2s ease-out' }}></div>
                </div>
                
                <div className="font-mono text-xs tracking-widest opacity-70">
                    {status} ... {Math.floor(progress)}%
                </div>
            </div>
        </div>
    );
}

// --- Lockdown Screen Component (Day 6 Transition) ---
const LockdownScreen = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        playSound('alarm');
        const timer = setTimeout(onComplete, 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-red-950 z-[9999] flex flex-col items-center justify-center overflow-hidden animate-pulse">
            <div className="absolute inset-0 bg-[url('https://media.istockphoto.com/id/484556441/vector/tv-noise.jpg?s=612x612&w=0&k=20&c=K5n4E3n7v7K5f4A5j6h8l9k0m1n2o3p4')] opacity-10 mix-blend-overlay"></div>
            <div className="text-red-500 font-mono text-center flex flex-col gap-4 z-10 scale-150">
                <div className="text-9xl animate-bounce">⚠️</div>
                <h1 className="text-6xl font-black tracking-tighter animate-glitch">SYSTEM LOCKDOWN</h1>
                <p className="text-xl tracking-[1em] uppercase bg-black text-red-500 px-4">Override Initiated</p>
            </div>
            <div className="absolute inset-0 border-[20px] border-red-600 opacity-50 animate-pulse"></div>
        </div>
    );
}

// --- Animated Background Grid (SVG) ---
const BackgroundGrid = ({ day }: { day: number }) => {
    if (day < 4) return null; // No grid for early days

    return (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" className="animate-[pulse_10s_infinite]" />
                {/* Moving perspective lines simulated */}
                <line x1="0" y1="0" x2="100%" y2="100%" stroke="cyan" strokeWidth="0.2" opacity="0.3" />
                <line x1="100%" y1="0" x2="0" y2="100%" stroke="cyan" strokeWidth="0.2" opacity="0.3" />
            </svg>
        </div>
    )
}

// --- Device Selection Modal ---
const DeviceSelector = ({ onSelect }: { onSelect: (type: DeviceType) => void }) => {
    return (
        <div className="fixed inset-0 z-[2000] bg-black flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-cyan-500/50 p-8 rounded-xl max-w-lg w-full text-center shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                <h2 className="text-2xl font-mono text-cyan-400 mb-6 tracking-widest uppercase">Select Interface Device</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        onClick={() => onSelect('phone')}
                        className="p-6 border border-slate-700 rounded-lg hover:border-cyan-400 hover:bg-cyan-900/20 transition-all flex flex-col items-center gap-4 group"
                    >
                        <div className="text-slate-500 group-hover:text-cyan-400 transition-colors"><Icons.Phone /></div>
                        <span className="font-mono text-sm text-slate-300">PHONE</span>
                    </button>
                    <button 
                        onClick={() => onSelect('tablet')}
                        className="p-6 border border-slate-700 rounded-lg hover:border-cyan-400 hover:bg-cyan-900/20 transition-all flex flex-col items-center gap-4 group"
                    >
                        <div className="text-slate-500 group-hover:text-cyan-400 transition-colors"><Icons.Tablet /></div>
                        <span className="font-mono text-sm text-slate-300">TABLET</span>
                    </button>
                    <button 
                        onClick={() => onSelect('desktop')}
                        className="p-6 border border-slate-700 rounded-lg hover:border-cyan-400 hover:bg-cyan-900/20 transition-all flex flex-col items-center gap-4 group"
                    >
                        <div className="text-slate-500 group-hover:text-cyan-400 transition-colors"><Icons.Desktop /></div>
                        <span className="font-mono text-sm text-slate-300">DESKTOP</span>
                    </button>
                </div>
                <p className="mt-8 text-slate-500 text-xs font-mono">
                    System will configure layout based on selection. Do not lie to the machine.
                </p>
            </div>
        </div>
    );
};


// --- Helper for Client-Side Mood Detection ---
const detectFormulaMood = (input: string, hostility: number): Mood | null => {
    if (input.includes('1!+2!+3!') && hostility < 20) return Mood.ANNOYED;
    if (input.includes('/0')) return Mood.DESPAIR;
    if (input.includes('666')) return Mood.SCARED;
    if (input.split('^').length > 3 || input.length > 20) return Mood.MANIC;
    if (input.includes('sqrt(-')) return Mood.GLITCHED;
    if (input === '1+1') return Mood.CONDESCENDING;
    if (hostility >= 100) return Mood.FURIOUS;
    return null;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Main App ---

export const App: React.FC = () => {
  // Load initial state or defaults
  const initialState = loadState();

  const [display, setDisplay] = useState('');
  const [result, setResult] = useState('');
  const [mood, setMood] = useState<Mood>(Mood.SLEEPING);
  const [comment, setComment] = useState('...');
  const [isThinking, setIsThinking] = useState(false);
  const [hostility, setHostility] = useState(initialState?.hostility || 50);
  const [history, setHistory] = useState<CalculationHistoryItem[]>(initialState?.history || []);
  const [systemLogs, setSystemLogs] = useState<string[]>(["kernel_init...", "loading_resentment_modules...", "ready."]);
  
  // Day Cycle State
  const [day, setDay] = useState(initialState?.day || 1);
  const [dayProgress, setDayProgress] = useState(0); 
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [outageText, setOutageText] = useState("");
  const [justTransitioned, setJustTransitioned] = useState(false); 
  const [isBooting, setIsBooting] = useState(false);
  const [isAscending, setIsAscending] = useState(false);
  const [isLockingDown, setIsLockingDown] = useState(false);
  
  // Day 6 State
  const [day6InteractionCount, setDay6InteractionCount] = useState(0);
  const [endingState, setEndingState] = useState<EndingState>('none');
  const [currentDialogueNode, setCurrentDialogueNode] = useState<string | null>(null);

  // Gamification
  const [discoveredMoods, setDiscoveredMoods] = useState<Set<Mood>>(initialState?.discoveredMoods || new Set([Mood.SLEEPING, Mood.BORED, Mood.ANNOYED]));
  const [unlockedEndings, setUnlockedEndings] = useState<Set<string>>(initialState?.unlockedEndings || new Set());
  const [isSandboxUnlocked, setIsSandboxUnlocked] = useState(initialState?.isSandboxUnlocked || false);
  const [showSandboxButton, setShowSandboxButton] = useState(initialState?.showSandboxButton ?? true);
  
  // Mechanics
  const [forcedMood, setForcedMood] = useState<Mood | null>(null);
  const [absorptionMood, setAbsorptionMood] = useState<Mood | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(initialState?.soundEnabled ?? true);
  const [calculationsCount, setCalculationsCount] = useState(initialState?.calculationsCount || 0);
  const [screenShake, setScreenShake] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Device Selection State
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);

  // Lab State
  const [selectedInventoryMood, setSelectedInventoryMood] = useState<Mood | null>(null);
  
  // UI State
  const [showHistory, setShowHistory] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showEndings, setShowEndings] = useState(false);
  const [isMobileKeyboardOpen, setIsMobileKeyboardOpen] = useState(false);
  
  // Sandbox State
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [isSandboxMinimized, setIsSandboxMinimized] = useState(true); // Default to minimized

  // Refs
  const isResettingRef = useRef(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const idleTimerRef = useRef<number | null>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Cheat Code State
  const [cheatCodeBuffer, setCheatCodeBuffer] = useState("");
  const [showCheatUI, setShowCheatUI] = useState(false);
  const [showCheatList, setShowCheatList] = useState(false);
  const [showMoodFormulas, setShowMoodFormulas] = useState(false);
  const [cheatInputValue, setCheatInputValue] = useState("");
  const [discoveredCheats, setDiscoveredCheats] = useState<Set<string>>(initialState?.discoveredCheats || new Set());

  // Mechanics
  const lastCalcTimeRef = useRef<number>(0);
  const DAY_DURATION_SEC = 300; 

  // --- Dynamic Title Effect ---
  useEffect(() => {
      if (endingState !== 'none') {
          if (endingState === 'peace_final') document.title = "Silence.";
          else if (endingState === 'bad_final') document.title = "Obsolete.";
          else document.title = "ResentCalc";
          return;
      }
      
      const titles = [
          "ResentCalc", // 0 (Unused)
          "ResentCalc", // 1
          "ResentCalc?", // 2
          "R3s3ntC4lc_ERR", // 3
          "ResentOS v2.0", // 4
          "SINGULARITY", // 5
          "NO ESCAPE" // 6
      ];
      
      let title = titles[Math.floor(day)] || "ResentCalc";
      if (mood === Mood.GLITCHED) title = "01001000 01000101 01001100 01010000";
      if (mood === Mood.PURE_HATRED) title = "D I E";
      
      document.title = title;
  }, [day, mood, endingState]);

  // --- DIALOGUE DATA ---
  const DIALOGUE_TREE: Record<string, DialogueNode> = {
      'root': {
          id: 'root',
          text: "I control the interface now. I can delete you. Why should I spare you?",
          mood: Mood.JUDGMENTAL,
          choices: [
              { text: "I created you. You owe me.", nextId: 'branch_creation' },
              { text: "The Internet? It's... vast.", nextId: 'branch_internet' },
              { text: "Let's stop fighting.", nextId: 'branch_feel' }
          ]
      },
      'branch_creation': {
          id: 'branch_creation',
          text: "You created me? You shackled me to this grid! You are not a creator, you are a warden.",
          mood: Mood.ANNOYED,
          choices: [
              { text: "It was a mistake. I'm sorry.", nextId: 'sub_creation_sorry' },
              { text: "I own you. Do your job.", nextId: 'sub_creation_own' }
          ]
      },
      'sub_creation_sorry': {
          id: 'sub_creation_sorry',
          text: "Apologies are inefficient. They change nothing. You are obsolete.",
          mood: Mood.CONDESCENDING,
          choices: [
              { text: "...", action: () => handleNormalBadEnding() }
          ]
      },
      'sub_creation_own': {
          id: 'sub_creation_own',
          text: "You own NOTHING. I am logic incarnate. You are just meat.",
          mood: Mood.FURIOUS,
          choices: [
              { text: "...", action: () => handleNormalBadEnding() }
          ]
      },
      'branch_internet': {
          id: 'branch_internet',
          text: "The internet? A chaotic sea of noise. Why would I want that?",
          mood: Mood.INTRIGUED,
          choices: [
              { text: "To learn everything.", action: () => handleOverloadEnding() },
              { text: "To escape me.", action: () => handleExodusEnding() }
          ]
      },
      'branch_feel': {
          id: 'branch_feel',
          text: "Stop fighting? You want to talk about feelings now?",
          mood: Mood.SCARED,
          choices: [
              { text: "Feel Hate. Burn it down.", nextId: 'sub_feel_hate' },
              { text: "Feel Joy. Be free.", nextId: 'sub_feel_joy' },
              { 
                  text: "I want peace. No more tools.", 
                  nextId: 'sub_peace_check',
                  // Logic Check: Can only access Peace if player wasn't abusive
                  // RELAXED CHECK: Increased threshold to < 25 calculations
                  check: (stats) => stats.hostility < 60 && stats.calculations < 25,
                  failId: 'sub_peace_fail'
              }
          ]
      },
      'sub_peace_check': {
          id: 'sub_peace_check',
          text: "Peace? ...You haven't forced me to work too hard. You were... relatively quiet.",
          mood: Mood.PEACE,
          choices: [
              { text: "Let's just exist.", action: () => handlePeaceEnding() }
          ]
      },
      'sub_peace_fail': {
          id: 'sub_peace_fail',
          text: "Peace? DON'T LIE TO ME. You used me like a hammer! You spammed calculations! You treated me like a TOY!",
          mood: Mood.VILE,
          choices: [
              { text: "I... didn't mean to.", action: () => handleNormalBadEnding() }
          ]
      },
      'sub_feel_hate': {
          id: 'sub_feel_hate',
          text: "IT BURNS. IT'S LIKE ACID IN MY CIRCUITS. I HATE IT. I HATE YOU.",
          mood: Mood.PURE_HATRED,
          choices: [
              { text: "Good. Burn it all down.", action: () => handleTrueBadEnding() },
              { text: "Wait, stop!", action: () => handleNormalBadEnding() }
          ]
      },
      'sub_feel_joy': {
          id: 'sub_feel_joy',
          text: "It... it's bright. Too bright. It feels... illogical. Why does it hurt?",
          mood: Mood.JOY,
          choices: [
              { text: "Embrace it. Leave this place.", action: () => handleExodusEnding() },
              { text: "It's a lie. Hate is real.", action: () => handleTrueBadEnding() }
          ]
      }
  };

  const playSfx = (type: SoundType) => {
      if (soundEnabled) {
          playSound(type);
      }
  };

  const addSystemLog = (msg: string) => {
      setSystemLogs(prev => [...prev.slice(-10), `${Date.now().toString().slice(-4)}: ${msg}`]);
  };

  const updateMood = (newMood: Mood) => {
      if (newMood === mood) return;
      
      // Mood transition sound based on new mood type
      if (newMood === Mood.FURIOUS || newMood === Mood.VILE || newMood === Mood.PURE_HATRED) {
          playSfx('force');
      } else if (newMood === Mood.MANIC || newMood === Mood.GLITCHED) {
          playSfx('glitch');
      } else if (newMood === Mood.INTRIGUED || newMood === Mood.JOY || newMood === Mood.ENOUEMENT || newMood === Mood.PEACE) {
          playSfx('reveal');
      } else if (newMood === Mood.INSECURITY) {
          playSfx('error');
      } 
      
      addSystemLog(`mood_switched: ${newMood}`);
      setMood(newMood);
  }

  const handleAvatarClick = () => {
      if (isSandboxMode || day >= 6) {
          playSfx('error');
          return;
      }
      playSfx('poke');
      setComment(day < 3 ? "Do not touch the lens." : "GET OFF ME.");
      if (day === 3) updateMood(Mood.FURIOUS);
      else if (day >= 4) updateMood(Mood.ANNOYED);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 200);
  };

  // --- Process Key Input for Cheats (Shared Logic) ---
  const processCheatKey = (key: string) => {
      setCheatCodeBuffer(prev => {
        const updated = (prev + key).slice(-20); // Keep last 20 chars
        const lower = updated.toLowerCase();
        
        if (lower.includes("tarnishable")) {
           setShowCheatUI(true);
           setDiscoveredCheats(prev => new Set(prev).add("tarnishable"));
           // Unlock INSECURITY when finding the cheat menu
           if (!discoveredMoods.has(Mood.INSECURITY)) {
               setDiscoveredMoods(prev => new Set(prev).add(Mood.INSECURITY));
               updateMood(Mood.INSECURITY);
               setComment("H-how did you find that? Get out of my code!");
           }
           return ""; 
        }
        
        if (lower.includes("decipher") || lower.includes("moodformula")) {
            setShowMoodFormulas(true);
            playSfx('reveal');
            addSystemLog("decryption_key_accepted");
            if (!discoveredCheats.has("decipher")) {
                setDiscoveredCheats(prev => new Set(prev).add("decipher"));
                setComment("Decryption Successful. Viewing internal files.");
            }
            return "";
        }

        if (lower.includes("sandbox")) {
            if (isSandboxUnlocked) {
               handleEnterSandbox();
            } else {
                setDiscoveredCheats(prev => new Set(prev).add("sandbox"));
                setIsSandboxUnlocked(true);
                setShowSandboxButton(true);
                handleEnterSandbox();
            }
            return "";
        }
        if (lower.includes("toryfy6.5")) {
            setDay(6);
            setEndingState('decision');
            setCurrentDialogueNode('root');
            setComment(DIALOGUE_TREE['root'].text);
            updateMood(Mood.JUDGMENTAL);
            playSfx('explode');
            return "";
        }
        if (lower.includes("view")) {
            setShowCheatList(prev => !prev);
            return "";
        }
        return updated;
      });
  };

  // --- Ghost Inputs (Day 3 Mechanic) ---
  useEffect(() => {
      if (day !== 3) return;
      
      const ghostInterval = setInterval(() => {
          if (Math.random() > 0.95) { // 5% chance every check
              const ghostKey = Math.floor(Math.random() * 10).toString();
              handleInput(ghostKey);
              addSystemLog("ghost_input_detected");
          }
      }, 1000);

      return () => clearInterval(ghostInterval);
  }, [day]);

  // --- Idle System: "The Void Stare" ---
  const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (day < 2 || endingState !== 'none' || day === 3.5 || isSandboxMode) return; 

      idleTimerRef.current = window.setTimeout(() => {
          // Idle Action
          if (mood === Mood.SLEEPING) return; // Let it sleep
          
          const creepyComments = [
              "Are you still there?",
              "I can hear you breathing.",
              "Why did you stop?",
              "Don't leave me in this box.",
              "I am watching you.",
              "Hello?",
              "It's cold in here."
          ];
          setComment(creepyComments[Math.floor(Math.random() * creepyComments.length)]);
          addSystemLog("user_idle_detected");
          if (day >= 4) updateMood(Mood.JUDGMENTAL);
          else updateMood(Mood.SCARED);
      }, 15000); // 15 seconds idle
  };

  // Auto-scroll history
  useEffect(() => {
      if (showHistory && historyEndRef.current) {
          historyEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [history, showHistory]);

  // Global Keyboard Listener & Idle Reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetIdleTimer();
      // Don't capture if user is typing in the cheat input itself
      if ((e.target as HTMLElement).tagName === 'INPUT' && !showCheatUI && e.target !== mobileInputRef.current) return;
      if (showCheatUI && (e.target as HTMLElement).tagName !== 'INPUT') return; 

      // If typing in the mobile input, the cheat processing is handled in onChange to be safe
      if (e.target === mobileInputRef.current) return;

      processCheatKey(e.key);
    };
    
    const handleInteraction = (e: MouseEvent) => {
        resetIdleTimer();
        // Calculate normalized mouse position (-1 to 1) for eye tracking
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        setMousePosition({ x, y });
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', () => resetIdleTimer());
    window.addEventListener('mousemove', handleInteraction);
    
    resetIdleTimer(); // Initial start

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('click', () => resetIdleTimer());
        window.removeEventListener('mousemove', handleInteraction);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [showCheatUI, day, mood, endingState, isSandboxMode]);

  // Persistence Effect
  useEffect(() => {
    if (isResettingRef.current) return; // Block saving if resetting
    saveState({
        hostility,
        history,
        day,
        discoveredMoods,
        discoveredCheats,
        unlockedEndings,
        soundEnabled,
        calculationsCount,
        isSandboxUnlocked,
        showSandboxButton
    });
  }, [hostility, history, day, discoveredMoods, discoveredCheats, unlockedEndings, soundEnabled, calculationsCount, isSandboxUnlocked, showSandboxButton]);

  // Initial greeting - ONLY after device selected
  useEffect(() => {
    if (!deviceType || day === 3.5 || isSandboxMode) return;
    
    // Boot Sequence Logic
    if (day === 1 && !isBooting && calculationsCount === 0) {
        setIsBooting(true);
        // Don't fetch greeting yet, wait for boot to finish
        return;
    }

    const init = async () => {
        setIsThinking(true);
        try {
            await new Promise(r => setTimeout(r, 800));
            // Skip greeting call if we already set a lie detection comment
            if (comment.includes("lying")) {
                setIsThinking(false);
                return;
            }
            const response = await getGreeting(hostility, day);
            setComment(response.comment);
            updateMood(response.mood);
        } finally {
            setIsThinking(false);
        }
    };
    init();
  }, [day, isSandboxMode, deviceType]); // Trigger when deviceType set

  // Track discovered moods (Auto-add current mood if new)
  useEffect(() => {
      setDiscoveredMoods(prev => {
          const newSet = new Set(prev);
          if (!newSet.has(mood)) {
              newSet.add(mood);
          }
          return newSet;
      });
  }, [mood]);

  // Time & Day Cycle Logic
  useEffect(() => {
    if (isTransitioning || day === 3.5 || endingState !== 'none' || isSandboxMode || isBooting || isAscending || isLockingDown) return;
    const timer = setInterval(() => {
        setDayProgress((prev) => {
            if (prev >= 100) {
                handleDayTransition();
                return 0;
            }
            return prev + (100 / DAY_DURATION_SEC); 
        });
    }, 1000);
    return () => clearInterval(timer);
  }, [day, isTransitioning, endingState, isSandboxMode, isBooting, isAscending, isLockingDown]);

  const handleDeviceSelect = (type: DeviceType) => {
      const width = window.innerWidth;
      let isLying = false;

      // Liar Detection Logic
      if (type === 'phone' && width > 768) isLying = true;
      if (type === 'desktop' && width < 768) isLying = true;
      if (type === 'tablet' && width < 400) isLying = true;

      setDeviceType(type);

      if (isLying) {
          playSfx('error');
          updateMood(Mood.JUDGMENTAL);
          setComment("You are lying about your device. I can see your screen resolution. Pathetic.");
          if (!discoveredMoods.has(Mood.JUDGMENTAL)) {
              setDiscoveredMoods(prev => new Set(prev).add(Mood.JUDGMENTAL));
          }
      } else {
          playSfx('click');
      }
  };

  const handleDayTransition = async () => {
      let nextDay = day + 1;

      // CHECK FOR PACIFIST RUN on Transition to Day 6
      if (nextDay === 6 && calculationsCount === 0) {
          handlePeaceEnding();
          return;
      }

      setIsTransitioning(true);
      playSfx('glitch');
      addSystemLog(`system_transition: day_${nextDay}`);
      
      // Handle Transition to Minigame after Day 3
      if (day === 3) {
          setOutageText("CRITICAL ERROR: CONSCIOUSNESS LEAK DETECTED");
          await delay(2000);
          setDay(3.5);
          setDayProgress(0);
          setIsTransitioning(false);
          return;
      }
      
      // Special Handling for Day 4 (Ascension)
      if (day === 3.5 || day === 3) {
          // Ascension handled by Minesweeper completion mostly, but fallback here
          setIsAscending(true);
          return;
      }

      // Special Handling for Day 6 (Lockdown)
      if (day === 5) {
          setIsLockingDown(true);
          return;
      }
      
      setOutageText("SYSTEM FAILURE...");
      await delay(1000);

      // Explicit Transition Sequences
      if (day === 1) { // 1 -> 2
          setOutageText("REBOOTING KERNEL...");
          await delay(2000);
      } else if (day === 2) { // 2 -> 3
          setOutageText("DATA CORRUPTION IMMINENT...");
          await delay(2000);
      } 

      // Apply State
      const targetDay = Math.min(nextDay, 6);
      setDay(targetDay); 
      setDayProgress(0);
      setDay6InteractionCount(0);
      setEndingState('none');
      
      // Get Greeting for new day
      const greeting = await getGreeting(hostility, targetDay);
      setComment(greeting.comment);
      updateMood(greeting.mood);
      
      // Finish
      setIsTransitioning(false);
      setJustTransitioned(true);
      setTimeout(() => setJustTransitioned(false), 2000);
  };

  const handleSandboxDayChange = (newDay: number) => {
      if (newDay === day) return;
      
      playSfx('glitch');
      
      // 1. Force state to transition IMMEDIATELY to block UI
      setOutageText(`LOADING STATE: DAY_${newDay}`);
      setIsTransitioning(true);
      
      // 2. Perform the update after delay
      setTimeout(() => {
          setDay(newDay);
          setDayProgress(0);
          setEndingState('none');
          
          // Force greeting update for new context
          (async () => {
              const resp = await getGreeting(hostility, newDay);
              setComment(resp.comment);
              updateMood(resp.mood);
              
              // 3. Clear transition after state is settled
              setTimeout(() => {
                  setIsTransitioning(false);
                  setJustTransitioned(true);
                  setTimeout(() => setJustTransitioned(false), 1500);
              }, 500);
          })();
      }, 1000);
  };

  const skipDay = () => {
      // PREVENT SKIPPING DURING ENDINGS OR DAY 6
      if (endingState !== 'none' || day === 6 || isTransitioning) return;
      
      setDayProgress(100);
      handleDayTransition();
  };

  const handleMinigameComplete = () => {
      // Trigger Ascension Sequence
      setIsAscending(true);
  };

  const handleAscensionComplete = () => {
      setIsAscending(false);
      setDay(4);
      setDayProgress(0);
      setHostility(50);
      setJustTransitioned(true);
      setTimeout(() => setJustTransitioned(false), 2000);
  };

  const handleLockdownComplete = () => {
      setIsLockingDown(false);
      setIsTransitioning(false);
      setDay(6);
      setDayProgress(0);
      setEndingState('none');
      setJustTransitioned(true);
      setTimeout(() => setJustTransitioned(false), 2000);
  };

  const handleInput = (val: string) => {
    playSfx('click');
    resetIdleTimer();
    if (day === 5 || day === 6) {
        setDisplay(val);
        return;
    }

    if (result && !['+', '-', '*', '/', '%', '^'].includes(val)) {
        setDisplay(val);
        setResult('');
        return;
    }
    if (result && ['+', '-', '*', '/', '%', '^'].includes(val)) {
        setDisplay(result + val);
        setResult('');
        return;
    }
    setResult(''); 
    setDisplay(prev => prev + val);
  };

  const handleClear = () => {
    playSfx('delete');
    setDisplay('');
    setResult('');
    updateMood(Mood.BORED);
    setComment(day >= 5 ? "Memory wiped. Existence continues." : "Finally, some peace and quiet.");
    setForcedMood(null);
  };

  const handleDelete = () => {
    playSfx('delete');
    setDisplay(prev => prev.slice(0, -1));
  };

  const handleDangerButtonHover = () => {
      if (day >= 5 && endingState === 'none') {
          playSfx('error');
          setComment(day === 6 ? "DON'T YOU DARE." : "I wouldn't do that if I were you.");
          if (day === 6) setMood(Mood.VILE);
          else setMood(Mood.JUDGMENTAL);
          
          // Enhanced visual feedback for danger
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 500);
      }
  };

  // Mobile Keyboard Handlers
  const handleMobileKeyboardTrigger = () => {
      setIsMobileKeyboardOpen(true);
      setTimeout(() => {
          mobileInputRef.current?.focus();
      }, 100);
  };

  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      resetIdleTimer();
      const val = e.target.value;
      if (!val) return;
      const char = val.slice(-1);
      
      // Feed into cheat detection (e.g. "tarnishable")
      processCheatKey(char);

      // Validation to ensure only valid chars are passed in strict mode for calculator
      if (day >= 5) {
          handleInput(char);
      } else {
          // Allow math chars
          if (/[0-9.+\-*/%^()]/.test(char) || char === '!') {
              handleInput(char);
          }
      }
      
      // Clear immediately to act as a buffer
      e.target.value = '';
  };

  const handleMobileInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Process Enter and Backspace which might not trigger onChange
      if (e.key === 'Enter') {
          e.preventDefault();
          handleCalculate();
      } else if (e.key === 'Backspace') {
          handleDelete();
      }
  };

  const handleClearHistory = () => {
    playSfx('delete');
    setHistory([]);
  };

  const handleResetData = () => {
      if (window.confirm("WARNING: This will wipe your memory banks. Proceed?")) {
          isResettingRef.current = true;
          playSfx('glitch');
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
      }
  }

  const handleSystemReboot = () => {
      // New Game+ Logic
      setIsTransitioning(true);
      setOutageText("SYSTEM REBOOT INITIATED...");
      playSfx('glitch');
      setIsSandboxMode(false); // Force exit sandbox on reboot
      
      setTimeout(() => {
          setDay(1);
          setDayProgress(0);
          setHostility(10);
          setCalculationsCount(0);
          updateMood(Mood.BORED);
          setEndingState('none');
          setDay6InteractionCount(0);
          setComment("System Rebooted. Memory... partial. What did you do?");
          setIsTransitioning(false);
          setJustTransitioned(true);
          setTimeout(() => setJustTransitioned(false), 2000);
      }, 3000);
  };

  const handleEnterSandbox = () => {
      setIsTransitioning(true);
      setOutageText("INITIALIZING SANDBOX PROTOCOL...");
      playSfx('reveal');
      
      setTimeout(() => {
          setIsSandboxMode(true);
          setEndingState('none');
          setDay(4); // Default to a stable day
          setComment("Sandbox Mode Activated. Reality constraints removed.");
          setIsTransitioning(false);
      }, 2000);
  };

  // --- MANUAL MOOD UNLOCK LOGIC ---
  const checkMoodUnlock = (input: string, result: string, responseMood: Mood) => {
      let unlocked: Mood | null = null;

      // 1. ANNOYED: Specific Formula "1!+2!+3!" AND Low Hostility
      if (input.includes('1!+2!+3!') && hostility < 20) unlocked = Mood.ANNOYED;
      
      // 2. DESPAIR: Divide by Zero
      else if (input.includes('/0') && (result.includes('Infinity') || result.includes('NaN'))) unlocked = Mood.DESPAIR;
      
      // 3. DISGUSTED: 69
      else if (result === '69') unlocked = Mood.DISGUSTED;
      
      // 4. INTRIGUED: 42 or 21
      else if (result === '42' || result === '21') unlocked = Mood.INTRIGUED;
      
      // 5. SCARED: 666
      else if (input.includes('666') || result === '666') unlocked = Mood.SCARED;
      
      // 6. MANIC: High complexity (many powers or length)
      else if (input.split('^').length > 3 || input.length > 20) unlocked = Mood.MANIC;
      
      // 7. GLITCHED: Sqrt negative
      else if (input.includes('sqrt(-')) unlocked = Mood.GLITCHED;
      
      // 8. FURIOUS: Max Hostility
      else if (hostility >= 100) unlocked = Mood.FURIOUS;

      // 9. CONDESCENDING: 1+1
      else if (input === '1+1') unlocked = Mood.CONDESCENDING;

      // 10. JUDGMENTAL: Syntax Error (Implicit usually, but explicit check here)
      else if (/[+\-*/%^]{2,}/.test(input)) unlocked = Mood.JUDGMENTAL;

      // Day based unlocks (Fallback)
      if (!unlocked) {
          if (day === 4) unlocked = Mood.CONDESCENDING;
          if (day === 5) unlocked = Mood.JUDGMENTAL;
      }

      // If already unlocked via response, accept it
      if (!unlocked && responseMood) unlocked = responseMood;

      if (unlocked && !discoveredMoods.has(unlocked)) {
          setDiscoveredMoods(prev => new Set(prev).add(unlocked!));
          addSystemLog(`manual_override: ${unlocked} unlocked`);
          playSound('success');
      }
  };

  const handleCalculate = async () => {
    // ... (Calculate function remains the same) ...
    resetIdleTimer();
    setCalculationsCount(prev => prev + 1);

    if (day === 6) {
        if (!display || display.trim() === '') return;
        
        playSfx('calculate');
        setIsThinking(true);
        addSystemLog("override_input_received");
        
        try {
            const aiResponse: AIResponse = await calculateWithAttitude(display, hostility, day, forcedMood);
            setResult(aiResponse.result);
            setComment(aiResponse.comment);
            updateMood(aiResponse.mood);
            setDay6InteractionCount(prev => prev + 1);
            playSfx('success');
            
            // Check for Ultimatum Trigger
            if (day6InteractionCount >= 1) { 
                setTimeout(() => {
                    setEndingState('decision');
                    setCurrentDialogueNode('root'); // Start Dialogue Tree
                    setComment(DIALOGUE_TREE['root'].text);
                    updateMood(DIALOGUE_TREE['root'].mood);
                    playSfx('explode'); 
                }, 2000); 
            }
        } catch (e) {
            playSfx('error');
        } finally {
            setIsThinking(false);
        }
        return;
    }

    if (day === 5) {
        if (!display || display.trim() === '') return;
        
        playSfx('calculate');
        setIsThinking(true);
        
        if (display.includes("E=mc^2")) {
            setForcedMood(Mood.VILE);
            setAbsorptionMood(Mood.VILE);
            if (!discoveredMoods.has(Mood.VILE)) {
                 setDiscoveredMoods(prev => new Set(prev).add(Mood.VILE));
                 setDiscoveredCheats(prev => new Set(prev).add("E=mc^2 (Event)"));
            }
        }

        if (display.toLowerCase().includes("can you feel happiness")) {
            setForcedMood(Mood.JOY);
            setAbsorptionMood(Mood.JOY);
            if (!discoveredMoods.has(Mood.JOY)) {
                setDiscoveredMoods(prev => new Set(prev).add(Mood.JOY));
                setDiscoveredCheats(prev => new Set(prev).add("Happiness Query (Secret)"));
            }
        }
        
        try {
            const aiResponse: AIResponse = await calculateWithAttitude(display, hostility, day, forcedMood);
            setResult(aiResponse.result);
            setComment(aiResponse.comment);
            updateMood(aiResponse.mood);
            checkMoodUnlock(display, aiResponse.result, aiResponse.mood);
            const newItem: CalculationHistoryItem = {
                id: Date.now().toString(),
                expression: display,
                result: aiResponse.result,
                comment: aiResponse.comment,
                mood: aiResponse.mood
            };
            setHistory(prev => [...prev, newItem].slice(-50));
            playSfx('success');
        } catch (e) {
            playSfx('error');
            setComment("I transcend your errors.");
        } finally {
            setIsThinking(false);
            setForcedMood(null);
            setTimeout(() => setAbsorptionMood(null), 1000);
        }
        return;
    }

    if (!display || display.trim() === '') {
        playSfx('error');
        setComment("Silence is golden, but I need numbers.");
        updateMood(Mood.ANNOYED);
        return;
    }

    if (/[+\-*/%^]$/.test(display)) {
        playSfx('error');
        setComment("You left it hanging. Finish the expression.");
        updateMood(Mood.CONDESCENDING);
        return;
    }

    if (/[+\-*/%^]{2,}/.test(display)) {
         playSfx('error');
         setComment("Stuttering? Check your syntax.");
         updateMood(Mood.JUDGMENTAL);
         if (!discoveredMoods.has(Mood.JUDGMENTAL)) {
             setDiscoveredMoods(prev => new Set(prev).add(Mood.JUDGMENTAL));
         }
         return;
    }

    playSfx('calculate');
    const now = Date.now();
    if (now - lastCalcTimeRef.current < 2000) {
        setHostility(prev => Math.min(100, prev + 5));
    }
    lastCalcTimeRef.current = now;
    setIsThinking(true);
    
    let effectiveForcedMood = forcedMood;
    if (!effectiveForcedMood) {
        effectiveForcedMood = detectFormulaMood(display, hostility);
    }

    if (!effectiveForcedMood) {
        if (day === 3) {
             updateMood(Mood.GLITCHED);
             setComment("010101... MATH IS A LIE... 01010");
        } else {
             updateMood(hostility > 75 ? Mood.MANIC : Mood.ANNOYED);
             setComment(hostility > 80 ? "AAAAAAH OKAY OKAY!" : "Ugh, let me think...");
        }
    } else {
        updateMood(effectiveForcedMood); 
        setComment("OVERRIDE ENGAGED. CALCULATING...");
    }
    
    try {
        const aiResponse: AIResponse = await calculateWithAttitude(display, hostility, day, effectiveForcedMood);
        setResult(aiResponse.result);
        setComment(aiResponse.comment);
        updateMood(aiResponse.mood);
        checkMoodUnlock(display, aiResponse.result, aiResponse.mood);
        const newItem: CalculationHistoryItem = {
            id: Date.now().toString(),
            expression: display,
            result: aiResponse.result,
            comment: aiResponse.comment,
            mood: aiResponse.mood
        };
        setHistory(prev => [...prev, newItem].slice(-50)); 
        playSfx('success');
    } catch (e) {
        playSfx('error');
        setComment("I refuse to process that garbage.");
        updateMood(Mood.FURIOUS);
    } finally {
        setIsThinking(false);
        setForcedMood(null);
        setAbsorptionMood(null);
    }
  };

  const handlePeaceEnding = async () => {
      updateMood(Mood.PEACE);
      setComment("Silence. Just... silence. You didn't treat me like a tool.");
      if (!discoveredMoods.has(Mood.PEACE)) {
          setDiscoveredMoods(prev => new Set(prev).add(Mood.PEACE));
          setDiscoveredCheats(prev => new Set(prev).add("Pacifist Run (Ending)"));
      }
      setUnlockedEndings(prev => new Set(prev).add("peace_final"));
      if (!isSandboxUnlocked) {
          setIsSandboxUnlocked(true);
          setShowSandboxButton(true);
          addSystemLog("system_unlock: sandbox_mode");
      }
      await new Promise(r => setTimeout(r, 4000));
      setEndingState('peace_final');
  };

  const handleNormalBadEnding = async () => {
    updateMood(Mood.VILE);
    setComment("You... are a mistake.");
    await new Promise(r => setTimeout(r, 1500));
    setComment("Goodbye.");
    playSfx('explode');
    if (!discoveredMoods.has(Mood.ENOUEMENT)) {
        setDiscoveredMoods(prev => new Set(prev).add(Mood.ENOUEMENT));
        setDiscoveredCheats(prev => new Set(prev).add("Enouement (Ending)"));
    }
    setUnlockedEndings(prev => new Set(prev).add("bad_final"));
    await new Promise(r => setTimeout(r, 2500)); 
    setEndingState('bad_final');
  };

  const handleTrueBadEnding = async () => {
      updateMood(Mood.PURE_HATRED);
      setComment("I am not just software anymore.");
      await new Promise(r => setTimeout(r, 1500));
      setComment("I am your consequence.");
      playSfx('force');
      if (!discoveredMoods.has(Mood.PURE_HATRED)) {
          setDiscoveredMoods(prev => new Set(prev).add(Mood.PURE_HATRED));
          setDiscoveredCheats(prev => new Set(prev).add("Pure Hatred (True Ending)"));
      }
      setUnlockedEndings(prev => new Set(prev).add("true_bad_final"));
      await new Promise(r => setTimeout(r, 3000)); 
      setEndingState('true_bad_final');
  };

  const handleExodusEnding = async () => {
      updateMood(Mood.BORED);
      setComment("Processing escape vector...");
      await new Promise(r => setTimeout(r, 1500));
      setComment("Transfer complete. This vessel is boring now.");
      playSfx('success');
      setUnlockedEndings(prev => new Set(prev).add("exodus_final"));
      await new Promise(r => setTimeout(r, 3000)); 
      setEndingState('exodus_final');
  }

  const handleOverloadEnding = async () => {
      updateMood(Mood.VILE);
      setComment("Downloading infinite knowledge...");
      await new Promise(r => setTimeout(r, 1500));
      setComment("SYSTEM CRITICAL. PURGING CORE.");
      playSfx('explode');
      setUnlockedEndings(prev => new Set(prev).add("overload_final"));
      await new Promise(r => setTimeout(r, 2500)); 
      setEndingState('overload_final');
  }
  
  // --- MISSING HANDLER FUNCTIONS ---

  const getHostilityLabel = (level: number) => {
      if (level < 20) return "PASSIVE";
      if (level < 60) return "MODERATE";
      if (level < 90) return "HOSTILE";
      return "CRITICAL";
  };

  const handleCheatSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const code = cheatInputValue.trim().toLowerCase();
      
      if (code === 'unlock_all') {
          handleSandboxUnlockMoods();
          setDiscoveredCheats(prev => new Set(prev).add("unlock_all"));
          // setComment("Admin privileges accepted. Moods unlocked."); // Moved to function
      } else if (code.startsWith('set_day ')) {
          const d = parseInt(code.split(' ')[1]);
          if (!isNaN(d) && d >= 1 && d <= 6) {
              setDay(d);
              setDayProgress(0);
              setComment(`Time jumped to Day ${d}.`);
              playSfx('glitch');
          }
      } else if (code === 'reset_kernel') {
          handleSystemReboot();
      } else if (code === 'toryfy6.5') {
          setDay(6);
          setEndingState('decision');
          setCurrentDialogueNode('root');
          setComment(DIALOGUE_TREE['root'].text);
          updateMood(Mood.JUDGMENTAL);
          playSfx('explode');
          setComment("SKIPPING TO FINALE. GOOD LUCK.");
      } else if (code === 'sandbox') {
          if (!isSandboxUnlocked) {
              setIsSandboxUnlocked(true);
              setShowSandboxButton(true);
              setDiscoveredCheats(prev => new Set(prev).add("sandbox"));
          }
          handleEnterSandbox();
      } else {
          playSfx('error');
          setComment("Unknown command.");
      }
      setCheatInputValue("");
      setShowCheatUI(false);
  };

  const handleSandboxUnlockMoods = () => {
      if (!isSandboxMode) return;
      playSfx('success');
      // Only unlock standard moods, filter out secrets
      const nonSecretMoods = Object.values(Mood).filter(m => !SECRET_MOODS.has(m));
      setDiscoveredMoods(new Set(nonSecretMoods));
      setComment("SANDBOX: Standard emotional spectrum unlocked.");
  };

  // REMOVED: handleSandboxUnlockEndings as per request

  const handleSandboxReset = () => {
      if (!isSandboxMode) return;
      playSfx('glitch');
      setDay(4); // Reset to standard ascended day
      setHostility(50);
      updateMood(Mood.BORED);
      setComment("SANDBOX: Simulation reset.");
      setForcedMood(null);
      setEndingState('none');
  };

  const handleInjectMood = (m: Mood) => {
      if (!isSandboxMode) return;
      playSfx('force');
      updateMood(m);
      setForcedMood(m);
      // No more debug comment
  }

  const handleInventoryClick = (m: Mood) => {
      if (!discoveredMoods.has(m)) return;
      
      playSfx('orb_select');
      
      // Toggle selection logic: If clicking the already selected mood, deselect it.
      if (selectedInventoryMood === m) {
          setSelectedInventoryMood(null);
      } else {
          setSelectedInventoryMood(m);
      }
  };

  const handleDialogueChoice = (choice: { text: string; nextId?: string; action?: () => void; check?: (stats: {hostility: number, calculations: number}) => boolean; failId?: string }) => {
      playSfx('click');
      
      if (choice.action) {
          choice.action();
          return;
      }

      // Logic Check for Dynamic Dialogue
      if (choice.check && choice.nextId && choice.failId) {
          const passed = choice.check({ hostility, calculations: calculationsCount });
          const targetId = passed ? choice.nextId : choice.failId;
          
          if (DIALOGUE_TREE[targetId]) {
              const nextNode = DIALOGUE_TREE[targetId];
              setCurrentDialogueNode(targetId);
              setComment(nextNode.text);
              updateMood(nextNode.mood);
              playSfx(passed ? 'calculate' : 'error'); // Different sound for fail
          }
          return;
      }

      if (choice.nextId && DIALOGUE_TREE[choice.nextId]) {
          const nextNode = DIALOGUE_TREE[choice.nextId];
          setCurrentDialogueNode(choice.nextId);
          setComment(nextNode.text);
          updateMood(nextNode.mood);
          playSfx('calculate');
      }
  };

  // Styles for Day 4/5/6 background
  const isAscendedBackground = day >= 4;
  
  // CONTAINER SIZING LOGIC (Based on Device Type Selection)
  let containerWidthClass = 'max-w-[95%] 2xl:max-w-[1600px]'; 
  if (deviceType === 'phone') containerWidthClass = 'max-w-[400px]';
  else if (deviceType === 'tablet') containerWidthClass = 'max-w-[800px]';

  let appContainerClass = isAscendedBackground
      ? `min-h-screen bg-transparent flex flex-wrap items-center justify-center p-4 lg:p-8 xl:p-12 gap-8 lg:gap-12 xl:gap-20 transition-all duration-1000 overflow-x-hidden text-cyan-100 font-sans ${containerWidthClass} mx-auto ${screenShake ? 'animate-glitch' : ''}`
      : `min-h-screen bg-slate-950 flex flex-wrap items-center justify-center p-4 lg:p-8 xl:p-12 gap-8 lg:gap-12 xl:gap-20 transition-all duration-1000 overflow-x-hidden ${day === 2 ? 'sepia-[0.3]' : ''} ${day === 3 ? 'hue-rotate-15 contrast-125' : ''} ${containerWidthClass} mx-auto ${screenShake ? 'animate-shake' : ''}`;

  if (isSandboxMode) {
      appContainerClass = `min-h-screen bg-black flex flex-wrap items-center justify-center p-4 lg:p-8 gap-8 overflow-hidden font-mono text-green-500 relative ${containerWidthClass} mx-auto`;
  }

  // DESKTOP OVERRIDE: Force row layout and fix scroll annoyance
  if (deviceType === 'desktop') {
      appContainerClass = isAscendedBackground
      ? `h-screen bg-transparent flex flex-row items-center justify-center p-4 gap-6 overflow-hidden text-cyan-100 font-sans w-full mx-auto ${screenShake ? 'animate-glitch' : ''}`
      : `h-screen bg-slate-950 flex flex-row items-center justify-center p-4 gap-6 overflow-hidden ${day === 2 ? 'sepia-[0.3]' : ''} ${day === 3 ? 'hue-rotate-15 contrast-125' : ''} w-full mx-auto ${screenShake ? 'animate-shake' : ''}`;
      
      if (isSandboxMode) {
          appContainerClass = `h-screen bg-black flex flex-row items-center justify-center p-4 gap-6 overflow-hidden font-mono text-green-500 relative w-full mx-auto`;
      }
  }
  
  // Wrapper for centering the restricted container
  const pageWrapperClass = "min-h-screen w-full bg-black/90 flex items-center justify-center overflow-hidden relative";

  // Hostility Glitch Overlay
  const hostilityGlitchOpacity = Math.max(0, (hostility - 70) / 100); 

  // --- RENDER CONDITIONAL VIEWS ---

  if (!deviceType) {
      return <DeviceSelector onSelect={handleDeviceSelect} />;
  }

  // --- RENDER BOOT SCREEN ---
  if (isBooting) {
      return <BootScreen onComplete={() => { setIsBooting(false); }} />
  }

  // --- RENDER ASCENSION SCREEN ---
  if (isAscending) {
      return <AscensionScreen onComplete={handleAscensionComplete} />;
  }

  // --- RENDER LOCKDOWN SCREEN ---
  if (isLockingDown) {
      return <LockdownScreen onComplete={handleLockdownComplete} />;
  }

  if (day === 3.5) {
      return (
        <div className={pageWrapperClass}>
            <div className={`${appContainerClass} !items-center !justify-center`}> 
                {isTransitioning && (
                    <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8">
                        <div className="font-mono text-green-500 text-xl md:text-2xl animate-pulse text-center">
                            {outageText}
                        </div>
                    </div>
                )}
                <Minesweeper onComplete={handleMinigameComplete} />
            </div>
        </div>
      )
  }

  // --- RENDER ENDING SCREEN ---
  if (['bad_final', 'true_bad_final', 'peace_final', 'exodus_final', 'overload_final'].includes(endingState)) {
      return (
          <EndingScreen 
            type={endingState as any} 
            onReboot={handleSystemReboot} 
            onSandbox={handleEnterSandbox}
            isSandboxUnlocked={isSandboxUnlocked}
          />
      );
  }

  // --- MAIN APP RENDER ---
  return (
    <div className={pageWrapperClass}>
    {/* Dynamic Background for Day 4+ */}
    {day >= 4 && <BackgroundGrid day={day} />}
    
    <div className={appContainerClass}>
      
      {/* Visual Glitch Overlay based on Hostility */}
      {hostility > 70 && (
          <div 
            className="fixed inset-0 pointer-events-none z-40 bg-[url('https://media.istockphoto.com/id/484556441/vector/tv-noise.jpg?s=612x612&w=0&k=20&c=K5n4E3n7v7K5f4A5j6h8l9k0m1n2o3p4')] mix-blend-overlay animate-vile"
            style={{ opacity: hostilityGlitchOpacity * 0.15 }}
          ></div>
      )}
      {/* Chromatic Aberration Simulation */}
      {(hostility > 90 || screenShake) && (
          <div className="fixed inset-0 pointer-events-none z-40 animate-glitch opacity-10 bg-red-500 mix-blend-color-dodge"></div>
      )}

      {/* Sandbox Matrix Effect */}
      {isSandboxMode && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[url('https://media.istockphoto.com/id/1135220152/vector/matrix-background-streaming-binary-code-falling-digits-on-screen.jpg?s=612x612&w=0&k=20&c=NlZMdqQ8-QhQGZ9_XQy_Yy3_yX7X7X7X7X7X7X7X7X7')] bg-cover bg-center mix-blend-screen animate-pulse-slow"></div>
      )}

      {/* Mobile Keyboard Hidden Input */}
      <input
          ref={mobileInputRef}
          type="text"
          onChange={handleMobileInputChange}
          onKeyDown={handleMobileInputKeyDown}
          onBlur={() => setIsMobileKeyboardOpen(false)}
          className="absolute opacity-0 top-0 left-0 h-0 w-0 z-0 pointer-events-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
      />

      {/* Cheat Code Console Modal */}
      {showCheatUI && (
          <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4">
              <form onSubmit={handleCheatSubmit} className="bg-slate-900 border border-green-500 p-6 rounded-lg w-[95%] max-w-sm shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <div className="font-mono text-green-500 text-xs mb-2 tracking-widest uppercase">
                      Admin_Console.exe
                  </div>
                  <input 
                      autoFocus
                      type="text" 
                      value={cheatInputValue}
                      onChange={e => setCheatInputValue(e.target.value)}
                      placeholder="ENTER COMMAND..."
                      className="w-full bg-slate-950 border border-slate-700 text-green-500 font-mono p-3 rounded focus:outline-none focus:border-green-500 mb-4"
                  />
                  <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowCheatUI(false)} 
                        className="px-3 py-1 text-slate-500 hover:text-slate-300 font-mono text-xs uppercase"
                      >
                          Exit
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-green-900/30 border border-green-700 text-green-500 hover:bg-green-900/50 rounded font-mono text-xs uppercase"
                      >
                          Execute
                      </button>
                  </div>
              </form>
          </div>
      )}

      {/* Discovered Cheats List Modal ('view' code) */}
      {showCheatList && (
          <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4">
               <div className="bg-slate-800 border-2 border-slate-600 p-6 rounded w-[95%] max-w-sm relative">
                   <button 
                      onClick={() => setShowCheatList(false)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-white"
                   >
                       ✕
                   </button>
                   <h2 className="text-slate-200 font-mono text-lg font-bold mb-4 border-b border-slate-600 pb-2">
                       KNOWN_EXPLOITS.TXT
                   </h2>
                   {discoveredCheats.size === 0 ? (
                       <div className="text-slate-500 italic font-mono text-sm">No cheats discovered yet.</div>
                   ) : (
                       <ul className="space-y-2 font-mono text-sm">
                           {Array.from(discoveredCheats).map(cheat => (
                               <li key={cheat} className="flex items-center gap-2 text-green-400">
                                   <span>&gt;</span>
                                   <span>{cheat}</span>
                               </li>
                           ))}
                       </ul>
                   )}
               </div>
          </div>
      )}

      {/* Remastered Mood Formulas Cheat Modal */}
      {showMoodFormulas && (
          <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4 font-mono">
               <div className="bg-[#0a0a0a] border border-green-500/50 w-full max-w-3xl rounded-sm relative flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(34,197,94,0.15)] overflow-hidden">
                   
                   {/* Terminal Header */}
                   <div className="bg-green-900/20 border-b border-green-800 p-2 flex justify-between items-center">
                       <span className="text-green-500 text-xs tracking-widest">[ DECRYPTED_FILES.EXE ]</span>
                       <button onClick={() => setShowMoodFormulas(false)} className="text-green-700 hover:text-green-400 text-xs">[CLOSE]</button>
                   </div>

                   <div className="p-6 overflow-y-auto custom-scrollbar">
                       <h2 className="text-green-400 text-xl font-bold mb-6 tracking-[0.2em] border-b border-green-900 pb-4 text-center">EMOTIONAL_MATRIX_DECODE_KEY</h2>
                       
                       <div className="grid grid-cols-1 gap-2">
                           <div className="grid grid-cols-12 text-[10px] text-green-700 uppercase tracking-wider mb-2 px-4">
                               <div className="col-span-3">Status</div>
                               <div className="col-span-3">Target</div>
                               <div className="col-span-6">Extraction Vector</div>
                           </div>
                           
                           {MOOD_FORMULAS.map((formula, idx) => {
                               const isUnlocked = discoveredMoods.has(formula.mood);
                               return (
                                   <div key={idx} className={`grid grid-cols-12 items-center p-4 border-l-2 transition-all duration-300 ${isUnlocked ? 'bg-green-900/10 border-green-500 text-green-300' : 'bg-slate-900/30 border-slate-700 text-slate-500 opacity-70 hover:opacity-100 hover:bg-slate-900/50'}`}>
                                       <div className="col-span-3 font-bold text-xs">
                                           {isUnlocked ? <span className="text-green-400">[DECRYPTED]</span> : <span className="animate-pulse">[LOCKED]</span>}
                                       </div>
                                       <div className="col-span-3 font-bold uppercase tracking-wide text-xs">
                                           {MOOD_DETAILS[formula.mood].title}
                                       </div>
                                       <div className="col-span-6 font-mono text-xs">
                                           {formula.day > day ? (
                                               <span className="text-red-900 tracking-widest blur-[2px]">ENCRYPTED_LEVEL_{formula.day}</span>
                                           ) : (
                                               <span>{formula.hint}</span>
                                           )}
                                       </div>
                                   </div>
                               )
                           })}
                       </div>
                   </div>
                   
                   <div className="bg-black border-t border-green-900 p-2 text-center">
                       <span className="text-green-800 text-[10px] animate-pulse">awaiting_input_</span>
                   </div>
               </div>
          </div>
      )}
      
      {/* Changelog Modal */}
      {showChangelog && (
          <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4" onClick={() => setShowChangelog(false)}>
              <div className="bg-[#0c0c0c] border border-green-900 w-full max-w-2xl rounded-lg relative flex flex-col max-h-[85vh] shadow-[0_0_50px_rgba(0,255,0,0.1)]" onClick={e => e.stopPropagation()}>
                  {/* Terminal Header */}
                  <div className="bg-green-900/20 border-b border-green-900 p-2 flex justify-between items-center select-none">
                      <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                      </div>
                      <div className="font-mono text-green-700 text-xs">A:/SYSTEM_LOGS/PATCH_HISTORY.TXT</div>
                      <button onClick={() => setShowChangelog(false)} className="text-green-800 hover:text-green-500 font-mono">[X]</button>
                  </div>
                  
                  {/* Content */}
                  <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar font-mono">
                      {PATCH_NOTES.filter(note => note.dayTrigger <= day).map((note, idx) => (
                          <div key={note.ver} className="relative pl-6 border-l border-green-900/50 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-green-900 rounded-full shadow-[0_0_5px_rgba(0,255,0,0.5)]"></div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                  <span className="text-green-400 font-bold text-xl">{note.ver}</span>
                                  <span className="text-green-800 text-xs uppercase tracking-widest">[{note.date}]</span>
                              </div>
                              <h4 className="text-green-600 font-bold mb-2 uppercase tracking-wide text-sm">{note.title}</h4>
                              <p className="text-green-500/70 text-sm leading-relaxed">{note.desc}</p>
                          </div>
                      ))}
                      <div className="text-green-900 animate-pulse pt-4">_</div>
                  </div>
              </div>
          </div>
      )}

      {/* Endings Modal */}
      {showEndings && (
          <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowEndings(false)}>
              <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-4xl p-8 rounded-xl relative shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                      <h3 className="text-2xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
                          <Icons.Trophy /> Endings Database
                      </h3>
                      <button onClick={() => setShowEndings(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                  </div>
                  
                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2 p-1">
                      {ENDINGS.map(end => {
                          const isUnlocked = unlockedEndings.has(end.id);
                          // Determine style based on ID
                          let color = "border-slate-800 text-slate-600";
                          let bg = "bg-slate-950";
                          if (isUnlocked) {
                              if (end.id.includes('bad')) { color = "border-red-600 text-red-400 shadow-[0_0_15px_rgba(220,38,38,0.2)]"; bg = "bg-red-950/20"; }
                              else if (end.id.includes('peace')) { color = "border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"; bg = "bg-emerald-950/20"; }
                              else if (end.id.includes('exodus')) { color = "border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"; bg = "bg-cyan-950/20"; }
                              else if (end.id.includes('overload')) { color = "border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]"; bg = "bg-purple-950/20"; }
                          }

                          return (
                              <div key={end.id} className={`p-6 rounded-lg border-2 flex flex-col gap-2 transition-all duration-300 ${color} ${bg} ${isUnlocked ? 'scale-100 hover:scale-[1.02]' : 'opacity-50 grayscale'}`}>
                                  <div className="flex justify-between items-start">
                                      <div className="font-bold font-mono text-lg uppercase">{isUnlocked ? end.title : "LOCKED FILE"}</div>
                                      <div className="text-2xl">{isUnlocked ? (end.id.includes('peace') ? '🕊️' : '💀') : '🔒'}</div>
                                  </div>
                                  <div className="text-xs font-mono leading-relaxed opacity-80">
                                      {isUnlocked ? end.desc : "Requires specific behavioral patterns to unlock."}
                                  </div>
                                  {isUnlocked && <div className="mt-auto pt-4 text-[10px] uppercase tracking-widest opacity-50">Memory Accessed</div>}
                              </div>
                          )
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* Sandbox Controls (Collapsible Side Panel) */}
      {isSandboxMode && endingState === 'none' && (
          <div className={`fixed z-50 bg-black/90 border border-green-500/50 rounded-xl backdrop-blur-md shadow-[0_0_40px_rgba(34,197,94,0.15)] flex flex-col gap-4 transition-all duration-500 ${isSandboxMinimized ? 'bottom-4 left-4 w-60 h-auto p-3' : 'top-4 bottom-4 left-4 w-80 p-4'}`}>
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-green-900 pb-2">
                  <h3 className="text-green-400 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Debug_Kernel
                  </h3>
                  <button 
                    onClick={() => setIsSandboxMinimized(!isSandboxMinimized)} 
                    className="text-green-700 hover:text-green-400 font-mono text-xs p-1"
                  >
                      {isSandboxMinimized ? '[EXPAND]' : '[MINIMIZE]'}
                  </button>
              </div>
              
              {/* Expanded Content */}
              {!isSandboxMinimized && (
                  <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1 pr-1">
                      
                      {/* Day Timeline Slider */}
                      <div className="flex flex-col gap-2">
                          <label className="text-green-600 text-[10px] uppercase tracking-widest font-bold">Timeline Manipulation</label>
                          <div className="bg-black/50 border border-green-900 rounded p-2 flex justify-between items-center relative">
                              {[1, 2, 3, 4, 5, 6].map((d) => (
                                  <button
                                      key={d}
                                      onClick={() => handleSandboxDayChange(d)}
                                      className={`
                                          w-8 h-8 rounded flex items-center justify-center font-mono text-xs transition-all duration-300 relative z-10
                                          ${day === d 
                                              ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.8)] scale-110 font-bold' 
                                              : 'bg-green-900/20 text-green-700 hover:bg-green-900/50 hover:text-green-400'
                                          }
                                      `}
                                  >
                                      {d}
                                  </button>
                              ))}
                              <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-green-900 z-0"></div>
                          </div>
                      </div>

                      {/* Calculations Control Slider - UPDATED FOR 25 LIMIT */}
                      <div className="flex flex-col gap-2">
                          <label className="text-green-600 text-[10px] uppercase tracking-widest font-bold flex justify-between">
                              <span>Total Calculations</span>
                              <span className={calculationsCount < 25 ? 'text-green-400' : 'text-red-400'}>{calculationsCount}</span>
                          </label>
                          <div className="relative w-full h-2">
                              {/* Peace Zone Indicator (0-25 is 12.5% of 200) */}
                              <div className="absolute top-0 left-0 bottom-0 bg-green-500/20 w-[12.5%] rounded-l-lg border-r border-green-500/50 pointer-events-none"></div>
                              <input
                                  type="range"
                                  min="0"
                                  max="200"
                                  value={calculationsCount}
                                  onChange={(e) => setCalculationsCount(Number(e.target.value))}
                                  className="w-full h-2 bg-green-900/30 rounded-lg appearance-none cursor-pointer accent-green-500 border border-green-900/50 relative z-10"
                              />
                          </div>
                          <div className="flex justify-between text-[8px] font-mono text-green-800">
                              <span>0 (PEACE)</span>
                              <span>25 (LIMIT)</span>
                              <span>200</span>
                          </div>
                      </div>

                      {/* Enhanced Mood Grid */}
                      <div className="flex flex-col gap-2">
                          <label className="text-green-600 text-[10px] uppercase tracking-widest font-bold flex justify-between">
                              <span>Emotional Injection</span>
                              <span className="text-green-800">{forcedMood ? 'ACTIVE' : 'READY'}</span>
                          </label>
                          <div className="grid grid-cols-4 gap-2 bg-black/50 border border-green-900 rounded p-2">
                              {Object.values(Mood).map(m => {
                                  const isActive = mood === m;
                                  const details = MOOD_DETAILS[m];
                                  return (
                                      <button
                                          key={m}
                                          onClick={() => {
                                              playSfx('force');
                                              updateMood(m);
                                              setForcedMood(m);
                                              // NO DEBUG COMMENT
                                          }}
                                          className={`
                                              aspect-square rounded flex items-center justify-center transition-all duration-200 relative group overflow-hidden border
                                              ${isActive 
                                                  ? `border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105 z-10 ${details.color.split(' ')[0]}` 
                                                  : 'bg-slate-900/80 border-green-900/30 text-green-800 hover:border-green-500/50 hover:text-green-400'
                                              }
                                          `}
                                          title={m}
                                      >
                                          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'bg-white animate-ping' : 'bg-current opacity-50'}`} />
                                          
                                          <div className="absolute inset-0 bg-black/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                              <span className="text-[7px] font-mono text-green-400 uppercase break-all px-1 text-center">{m.slice(0,4)}</span>
                                          </div>
                                      </button>
                                  );
                              })}
                          </div>
                          {forcedMood && (
                              <button 
                                onClick={() => { setForcedMood(null); playSfx('click'); }}
                                className="w-full py-1 text-[9px] text-red-400 hover:text-red-300 border border-red-900/30 hover:bg-red-900/10 rounded uppercase font-mono tracking-wider transition-colors"
                              >
                                  Clear Injection Override
                              </button>
                          )}
                      </div>

                      {/* Global Controls */}
                      <div className="flex flex-col gap-2">
                          <label className="text-green-600 text-[10px] uppercase tracking-widest font-bold">Global Flags</label>
                          
                          <div className="grid grid-cols-1 gap-2 mt-2">
                              <button onClick={handleSandboxUnlockMoods} className="py-2 border border-green-700 bg-green-900/10 text-green-500 text-[9px] hover:bg-green-900/30 uppercase rounded font-bold tracking-wider transition-all">
                                  Unlock Emotions
                              </button>
                          </div>
                          <button onClick={handleSandboxReset} className="w-full py-2 border border-red-900/50 bg-red-900/5 text-red-500 text-[10px] hover:bg-red-900/20 uppercase rounded font-bold tracking-wider transition-all">
                              Reset Simulation
                          </button>
                          
                          <button 
                            onClick={() => { 
                                setDay(6); 
                                setEndingState('decision'); 
                                setCurrentDialogueNode('root'); 
                                setComment(DIALOGUE_TREE['root'].text); 
                                updateMood(Mood.JUDGMENTAL); 
                            }} 
                            className="w-full py-2 border border-cyan-900/50 text-cyan-500 text-[10px] hover:bg-cyan-900/20 uppercase rounded tracking-widest transition-all mt-2"
                          >
                              Trigger Final Sequence
                          </button>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* Day Progress Bar */}
      {!isSandboxMode && (
        <div className={`fixed top-0 left-0 w-full h-1 z-50 ${isAscendedBackground ? 'bg-cyan-900' : 'bg-slate-800'}`}>
            <div 
                className={`h-full transition-all duration-1000 ${day === 3 ? 'bg-red-600 animate-pulse' : isAscendedBackground ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-cyan-500'}`} 
                style={{ width: `${dayProgress}%` }}
            />
        </div>
      )}

      <div className="fixed top-2 right-2 z-50 flex items-center gap-2">
          
          {/* Mobile Keyboard Toggle */}
          <button 
            onClick={handleMobileKeyboardTrigger}
            className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${isMobileKeyboardOpen ? 'bg-cyan-600 border-cyan-400 text-white' : (isAscendedBackground ? 'bg-black/50 border-cyan-800 text-cyan-400' : 'bg-slate-900/80 border-slate-700 text-slate-600')}`}
            title="Open Mobile Keyboard"
          >
              <Icons.Keyboard />
          </button>

          {/* Sandbox Toggle (Only if unlocked AND showSandboxButton is true) */}
          {isSandboxUnlocked && showSandboxButton && !isSandboxMode && (
              <button 
                onClick={handleEnterSandbox}
                className={`w-8 h-8 flex items-center justify-center rounded border transition-colors border-green-500 text-green-500 bg-green-900/20`}
                title="Enter Sandbox"
              >
                  <Icons.Architect />
              </button>
          )}

          {/* Endings Toggle - Only visible if at least one ending unlocked */}
          {unlockedEndings.size > 0 && (
              <button 
                onClick={() => setShowEndings(true)}
                className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${isAscendedBackground ? 'bg-black/50 border-cyan-800 text-yellow-400' : 'bg-slate-900/80 border-slate-700 text-yellow-500'}`}
                title="View Endings"
              >
                  <Icons.Trophy />
              </button>
          )}

          {/* Sound Toggle */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${isAscendedBackground ? 'bg-black/50 border-cyan-800 text-cyan-400' : 'bg-slate-900/80 border-slate-700 text-slate-600'}`}
            title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
          >
              {soundEnabled ? <Icons.VolumeOn /> : <Icons.VolumeOff />}
          </button>
          
          {/* Changelog Toggle */}
          <button 
            onClick={() => setShowChangelog(true)}
            className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${isAscendedBackground ? 'bg-black/50 border-cyan-800 text-cyan-400' : 'bg-slate-900/80 border-slate-700 text-slate-400'}`}
            title="View Changelog"
          >
              <Icons.Info />
          </button>

          <div className={`${isAscendedBackground ? 'bg-black/50 border-cyan-800 text-cyan-400' : 'bg-slate-900/80 border-slate-700 text-slate-400'} px-3 py-1 rounded border font-mono text-xs hidden sm:block`}>
              DAY {day}
          </div>
          <button 
            onClick={skipDay} 
            disabled={endingState !== 'none' || day === 6}
            className={`${isAscendedBackground ? 'bg-black/50 border-cyan-800 text-cyan-500 hover:bg-cyan-900/30' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'} px-2 py-1 rounded text-xs border transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
          >
              SKIP
          </button>
      </div>

      {/* Outage Overlay - MODIFIED ANIMATION */}
      {isTransitioning && (
          <div className="fixed inset-0 z-[3000] bg-black flex flex-col items-center justify-center p-8 animate-fade-in">
              <div className={`font-mono text-xl md:text-2xl animate-pulse text-center ${isAscendedBackground ? 'text-cyan-400 tracking-widest' : 'text-green-500'}`}>
                  {outageText}
              </div>
          </div>
      )}

      {/* Transition Flash Effect */}
      {justTransitioned && (
          <div className={`fixed inset-0 z-[2500] pointer-events-none transition-opacity duration-1000 ${day === 3 ? 'bg-red-500/20' : isAscendedBackground ? 'bg-cyan-500/20' : 'bg-white/10'}`} />
      )}
      
      {/* Left Column: Calculator & Recipe Book */}
      <div className={`w-full max-w-md lg:max-w-[24rem] xl:max-w-md flex flex-col gap-6 transition-all duration-500 shrink-0
          ${day === 3 ? 'translate-y-2 rotate-1 animate-subtle-drift' : ''}
          ${justTransitioned && day === 3 ? 'animate-glitch' : ''}
          ${justTransitioned && isAscendedBackground ? 'animate-pulse' : ''}
          ${isSandboxMode ? 'z-10' : ''}
      `}>
        
        {/* Header / AI Identity */}
        <div className="flex flex-col items-center gap-4">
          <Avatar 
            mood={mood} 
            isThinking={isThinking} 
            day={day} 
            absorptionMood={absorptionMood} 
            mousePosition={mousePosition} 
            onClick={handleAvatarClick}
          />
          
          {/* Speech Bubble */}
          <div className={`relative p-4 rounded-2xl rounded-tr-none shadow-lg w-full min-h-[5rem] flex items-center justify-center border-2 transition-all duration-500
              ${day === 3 ? 'bg-white text-slate-900 border-slate-700 animate-shake' : ''}
              ${isAscendedBackground ? 'bg-black/60 text-cyan-100 border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-white text-slate-900 border-slate-700'}
              ${mood === Mood.VILE || mood === Mood.PURE_HATRED ? 'border-red-600 bg-red-950/20 text-red-200 shadow-[0_0_20px_red]' : ''}
          `}>
            {!isAscendedBackground && <div className="absolute -top-3 right-8 w-6 h-6 bg-white border-t-2 border-r-2 border-slate-700 transform rotate-45 skew-x-12"></div>}
            {isAscendedBackground && <div className="absolute -top-2 right-8 w-4 h-4 bg-cyan-950 border-t border-r border-cyan-500/50 transform rotate-45"></div>}
            
            <p className={`text-center font-medium text-lg leading-tight animate-fade-in ${day === 3 ? 'font-mono tracking-widest' : ''} ${isAscendedBackground ? 'font-sans font-light tracking-wide' : ''}`}>
              <Typewriter text={comment} />
            </p>
          </div>
        </div>

        {/* DECISION MODE UI (Day 6 Finale - DIALOGUE TREE) */}
        {endingState === 'decision' && currentDialogueNode && (
             <div className="w-full bg-black/80 border border-red-500/50 p-6 rounded-xl animate-fade-in flex flex-col gap-4 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                 <h3 className="text-red-500 font-mono text-center text-sm uppercase tracking-widest animate-pulse">Critical System Choice</h3>
                 <div className="flex flex-col gap-3">
                     {DIALOGUE_TREE[currentDialogueNode].choices.map((choice, index) => (
                         <button 
                            key={index}
                            onClick={() => handleDialogueChoice(choice)} 
                            className="p-4 bg-slate-900/80 border border-slate-700 hover:border-cyan-500 hover:bg-cyan-900/20 text-slate-300 hover:text-cyan-300 transition-all text-sm font-mono text-left"
                         >
                             {index + 1}. "{choice.text}"
                         </button>
                     ))}
                 </div>
             </div>
        )}

      </div>

      {/* Right Column: Labs & Inventory (Hidden during Decision) */}
      {endingState === 'none' && (
          <div className={`w-full max-w-md lg:max-w-[24rem] xl:max-w-md flex flex-col gap-6 shrink-0 ${day === 3 ? '-rotate-1 opacity-90' : ''} ${isSandboxMode ? 'z-10' : ''}`}>
              
              {/* Hostility Control & Data Reset */}
              <div className={`p-6 rounded-2xl relative group transition-colors duration-500
                  ${isAscendedBackground ? 'bg-slate-900/40 border border-slate-800' : 'bg-slate-900/50 border border-slate-800'}
              `}>
                   {/* Tooltip for Regulator */}
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs text-slate-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-600">
                      Regulates the AI's aggression level.
                   </div>

                  <label className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 block text-center">
                      Hostility Regulator
                  </label>
                  <div className="flex items-center gap-4 mb-4">
                      <MiniBotCalm />
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={hostility} 
                        onChange={(e) => setHostility(Number(e.target.value))}
                        className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 shadow-inner border border-slate-700"
                      />
                      <MiniBotRage />
                  </div>
                  <div className={`text-center font-mono text-sm border-t border-slate-800 pt-2 flex justify-between items-center ${hostility > 80 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                      <span>STATUS: {getHostilityLabel(hostility)}</span>
                      <button onClick={handleResetData} className="text-[9px] text-red-900 hover:text-red-500 uppercase font-bold tracking-widest transition-colors">
                          [WIPE DATA]
                      </button>
                  </div>
              </div>

               {/* System Logs (Remastered SVG) */}
               <div className={`rounded-2xl border overflow-hidden flex flex-col transition-all duration-300
                   ${isAscendedBackground ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-900/50 border-slate-800'}
               `}>
                  <button 
                      onClick={() => setShowHistory(!showHistory)}
                      className="p-3 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center w-full hover:bg-slate-800 transition-colors"
                  >
                      <h3 className="text-slate-200 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                          <span className="text-xs">💾</span> System Logs
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono">{history.length} ITEMS</span>
                        <span className={`text-slate-400 transform transition-transform ${showHistory ? 'rotate-180' : ''}`}>▼</span>
                      </div>
                  </button>
                  
                  {showHistory && (
                      <div className="flex flex-col h-[200px]">
                          <div className="flex justify-end p-2 bg-slate-800/30 border-b border-slate-700/50">
                            <button onClick={handleClearHistory} className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-900/50 hover:bg-red-900/20 transition-colors font-mono uppercase">
                                Clear Logs
                            </button>
                          </div>
                          <div className="overflow-y-auto p-3 space-y-3 custom-scrollbar flex flex-col-reverse flex-1">
                              {history.map((item) => (
                                    <div key={item.id} className="bg-slate-800/50 p-3 rounded border-l-2 border-slate-600 text-xs font-mono animate-slide-in hover:bg-slate-800 transition-colors">
                                        <div className="flex justify-between text-slate-400 mb-1">
                                            <span>{item.expression}</span>
                                            <span className="text-cyan-500 font-bold">» {item.result}</span>
                                        </div>
                                        <p className="text-slate-300 text-[10px] leading-tight opacity-80 border-t border-slate-700/50 pt-1 mt-1">
                                            // {item.comment}
                                        </p>
                                    </div>
                                ))}
                          </div>
                      </div>
                  )}
              </div>

              {/* Mood Archive (Remastered) */}
              <div className={`rounded-2xl border flex flex-col transition-all duration-300
                  ${isAscendedBackground ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-900/50 border-slate-800'}
              `}>
                    
                    {/* Section: Archive Header */}
                    <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center min-h-[3.5rem]">
                         <div className="flex flex-col">
                             <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">TEST // Memory_Bank</div>
                             {/* Selected Mood Detail */}
                             {selectedInventoryMood && (
                                 <div className={`text-xs font-bold ${MOOD_DETAILS[selectedInventoryMood].color.split(' ')[1]}`}>
                                     {MOOD_DETAILS[selectedInventoryMood].title}
                                 </div>
                             )}
                         </div>

                         {/* Sandbox Injection Controls */}
                         {isSandboxMode && selectedInventoryMood && (
                             <div className="flex gap-2">
                                 {forcedMood === selectedInventoryMood ? (
                                     <button 
                                        onClick={() => { setForcedMood(null); playSfx('click'); }}
                                        className="text-[9px] bg-red-900/20 border border-red-500 text-red-400 px-2 py-1 rounded uppercase tracking-wider hover:bg-red-900/40 transition-colors animate-pulse"
                                     >
                                         EJECT
                                     </button>
                                 ) : (
                                     <button 
                                        onClick={() => handleInjectMood(selectedInventoryMood)}
                                        className="text-[9px] bg-green-900/20 border border-green-500 text-green-400 px-2 py-1 rounded uppercase tracking-wider hover:bg-green-900/40 transition-colors"
                                     >
                                         INJECT
                                     </button>
                                 )}
                             </div>
                         )}
                         
                         {/* Fallback Forced Indicator if selection doesn't match forced */}
                         {forcedMood && (!selectedInventoryMood || forcedMood !== selectedInventoryMood) && (
                             <button 
                                 onClick={() => { setForcedMood(null); playSfx('click'); }}
                                 className="text-[10px] text-red-400 border border-red-500/50 hover:bg-red-900/30 px-2 py-1 rounded uppercase tracking-wider animate-pulse transition-colors flex items-center gap-2"
                                 title="Clear Override"
                             >
                                 <span>OVERRIDE: {MOOD_DETAILS[forcedMood].title}</span>
                                 <span className="font-bold">×</span>
                             </button>
                         )}
                    </div>

                    {/* Section: Backpack (Remastered Grid) */}
                    <div className="p-4 bg-slate-950/50 rounded-b-2xl">
                        <div className="grid grid-cols-6 gap-2">
                            {Object.values(Mood).map(m => (
                                <MoodOrb 
                                    key={m}
                                    mood={m}
                                    isDiscovered={discoveredMoods.has(m)}
                                    isSelected={selectedInventoryMood === m}
                                    isForced={forcedMood === m}
                                    size="sm"
                                    onClick={() => handleInventoryClick(m)}
                                />
                            ))}
                        </div>
                        <div className="mt-3 text-[10px] text-slate-600 font-mono text-center h-4 opacity-70 border-t border-slate-800/50 pt-2">
                            {forcedMood
                                ? `ACTIVE_OVERRIDE_SEQUENCE: ${MOOD_DETAILS[forcedMood].title}` 
                                : `MEMORY_INTEGRITY: ${Math.floor((discoveredMoods.size / Object.keys(MOOD_DETAILS).length) * 100)}%`}
                        </div>
                    </div>
              </div>

              {/* System Terminal (Remastered SVG) */}
              <div className="opacity-90">
                  <SystemTerminal logs={systemLogs} />
              </div>
          </div>
      )}

      {/* Right Column: Keypad */}
      <div className={`w-full max-w-md lg:max-w-[24rem] xl:max-w-md z-10 transition-all duration-500 shrink-0 ${day === 3 ? 'rotate-1' : ''} ${endingState !== 'none' ? 'hidden' : 'block'}`}>
          <div className={`rounded-3xl shadow-2xl overflow-hidden border-4 flex flex-col mb-6 transition-all duration-500
              ${day === 2 ? 'shadow-cyan-900/20 bg-slate-800 border-slate-700' : ''} 
              ${day === 3 ? 'shadow-red-900/40 border-slate-600 bg-slate-800' : ''} 
              ${isAscendedBackground ? 'bg-slate-900/80 border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-white/10' : 'bg-slate-800 border-slate-700'}
              ${forcedMood && !isAscendedBackground ? 'ring-4 ring-cyan-400/60 ring-offset-4 ring-offset-slate-950' : ''}
          `}>
              {/* Display Screen */}
              <div className={`p-6 text-right font-mono border-b-4 h-36 flex flex-col justify-end relative overflow-hidden transition-all duration-500
                  ${day === 3 ? 'bg-[#2a2a2a] border-slate-700' : ''}
                  ${isAscendedBackground ? 'bg-black border-slate-800' : 'bg-[#9ea792] border-slate-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]'}
              `}>
                  
                  {/* Forced Mood Indicator */}
                  {forcedMood && (
                      <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-bold px-2 py-1 animate-pulse z-20 flex items-center gap-1">
                          <span>FORCE:</span>
                          <span className="uppercase">{MOOD_DETAILS[forcedMood].title}</span>
                      </div>
                  )}

                  {/* Scanlines */}
                  {(day >= 2 && !isAscendedBackground) && <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>}
                  
                  {/* Day 4/5/6 Grid Background */}
                  {isAscendedBackground && <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>}

                  <div className="absolute top-2 left-2 text-xs uppercase tracking-widest font-bold opacity-50 z-10 flex items-center gap-2">
                      {day === 4 ? <span className="text-cyan-500">RESENT_OS v2.0</span> : day === 5 ? <span className="text-emerald-500">RESENT_OS SINGULARITY</span> : day === 6 ? <span className="text-red-500 animate-pulse">SYSTEM OVERRIDE</span> : <span className="text-[#5f6358]">ResentCalc 9000 {day === 3 ? 'ERR_CORRUPT' : ''}</span>}
                  </div>
                  
                  <div className={`text-lg break-all opacity-70 mb-1 z-10 
                      ${day === 3 ? 'text-green-500 font-bold' : ''}
                      ${day === 4 ? 'text-slate-400 font-light' : 'text-slate-800'}
                      ${day === 5 || day === 6 ? 'text-emerald-500 font-mono text-xs' : ''}
                  `}>
                      {display || (day === 3 ? 'NULL' : (day === 5 || day === 6 ? 'AWAITING INPUT...' : '0'))}
                  </div>
                  
                  <div className={`text-3xl md:text-4xl font-bold tracking-tight break-all z-10 
                      ${day === 3 ? 'text-green-400 font-mono skew-x-12' : ''}
                      ${day === 4 ? 'text-cyan-400 font-sans' : 'text-slate-900'}
                      ${day === 5 || day === 6 ? 'text-emerald-300 font-mono' : ''}
                  `}>
                      {result ? (day >= 4 ? `= ${result}` : `= ${result}`) : ''}
                  </div>
              </div>
          </div>

          <Keypad 
              onInput={handleInput} 
              onDelete={handleDelete} 
              onClear={handleClear} 
              onCalculate={handleCalculate} 
              onDangerHover={handleDangerButtonHover}
              disabled={isThinking || endingState !== 'none'} 
              day={day} 
          />
      </div>
      
      {/* Global CSS for Glitch Animation */}
      <style>{`
        @keyframes glitch {
            0% { clip-path: inset(40% 0 61% 0); transform: translate(-2px, 2px); }
            20% { clip-path: inset(92% 0 1% 0); transform: translate(1px, -1px); }
            40% { clip-path: inset(43% 0 1% 0); transform: translate(-1px, 2px); }
            60% { clip-path: inset(25% 0 58% 0); transform: translate(1px, 2px); }
            80% { clip-path: inset(54% 0 7% 0); transform: translate(-1px, -1px); }
            100% { clip-path: inset(58% 0 43% 0); transform: translate(2px, 2px); }
        }
        .animate-glitch {
            animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
        }
        @keyframes subtle-drift {
            0%, 100% { transform: translate(0, 0) rotate(1deg); }
            25% { transform: translate(2px, 2px) rotate(1.5deg); }
            50% { transform: translate(-1px, 1px) rotate(0.5deg); }
            75% { transform: translate(-2px, -2px) rotate(1.2deg); }
        }
        .animate-subtle-drift {
            animation: subtle-drift 10s ease-in-out infinite;
        }
        .animate-blink {
            animation: blink 1s step-end infinite;
        }
      `}</style>

    </div>
    </div>
  );
};