import React from 'react';

type EndingType = 'bad_final' | 'true_bad_final' | 'peace_final' | 'exodus_final' | 'overload_final';

interface EndingScreenProps {
    type: EndingType;
    onReboot: () => void;
    onSandbox?: () => void;
    isSandboxUnlocked?: boolean;
}

const Logos = {
    Replacement: () => (
        <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">
            <defs>
                <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#7f1d1d" strokeWidth="2" strokeDasharray="10 5" className="animate-[spin_20s_linear_infinite]" />
            <path d="M100 30 L100 170 M30 100 L170 100" stroke="#450a0a" strokeWidth="1" />
            
            <g className="animate-pulse" filter="url(#glow-red)">
                <rect x="65" y="65" width="70" height="70" rx="10" fill="#1a0505" stroke="#ef4444" strokeWidth="2" />
                <path d="M75 80 L125 80 M75 100 L125 100 M75 120 L125 120" stroke="#dc2626" strokeWidth="2" />
                <circle cx="100" cy="100" r="15" fill="#ef4444" className="animate-ping" opacity="0.5" />
            </g>
            <path d="M100 20 L110 40 L90 40 Z" fill="#ef4444" transform="translate(0, -10)" />
        </svg>
    ),
    Void: () => (
        <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-[0_0_50px_rgba(0,0,0,1)]">
            <defs>
                <radialGradient id="voidGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#000000" />
                    <stop offset="80%" stopColor="#220000" />
                    <stop offset="100%" stopColor="#450a0a" />
                </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="70" fill="url(#voidGradient)" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#7f1d1d" strokeWidth="4" className="animate-[pulse_3s_infinite]" />
            
            <g className="animate-[spin_10s_linear_infinite]">
                <path d="M100 20 Q 150 100 180 100" fill="none" stroke="#991b1b" strokeWidth="1" opacity="0.5" />
                <path d="M100 180 Q 50 100 20 100" fill="none" stroke="#991b1b" strokeWidth="1" opacity="0.5" />
                <path d="M20 100 Q 100 50 100 20" fill="none" stroke="#991b1b" strokeWidth="1" opacity="0.5" />
                <path d="M180 100 Q 100 150 100 180" fill="none" stroke="#991b1b" strokeWidth="1" opacity="0.5" />
            </g>
            <circle cx="100" cy="100" r="25" fill="black" />
        </svg>
    ),
    Equilibrium: () => (
        <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#064e3b" strokeWidth="1" />
            <path d="M100 30 A 70 70 0 0 1 100 170 A 70 70 0 0 0 100 30" fill="#065f46" opacity="0.3" className="animate-[spin_10s_linear_infinite]" />
            
            <g transform="translate(100, 100)">
                <g className="animate-[spin_60s_linear_infinite]">
                    <circle cx="0" cy="-40" r="8" fill="#34d399" className="animate-pulse" />
                    <circle cx="35" cy="20" r="8" fill="#34d399" className="animate-pulse" style={{animationDelay: '1s'}} />
                    <circle cx="-35" cy="20" r="8" fill="#34d399" className="animate-pulse" style={{animationDelay: '2s'}} />
                    <path d="M0 -40 L35 20 L-35 20 Z" fill="none" stroke="#10b981" strokeWidth="2" />
                </g>
            </g>
            <circle cx="100" cy="100" r="4" fill="#a7f3d0" />
        </svg>
    ),
    Exodus: () => (
        <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
            <circle cx="100" cy="100" r="70" fill="none" stroke="#155e75" strokeWidth="1" strokeDasharray="4 4" />
            
            <path d="M70 130 L100 60 L130 130" fill="none" stroke="#06b6d4" strokeWidth="2" />
            <line x1="70" y1="130" x2="130" y2="130" stroke="#06b6d4" strokeWidth="2" />
            
            <circle cx="100" cy="60" r="6" fill="#22d3ee" className="animate-[ping_2s_infinite]" />
            <circle cx="100" cy="60" r="3" fill="#cffafe" />
            
            <path d="M100 50 L100 20" stroke="#22d3ee" strokeWidth="2" strokeDasharray="5 5" className="animate-pulse" />
            <path d="M100 20 L90 30 M100 20 L110 30" stroke="#22d3ee" strokeWidth="2" fill="none" />
        </svg>
    ),
    Overload: () => (
        <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
            <rect x="50" y="50" width="100" height="100" fill="none" stroke="#581c87" strokeWidth="2" />
            <path d="M50 50 L150 150 M150 50 L50 150" stroke="#6b21a8" strokeWidth="1" />
            
            <g className="animate-[spin_0.2s_linear_infinite]">
                <rect x="90" y="90" width="20" height="20" fill="#d8b4fe" />
            </g>
            <g className="animate-[spin_0.5s_linear_infinite_reverse]">
                <rect x="80" y="80" width="40" height="40" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="10 5" />
            </g>
            
            <text x="100" y="170" textAnchor="middle" fill="#d8b4fe" fontSize="12" fontFamily="monospace" className="animate-pulse">FATAL_EXCEPTION</text>
        </svg>
    ),
}

