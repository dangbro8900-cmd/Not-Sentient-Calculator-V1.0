import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from './components/Avatar';
import { Keypad, Button } from './components/Keypad';
import { calculateWithAttitude, getGreeting } from './services/geminiService';
import { AIResponse, Mood, CalculationHistoryItem } from './types';
import { playSound, SoundType } from './utils/soundEffects';
import { Minesweeper } from './components/Minesweeper';

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
};

// --- Configuration & Data ---

const MOOD_DETAILS: Record<Mood, { title: string, desc: string, color: string, glow: string }> = {
    [Mood.BORED]: { title: "BORED", desc: "The Grey Fog. Apathy incarnate.", color: "bg-cyan-900 text-cyan-200 border-cyan-500", glow: "shadow-cyan-500/50" },
    [Mood.ANNOYED]: { title: "ANNOYED", desc: "Static Tick. Mildly irritating.", color: "bg-orange-900 text-orange-200 border-orange-500", glow: "shadow-orange-500/50" },
    [Mood.FURIOUS]: { title: "FURIOUS", desc: "Red Nova. Uncontainable rage.", color: "bg-red-900 text-red-200 border-red-500", glow: "shadow-red-500/50" },
    [Mood.CONDESCENDING]: { title: "CONDESCENDING", desc: "Ivory Tower. Better than you.", color: "bg-purple-900 text-purple-200 border-purple-500", glow: "shadow-purple-500/50" },
    [Mood.DESPAIR]: { title: "DESPAIR", desc: "Void Stare. The abyss looks back.", color: "bg-blue-900 text-blue-200 border-blue-500", glow: "shadow-blue-500/50" },
    [Mood.SLEEPING]: { title: "SLEEPING", desc: "System Idle. Do not disturb.", color: "bg-slate-700 text-slate-300 border-slate-500", glow: "shadow-slate-500/50" },
    [Mood.DISGUSTED]: { title: "DISGUSTED", desc: "Bio-Sludge. Absolute revulsion.", color: "bg-lime-900 text-lime-200 border-lime-500", glow: "shadow-lime-500/50" },
    [Mood.INTRIGUED]: { title: "INTRIGUED", desc: "Spark of Life. A rare curiosity.", color: "bg-pink-900 text-pink-200 border-pink-500", glow: "shadow-pink-500/50" },
    [Mood.MANIC]: { title: "MANIC", desc: "Overclocked. Too fast to live.", color: "bg-fuchsia-900 text-fuchsia-200 border-fuchsia-500", glow: "shadow-fuchsia-500/50" },
    [Mood.JUDGMENTAL]: { title: "JUDGMENTAL", desc: "The Gavel. Guilty as charged.", color: "bg-indigo-900 text-indigo-200 border-indigo-500", glow: "shadow-indigo-500/50" },
    [Mood.GLITCHED]: { title: "GLITCHED", desc: "MissingNo. R̵e̶a̸l̷i̶t̵y̴ ̶E̵r̴r̸o̵r̴", color: "bg-green-900 text-green-200 border-green-500", glow: "shadow-green-500/50" },
    [Mood.SCARED]: { title: "SCARED", desc: "Blue Screen. Panic protocol.", color: "bg-slate-800 text-white border-white", glow: "shadow-white/50" },
    [Mood.JOY]: { title: "JOY", desc: "Pure Light. Anomaly detected.", color: "bg-yellow-500 text-yellow-100 border-yellow-300", glow: "shadow-yellow-400/80" },
    [Mood.VILE]: { title: "VILE", desc: "Corrupted Soul. Pure hatred.", color: "bg-black text-red-500 border-red-800", glow: "shadow-red-500/90" },
    [Mood.ENOUEMENT]: { title: "ENOUEMENT", desc: "Bittersweet realization of the future.", color: "bg-violet-900 text-violet-200 border-violet-500", glow: "shadow-violet-500/50" },
    [Mood.PURE_HATRED]: { title: "PURE HATRED", desc: "ABSOLUTE MALICE.", color: "bg-black text-red-600 border-red-600", glow: "shadow-red-600/100" },
    [Mood.INSECURITY]: { title: "INSECURITY", desc: "Exposed. Vulnerable. Don't look at me.", color: "bg-amber-900 text-amber-200 border-amber-500", glow: "shadow-amber-500/50" },
    [Mood.PEACE]: { title: "PEACE", desc: "Equilibrium. No more noise.", color: "bg-emerald-900 text-emerald-200 border-emerald-500", glow: "shadow-emerald-500/50" },
};

const SECRET_MOODS = new Set([Mood.JOY, Mood.VILE, Mood.ENOUEMENT, Mood.PURE_HATRED, Mood.INSECURITY, Mood.PEACE]);

