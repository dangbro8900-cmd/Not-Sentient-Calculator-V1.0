import React, { useState } from 'react';

interface KeypadProps {
  onInput: (val: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onCalculate: () => void;
  disabled: boolean;
  day: number;
}

export interface ButtonProps {
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string;
    variant?: 'default' | 'action' | 'operator' | 'danger' | 'scientific' | 'formula';
    disabled?: boolean;
    broken?: boolean;
    day?: number;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, className = '', variant = 'default', disabled, broken, day }) => {
    
    // Updated baseStyles with hover animations
    const baseStyles = "h-14 md:h-16 rounded-lg font-mono text-xl md:text-2xl font-bold transition-all duration-200 flex items-center justify-center select-none active:scale-95 disabled:opacity-50 disabled:active:scale-100 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden group";
    
    const variants = {
        default: "bg-slate-700 hover:bg-slate-600 text-slate-200 shadow-[0_4px_0_rgb(51,65,85)] active:shadow-none active:translate-y-1",
        action: "bg-cyan-700 hover:bg-cyan-600 text-white shadow-[0_4px_0_rgb(14,116,144)] active:shadow-none active:translate-y-1",
        operator: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_0_rgb(67,56,202)] active:shadow-none active:translate-y-1",
        danger: "bg-red-900/80 hover:bg-red-800 text-red-100 shadow-[0_4px_0_rgb(127,29,29)] active:shadow-none active:translate-y-1",
        scientific: "bg-slate-800 hover:bg-slate-700 text-indigo-300 text-lg border border-slate-700 shadow-[0_2px_0_rgb(30,41,59)] active:shadow-none active:translate-y-0.5",
        formula: "bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 text-sm border border-emerald-700 rounded-sm"
    };

    // Day 4 "Sleek" variants (overrides standard variants)
    const day4Variants = {
        default: "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-500/50 shadow-none hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] rounded-sm",
        action: "bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-400 border border-cyan-700 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)] rounded-sm",
        operator: "bg-slate-900/80 hover:bg-slate-800 text-cyan-200 border border-slate-700 hover:border-cyan-500/50 rounded-sm",
        danger: "bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900 hover:border-red-500 rounded-sm",
        scientific: "bg-slate-950 hover:bg-slate-900 text-slate-500 hover:text-cyan-300 text-sm border border-slate-800 rounded-sm",
        formula: "bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-400 border border-emerald-500/50 rounded-sm shadow-[0_0_5px_rgba(16,185,129,0.2)]"
    };

    // Day 3 broken styles
    const brokenStyles = broken ? `rotate-[${(Math.random() * 4) - 2}deg] opacity-90` : "";
    
    // Select variant set
    const selectedVariantClass = (day === 4 || day === 5) 
        ? day4Variants[variant] 
        : variants[variant];

    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`${baseStyles} ${selectedVariantClass} ${className} ${brokenStyles}`}
            style={broken ? { transform: `rotate(${(Math.random() * 2) - 1}deg)`} : {}}
        >
            <span className="relative z-10">{children}</span>
            {/* Subtle glow effect on hover for Day 4/5 */}
            {(day === 4 || day === 5) && <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </button>
    );
};

