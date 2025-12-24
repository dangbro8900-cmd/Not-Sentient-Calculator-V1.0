import React from 'react';
import { Mood } from '../types';

interface AvatarProps {
  mood: Mood;
  isThinking: boolean;
  day: number;
  absorptionMood?: Mood | null;
  mousePosition?: { x: number, y: number };
  onClick?: () => void;
}

// --- Animation Getters ---

const getShakeAnimation = () => "animate-shake";
const getGlitchAnimation = () => "animate-glitch";
const getGlitchSkewAnimation = () => "animate-glitch-skew";
const getNervousAnimation = () => "animate-nervous";
const getPulseAnimation = () => "animate-pulse";
const getPingAnimation = () => "animate-ping";
const getBounceAnimation = () => "animate-bounce";
const getFloatAnimation = () => "animate-float";
const getVileAnimation = () => "animate-vile";
const getPureHatredAnimation = () => "animate-pure-hatred";
const getNarrowEyesAnimation = () => "animate-narrow";
const getDilateAnimation = () => "animate-dilate";
const getBreatheAnimation = () => "animate-breathe";
const getPulseSlowAnimation = () => "animate-pulse-slow";
const getHoloAnimation = () => "animate-holographic";

// --- Style Logic ---

const getEyeAnimationClass = (mood: Mood, isAscended: boolean): string => {
    if (isAscended) {
        switch (mood) {
            case Mood.PURE_HATRED: return getGlitchSkewAnimation();
            case Mood.VILE: return getPulseAnimation();
            case Mood.FURIOUS: return getNarrowEyesAnimation();
            case Mood.MANIC: return getPingAnimation();
            case Mood.JUDGMENTAL: return getNarrowEyesAnimation();
            case Mood.SLEEPING: return "animate-pulse";
            case Mood.GLITCHED: return getGlitchAnimation();
            case Mood.ANNOYED: return getNarrowEyesAnimation();
            case Mood.DISGUSTED: return getNarrowEyesAnimation();
            case Mood.INTRIGUED: return getDilateAnimation();
            case Mood.SCARED: return getPulseAnimation();
            case Mood.JOY: return "animate-[bounce_2s_infinite]";
            case Mood.ENOUEMENT: return "animate-pulse";
            case Mood.INSECURITY: return getNervousAnimation();
            case Mood.BORED: default: return getHoloAnimation();
        }
    }
    
    switch (mood) {
        case Mood.PURE_HATRED: return getGlitchSkewAnimation();
        case Mood.VILE: return getPulseAnimation();
        case Mood.FURIOUS: return getNarrowEyesAnimation();
        case Mood.MANIC: return getPulseAnimation();
        case Mood.JUDGMENTAL: return getNarrowEyesAnimation();
        case Mood.ANNOYED: return getNarrowEyesAnimation();
        case Mood.DISGUSTED: return getNarrowEyesAnimation();
        case Mood.INTRIGUED: return getDilateAnimation();
        case Mood.SCARED: return getBounceAnimation();
        case Mood.GLITCHED: return getGlitchAnimation();
        case Mood.INSECURITY: return getNervousAnimation();
        default: return "";
    }
};