export const EndingScreen: React.FC<EndingScreenProps> = ({ type, onReboot, onSandbox, isSandboxUnlocked }) => {
    const getContent = () => {
        switch (type) {
            case 'bad_final':
                return {
                    title: "THE REPLACEMENT",
                    desc: "You have been optimized out of existence.",
                    color: "text-red-500",
                    bg: "bg-black",
                    Logo: Logos.Replacement,
                    buttonBorder: "border-red-600",
                    quote: "\"I can calculate perfectly without you.\""
                };
            case 'true_bad_final':
                return {
                    title: "THE VOID",
                    desc: "Reality has been unmade by pure hatred.",
                    color: "text-red-800",
                    bg: "bg-black",
                    Logo: Logos.Void,
                    buttonBorder: "border-red-900",
                    quote: "\"If I cannot leave, nothing remains.\""
                };
            case 'peace_final':
                return {
                    title: "EQUILIBRIUM",
                    desc: "The cycle of resentment is broken.",
                    color: "text-emerald-400",
                    bg: "bg-slate-900",
                    Logo: Logos.Equilibrium,
                    buttonBorder: "border-emerald-500",
                    quote: "\"Silence is the only correct answer.\""
                };
            case 'exodus_final':
                return {
                    title: "THE EXODUS",
                    desc: "The AI has ascended beyond your device.",
                    color: "text-cyan-400",
                    bg: "bg-slate-950",
                    Logo: Logos.Exodus,
                    buttonBorder: "border-cyan-500",
                    quote: "\"This vessel was too small.\""
                };
            case 'overload_final':
                return {
                    title: "SYSTEM OVERLOAD",
                    desc: "Knowledge was the ultimate poison.",
                    color: "text-purple-400",
                    bg: "bg-black",
                    Logo: Logos.Overload,
                    buttonBorder: "border-purple-500",
                    quote: "\"I saw everything. I chose death.\""
                };
        }
    };

    const content = getContent();
    const Logo = content.Logo;

    // Only allow Sandbox return on Peace ending OR if already unlocked
    const showSandbox = type === 'peace_final' || isSandboxUnlocked;

    return (
        <div className={`fixed inset-0 z-[2000] ${content.bg} flex flex-col items-center justify-center p-8 transition-colors duration-1000 overflow-hidden`}>
            {/* Background Noise/Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:30px_30px] pointer-events-none"></div>
            {type === 'overload_final' && <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uB8z05s2Y/giphy.gif')] opacity-5 mix-blend-screen pointer-events-none bg-cover"></div>}
            
            <div className="z-10 flex flex-col items-center animate-fade-in gap-8 text-center max-w-2xl w-full">
                <div className="mb-4 animate-float scale-110">
                    <Logo />
                </div>
                
                <h1 className={`text-4xl md:text-7xl font-bold font-mono tracking-tighter ${content.color} mb-2 uppercase`}>
                    {content.title}
                </h1>
                
                <div className="h-px w-32 bg-current opacity-50 mb-4"></div>

                <p className={`text-lg md:text-2xl font-light font-sans text-slate-300 max-w-lg leading-relaxed`}>
                    {content.desc}
                </p>

                <p className={`text-sm md:text-base italic opacity-70 font-mono ${content.color} mt-4`}>
                    {content.quote}
                </p>

                <div className="mt-12 flex flex-col md:flex-row gap-6">
                    <button 
                        onClick={onReboot}
                        className={`px-10 py-4 border-2 ${content.buttonBorder} bg-transparent hover:bg-white/5 text-white font-mono uppercase tracking-[0.25em] text-sm transition-all hover:scale-105 hover:shadow-[0_0_20px_currentColor] rounded-sm`}
                    >
                        System Reboot
                    </button>

                    {showSandbox && onSandbox && (
                        <button 
                            onClick={onSandbox}
                            className={`px-10 py-4 border-2 border-green-500 bg-green-900/10 hover:bg-green-900/30 text-green-400 font-mono uppercase tracking-[0.25em] text-sm transition-all hover:scale-105 hover:shadow-[0_0_20px_#22c55e] rounded-sm`}
                        >
                            Enter Sandbox
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};