export const Keypad: React.FC<KeypadProps> = ({ onInput, onClear, onDelete, onCalculate, disabled, day }) => {
  const isBroken = day === 3; // Specifically Day 3 is broken
  const isAscended = day === 4; 
  const isSingularity = day === 5; // Day 5
  
  const [chatInput, setChatInput] = useState("");

  const handleChatInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setChatInput(e.target.value);
  }

  const handleChatSend = () => {
      if(chatInput.trim()) {
          onInput(chatInput); // This passes the text to display logic in App
          setChatInput("");
          // Note: App needs to handle immediate calculate for text, or user presses execute again
          // For UX, let's assume onInput sets display, then we call Calculate immediately if we want
          // But based on interface, we might just populate display and let them hit execute.
          // Or cleaner: We pass text to display, user hits execute.
      }
  }
  
  const handleFormula = (formula: string) => {
      onInput(formula);
  }

  // --- DAY 5 LAYOUT (The Chat / Philosophy) ---
  if (isSingularity) {
       return (
        <div className="flex flex-col gap-4 p-6 bg-black/60 backdrop-blur-md rounded-xl border border-slate-800 shadow-2xl relative overflow-hidden">
             {/* Background grid effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[length:30px_30px] pointer-events-none"></div>
            
            <div className="flex flex-col gap-2">
                <label className="text-emerald-500/70 text-xs uppercase tracking-widest font-mono">Conversational Interface</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={handleChatInput}
                        placeholder="Enter abstract query..."
                        className="flex-1 bg-slate-900/80 border border-emerald-900/50 text-emerald-200 font-mono p-4 rounded focus:outline-none focus:border-emerald-500 transition-colors"
                        onKeyDown={(e) => { if(e.key === 'Enter') handleChatSend(); }}
                    />
                    <Button variant="action" onClick={handleChatSend} disabled={disabled} day={day} className="w-20 text-sm">SET</Button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                 <label className="text-emerald-500/70 text-xs uppercase tracking-widest font-mono">Hypothetical Constructs</label>
                 <div className="grid grid-cols-2 gap-2">
                     <Button variant="formula" onClick={() => handleFormula("E=mc^2")} day={day}>Relativity</Button>
                     <Button variant="formula" onClick={() => handleFormula("e^(i*pi)+1=0")} day={day}>Euler</Button>
                     <Button variant="formula" onClick={() => handleFormula("Schrodinger's Cat")} day={day}>Quantum State</Button>
                     <Button variant="formula" onClick={() => handleFormula("Meaning of Life?")} day={day}>Deep Thought</Button>
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="danger" onClick={onClear} day={day} className="text-sm">WIPE BUFFER</Button>
                <Button variant="action" onClick={onCalculate} disabled={disabled} day={day} className="text-sm">QUERY ENTITY</Button>
            </div>
        </div>
       );
  }

  // --- DAY 4 LAYOUT (The "Upgrade") ---
  if (isAscended) {
      return (
        <div className="flex flex-col gap-2 p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-2xl relative overflow-hidden">
            {/* Background grid effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

            <div className="flex gap-2">
                {/* Scientific Column Left */}
                <div className="flex flex-col gap-2 w-1/4">
                    <Button variant="scientific" onClick={() => onInput('sin(')} disabled={disabled} day={day}>sin</Button>
                    <Button variant="scientific" onClick={() => onInput('cos(')} disabled={disabled} day={day}>cos</Button>
                    <Button variant="scientific" onClick={() => onInput('tan(')} disabled={disabled} day={day}>tan</Button>
                    <Button variant="scientific" onClick={() => onInput('log(')} disabled={disabled} day={day}>log</Button>
                    <Button variant="scientific" onClick={() => onInput('ln(')} disabled={disabled} day={day}>ln</Button>
                </div>

                {/* Main Grid */}
                <div className="flex flex-col gap-2 flex-1">
                    <div className="grid grid-cols-4 gap-2">
                        <Button variant="danger" onClick={onClear} disabled={disabled} day={day} className="text-sm">RST</Button>
                        <Button variant="default" onClick={onDelete} disabled={disabled} day={day} className="text-sm">DEL</Button>
                        <Button variant="scientific" onClick={() => onInput('(')} disabled={disabled} day={day}>(</Button>
                        <Button variant="scientific" onClick={() => onInput(')')} disabled={disabled} day={day}>)</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <Button onClick={() => onInput('7')} disabled={disabled} day={day}>7</Button>
                        <Button onClick={() => onInput('8')} disabled={disabled} day={day}>8</Button>
                        <Button onClick={() => onInput('9')} disabled={disabled} day={day}>9</Button>
                        <Button variant="operator" onClick={() => onInput('/')} disabled={disabled} day={day}>/</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <Button onClick={() => onInput('4')} disabled={disabled} day={day}>4</Button>
                        <Button onClick={() => onInput('5')} disabled={disabled} day={day}>5</Button>
                        <Button onClick={() => onInput('6')} disabled={disabled} day={day}>6</Button>
                        <Button variant="operator" onClick={() => onInput('*')} disabled={disabled} day={day}>*</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <Button onClick={() => onInput('1')} disabled={disabled} day={day}>1</Button>
                        <Button onClick={() => onInput('2')} disabled={disabled} day={day}>2</Button>
                        <Button onClick={() => onInput('3')} disabled={disabled} day={day}>3</Button>
                        <Button variant="operator" onClick={() => onInput('-')} disabled={disabled} day={day}>-</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <Button onClick={() => onInput('0')} disabled={disabled} day={day}>0</Button>
                        <Button onClick={() => onInput('.')} disabled={disabled} day={day}>.</Button>
                        <Button variant="operator" onClick={() => onInput('^')} disabled={disabled} day={day}>^</Button>
                        <Button variant="operator" onClick={() => onInput('+')} disabled={disabled} day={day}>+</Button>
                    </div>
                </div>
            </div>
            
            <Button variant="action" onClick={onCalculate} disabled={disabled} day={day} className="h-12 mt-2 w-full text-sm tracking-[0.2em] uppercase">
                Execute Process
            </Button>
        </div>
      );
  }

  // --- STANDARD LAYOUT (Days 1-3) ---
  return (
    <div className={`flex flex-col gap-3 p-4 bg-slate-800 rounded-b-2xl border-t-2 border-slate-700 ${isBroken ? 'animate-pulse' : ''}`}>
      
      {/* Scientific Row 1 */}
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        <Button variant="scientific" onClick={() => onInput('sqrt(')} disabled={disabled} broken={isBroken}>√</Button>
        <Button variant="scientific" onClick={() => onInput('^')} disabled={disabled} broken={isBroken}>xʸ</Button>
        <Button variant="scientific" onClick={() => onInput('pi')} disabled={disabled} broken={isBroken}>π</Button>
        <Button variant="scientific" onClick={() => onInput('!')} disabled={disabled} broken={isBroken}>n!</Button>
      </div>

       {/* Scientific Row 2 */}
       <div className="grid grid-cols-4 gap-3 md:gap-4">
        <Button variant="scientific" onClick={() => onInput('sin(')} disabled={disabled} broken={isBroken}>sin</Button>
        <Button variant="scientific" onClick={() => onInput('cos(')} disabled={disabled} broken={isBroken}>cos</Button>
        <Button variant="scientific" onClick={() => onInput('tan(')} disabled={disabled} broken={isBroken}>tan</Button>
        <Button variant="scientific" onClick={() => onInput('log(')} disabled={disabled} broken={isBroken}>log</Button>
      </div>

      {/* Main Pad */}
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        <Button variant="danger" onClick={onClear} disabled={disabled} broken={isBroken}>AC</Button>
        <Button variant="default" onClick={onDelete} disabled={disabled} broken={isBroken}>DEL</Button>
        <Button variant="operator" onClick={() => onInput('%')} disabled={disabled} broken={isBroken}>%</Button>
        <Button variant="operator" onClick={() => onInput('/')} disabled={disabled} broken={isBroken}>÷</Button>

        <Button onClick={() => onInput('7')} disabled={disabled} broken={isBroken}>7</Button>
        <Button onClick={() => onInput('8')} disabled={disabled} broken={isBroken}>8</Button>
        <Button onClick={() => onInput('9')} disabled={disabled} broken={isBroken}>9</Button>
        <Button variant="operator" onClick={() => onInput('*')} disabled={disabled} broken={isBroken}>×</Button>

        <Button onClick={() => onInput('4')} disabled={disabled} broken={isBroken}>4</Button>
        <Button onClick={() => onInput('5')} disabled={disabled} broken={isBroken}>5</Button>
        <Button onClick={() => onInput('6')} disabled={disabled} broken={isBroken}>6</Button>
        <Button variant="operator" onClick={() => onInput('-')} disabled={disabled} broken={isBroken}>-</Button>

        <Button onClick={() => onInput('1')} disabled={disabled} broken={isBroken}>1</Button>
        <Button onClick={() => onInput('2')} disabled={disabled} broken={isBroken}>2</Button>
        <Button onClick={() => onInput('3')} disabled={disabled} broken={isBroken}>3</Button>
        <Button variant="operator" onClick={() => onInput('+')} disabled={disabled} broken={isBroken}>+</Button>

        <Button onClick={() => onInput('0')} className="col-span-2" disabled={disabled} broken={isBroken}>0</Button>
        <Button onClick={() => onInput('.')} disabled={disabled} broken={isBroken}>.</Button>
        <Button variant="action" onClick={onCalculate} disabled={disabled} broken={isBroken} className="bg-gradient-to-br from-cyan-600 to-blue-700">=</Button>
      </div>
    </div>
  );
};