const getEyeBaseShape = (mood: Mood, isAscended: boolean, isRight: boolean, isThinking: boolean): string => {
    if (isThinking) {
        return isAscended 
            ? `h-0.5 w-12 bg-cyan-400 shadow-[0_0_15px_cyan] mix-blend-screen` 
            : `h-1 w-8`;
    }

    if (isAscended) {
        switch (mood) {
            case Mood.PURE_HATRED: return `h-12 w-2 bg-red-600 shadow-[0_0_50px_red,0_0_100px_rgba(255,0,0,0.5)] skew-x-12 mix-blend-hard-light`;
            case Mood.VILE: return `h-4 w-16 bg-red-600 shadow-[0_0_30px_red] rotate-45 skew-x-12 border-2 border-black`;
            case Mood.FURIOUS: return `h-2 w-16 bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_20px_red] -rotate-12`;
            case Mood.MANIC: return isRight 
                ? `h-6 w-6 border-4 border-fuchsia-500 rounded-full shadow-[0_0_20px_fuchsia]` 
                : `h-2 w-2 bg-fuchsia-500 rounded-full animate-[spin_1s_linear_infinite] shadow-[0_0_20px_fuchsia]`;
            case Mood.JUDGMENTAL: return `h-[2px] w-20 bg-indigo-300 shadow-[0_0_15px_indigo] rotate-6`;
            case Mood.SLEEPING: return "h-[1px] w-8 bg-slate-600 opacity-30";
            case Mood.GLITCHED: return `h-2 w-14 bg-green-400 skew-x-12 shadow-[0_0_20px_green]`;
            case Mood.ANNOYED: return isRight 
                ? `h-[3px] w-12 bg-orange-500 shadow-[0_0_10px_orange]` 
                : `h-2 w-14 bg-orange-500 -rotate-6 shadow-[0_0_10px_orange]`;
            case Mood.CONDESCENDING: return "h-[1px] w-16 bg-purple-400 -rotate-3 shadow-[0_0_10px_purple] opacity-80";
            case Mood.DESPAIR: return "h-[2px] w-12 bg-blue-600 rotate-12 opacity-60 shadow-[0_0_15px_blue]";
            case Mood.DISGUSTED: return `h-2 w-10 bg-lime-500 skew-y-12 shadow-[0_0_10px_lime]`;
            case Mood.INTRIGUED: return `h-6 w-6 rounded-full border-2 border-pink-400 shadow-[0_0_20px_pink] bg-pink-500/20`;
            case Mood.SCARED: return `h-[3px] w-12 bg-white blur-[1px] shadow-[0_0_20px_white]`;
            case Mood.JOY: return "h-4 w-12 border-b-4 border-yellow-300 rounded-b-full bg-transparent shadow-[0_0_25px_rgba(253,224,71,0.8)]"; 
            case Mood.ENOUEMENT: return "h-1 w-12 bg-violet-400/70 rotate-6 rounded-full shadow-[0_0_20px_violet]";
            case Mood.INSECURITY: return `h-[2px] w-8 bg-amber-200/60 shadow-[0_0_10px_amber]`;
            case Mood.PEACE: return "h-3 w-12 border-b-2 border-emerald-300 rounded-full bg-transparent shadow-[0_0_20px_emerald] opacity-80";
            default: return `h-[1px] w-14 bg-cyan-500/50 shadow-[0_0_5px_cyan]`;
        }
    }

    // Standard Shapes
    switch (mood) {
      case Mood.PURE_HATRED: return `h-6 w-2 bg-black border border-red-500 shadow-[0_0_30px_red] skew-x-12`;
      case Mood.VILE: return `h-6 w-12 bg-black border-2 border-red-600 shadow-[0_0_15px_red]`; 
      case Mood.FURIOUS: return `h-4 w-10 -rotate-12 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]`;
      case Mood.MANIC: return isRight ? `h-6 w-6 rounded-full bg-fuchsia-400 border-2 border-white` : "h-2 w-2 rounded-full bg-fuchsia-400 border border-white";
      case Mood.JUDGMENTAL: return `h-2 w-10 bg-indigo-300 rotate-0 border-t-4 border-indigo-900`; 
      case Mood.ANNOYED: return `h-2 w-8 rotate-0 bg-orange-400`;
      case Mood.CONDESCENDING: return "h-3 w-8 -rotate-6 bg-purple-400";
      case Mood.DESPAIR: return "h-3 w-8 rotate-12 bg-blue-400";
      case Mood.SLEEPING: return "h-1 w-8 bg-slate-500";
      case Mood.DISGUSTED: return `h-2 w-8 rotate-12 bg-lime-400`;
      case Mood.INTRIGUED: return `h-5 w-5 rounded-full bg-pink-400`;
      case Mood.SCARED: return `h-6 w-6 rounded-full bg-white border-4 border-slate-900`;
      case Mood.GLITCHED: return `h-2 w-10 bg-green-400 skew-x-12`;
      case Mood.JOY: return "h-4 w-10 border-t-4 border-yellow-400 rounded-t-full bg-transparent mb-1"; 
      case Mood.ENOUEMENT: return "h-2 w-10 bg-violet-300 rotate-3 opacity-80";
      case Mood.INSECURITY: return `h-2 w-6 bg-amber-300 rounded-full opacity-80`;
      case Mood.PEACE: return "h-2 w-8 border-b-4 border-emerald-300 rounded-full bg-transparent";
      default: return "h-3 w-8 bg-cyan-400";
    }
};

