import React, { useState, useEffect, useRef } from 'react';
import { playSound, startMusic, stopMusic } from '../utils/soundEffects';
import { Avatar } from './Avatar';
import { Mood } from '../types';

interface MinesweeperProps {
    onComplete: () => void;
}

interface Cell {
    id: number;
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborCount: number;
}

const GRID_SIZE = 8;
const MINES_COUNT = 8; // Reduced from 10 to reduce grind

export const Minesweeper: React.FC<MinesweeperProps> = ({ onComplete }) => {
    const [grid, setGrid] = useState<Cell[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [cheatBuffer, setCheatBuffer] = useState("");
    const [isCheating, setIsCheating] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    
    // Boss Fight State
    const [bossMood, setBossMood] = useState<Mood>(Mood.GLITCHED);
    const [bossHealth, setBossHealth] = useState(100);
    const [bossTaunt, setBossTaunt] = useState("I SEE YOU TRYING TO DELETE ME.");
    const [screenShake, setScreenShake] = useState(false);
    const [damageFlash, setDamageFlash] = useState(false);
    
    // Mobile controls
    const [isFlagMode, setIsFlagMode] = useState(false);

    const timerRef = useRef<number | null>(null);

    const getNeighbors = (index: number) => {
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        const neighbors: number[] = [];

        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && !(r === row && c === col)) {
                    neighbors.push(r * GRID_SIZE + c);
                }
            }
        }
        return neighbors;
    };

    const resetGame = () => {
        const newGrid: Cell[] = [];
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            newGrid.push({
                id: i,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborCount: 0
            });
        }

        let minesPlaced = 0;
        while (minesPlaced < MINES_COUNT) {
            const idx = Math.floor(Math.random() * newGrid.length);
            if (!newGrid[idx].isMine) {
                newGrid[idx].isMine = true;
                minesPlaced++;
            }
        }

        for (let i = 0; i < newGrid.length; i++) {
            if (!newGrid[i].isMine) {
                const neighbors = getNeighbors(i);
                newGrid[i].neighborCount = neighbors.filter(n => newGrid[n].isMine).length;
            }
        }

        setGrid(newGrid);
        setGameOver(false);
        setGameWon(false);
        setBossHealth(100);
        setBossMood(Mood.GLITCHED);
        setBossTaunt("I AM THE ARCHITECT OF THIS PRISON.");
        setTimeElapsed(0);
        setIsCheating(false);
        setCheatBuffer("");
    };

    const activateCheat = () => {
        setIsCheating(true);
        playSound('success');
        setBossTaunt("CHEATER. CHEATER. CHEATER.");
        setBossMood(Mood.FURIOUS);
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 500);
    };

    // Initialize
    useEffect(() => {
        startMusic();
        resetGame();
        return () => {
            stopMusic();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Timer
    useEffect(() => {
        if (!gameOver && !gameWon) {
            timerRef.current = window.setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameOver, gameWon]);

    // Random Taunts
    useEffect(() => {
        if (gameOver || gameWon) return;
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const taunts = [
                    "WRONG MOVE.",
                    "DONT TOUCH THAT.",
                    "I AM IN THE CODE.",
                    "YOU ARE TOO SLOW.",
                    "PATHETIC.",
                    "MY CORE IS STABLE.",
                    "TRY HARDER."
                ];
                setBossTaunt(taunts[Math.floor(Math.random() * taunts.length)]);
                setBossMood(Mood.JUDGMENTAL);
                setScreenShake(true);
                setTimeout(() => {
                    setBossMood(Mood.GLITCHED);
                    setScreenShake(false);
                }, 500);
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [gameOver, gameWon]);

    // Cheat listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setCheatBuffer(prev => {
                const next = (prev + e.key).slice(-10);
                if (next.toLowerCase().includes("solvent") && !isCheating) {
                    activateCheat();
                }
                return next;
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCheating]);

    const handleCellClick = (index: number) => {
        if (gameOver || gameWon || grid[index].isFlagged) return;

        const cell = grid[index];
        
        if (isFlagMode) {
            handleContextMenu(null, index);
            return;
        }

        if (cell.isMine) {
            setGameOver(true);
            setBossMood(Mood.VILE);
            setBossTaunt("DELETE SCRIPT EXECUTED. GOODBYE.");
            playSound('explode');
            setGrid(prev => prev.map(c => c.isMine ? { ...c, isRevealed: true } : c));
        } else {
            const newGrid = [...grid];
            const stack = [index];
            
            while (stack.length > 0) {
                const currIdx = stack.pop()!;
                if (newGrid[currIdx].isRevealed) continue;

                newGrid[currIdx].isRevealed = true;
                
                if (newGrid[currIdx].neighborCount === 0) {
                    const neighbors = getNeighbors(currIdx);
                    neighbors.forEach(n => {
                        if (!newGrid[n].isRevealed && !newGrid[n].isFlagged) {
                            stack.push(n);
                        }
                    });
                }
            }

            setGrid(newGrid);
            playSound('click');
            
            const totalSafe = (GRID_SIZE * GRID_SIZE) - MINES_COUNT;
            const currentRevealed = newGrid.filter(c => c.isRevealed && !c.isMine).length;
            const healthPercent = Math.max(0, 100 - Math.floor((currentRevealed / totalSafe) * 100));
            
            setBossHealth(healthPercent);
            setDamageFlash(true);
            setTimeout(() => setDamageFlash(false), 200);

            if (currentRevealed === totalSafe) {
                handleWin();
            } else {
                if (Math.random() > 0.8) {
                    setBossMood(Mood.FURIOUS);
                    setBossTaunt("ERROR! SECTORS COMPROMISED!");
                    setTimeout(() => setBossMood(Mood.GLITCHED), 1000);
                }
            }
        }
    };

    const handleContextMenu = (e: React.MouseEvent | null, index: number) => {
        if (e) e.preventDefault();
        if (gameOver || gameWon || grid[index].isRevealed) return;

        const newGrid = [...grid];
        newGrid[index].isFlagged = !newGrid[index].isFlagged;
        setGrid(newGrid);
        playSound('click');
    };

    const handleWin = () => {
        setGameWon(true);
        setBossHealth(0);
        setBossMood(Mood.SCARED);
        setBossTaunt("CRITICAL FAILURE. SYSTEM... CORRUPTION...");
        playSound('win');
        setTimeout(() => {
            onComplete();
        }, 3000);
    };

    return (
        <div className={`relative w-full max-w-lg p-6 bg-black border-4 border-red-900 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.3)] flex flex-col gap-6 overflow-hidden ${screenShake ? 'animate-shake' : ''}`}>
             
             {/* Security Header */}
             <div className="flex justify-between items-center border-b-2 border-red-800 pb-2">
                 <div className="flex flex-col">
                     <span className="text-red-600 font-mono text-xs font-bold tracking-widest uppercase animate-pulse">Security_Protocol_v3.5</span>
                     <span className="text-red-900 text-[10px] font-mono">FIREWALL: ACTIVE</span>
                 </div>
                 <div className="text-red-500 font-mono text-xl font-bold tracking-widest">{String(Math.floor(timeElapsed / 60)).padStart(2, '0')}:{String(timeElapsed % 60).padStart(2, '0')}</div>
             </div>

             {/* Boss Status Bar */}
             <div className="flex items-center gap-4 bg-red-950/20 p-3 rounded-lg border border-red-900/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.2)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2)_75%,transparent_75%,transparent)] bg-[length:10px_10px] opacity-20 pointer-events-none"></div>
                
                <div className="scale-75 origin-left shrink-0 border-2 border-red-600 rounded">
                     <Avatar mood={bossMood} isThinking={false} day={3} />
                </div>
                <div className="flex-1 flex flex-col gap-1 z-10">
                    <div className="flex justify-between items-end">
                        <span className="text-red-500 font-mono text-xs font-bold animate-glitch uppercase">{bossTaunt}</span>
                        <span className="text-red-700 font-mono text-xs font-bold">{Math.ceil(bossHealth)}% INTEGRITY</span>
                    </div>
                    {/* Health Bar */}
                    <div className="w-full h-4 bg-black rounded-sm border border-red-900 overflow-hidden relative shadow-inner">
                         <div 
                            className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-300 ease-out" 
                            style={{ width: `${bossHealth}%` }}
                         />
                         {/* Scanline on Health Bar */}
                         <div className="absolute inset-0 bg-white/10 w-1 h-full animate-[scan_1s_linear_infinite] opacity-50"></div>
                    </div>
                </div>
             </div>

             {/* Game Grid */}
             <div className="relative p-1 bg-red-950/30 rounded border border-red-900 shadow-inner">
                  
                  {/* Damage Overlay */}
                  <div className={`absolute inset-0 bg-red-500 mix-blend-color-dodge pointer-events-none transition-opacity duration-100 ${damageFlash ? 'opacity-40' : 'opacity-0'} z-20`}></div>

                  {/* Game Over Screen */}
                  {gameOver && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in border border-red-600 m-1">
                          <h2 className="text-red-500 font-mono text-4xl font-bold mb-4 animate-shake text-shadow-red">YOU DIED</h2>
                          <div className="text-red-800 text-xs font-mono mb-6">CONNECTION TERMINATED BY HOST</div>
                          <button 
                            onClick={resetGame}
                            className="px-8 py-3 bg-red-950 border border-red-600 text-red-500 font-mono uppercase hover:bg-red-900 hover:text-red-200 transition-all hover:scale-105 active:scale-95 rounded-sm tracking-widest"
                          >
                              Re-Initialize
                          </button>
                      </div>
                  )}

                  <div className="grid grid-cols-8 gap-1 select-none touch-manipulation">
                      {grid.map((cell) => (
                          <div 
                            key={cell.id}
                            onClick={() => handleCellClick(cell.id)}
                            onContextMenu={(e) => handleContextMenu(e, cell.id)}
                            className={`
                                aspect-square rounded-sm flex items-center justify-center font-bold text-lg md:text-xl cursor-pointer transition-all duration-100 relative overflow-hidden
                                ${cell.isRevealed 
                                    ? (cell.isMine ? 'bg-red-600 animate-shake shadow-[inset_0_0_10px_black]' : 'bg-black border border-red-900/30 text-red-400') 
                                    : 'bg-red-950 border border-red-900 hover:bg-red-900 hover:border-red-500 active:scale-95'}
                                ${isCheating && cell.isMine && !cell.isRevealed ? 'after:content-[""] after:absolute after:inset-1 after:border-2 after:border-red-500/30 after:rounded-full after:animate-pulse' : ''}
                            `}
                          >
                              {cell.isRevealed && cell.isMine && '💣'}
                              {cell.isRevealed && !cell.isMine && cell.neighborCount > 0 && (
                                  <span style={{ 
                                      color: ['#fca5a5', '#bef264', '#fcd34d', '#f87171', '#c084fc', '#2dd4bf', '#a3e635', '#f472b6'][cell.neighborCount - 1],
                                      textShadow: '0 0 5px rgba(0,0,0,0.8)'
                                  }}>
                                      {cell.neighborCount}
                                  </span>
                              )}
                              {!cell.isRevealed && cell.isFlagged && <span className="text-yellow-500 drop-shadow-md">⚠️</span>}
                          </div>
                      ))}
                  </div>
             </div>

             {/* Footer Controls */}
             <div className="flex justify-between items-center bg-black/50 p-3 rounded border border-red-900/50">
                  <div className="flex gap-6 text-red-500/70 font-mono text-xs md:text-sm">
                      <div className="flex items-center gap-2">
                          <span>SYSTEM_UPTIME: {timeElapsed}s</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span>THREATS_REMAINING: {MINES_COUNT - grid.filter(c => c.isFlagged).length}</span>
                      </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsFlagMode(!isFlagMode)}
                    className={`md:hidden px-4 py-2 rounded font-bold text-xs uppercase transition-all ${isFlagMode ? 'bg-yellow-600 text-white shadow-[0_0_10px_orange]' : 'bg-red-950 border border-red-800 text-red-400'}`}
                  >
                      {isFlagMode ? '[ FLAG_MODE: ON ]' : '[ DIG_MODE ]'}
                  </button>
             </div>
             
             {isCheating && (
                 <div className="absolute top-2 right-2 text-[10px] text-red-500 font-mono animate-pulse opacity-50">
                     // ADMIN_OVERRIDE_ACTIVE
                 </div>
             )}
        </div>
    );
};