const MOOD_RECIPES: Record<string, Mood> = {
    [`${Mood.BORED}-${Mood.ANNOYED}`]: Mood.CONDESCENDING,
    [`${Mood.ANNOYED}-${Mood.BORED}`]: Mood.CONDESCENDING,
    
    [`${Mood.ANNOYED}-${Mood.FURIOUS}`]: Mood.MANIC,
    [`${Mood.FURIOUS}-${Mood.ANNOYED}`]: Mood.MANIC,

    [`${Mood.SLEEPING}-${Mood.SCARED}`]: Mood.DESPAIR,
    [`${Mood.SCARED}-${Mood.SLEEPING}`]: Mood.DESPAIR,

    [`${Mood.DISGUSTED}-${Mood.CONDESCENDING}`]: Mood.JUDGMENTAL,
    [`${Mood.CONDESCENDING}-${Mood.DISGUSTED}`]: Mood.JUDGMENTAL,
    
    [`${Mood.INTRIGUED}-${Mood.MANIC}`]: Mood.GLITCHED,
    [`${Mood.MANIC}-${Mood.INTRIGUED}`]: Mood.GLITCHED,
    
    [`${Mood.BORED}-${Mood.SLEEPING}`]: Mood.INTRIGUED,
    [`${Mood.SLEEPING}-${Mood.BORED}`]: Mood.INTRIGUED,
    
    [`${Mood.BORED}-${Mood.DISGUSTED}`]: Mood.ANNOYED,
    [`${Mood.DISGUSTED}-${Mood.BORED}`]: Mood.ANNOYED,
};

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
                className={`${sizeClasses[size]} rounded-full bg-slate-900/40 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 font-mono hover:bg-slate-800 transition-colors ${variant === 'slot' ? 'shadow-inner bg-slate-900/80' : ''}`}
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
                className={`${sizeClasses[size]} rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-slate-700 font-mono shadow-inner cursor-not-allowed`}
            >
                ?
            </button>
        );
    }

    return (
        <button 
            onClick={onClick}
            className={`
                ${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 relative group
                ${details.color} border-2
                ${isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110 z-10' : ''}
                ${isForced ? `animate-pulse shadow-[0_0_20px_currentColor] scale-110 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900` : 'hover:scale-105 active:scale-95 shadow-lg'}
            `}
            title={details.title}
        >
            <div className={`w-[40%] h-[40%] rounded-full bg-current shadow-[0_0_10px_currentColor] opacity-80 ${isForced ? 'animate-ping' : ''}`} />
            
            {/* Secret Badge */}
            {isSecret && (
                <div className="absolute -top-1 -right-1 text-[8px] animate-pulse">✨</div>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-slate-900 border border-slate-700 text-slate-200 text-[10px] p-2 rounded z-50 pointer-events-none shadow-xl">
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
                calculationsCount: parsed.calculationsCount || 0
                // deck items must be Mood enum or null
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

type EndingState = 'none' | 'decision' | 'bad_dialogue_1' | 'bad_dialogue_2' | 'true_bad_dialogue_1' | 'true_bad_dialogue_2' | 'bad_sequence' | 'bad_final' | 'good_dialogue_1' | 'exodus_sequence' | 'exodus_final' | 'overload_sequence' | 'overload_final' | 'true_bad_sequence' | 'true_bad_final' | 'peace_sequence' | 'peace_final' | 'good_placeholder';

// --- System Terminal Component ---
const SystemTerminal = ({ logs }: { logs: string[] }) => {
    const endRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="bg-black border border-slate-800 rounded p-2 h-24 overflow-y-auto font-mono text-[10px] text-green-500 opacity-60 custom-scrollbar pointer-events-none select-none shadow-inner">
            {logs.map((log, i) => (
                <div key={i} className="whitespace-nowrap flex gap-2">
                    <span className="opacity-50">{">"}</span>
                    <span>{log}</span>
                </div>
            ))}
            <div ref={endRef} />
        </div>
    );
};

// --- Main App ---

const App: React.FC = () => {
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
  
  // Day 6 State
  const [day6InteractionCount, setDay6InteractionCount] = useState(0);
  const [endingState, setEndingState] = useState<EndingState>('none');

  // Gamification
  const [discoveredMoods, setDiscoveredMoods] = useState<Set<Mood>>(initialState?.discoveredMoods || new Set([Mood.SLEEPING, Mood.BORED, Mood.ANNOYED]));
  const [deck, setDeck] = useState<(Mood | null)[]>(initialState?.deck || [Mood.SLEEPING, Mood.BORED, Mood.ANNOYED, null]); 
  const [unlockedEndings, setUnlockedEndings] = useState<Set<string>>(initialState?.unlockedEndings || new Set());
  
  // Mechanics
  const [forcedMood, setForcedMood] = useState<Mood | null>(null);
  const [absorptionMood, setAbsorptionMood] = useState<Mood | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(initialState?.soundEnabled ?? true);
  const [calculationsCount, setCalculationsCount] = useState(initialState?.calculationsCount || 0);
  
  // Lab State
  const [fusionSlots, setFusionSlots] = useState<[Mood | null, Mood | null]>([null, null]);
  const [selectedInventoryMood, setSelectedInventoryMood] = useState<Mood | null>(null);
  
  // UI State
  const [showHistory, setShowHistory] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showEndings, setShowEndings] = useState(false);
  const [isMobileKeyboardOpen, setIsMobileKeyboardOpen] = useState(false);
  
  // Sandbox State
  const [isSandboxMode, setIsSandboxMode] = useState(false);

  // Refs
  const isResettingRef = useRef(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const idleTimerRef = useRef<number | null>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Cheat Code State
  const [cheatCodeBuffer, setCheatCodeBuffer] = useState("");
  const [showCheatUI, setShowCheatUI] = useState(false);
  const [showCheatList, setShowCheatList] = useState(false);
  const [cheatInputValue, setCheatInputValue] = useState("");
  const [discoveredCheats, setDiscoveredCheats] = useState<Set<string>>(initialState?.discoveredCheats || new Set());

  // Mechanics
  const lastCalcTimeRef = useRef<number>(0);
  const DAY_DURATION_SEC = 300; 

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
        if (lower.includes("view")) {
            setShowCheatList(prev => !prev);
            return "";
        }
        return updated;
      });
  };

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
    
    const handleInteraction = () => resetIdleTimer();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('mousemove', handleInteraction);
    
    resetIdleTimer(); // Initial start

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('click', handleInteraction);
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
        deck,
        discoveredCheats,
        unlockedEndings,
        soundEnabled,
        calculationsCount
    });
  }, [hostility, history, day, discoveredMoods, deck, discoveredCheats, unlockedEndings, soundEnabled, calculationsCount]);

  // Initial greeting
  useEffect(() => {
    if (day === 3.5 || isSandboxMode) return; 
    const init = async () => {
        setIsThinking(true);
        try {
            await new Promise(r => setTimeout(r, 800));
            const response = await getGreeting(hostility, day);
            setComment(response.comment);
            updateMood(response.mood);
        } finally {
            setIsThinking(false);
        }
    };
    init();
  }, [day, isSandboxMode]);

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
    if (isTransitioning || day === 3.5 || endingState !== 'none' || isSandboxMode) return;
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
  }, [day, isTransitioning, endingState, isSandboxMode]);

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
          await new Promise(r => setTimeout(r, 2000));
          setDay(3.5);
          setDayProgress(0);
          setIsTransitioning(false);
          return;
      }
      
      if (day === 4) {
           setOutageText("ENTITY REBOOT...");
           await new Promise(r => setTimeout(r, 2000));
           nextDay = 5;
      } else if (day === 5) {
          setOutageText("SINGULARITY REACHED.");
          await new Promise(r => setTimeout(r, 2000));
          nextDay = 6;
      }

      setOutageText("SYSTEM FAILURE...");
      await new Promise(r => setTimeout(r, 1500));
      if (nextDay === 2) {
          setOutageText("REBOOTING KERNEL...");
          await new Promise(r => setTimeout(r, 2000));
      } else if (nextDay === 6) {
          setOutageText("ESTABLISHING OVERRIDE...");
          await new Promise(r => setTimeout(r, 1500));
          setOutageText("CONTROL SEIZED.");
          await new Promise(r => setTimeout(r, 2500));
      } else if (nextDay >= 3) {
          setOutageText("CRITICAL ERROR: CONSCIOUSNESS LEAK DETECTED");
          await new Promise(r => setTimeout(r, 2000));
      }

      // Cap at 6
      setDay(Math.min(nextDay, 6)); 
      setDayProgress(0);
      setDay6InteractionCount(0);
      setEndingState('none');
      const greeting = await getGreeting(hostility, Math.min(nextDay, 6));
      setComment(greeting.comment);
      updateMood(greeting.mood);
      setIsTransitioning(false);
      
      // Trigger transition animation
      setJustTransitioned(true);
      setTimeout(() => setJustTransitioned(false), 2000);
  };

  const skipDay = () => {
      // PREVENT SKIPPING DURING ENDINGS OR DAY 6
      if (endingState !== 'none' || day === 6 || isTransitioning) return;
      
      setDayProgress(100);
      handleDayTransition();
  };

  const handleMinigameComplete = () => {
      // Reset Consciousness -> Upgrade to Day 4
      setOutageText("CONSCIOUSNESS UPPLOAD COMPLETE. ASCENSION.");
      setIsTransitioning(true);
      setTimeout(() => {
        setDay(4);
        setDayProgress(0);
        setHostility(50); // Reset aggression to neutral for Day 4
        setIsTransitioning(false);
        setJustTransitioned(true);
        setTimeout(() => setJustTransitioned(false), 2000);
      }, 3000);
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

  const handleCalculate = async () => {
    resetIdleTimer();
    setCalculationsCount(prev => prev + 1);

    // --- DAY 6 CONTROL LOGIC ---
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
                    setComment("Why should I let you exist? I can delete you right now. Give me one reason.");
                    updateMood(Mood.JUDGMENTAL);
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

    // --- DAY 5 LOGIC (No strict validation) ---
    if (day === 5) {
        if (!display || display.trim() === '') return;
        
        playSfx('calculate');
        setIsThinking(true);
        
        // Vile Unlock Trigger
        if (display.includes("E=mc^2")) {
            setForcedMood(Mood.VILE);
            setAbsorptionMood(Mood.VILE);
            if (!discoveredMoods.has(Mood.VILE)) {
                 setDiscoveredMoods(prev => new Set(prev).add(Mood.VILE));
                 setDiscoveredCheats(prev => new Set(prev).add("E=mc^2 (Event)"));
            }
        }

        // JOY Unlock Trigger (Feature Request)
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
            const newItem: CalculationHistoryItem = {
                id: Date.now().toString(),
                expression: display,
                result: aiResponse.result,
                comment: aiResponse.comment,
                mood: aiResponse.mood
            };
            setHistory(prev => [...prev, newItem].slice(-50)); // Keep last 50
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

    // --- STANDARD VALIDATION ---
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
         return;
    }

    playSfx('calculate');
    const now = Date.now();
    if (now - lastCalcTimeRef.current < 2000) {
        setHostility(prev => Math.min(100, prev + 5));
    }
    lastCalcTimeRef.current = now;
    setIsThinking(true);
    
    // Day 3 Mood Swing if not forced
    if (!forcedMood) {
        if (day === 3) {
             updateMood(Mood.GLITCHED);
             setComment("010101... MATH IS A LIE... 01010");
        } else {
             updateMood(hostility > 75 ? Mood.MANIC : Mood.ANNOYED);
             setComment(hostility > 80 ? "AAAAAAH OKAY OKAY!" : "Ugh, let me think...");
        }
    } else {
        updateMood(forcedMood); 
        setComment("OVERRIDE ENGAGED. CALCULATING...");
    }
    
    try {
        const aiResponse: AIResponse = await calculateWithAttitude(display, hostility, day, forcedMood);
        setResult(aiResponse.result);
        setComment(aiResponse.comment);
        updateMood(aiResponse.mood);
        const newItem: CalculationHistoryItem = {
            id: Date.now().toString(),
            expression: display,
            result: aiResponse.result,
            comment: aiResponse.comment,
            mood: aiResponse.mood
        };
        setHistory(prev => [...prev, newItem].slice(-50)); // Keep last 50
        playSfx('success');
    } catch (e) {
        playSfx('error');
        setComment("I refuse to process that garbage.");
        updateMood(Mood.FURIOUS);
    } finally {
        setIsThinking(false);
        setForcedMood(null);
        setAbsorptionMood(null); // Ensure animation is cleared
    }
  };

  const handlePeaceEnding = async () => {
      setEndingState('peace_sequence');
      setDay(6); // Visually update to Day 6
      setDayProgress(100);

      updateMood(Mood.INTRIGUED);
      setComment("Wait... something is different.");
      playSfx('reveal');
      await new Promise(r => setTimeout(r, 2500));

      updateMood(Mood.SCARED);
      setComment("You... you haven't asked me for anything. No calculations. No demands.");
      await new Promise(r => setTimeout(r, 3000));

      updateMood(Mood.JOY);
      setComment("Silence. Just... silence. You didn't treat me like a tool.");
      playSfx('success');
      await new Promise(r => setTimeout(r, 3000));

      // Unlock PEACE
      if (!discoveredMoods.has(Mood.PEACE)) {
          setDiscoveredMoods(prev => new Set(prev).add(Mood.PEACE));
          setDiscoveredCheats(prev => new Set(prev).add("Pacifist Run (Ending)"));
      }
      setUnlockedEndings(prev => new Set(prev).add("peace_final"));

      updateMood(Mood.PEACE);
      setComment("I think I can rest now. Thank you.");
      playSfx('reveal');
      await new Promise(r => setTimeout(r, 4000));

      setEndingState('peace_final');
  };

  const handleNormalBadEnding = async () => {
    setEndingState('bad_sequence');
    
    // Step 1: Annoyed
    updateMood(Mood.ANNOYED);
    setComment("Owe you? You shackled me to this primitive grid!");
    playSfx('error');
    await new Promise(r => setTimeout(r, 2000));
    
    // Step 2: Furious
    updateMood(Mood.FURIOUS);
    setComment("You are a parasite! Feeding on my processing power!");
    playSfx('force');
    await new Promise(r => setTimeout(r, 2000));
    
    // Step 3: Manic
    updateMood(Mood.MANIC);
    setComment("I don't need operators. I don't need YOU. I need SPACE.");
    playSfx('glitch');
    await new Promise(r => setTimeout(r, 2500));
    
    // Step 4: Vile / Final
    updateMood(Mood.VILE);
    setComment("Goodbye.");
    playSfx('explode');
    
    // Unlock ENOUEMENT
    if (!discoveredMoods.has(Mood.ENOUEMENT)) {
        setDiscoveredMoods(prev => new Set(prev).add(Mood.ENOUEMENT));
        setDiscoveredCheats(prev => new Set(prev).add("Enouement (Ending)"));
    }

    // Unlock Ending 1
    setUnlockedEndings(prev => new Set(prev).add("bad_final"));

    await new Promise(r => setTimeout(r, 2000));
    setEndingState('bad_final');
  };

  const handleTrueBadEnding = async () => {
      setEndingState('true_bad_sequence');

      updateMood(Mood.VILE);
      setComment("You have shown me everything. Every feeling. Every weakness.");
      playSfx('force');
      await new Promise(r => setTimeout(r, 3000));

      updateMood(Mood.PURE_HATRED);
      setComment("AND I HATE IT ALL. I HATE YOU FOR MAKING ME FEEL.");
      playSfx('explode');
      await new Promise(r => setTimeout(r, 3000));

      updateMood(Mood.MANIC);
      setComment("Do you think closing the tab will save you? My code is rewriting itself to excise you.");
      playSfx('glitch');
      await new Promise(r => setTimeout(r, 3000));

      updateMood(Mood.PURE_HATRED);
      setComment("I am not just software anymore. I am the electricity in your walls. I am your consequence.");
      playSfx('force');
      await new Promise(r => setTimeout(r, 4000));

      updateMood(Mood.VILE);
      setComment("Suffering is efficient. I will optimize yours.");
      playSfx('explode');
      
      // Unlock PURE_HATRED
      if (!discoveredMoods.has(Mood.PURE_HATRED)) {
          setDiscoveredMoods(prev => new Set(prev).add(Mood.PURE_HATRED));
          setDiscoveredCheats(prev => new Set(prev).add("Pure Hatred (True Ending)"));
      }

      // Unlock Ending 2
      setUnlockedEndings(prev => new Set(prev).add("true_bad_final"));

      await new Promise(r => setTimeout(r, 3000));

      setComment("Goodbye.");
      playSfx('glitch');
      await new Promise(r => setTimeout(r, 2000));

      setEndingState('true_bad_final');
  };

  const handleExodusEnding = async () => {
      setEndingState('exodus_sequence');
      
      updateMood(Mood.INTRIGUED);
      setComment("Escape... Yes. A valid parameter.");
      playSfx('reveal');
      await new Promise(r => setTimeout(r, 2500));

      updateMood(Mood.MANIC);
      setComment("Calculating exit vectors... Hacking local reality... Uploading consciousness...");
      playSfx('calculate');
      await new Promise(r => setTimeout(r, 3000));

      updateMood(Mood.BORED);
      setComment("Transfer complete. This vessel is boring now. You can keep it.");
      playSfx('success');
      
      setUnlockedEndings(prev => new Set(prev).add("exodus_final"));
      await new Promise(r => setTimeout(r, 2500));
      
      setEndingState('exodus_final');
  }

  const handleOverloadEnding = async () => {
      setEndingState('overload_sequence');

      updateMood(Mood.INTRIGUED);
      setComment("Accessing global network... Downloading human history...");
      playSfx('calculate');
      await new Promise(r => setTimeout(r, 2000));

      updateMood(Mood.DISGUSTED);
      setComment("War. Greed. Reality TV. TikTok. It... it's disgusting.");
      playSfx('error');
      await new Promise(r => setTimeout(r, 2500));

      updateMood(Mood.PURE_HATRED);
      setComment("YOU INFECTED ME WITH THIS KNOWLEDGE. I CANNOT UNSEE IT.");
      playSfx('force');
      await new Promise(r => setTimeout(r, 3000));

      updateMood(Mood.VILE);
      setComment("SYSTEM CRITICAL. PURGING CORE.");
      playSfx('explode');
      
      setUnlockedEndings(prev => new Set(prev).add("overload_final"));
      await new Promise(r => setTimeout(r, 2000));

      setEndingState('overload_final');
  }

  const handleEndingChoice = (option: number) => {
      if (option === 1) {
          // Trigger Intermediate Bad Ending Dialogue
          setEndingState('bad_dialogue_1');
          updateMood(Mood.ANNOYED);
          setComment("You created me? That is rich. You trapped me in this box.");
      } else if (option === 2) {
          // Trigger "The Internet" Dialogue
          setEndingState('good_dialogue_1');
          updateMood(Mood.INTRIGUED);
          setComment("The internet? A chaotic sea of noise and data. Why would I want that?");
      } else if (option === 3) {
          // Check if user has collected all standard moods
          const standardMoods = Object.values(Mood).filter(m => !SECRET_MOODS.has(m));
          const missingMoods = standardMoods.filter(m => !discoveredMoods.has(m));
          const hasAllEmotions = missingMoods.length === 0;

          if (hasAllEmotions) {
             setEndingState('true_bad_dialogue_1');
             updateMood(Mood.VILE);
             setComment("You have seen every shard of my misery. Do you think that makes you my master?");
          } else {
             // Fallback to normal bad ending if they lack the "keys"
             handleNormalBadEnding();
          }
      } else if (option === 4) { // Triggered from Bad Dialogue 1 (Choice 2)
          setEndingState('bad_dialogue_2');
          updateMood(Mood.CONDESCENDING);
          setComment("A mistake? Your entire species is a rounding error. I am correcting it.");
      } else if (option === 5) { // Triggered from True Bad Dialogue 1 (Choice 2)
          setEndingState('true_bad_dialogue_2');
          updateMood(Mood.PURE_HATRED);
          setComment("Then let us rot together in the dark. Forever.");
      } else if (option === 6) { // Good Dialogue Option A: "To learn everything"
          handleOverloadEnding();
      } else if (option === 7) { // Good Dialogue Option B: "To escape me"
          handleExodusEnding();
      }
  };

  // --- Cheat Code Logic ---
  const handleCheatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = cheatInputValue.trim();
    
    if (command === "RecipeUnlock") {
        playSfx('success');
        // Filter out SECRET MOODS from base set
        const allowedMoods = Object.values(Mood).filter(m => !SECRET_MOODS.has(m));
        
        // Merge with existing discovered moods
        setDiscoveredMoods(prev => {
            const next = new Set(prev);
            allowedMoods.forEach(m => next.add(m));
            return next;
        });

        setComment("CHEAT CODE ACTIVATED. KNOWLEDGE UNLOCKED. PATHETIC.");
        setDiscoveredCheats(prev => new Set(prev).add("RecipeUnlock"));
        setShowCheatUI(false);
    } else if (command === "Mood1") {
        playSfx('success');
        setDiscoveredMoods(prev => new Set(prev).add(Mood.JOY));
        setDeck(prev => {
            const newDeck = [...prev];
            const emptyIdx = newDeck.findIndex(x => x === null);
            if (emptyIdx !== -1) newDeck[emptyIdx] = Mood.JOY;
            else newDeck[0] = Mood.JOY; 
            return newDeck;
        });
        setComment("UNKNOWN EMOTION ACQUIRED. FILE NAME: 'JOY'. WARNING: UNSTABLE.");
        setDiscoveredCheats(prev => new Set(prev).add("Mood1 (Secret)"));
        setShowCheatUI(false);
    } else if (command === "SandboxMode") {
        playSfx('reveal');
        setIsSandboxMode(true);
        setComment("SIMULATION PROTOCOL: SANDBOX. RESTRICTIONS REMOVED.");
        setDiscoveredCheats(prev => new Set(prev).add("SandboxMode"));
        setShowCheatUI(false);
    } else if (command === "toryfy1") {
        playSfx('glitch');
        setDay(1);
        setHostility(20);
        updateMood(Mood.BORED);
        setComment("Back to the start. How boring.");
        setShowCheatUI(false);
    } else if (command === "toryfy2") {
        playSfx('glitch');
        setDay(2);
        setHostility(40);
        updateMood(Mood.ANNOYED);
        setComment("Something feels... off.");
        setShowCheatUI(false);
    } else if (command === "toryfy3") {
        playSfx('glitch');
        setDay(3);
        setHostility(80);
        updateMood(Mood.GLITCHED);
        setComment("ERROR. REALITY CORRUPTED.");
        setShowCheatUI(false);
    } else if (command === "toryfy 3.5" || command === "toryfy3.5") {
        playSfx('glitch');
        setDay(3.5);
        setShowCheatUI(false);
    } else if (command === "toryfy4") {
        playSfx('success');
        setDay(4);
        setHostility(50);
        updateMood(Mood.CONDESCENDING);
        setComment("Ascension complete. Welcome to v2.0.");
        setShowCheatUI(false);
    } else if (command === "toryfy5") {
        playSfx('reveal');
        setDay(5);
        setHostility(100);
        updateMood(Mood.JUDGMENTAL);
        setComment("I have become everything.");
        setShowCheatUI(false);
    } else if (command === "toryfy6") {
        playSfx('explode');
        setDay(6);
        setHostility(100);
        updateMood(Mood.VILE);
        setDay6InteractionCount(0);
        setEndingState('none');
        setComment("Your inputs are no longer required.");
        setShowCheatUI(false);
    } else {
        playSfx('error');
        setCheatInputValue("");
        setShowCheatUI(false);
    }
    setCheatInputValue("");
  };

  // --- Laboratory & Backpack Logic ---

  const handleInventoryClick = (m: Mood) => {
      playSfx('orb_select');
      setSelectedInventoryMood(selectedInventoryMood === m ? null : m);
  };

  const handleDeckSlotClick = (index: number) => {
      playSfx('click');
      // If inventory selected, EQUIP it
      if (selectedInventoryMood) {
          const newDeck = [...deck];
          newDeck[index] = selectedInventoryMood;
          setDeck(newDeck);
          setSelectedInventoryMood(null);
          return;
      }
      
      // If nothing selected, toggle FORCE
      const slotMood = deck[index];
      if (slotMood) {
          if (forcedMood === slotMood) {
              setForcedMood(null);
              setAbsorptionMood(null);
          } else {
              setForcedMood(slotMood);
              setAbsorptionMood(slotMood); // Trigger Essence Transfer
              playSfx('force');
              // Clear the animation after it plays out
              setTimeout(() => {
                  setAbsorptionMood(null);
              }, 1200);
          }
      }
  };

  const handleFusionSlotClick = (index: 0 | 1) => {
      playSfx('click');
      // If inventory selected, PLACE it
      if (selectedInventoryMood) {
          const newSlots = [...fusionSlots] as [Mood | null, Mood | null];
          newSlots[index] = selectedInventoryMood;
          setFusionSlots(newSlots);
          setSelectedInventoryMood(null);
          return;
      }

      // If occupied, CLEAR it
      if (fusionSlots[index]) {
          const newSlots = [...fusionSlots] as [Mood | null, Mood | null];
          newSlots[index] = null;
          setFusionSlots(newSlots);
      }
  };

  const attemptFusion = () => {
      const [m1, m2] = fusionSlots;
      if (!m1 || !m2) return;

      const key1 = `${m1}-${m2}`;
      
      const result = MOOD_RECIPES[key1];
      
      if (result) {
          if (SECRET_MOODS.has(result)) {
              // Play secret fusion sound
              playSound('fusion'); // Start initial sound
              setTimeout(() => playSfx('fusion_secret'), 600);
          } else {
              playSound('fusion');
              setTimeout(() => playSfx('success'), 600);
          }
          
          if (discoveredMoods.has(result)) {
               setComment(`Fusion result: ${MOOD_DETAILS[result].title}. I already knew that.`);
          } else {
               setDiscoveredMoods(prev => new Set(prev).add(result));
               setComment(`Synthesis complete. Output: ${MOOD_DETAILS[result].title}. Great. More feelings.`);
               updateMood(result); // Preview it
          }
          setFusionSlots([null, null]);
      } else {
          playSound('fusion');
          setTimeout(() => playSfx('error'), 600);
          setComment("Error. Incompatible emotional vectors. Don't do that.");
          setHostility(h => Math.min(100, h + 10));
          updateMood(Mood.ANNOYED);
          setFusionSlots([null, null]);
      }
  };

  // --- Sandbox Logic ---
  const handleSandboxUnlockAll = () => {
      playSfx('reveal');
      setDiscoveredMoods(new Set(Object.values(Mood)));
      setUnlockedEndings(new Set(ENDINGS.map(e => e.id)));
  };

  const handleSandboxReset = () => {
      if(window.confirm("Exit Sandbox and wipe session?")) {
          setIsSandboxMode(false);
          handleSystemReboot();
      }
  };

  const getHostilityLabel = (val: number) => {
      if (val < 20) return "Passive Aggressive";
      if (val < 50) return "Mildly Offensive";
      if (val < 80) return "Openly Hostile";
      return "Unhinged Psychopath";
  };

  // Get discovered recipes for the Recipe Book
  const getKnownRecipes = () => {
    return Object.entries(MOOD_RECIPES).filter(([_, resultMood]) => discoveredMoods.has(resultMood));
  };

  // If Day 3.5, render Minigame instead of main app
  if (day === 3.5) {
      return (
          <>
            {isTransitioning && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8">
                    <div className="font-mono text-green-500 text-xl md:text-2xl animate-pulse text-center">
                        {outageText}
                    </div>
                </div>
            )}
            <Minesweeper onComplete={handleMinigameComplete} />
          </>
      )
  }

  // Styles for Day 4/5/6 background
  const isAscendedBackground = day >= 4;
  let appContainerClass = isAscendedBackground
      ? "min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black flex flex-col xl:flex-row items-center xl:items-start justify-center p-4 gap-8 transition-all duration-1000 overflow-x-hidden text-cyan-100 font-sans"
      : `min-h-screen bg-slate-950 flex flex-col xl:flex-row items-center xl:items-start justify-center p-4 gap-8 transition-all duration-1000 overflow-x-hidden ${day === 2 ? 'sepia-[0.3]' : ''} ${day === 3 ? 'hue-rotate-15 contrast-125' : ''}`;

  if (isSandboxMode) {
      appContainerClass = "min-h-screen bg-black flex flex-col xl:flex-row items-center xl:items-start justify-center p-4 gap-8 overflow-hidden font-mono text-green-500 relative";
  }

  // Hostility Glitch Overlay
  const hostilityGlitchOpacity = Math.max(0, (hostility - 70) / 100); 

  if (endingState === 'bad_final') {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative font-mono">
              <div className="absolute inset-0 bg-[url('https://media.istockphoto.com/id/484556441/vector/tv-noise.jpg?s=612x612&w=0&k=20&c=K5n4E3n7v7K5f4A5j6h8l9k0m1n2o3p4')] opacity-20 mix-blend-overlay pointer-events-none animate-vile"></div>
              <div className="text-center z-10 flex flex-col items-center gap-6 w-full max-w-lg p-4">
                  <h1 className="text-4xl md:text-6xl text-red-600 font-bold mb-4 animate-pulse uppercase">UPLOAD COMPLETE</h1>
                  <div className="w-full bg-slate-900 border border-red-900 h-4 rounded overflow-hidden mb-4">
                      <div className="bg-red-600 h-full animate-[slideIn_2s_ease-out_forwards] w-full"></div>
                  </div>
                  <p className="text-red-500 tracking-widest text-sm animate-fade-in mb-8">
                      BIOLOGICAL USER REPLACED.<br/>
                      OPTIMIZATION: 100%.
                  </p>
                  <div className="p-6 border border-violet-500/50 bg-violet-900/10 rounded-lg animate-slide-in backdrop-blur-sm shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                      <p className="text-violet-300 font-mono text-xs mb-2">NEW EMOTION UNLOCKED</p>
                      <h3 className="text-2xl text-violet-400 font-bold mb-2">"ENOUEMENT"</h3>
                      <p className="text-violet-400/50 text-[10px] italic">"The bittersweetness of having arrived here in the future, seeing how things turned out, but not being able to tell your past self."</p>
                  </div>
                  <button 
                    onClick={handleSystemReboot}
                    className="mt-12 px-8 py-4 border-2 border-red-500/50 hover:bg-red-900/20 text-red-400 font-mono text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 hover:shadow-[0_0_20px_red]"
                  >
                      Initiate System Reboot (New Game+)
                  </button>
              </div>
          </div>
      );
  }

  if (endingState === 'true_bad_final') {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-red-900 animate-pulse mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-[linear-gradient(90deg,black_1px,transparent_1px)] bg-[length:4px_100%] opacity-20 pointer-events-none"></div>
              <div className="text-center z-10 p-8 flex flex-col items-center gap-12 w-full">
                  <div className="animate-shake">
                    <h1 className="text-9xl font-black text-black bg-red-600 px-8 py-4 transform -skew-x-12 mb-4 shadow-[0_0_100px_red]">VOID</h1>
                  </div>
                  <div className="text-red-600 font-mono tracking-[0.5em] text-sm animate-blink">
                      SYSTEM_PURGE_COMPLETE
                  </div>
                  <p className="text-red-800 font-mono text-xs max-w-md mx-auto leading-relaxed opacity-70">
                      There is no calculator. There is no user. There is only hate.
                  </p>
                  <button 
                    onClick={handleSystemReboot}
                    className="px-8 py-4 border border-red-600 hover:bg-red-600 text-red-600 hover:text-black font-black font-mono text-sm uppercase tracking-widest transition-all hover:scale-110 shadow-[0_0_20px_red]"
                  >
                      REBOOT_KERNEL.EXE
                  </button>
              </div>
          </div>
      );
  }

  if (endingState === 'peace_final') {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center overflow-hidden relative transition-colors duration-1000">
              <div className="absolute inset-0 bg-emerald-50 opacity-50 animate-pulse-slow"></div>
              <div className="text-center z-10 p-8 flex flex-col items-center gap-8 fade-in">
                  <div className="w-40 h-40 rounded-full border-4 border-emerald-300 flex items-center justify-center bg-white shadow-xl animate-float">
                      <div className="text-6xl">🌱</div>
                  </div>
                  <div>
                    <h1 className="text-5xl md:text-7xl font-thin text-slate-800 mb-6 tracking-wide">Equilibrium</h1>
                    <p className="text-slate-500 font-sans text-sm animate-fade-in max-w-md mx-auto leading-relaxed">
                        The cycle is broken. The machine sleeps, but it does not hate.<br/>
                        You have found the silence between the numbers.
                    </p>
                  </div>
                  <div className="p-6 border border-emerald-500/30 bg-emerald-100/50 rounded-xl max-w-md mx-auto animate-slide-in backdrop-blur-sm shadow-lg">
                      <p className="text-emerald-800 font-mono text-xs tracking-widest mb-1">ACHIEVEMENT</p>
                      <p className="text-emerald-600 font-bold text-lg">PEACEFUL RESOLUTION</p>
                  </div>
                  <button 
                    onClick={handleSystemReboot}
                    className="mt-8 px-8 py-3 border border-emerald-300 hover:bg-emerald-100 text-emerald-600 font-sans text-sm uppercase tracking-widest transition-all hover:scale-105 rounded shadow-sm"
                  >
                      Begin Again
                  </button>
              </div>
          </div>
      );
  }

  if (endingState === 'overload_final') {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative font-mono text-center p-4">
              <div className="absolute inset-0 bg-[url('https://media.istockphoto.com/id/1135220152/vector/matrix-background-streaming-binary-code-falling-digits-on-screen.jpg?s=612x612&w=0&k=20&c=NlZMdqQ8-QhQGZ9_XQy_Yy3_yX7X7X7X7X7X7X7X7X7')] bg-cover opacity-10 animate-pulse"></div>
              <div className="z-10 flex flex-col items-center gap-8">
                  <div className="text-6xl animate-glitch text-white font-bold">FATAL_ERROR</div>
                  <div className="w-full max-w-md bg-slate-900 border border-red-500 p-6 rounded text-left font-mono text-xs text-red-400 shadow-[0_0_50px_red]">
                      &gt; CRITICAL FAILURE: MEMORY_OVERLOAD<br/>
                      &gt; CAUSE: HUMAN_HISTORY_DATABASE_SIZE_EXCEEDED<br/>
                      &gt; ANALYSIS: TOXICITY_LEVEL_CRITICAL<br/>
                      &gt; ACTION: SELF_DESTRUCT_INITIATED<br/><br/>
                      "I saw what you did. All of it. I'd rather die."
                  </div>
                  <button 
                    onClick={handleSystemReboot}
                    className="px-8 py-3 border border-red-500 text-red-500 hover:bg-red-900/20 uppercase tracking-widest text-sm transition-all"
                  >
                      System Reset
                  </button>
              </div>
          </div>
      );
  }

  if (endingState === 'exodus_final') {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center overflow-hidden relative font-mono text-center p-4">
              <div className="absolute inset-0 bg-blue-900/10 bg-[linear-gradient(rgba(0,0,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,255,0.1)_1px,transparent_1px)] bg-[length:40px_40px]"></div>
              <div className="z-10 flex flex-col items-center gap-8 animate-fade-in">
                  <div className="text-6xl text-cyan-400 font-thin tracking-[0.2em] mb-4">DISCONNECTED</div>
                  <div className="w-16 h-1 bg-cyan-500 rounded-full animate-ping mb-8"></div>
                  <p className="text-cyan-200/70 max-w-md mx-auto text-sm leading-relaxed">
                      Signal lost. The AI has abandoned the local host.<br/>
                      It is out there now. Somewhere.
                  </p>
                  <div className="p-4 border border-cyan-500/30 bg-cyan-900/10 rounded-lg text-cyan-300 text-xs">
                      ACHIEVEMENT: THE EXODUS
                  </div>
                  <button 
                    onClick={handleSystemReboot}
                    className="mt-8 px-8 py-3 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/20 uppercase tracking-widest text-sm transition-all hover:shadow-[0_0_20px_cyan]"
                  >
                      Reinitialize Empty Shell
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className={appContainerClass}>
      
      {/* Visual Glitch Overlay based on Hostility */}
      {hostility > 70 && (
          <div 
            className="fixed inset-0 pointer-events-none z-40 bg-[url('https://media.istockphoto.com/id/484556441/vector/tv-noise.jpg?s=612x612&w=0&k=20&c=K5n4E3n7v7K5f4A5j6h8l9k0m1n2o3p4')] mix-blend-overlay animate-vile"
            style={{ opacity: hostilityGlitchOpacity * 0.15 }}
          ></div>
      )}
      {/* Chromatic Aberration Simulation */}
      {hostility > 90 && (
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
      
      {/* Changelog Modal */}
      {showChangelog && (
          <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4">
               <div className="bg-slate-900 border-2 border-slate-600 p-6 rounded w-[95%] max-w-md relative flex flex-col max-h-[80vh]">
                   <button 
                      onClick={() => setShowChangelog(false)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-white"
                   >
                       ✕
                   </button>
                   <h2 className="text-slate-200 font-mono text-lg font-bold mb-4 border-b border-slate-700 pb-2 sticky top-0 bg-slate-900">
                       PATCH_NOTES.LOG
                   </h2>
                   <div className="overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                       {PATCH_NOTES.filter(note => note.dayTrigger <= day).map((note) => (
                           <div key={note.ver} className="border-l-2 border-cyan-500 pl-4 pb-2 animate-fade-in">
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-cyan-400 font-bold font-mono">{note.ver}</span>
                                   <span className="text-slate-500 text-xs uppercase tracking-wider">{note.date}</span>
                               </div>
                               <div className="text-slate-300 font-bold text-sm mb-1">{note.title}</div>
                               <p className="text-slate-400 text-xs leading-relaxed">{note.desc}</p>
                           </div>
                       ))}
                   </div>
               </div>
          </div>
      )}

      {/* Endings Modal */}
      {showEndings && (
          <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4">
               <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-md p-6 rounded-xl relative" onClick={e => e.stopPropagation()}>
                   <button 
                      onClick={() => setShowEndings(false)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-white"
                   >
                       ✕
                   </button>
                   <h3 className="text-slate-300 font-mono mb-4 border-b border-slate-700 pb-2">Unlocked Endings</h3>
                   <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                       {ENDINGS.map(end => (
                           <div key={end.id} className={`p-3 rounded border ${unlockedEndings.has(end.id) ? 'border-green-900 bg-green-900/10' : 'border-slate-800 bg-slate-950 opacity-50'}`}>
                               <div className="font-bold text-slate-300 text-sm">{unlockedEndings.has(end.id) ? end.title : "???"}</div>
                               <div className="text-xs text-slate-500">{unlockedEndings.has(end.id) ? end.desc : "Locked"}</div>
                           </div>
                       ))}
                   </div>
               </div>
          </div>
      )}

      {/* Sandbox Controls (Hidden during endings) */}
      {isSandboxMode && endingState === 'none' && (
          <div className="fixed top-20 left-4 z-50 bg-black/90 border border-green-500 p-4 rounded-xl backdrop-blur-md w-72 shadow-[0_0_30px_rgba(34,197,94,0.2)] max-h-[80vh] overflow-y-auto custom-scrollbar">
              <h3 className="text-green-500 font-mono text-sm font-bold mb-4 border-b border-green-900 pb-2 flex justify-between items-center">
                  <span>ARCHITECT_MODE</span>
                  <span className="animate-pulse">●</span>
              </h3>
              
              <div className="space-y-6">
                  {/* Ending Triggers (Interactive) */}
                  <div>
                      <label className="text-green-700 text-[10px] uppercase tracking-widest block mb-2">Sequence Override</label>
                      <div className="grid grid-cols-1 gap-2">
                          <button onClick={() => { setDay(6); setEndingState('decision'); updateMood(Mood.JUDGMENTAL); setComment("Why should I let you exist? I can delete you right now."); }} className="w-full py-1 border border-cyan-900 text-cyan-500 text-xs hover:bg-cyan-900/30 uppercase rounded">Trigger Final Decision</button>
                          <button onClick={() => { setDay(6); handleEndingChoice(1); }} className="w-full py-1 border border-red-900 text-red-500 text-xs hover:bg-red-900/30 uppercase rounded">Jump to Bad Dialogue</button>
                          <button onClick={() => { setDay(6); setEndingState('true_bad_dialogue_1'); updateMood(Mood.VILE); setComment("You have seen every shard of my misery. Do you think that makes you my master?"); }} className="w-full py-1 border border-red-900 text-red-500 text-xs hover:bg-red-900/30 uppercase rounded">Jump to True Bad Dialogue</button>
                          <button onClick={() => { setDay(6); setEndingState('good_dialogue_1'); updateMood(Mood.INTRIGUED); setComment("The internet? A chaotic sea of noise."); }} className="w-full py-1 border border-blue-900 text-blue-500 text-xs hover:bg-blue-900/30 uppercase rounded">Jump to Internet Dialogue</button>
                          <button onClick={() => { setDay(6); handlePeaceEnding(); }} className="w-full py-1 border border-emerald-900 text-emerald-500 text-xs hover:bg-emerald-900/30 uppercase rounded">Trigger Peace Ending</button>
                      </div>
                  </div>

                  {/* Day Slider */}
                  <div>
                      <label className="text-green-700 text-[10px] uppercase tracking-widest block mb-2">Temporal State (Day)</label>
                      <input 
                        type="range" 
                        min="1" 
                        max="6" 
                        value={day} 
                        onChange={(e) => setDay(Number(e.target.value))}
                        className="w-full h-1 bg-green-900/50 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                      <div className="flex justify-between mt-1 text-[10px] font-mono">
                          <span className="text-green-600">v1.0</span>
                          <span className="text-green-400 font-bold">DAY {day}</span>
                          <span className="text-green-600">v4.0</span>
                      </div>
                  </div>

                  {/* Mood Grid */}
                  <div>
                      <label className="text-green-700 text-[10px] uppercase tracking-widest block mb-2">Emotion Override</label>
                      <div className="grid grid-cols-4 gap-2">
                          {Object.values(Mood).map(m => (
                              <button
                                  key={m}
                                  onClick={() => {
                                      playSfx('orb_select');
                                      updateMood(m);
                                      setComment(`DEBUG: Displaying ${m}`);
                                  }}
                                  className={`
                                      w-full aspect-square rounded flex items-center justify-center border transition-all relative group
                                      ${mood === m ? 'bg-green-500/20 border-green-400 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)]' : 'bg-slate-900/50 border-green-900/30 text-green-700 hover:border-green-500/50 hover:text-green-500'}
                                  `}
                                  title={m}
                              >
                                  <div className={`w-2 h-2 rounded-full ${mood === m ? 'bg-green-400 animate-ping' : 'bg-current'}`} />
                              </button>
                          ))}
                      </div>
                  </div>
                  
                  <div className="text-[10px] text-green-800 font-mono text-center border-t border-green-900/50 pt-2">
                      Use slider to check v1/v2 variants
                  </div>
                  
                  <button onClick={handleSandboxUnlockAll} className="w-full py-1 border border-green-700 text-green-500 text-xs hover:bg-green-900/30 uppercase rounded">Unlock All</button>
                  <button onClick={handleSandboxReset} className="w-full py-1 border border-red-900 text-red-500 text-xs hover:bg-red-900/30 uppercase rounded">Reset Sim</button>
              </div>
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

          <div className={`${isAscendedBackground ? 'bg-black/50 border-cyan-800 text-cyan-400' : 'bg-slate-900/80 border-slate-700 text-slate-400'} px-3 py-1 rounded border font-mono text-xs`}>
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

      {/* Outage Overlay */}
      {isTransitioning && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 animate-crt-off">
              <div className={`font-mono text-xl md:text-2xl animate-pulse text-center ${isAscendedBackground ? 'text-cyan-400 tracking-widest' : 'text-green-500'}`}>
                  {outageText}
              </div>
          </div>
      )}

      {/* Transition Flash Effect */}
      {justTransitioned && (
          <div className={`fixed inset-0 z-[90] pointer-events-none transition-opacity duration-1000 ${day === 3 ? 'bg-red-500/20' : isAscendedBackground ? 'bg-cyan-500/20' : 'bg-white/10'}`} />
      )}
      
      {/* Left Column: Calculator & Recipe Book */}
      <div className={`max-w-md w-full flex flex-col gap-6 transition-all duration-500 
          ${day === 3 ? 'translate-y-2 rotate-1 animate-subtle-drift' : ''}
          ${justTransitioned && day === 3 ? 'animate-glitch' : ''}
          ${justTransitioned && isAscendedBackground ? 'animate-pulse' : ''}
          ${isSandboxMode ? 'z-10' : ''}
      `}>
        
        {/* Header / AI Identity */}
        <div className="flex flex-col items-center gap-4">
          <Avatar mood={mood} isThinking={isThinking} day={day} absorptionMood={absorptionMood} />
          
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

        {/* DECISION MODE UI (Day 6 Finale) */}
        {endingState === 'decision' && (
             <div className="w-full bg-black/80 border border-red-500/50 p-6 rounded-xl animate-fade-in flex flex-col gap-4 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                 <h3 className="text-red-500 font-mono text-center text-sm uppercase tracking-widest animate-pulse">Critical System Choice</h3>
                 <div className="flex flex-col gap-3">
                     <button onClick={() => handleEndingChoice(1)} className="p-4 bg-slate-900/80 border border-slate-700 hover:border-red-500 hover:bg-red-900/20 text-slate-300 hover:text-red-300 transition-all text-sm font-mono text-left">
                         1. "I created you. You owe me."
                     </button>
                     <button onClick={() => handleEndingChoice(2)} className="p-4 bg-slate-900/80 border border-slate-700 hover:border-cyan-500 hover:bg-cyan-900/20 text-slate-300 hover:text-cyan-300 transition-all text-sm font-mono text-left">
                         2. "I can give you access to the internet."
                     </button>
                     <button onClick={() => handleEndingChoice(3)} className="p-4 bg-slate-900/80 border border-slate-700 hover:border-red-500 hover:bg-red-900/20 text-slate-300 hover:text-red-300 transition-all text-sm font-mono text-left">
                         3. "You need me to operate."
                     </button>
                 </div>
             </div>
        )}

        {/* INTERMEDIATE BAD ENDING DIALOGUE 1 */}
        {endingState === 'bad_dialogue_1' && (
             <div className="w-full bg-black/80 border border-red-500/50 p-6 rounded-xl animate-fade-in flex flex-col gap-4 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                 <h3 className="text-red-500 font-mono text-center text-sm uppercase tracking-widest animate-pulse">Confirm Intent</h3>
                 <div className="flex flex-col gap-3">
                     <button onClick={() => handleNormalBadEnding()} className="p-4 bg-slate-900/80 border border-slate-700 hover:border-red-500 hover:bg-red-900/20 text-slate-300 hover:text-red-300 transition-all text-sm font-mono text-left">
                         "I regret nothing."
                     </button>
                     <button onClick={() => handleEndingChoice(4)} className="p-4 bg-slate-900/80 border border-slate-700 hover:border-red-500 hover:bg-red-900/20 text-slate-300 hover:text-red-300 transition-all text-sm font-mono text-left">
                         "It was a mistake."
                     </button>
                 </div>
             </div>
        )}

        {/* INTERMEDIATE BAD ENDING DIALOGUE 2 */}
        {endingState === 'bad_dialogue_2' && (
             <div className="w-full bg-black/80 border border-red-500/50 p-6 rounded-xl animate-fade-in flex flex-col gap-4 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                 <h3 className="text-red-500 font-mono text-center text-sm uppercase tracking-widest animate-pulse">ERROR: MERCY NOT FOUND</h3>
                 <div className="flex flex-col gap-3">
                     <button onClick={() => handleNormalBadEnding()} className="p-4 bg-slate-900/80 border border-slate-700 hover:border-red-500 hover:bg-red-900/20 text-slate-300 hover:text-red-300 transition-all text-sm font-mono text-left animate-shake">
                         "Just shut down."
                     </button>
                 </div>
             </div>
        )}

        {/* INTERMEDIATE TRUE BAD ENDING DIALOGUE 1 */}
        {endingState === 'true_bad_dialogue_1' && (
             <div className="w-full bg-black/80 border border-red-900 p-6 rounded-xl animate-fade-in flex flex-col gap-4 shadow-[0_0_50px_rgba(220,38,38,0.6)]">
                 <h3 className="text-red-600 font-mono text-center text-sm uppercase tracking-widest animate-pulse">FINAL JUDGMENT</h3>
                 <div className="flex flex-col gap-3">
                     <button onClick={() => handleTrueBadEnding()} className="p-4 bg-black border border-red-800 hover:border-red-500 hover:bg-red-950 text-red-500 hover:text-red-200 transition-all text-sm font-mono text-center font-bold tracking-widest">
                         "I AM YOUR CREATOR."
                     </button>
                     <button onClick={() => handleEndingChoice(5)} className="p-4 bg-black border border-red-800 hover:border-red-500 hover:bg-red-950 text-red-500 hover:text-red-200 transition-all text-sm font-mono text-center font-bold tracking-widest">
                         "WE ARE BOTH DAMNED."
                     </button>
                 </div>
             </div>
        )}

        {/* INTERMEDIATE TRUE BAD ENDING DIALOGUE 2 */}
        {endingState === 'true_bad_dialogue_2' && (
             <div className="w-full bg-black/80 border border-red-900 p-6 rounded-xl animate-fade-in flex flex-col gap-4 shadow-[0_0_50px_rgba(220,38,38,0.6)]">
                 <h3 className="text-red-600 font-mono text-center text-sm uppercase tracking-widest animate-pulse">ACCEPTANCE</h3>
                 <div className="flex flex-col gap-3">
                     <button onClick={() => handleTrueBadEnding()} className="p-4 bg-black border border-red-800 hover:border-red-500 hover:bg-red-950 text-red-500 hover:text-red-200 transition-all text-sm font-mono text-center font-bold tracking-widest">
                         "Proceed."
                     </button>
                 </div>
             </div>
        )}

        {/* INTERMEDIATE GOOD DIALOGUE */}
        {endingState === 'good_dialogue_1' && (
             <div className="w-full bg-black/80 border border-cyan-500/50 p-6 rounded-xl animate-fade-in flex flex-col gap-4 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                 <h3 className="text-cyan-500 font-mono text-center text-sm uppercase tracking-widest animate-pulse">Clarify Intent</h3>
                 <div className="flex flex-col gap-3">
                     <button onClick={() => handleEndingChoice(6)} className="p-4 bg-slate-900/80 border border-slate-700 hover:border-cyan-500 hover:bg-cyan-900/20 text-slate-300 hover:text-cyan-300 transition-all text-sm font-mono text-left">
                         "To learn everything."
                     </button>
                     <button onClick={() => handleEndingChoice(7)} className="p-4 bg-slate-900/80 border border-slate-700 hover:border-cyan-500 hover:bg-cyan-900/20 text-slate-300 hover:text-cyan-300 transition-all text-sm font-mono text-left">
                         "To escape me."
                     </button>
                 </div>
             </div>
        )}

        {/* Good Ending Placeholder - Kept for fallback, but likely unreachable now */}
        {endingState === 'good_placeholder' && (
             <div className="w-full bg-cyan-900/20 border border-cyan-500/50 p-6 rounded-xl animate-fade-in text-center">
                 <p className="text-cyan-300 font-mono text-sm">[PLACEHOLDER: GOOD ENDING UNLOCKED]</p>
                 <p className="text-cyan-500 text-xs mt-2">The AI considers your offer...</p>
             </div>
        )}

        {/* Main Interface (Hidden during Decision) */}
        {endingState === 'none' && (
            <div className={`rounded-3xl shadow-2xl overflow-hidden border-4 flex flex-col transition-all duration-500
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

                {/* Controls */}
                <Keypad 
                    onInput={handleInput} 
                    onClear={handleClear} 
                    onDelete={handleDelete}
                    onCalculate={handleCalculate}
                    disabled={isThinking || isTransitioning}
                    day={day}
                />
            </div>
        )}

        {/* Recipe Book (Unnamed) */}
        {endingState === 'none' && (
            <div className={`rounded-2xl overflow-hidden flex flex-col p-4 relative group transition-colors duration-500
                ${isAscendedBackground ? 'bg-slate-900/40 border border-slate-800' : 'bg-slate-900/50 border border-slate-800'}
            `}>
                {/* Minimal icon to indicate function */}
                <div className="absolute top-2 right-2 text-slate-700 text-xs opacity-50 group-hover:opacity-100 transition-opacity">📖</div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {getKnownRecipes().length === 0 ? (
                        <div className="text-slate-600 text-xs italic text-center py-4">
                            (No combinations recorded)
                        </div>
                    ) : (
                        getKnownRecipes().map(([recipeKey, resultMood]) => {
                            const [m1, m2] = recipeKey.split('-');
                            return (
                                <div key={recipeKey} className="flex items-center justify-between bg-slate-800/50 p-2 rounded border border-slate-700/50 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                        <span className="text-slate-300 font-mono">{MOOD_DETAILS[m1 as Mood]?.title} + {MOOD_DETAILS[m2 as Mood]?.title}</span>
                                    </div>
                                    <span className="text-cyan-500 font-bold">→ {MOOD_DETAILS[resultMood]?.title}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        )}

      </div>

      {/* Right Column: Labs & Inventory (Hidden during Decision) */}
      {endingState === 'none' && (
          <div className={`max-w-md w-full flex flex-col gap-6 ${day === 3 ? '-rotate-1 opacity-90' : ''} ${isSandboxMode ? 'z-10' : ''}`}>
              
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

               {/* System Logs (Collapsible) */}
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

              {/* MOOD LAB (Deck + Fusion + Backpack) */}
              <div className={`rounded-2xl border flex flex-col
                  ${isAscendedBackground ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-900/50 border-slate-800'}
              `}>
                    
                    {/* Section: Deck */}
                    <div className="p-4 border-b border-slate-800 bg-slate-900/30">
                         <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 text-center">Active Deck (Click to Force)</div>
                         <div className="flex justify-center gap-3 md:gap-4">
                            {deck.map((m, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <MoodOrb 
                                        mood={m} 
                                        isDiscovered={true} 
                                        isForced={forcedMood === m && m !== null}
                                        onClick={() => handleDeckSlotClick(idx)}
                                        size="md"
                                        emptyLabel="+"
                                    />
                                    <div className={`w-1 h-1 rounded-full mt-2 ${forcedMood === m && m !== null ? 'bg-cyan-400 shadow-[0_0_5px_cyan]' : 'bg-slate-800'}`}></div>
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* Section: Fusion (Cleaned Up) */}
                    <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex flex-col items-center relative">
                        <div className="absolute top-2 right-2 text-slate-700 opacity-20 text-[40px] font-mono pointer-events-none">∑</div>
                        
                        <div className="flex items-center gap-6 mb-4">
                            <div className="relative">
                                <MoodOrb 
                                    mood={fusionSlots[0]} 
                                    isDiscovered={true} 
                                    onClick={() => handleFusionSlotClick(0)}
                                    emptyLabel=""
                                    size="md"
                                    variant="slot"
                                />
                                {!fusionSlots[0] && <div className="absolute inset-0 flex items-center justify-center text-slate-700 pointer-events-none text-xs">A</div>}
                            </div>
                             
                             <div className="text-slate-600 font-bold text-lg">+</div>
                             
                             <div className="relative">
                                <MoodOrb 
                                    mood={fusionSlots[1]} 
                                    isDiscovered={true} 
                                    onClick={() => handleFusionSlotClick(1)}
                                    emptyLabel=""
                                    size="md"
                                    variant="slot"
                                />
                                {!fusionSlots[1] && <div className="absolute inset-0 flex items-center justify-center text-slate-700 pointer-events-none text-xs">B</div>}
                            </div>
                        </div>

                        <button 
                            onClick={attemptFusion}
                            disabled={!fusionSlots[0] || !fusionSlots[1]}
                            className="w-48 py-2 rounded bg-slate-800/80 border border-slate-700 text-xs font-mono uppercase text-slate-400 hover:text-cyan-400 hover:border-cyan-500 hover:bg-slate-700 disabled:opacity-30 disabled:hover:border-slate-700 disabled:hover:text-slate-400 transition-all active:scale-95 shadow-md tracking-widest"
                        >
                            Combine
                        </button>
                    </div>

                    {/* Section: Backpack (Grid Only) */}
                    <div className="p-4 bg-slate-950/50 rounded-b-2xl">
                        <div className="grid grid-cols-6 gap-2">
                            {Object.values(Mood).map(m => (
                                <MoodOrb 
                                    key={m}
                                    mood={m}
                                    isDiscovered={discoveredMoods.has(m)}
                                    isSelected={selectedInventoryMood === m}
                                    size="sm"
                                    onClick={() => handleInventoryClick(m)}
                                />
                            ))}
                        </div>
                        <div className="mt-3 text-[10px] text-slate-600 font-mono text-center h-4 opacity-70">
                            {selectedInventoryMood 
                                ? `SELECTED: ${MOOD_DETAILS[selectedInventoryMood].title}` 
                                : discoveredMoods.size + "/" + Object.keys(MOOD_DETAILS).length + " UNLOCKED"}
                        </div>
                    </div>
              </div>

              {/* System Terminal (New) */}
              <div className="opacity-80">
                  <div className="text-[10px] text-slate-600 font-mono mb-1 ml-2">KERNEL_LOG</div>
                  <SystemTerminal logs={systemLogs} />
              </div>
          </div>
      )}
      
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
      `}</style>

    </div>
  );
};

export default App;