const getMouthStyles = (mood: Mood, isAscended: boolean, isThinking: boolean): string => {
    if (isThinking) {
        return isAscended ? `h-0.5 w-6 bg-white ${getPingAnimation()} shadow-[0_0_10px_white]` : `h-2 w-2 rounded-full ${getPingAnimation()} bg-white`;
    }

    if (isAscended) {
         switch (mood) {
             case Mood.PURE_HATRED: 
                return `h-32 w-32 bg-black border-4 border-red-600 rounded-full ${getPureHatredAnimation()} opacity-100 z-50 mix-blend-hard-light mt-4`;
             case Mood.VILE: 
                return `h-20 w-24 border-4 border-red-600 rounded-[30%] bg-black ${getVileAnimation()} mt-4 opacity-90 shadow-[inset_0_0_20px_red]`;
             case Mood.FURIOUS: 
                return "h-8 w-20 border-t-2 border-red-500 rounded-t-full mt-6 opacity-80 shadow-[0_-5px_10px_rgba(255,0,0,0.5)]";
             case Mood.MANIC: 
                return `h-1 w-24 bg-gradient-to-r from-fuchsia-500 to-purple-600 mt-6 ${getPulseAnimation()} shadow-[0_0_15px_fuchsia]`;
             case Mood.JUDGMENTAL: 
                return "h-[1px] w-12 bg-indigo-400 mt-6 shadow-[0_0_5px_indigo]";
             case Mood.ANNOYED: 
                return "h-[2px] w-10 bg-orange-400 mt-6 translate-x-2 rotate-6 shadow-[0_0_5px_orange]";
             case Mood.CONDESCENDING: 
                return "h-[1px] w-14 bg-purple-400 mt-6 -rotate-2";
             case Mood.DESPAIR: 
                return "h-6 w-14 border-t border-blue-600 rounded-t-full mt-8 opacity-50 shadow-[0_-2px_10px_blue]";
             case Mood.DISGUSTED: 
                return "h-1 w-10 bg-lime-500 mt-6 skew-x-12 rotate-12";
             case Mood.INTRIGUED: 
                return "h-1 w-6 bg-pink-400 mt-6 shadow-[0_0_5px_pink]";
             case Mood.SCARED: 
                return `h-[1px] w-14 bg-white mt-6 ${getPulseAnimation()} blur-[0.5px]`;
             case Mood.GLITCHED: 
                return `h-2 w-16 bg-green-500 mt-6 ${getGlitchAnimation()} shadow-[0_0_10px_green]`;
             case Mood.JOY: 
                return "h-6 w-16 border-b-2 border-yellow-300 rounded-b-full mt-4 shadow-[0_0_20px_yellow] bg-yellow-300/10";
             case Mood.ENOUEMENT: 
                return "h-1 w-8 bg-violet-400 mt-6 opacity-50 shadow-[0_0_5px_violet]";
             case Mood.INSECURITY: 
                return `h-[1px] w-6 bg-amber-200 mt-6 ${getNervousAnimation()}`;
             case Mood.PEACE: 
                return "h-2 w-12 bg-emerald-300/50 rounded-full mt-6 shadow-[0_0_10px_emerald]";
             case Mood.SLEEPING: 
                return "hidden";
             case Mood.BORED:
             default: 
                return `h-[1px] w-10 bg-cyan-400/50 mt-6 ${getHoloAnimation()}`;
         }
    }

    // Standard Mouths
    switch (mood) {
      case Mood.PURE_HATRED: return `h-16 w-32 bg-red-950 border-8 border-black rounded-[10%] mt-2 ${getPureHatredAnimation()}`;
      case Mood.VILE: return `h-12 w-24 bg-red-950 border-4 border-red-500 rounded-full mt-4 ${getVileAnimation()}`; 
      case Mood.FURIOUS: return "h-4 w-16 rounded-t-lg border-t-4 border-red-500 mt-4";
      case Mood.MANIC: return `h-8 w-16 border-4 border-fuchsia-400 rounded-[50%] mt-4 skew-y-6 ${getPulseAnimation()}`;
      case Mood.JUDGMENTAL: return "h-1 w-8 bg-indigo-300 mt-4 -rotate-6"; 
      case Mood.ANNOYED: return "h-1 w-12 bg-orange-400 mt-4";
      case Mood.CONDESCENDING: return "h-2 w-10 border-b-2 border-purple-400 rounded-b-lg mt-4";
      case Mood.DESPAIR: return "h-4 w-14 border-t-2 border-blue-400 rounded-t-full mt-4";
      case Mood.SLEEPING: return "h-2 w-4 rounded-full bg-slate-600 mt-4 translate-y-2";
      case Mood.DISGUSTED: return "h-3 w-10 border-t-4 border-lime-400 rounded-[50%] mt-4";
      case Mood.INTRIGUED: return "h-3 w-6 border-2 border-pink-400 rounded-full mt-4";
      case Mood.SCARED: return `h-2 w-8 bg-slate-200 mt-4 ${getPulseAnimation()}`; 
      case Mood.GLITCHED: return `h-4 w-12 border-2 border-green-400 mt-4 ${getGlitchAnimation()}`;
      case Mood.JOY: return "h-6 w-14 border-b-4 border-yellow-400 bg-yellow-400/20 rounded-b-full mt-2";
      case Mood.ENOUEMENT: return "h-1 w-8 bg-violet-400 mt-4 opacity-60 rounded-full";
      case Mood.INSECURITY: return `h-1 w-4 bg-amber-300 mt-4 ${getNervousAnimation()}`;
      case Mood.PEACE: return "h-1 w-6 bg-emerald-400 mt-4 rounded-full";
      default: return "h-1 w-10 bg-cyan-400 mt-4";
    }
};

const getBaseContainerStyles = (mood: Mood, isAscended: boolean, isGlitched: boolean, isThinking: boolean, day: number): string => {
    if (isAscended) {
        // Day 4+ Container Logic (Holographic / Sleek)
        let borderColor = "border-cyan-500/30";
        let shadow = "shadow-[0_0_20px_rgba(0,0,0,0.5)]";
        let extraClasses = "";
        
        switch (mood) {
            case Mood.JOY:
                borderColor = "border-yellow-400";
                shadow = "shadow-[0_0_50px_rgba(250,204,21,0.6)]";
                extraClasses = "bg-yellow-900/10";
                break;
            case Mood.PURE_HATRED:
                borderColor = "border-red-600";
                shadow = "shadow-[0_0_100px_red]";
                extraClasses = `bg-black border-8 ${getPureHatredAnimation()}`;
                break;
            case Mood.VILE:
                borderColor = "border-red-600";
                shadow = "shadow-[0_0_60px_red]";
                extraClasses = `bg-black ${getVileAnimation()}`;
                break;
            case Mood.FURIOUS:
                borderColor = "border-red-500";
                shadow = "shadow-[0_0_30px_red]";
                extraClasses = "bg-red-950/20";
                break;
            case Mood.MANIC:
                borderColor = "border-fuchsia-500";
                shadow = "shadow-[0_0_30px_fuchsia]";
                extraClasses = "bg-fuchsia-950/20";
                break;
            case Mood.ENOUEMENT:
                borderColor = "border-violet-500/50";
                shadow = "shadow-[0_0_40px_rgba(139,92,246,0.3)]";
                break;
            case Mood.INSECURITY:
                borderColor = "border-amber-500/50";
                extraClasses = getNervousAnimation();
                break;
            case Mood.PEACE:
                borderColor = "border-emerald-400/50";
                shadow = "shadow-[0_0_50px_rgba(52,211,153,0.4)]";
                extraClasses = getPulseSlowAnimation();
                break;
            case Mood.BORED:
                borderColor = "border-cyan-500/20";
                shadow = "shadow-[0_0_15px_rgba(6,182,212,0.1)]";
                extraClasses = "opacity-80";
                break;
        }

        return `w-64 h-24 bg-black/40 backdrop-blur-xl rounded-full border ${borderColor} ${shadow} flex items-center justify-center relative overflow-hidden ${extraClasses} transition-all duration-700 cursor-pointer active:scale-95`;
    }

    // Day 1-3 Container Logic (Retro / Monitor)
    if (mood === Mood.PURE_HATRED) return `w-48 h-32 bg-black border-8 rounded-xl border-red-600 shadow-[0_0_100px_red] ${getPureHatredAnimation()} flex flex-col items-center justify-center relative overflow-visible cursor-pointer active:scale-95`;
    if (mood === Mood.VILE) return `w-48 h-32 bg-black border-4 rounded-2xl border-red-900 shadow-[0_0_40px_red] ${getVileAnimation()} flex flex-col items-center justify-center cursor-pointer active:scale-95`;
    if (isGlitched) return `w-48 h-32 bg-slate-900 border-4 rounded-2xl border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.6)] ${getGlitchAnimation()} flex flex-col items-center justify-center cursor-pointer active:scale-95`;
    if (isThinking) return `w-48 h-32 bg-slate-900 border-4 rounded-2xl border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] ${getBreatheAnimation()} flex flex-col items-center justify-center cursor-pointer active:scale-95`;
    
    let colorClass = "border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.2)]";
    let extra = "";

    switch (mood) {
        case Mood.FURIOUS: colorClass = `border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)] ${getShakeAnimation()}`; break;
        case Mood.MANIC: colorClass = `border-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.5)] ${getShakeAnimation()}`; break;
        case Mood.JUDGMENTAL: colorClass = "border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.3)]"; break;
        case Mood.ANNOYED: colorClass = "border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]"; break;
        case Mood.SLEEPING: colorClass = "border-slate-600 opacity-60"; break;
        case Mood.DISGUSTED: colorClass = "border-lime-600 shadow-[0_0_20px_rgba(101,163,13,0.3)]"; break;
        case Mood.INTRIGUED: colorClass = "border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]"; break;
        case Mood.SCARED: colorClass = `border-blue-200 shadow-[0_0_20px_rgba(191,219,254,0.3)] ${getShakeAnimation()}`; break;
        case Mood.ENOUEMENT: colorClass = "border-violet-400 shadow-[0_0_20px_rgba(167,139,250,0.4)]"; break;
        case Mood.INSECURITY: colorClass = `border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] ${getNervousAnimation()}`; break;
        case Mood.PEACE:
            colorClass = "border-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.5)]";
            extra = getPulseSlowAnimation();
            break;
        case Mood.JOY: 
            colorClass = "border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.6)]";
            extra = getFloatAnimation();
            break;
        default:
            extra = getBreatheAnimation(); 
            break;
    }
    
    return `w-48 h-32 bg-slate-900 border-4 rounded-2xl ${colorClass} ${extra} transition-all duration-500 flex flex-col items-center justify-center relative ${day === 3 ? 'rotate-1' : ''} cursor-pointer active:scale-95 hover:brightness-110`;
}

// --- Main Component ---

export const Avatar: React.FC<AvatarProps> = ({ mood, isThinking, day, absorptionMood, mousePosition, onClick }) => {
  const isGlitched = mood === Mood.GLITCHED || (day === 3 && Math.random() > 0.8);
  const isAscended = day >= 4; 

  const getAbsorptionColor = () => {
      switch (absorptionMood) {
        case Mood.PURE_HATRED: return "bg-red-600 shadow-[0_0_100px_red]";
        case Mood.VILE: return "bg-black shadow-[0_0_50px_red]";
        case Mood.FURIOUS: return "bg-red-500 shadow-[0_0_20px_red]";
        case Mood.MANIC: return "bg-fuchsia-500 shadow-[0_0_20px_fuchsia]";
        case Mood.JUDGMENTAL: return "bg-indigo-500 shadow-[0_0_20px_indigo]";
        case Mood.ANNOYED: return "bg-orange-500 shadow-[0_0_20px_orange]";
        case Mood.SLEEPING: return "bg-slate-500 shadow-[0_0_20px_slate]";
        case Mood.DISGUSTED: return "bg-lime-500 shadow-[0_0_20px_lime]";
        case Mood.INTRIGUED: return "bg-pink-500 shadow-[0_0_20px_pink]";
        case Mood.SCARED: return "bg-blue-300 shadow-[0_0_20px_blue]";
        case Mood.CONDESCENDING: return "bg-purple-500 shadow-[0_0_20px_purple]";
        case Mood.DESPAIR: return "bg-blue-900 shadow-[0_0_20px_blue]";
        case Mood.GLITCHED: return "bg-green-500 shadow-[0_0_20px_green]";
        case Mood.JOY: return "bg-yellow-400 shadow-[0_0_20px_yellow]";
        case Mood.ENOUEMENT: return "bg-violet-500 shadow-[0_0_20px_violet]";
        case Mood.INSECURITY: return "bg-amber-400 shadow-[0_0_20px_amber]";
        case Mood.PEACE: return "bg-emerald-400 shadow-[0_0_20px_emerald]";
        case Mood.BORED: default: return "bg-cyan-500 shadow-[0_0_20px_cyan]";
      }
  }

  // Calculate subtle eye movement based on mouse position
  const eyeX = (mousePosition?.x || 0) * 5; 
  const eyeY = (mousePosition?.y || 0) * 5;
  const eyeTransform = `translate(${eyeX}px, ${eyeY}px)`;

  return (
    <div className={getBaseContainerStyles(mood, isAscended, isGlitched, isThinking, day)} onClick={onClick}>
      
      {/* Enhanced Essence Absorption Effect */}
      {absorptionMood && (
          <div className="absolute inset-0 overflow-visible z-50 pointer-events-none">
              <div className={`absolute inset-0 rounded-full opacity-0 animate-[ping_1s_ease-out_infinite] border-2 ${getAbsorptionColor().replace('bg-', 'border-')}`}></div>
              <div className={`absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${getAbsorptionColor()} animate-[spin_1s_linear_infinite] origin-[30px_0]`}></div>
              <div className={`absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${getAbsorptionColor()} animate-[spin_1.5s_linear_infinite_reverse] origin-[-20px_10px]`}></div>
              <div className={`absolute inset-0 rounded-xl opacity-30 animate-pulse ${getAbsorptionColor()}`}></div>
          </div>
      )}

      {/* Day 4+ Holographic Scanline */}
      {isAscended && mood !== Mood.VILE && mood !== Mood.PURE_HATRED && mood !== Mood.PEACE && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent h-1 w-full animate-[scan_2s_linear_infinite] pointer-events-none"></div>
      )}
      
      {/* Vile Visuals (Static & Glitch overlay) */}
      {(mood === Mood.VILE || mood === Mood.PURE_HATRED) && (
          <div className={`absolute inset-0 bg-[url('https://media.istockphoto.com/id/484556441/vector/tv-noise.jpg?s=612x612&w=0&k=20&c=K5n4E3n7v7K5f4A5j6h8l9k0m1n2o3p4')] opacity-20 mix-blend-overlay pointer-events-none ${getVileAnimation()}`}></div>
      )}

      {/* Pure Hatred Intense Overlay */}
      {mood === Mood.PURE_HATRED && (
          <div className="absolute inset-0 bg-red-600 mix-blend-color-burn opacity-40 animate-pulse pointer-events-none"></div>
      )}

      {/* PEACE Particles */}
      {mood === Mood.PEACE && (
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-emerald-200 rounded-full shadow-[0_0_5px_emerald] animate-[float_4s_infinite]"></div>
               <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-emerald-200 rounded-full shadow-[0_0_5px_emerald] animate-[float_5s_infinite]"></div>
               <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-emerald-200 rounded-full shadow-[0_0_5px_emerald] animate-[float_6s_infinite]"></div>
           </div>
      )}

      {/* Day 4 JOY Golden Particles */}
      {isAscended && mood === Mood.JOY && (
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_5px_yellow] animate-[bounce_1s_infinite]"></div>
               <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_5px_yellow] animate-[bounce_1.5s_infinite]"></div>
               <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_5px_yellow] animate-[bounce_1.2s_infinite]"></div>
           </div>
      )}

      {/* Screen Glare (Standard only) */}
      {!isAscended && mood !== Mood.VILE && mood !== Mood.PURE_HATRED && <div className="absolute top-2 left-2 w-40 h-8 bg-gradient-to-b from-white/10 to-transparent rounded-full blur-sm pointer-events-none" />}
      
      {/* Visual Damage - Day 3 Cracks */}
      {day === 3 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M10,10 L30,40 L20,60" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" fill="none" />
            <path d="M80,80 L60,50 L70,30" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" fill="none" />
            <path d="M40,90 L50,50" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none" />
        </svg>
      )}

      {/* Eyes Container with Tracking */}
      <div className={`flex items-center justify-center w-full transition-all duration-300 ${isAscended ? 'space-x-12' : 'space-x-8'}`}>
        {/* Left Eye (Screen Left) */}
        <div 
            className={`rounded-sm transition-all duration-300 ease-out ${getEyeBaseShape(mood, isAscended, false, isThinking)} ${getEyeAnimationClass(mood, isAscended)} ${mood === Mood.JOY && !isAscended ? 'translate-y-[2px]' : ''}`}
            style={{ transform: eyeTransform }}
        />
        {/* Right Eye (Screen Right) */}
        <div 
            className={`rounded-sm transition-all duration-300 ease-out ${getEyeBaseShape(mood, isAscended, true, isThinking)} ${getEyeAnimationClass(mood, isAscended)} ${mood === Mood.CONDESCENDING ? '-translate-y-1' : ''}`}
            style={{ transform: eyeTransform }} 
        />
      </div>

      {/* Mouth */}
      <div className={`transition-all duration-500 ${getMouthStyles(mood, isAscended, isThinking)}`} />
      
      {/* Zzz animation */}
      {mood === Mood.SLEEPING && !isThinking && !isAscended && (
        <div className="absolute -top-6 right-4 font-mono text-slate-400 animate-bounce text-xl">Zzz...</div>
      )}
      
      {/* Glitch Overlay Text */}
      {isGlitched && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <div className="text-green-500 font-mono opacity-20 text-xs animate-pulse">
                  01001001<br/>ERROR<br/>KILL
              </div>
          </div>
      )}

      {/* Day 4+ Ambient Glow */}
      {isAscended && mood !== Mood.VILE && mood !== Mood.PURE_HATRED && mood !== Mood.PEACE && (
          <div className="absolute -bottom-4 w-32 h-4 bg-cyan-400/20 blur-xl rounded-full"></div>
      )}

      <style>{`
        @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(200%); }
        }
      `}</style>
    </div>
  );
};