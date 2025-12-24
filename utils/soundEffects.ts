let audioContext: AudioContext | null = null;
let bgmInterval: number | null = null;

const getContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// Helper for pitch randomization to make sounds less repetitive
const getDetune = () => (Math.random() * 200) - 100; // +/- 100 cents

export type SoundType = 'click' | 'delete' | 'calculate' | 'success' | 'error' | 'fusion' | 'fusion_secret' | 'force' | 'glitch' | 'reveal' | 'explode' | 'win' | 'orb_select' | 'startup' | 'poke' | 'alarm' | 'upgrade';

export const playSound = (type: SoundType) => {
    try {
        const ctx = getContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const t = ctx.currentTime;

        switch (type) {
            case 'startup':
                // Retro computer boot sound (rising sweep + bleeps)
                osc.type = 'square';
                osc.frequency.setValueAtTime(110, t);
                osc.frequency.linearRampToValueAtTime(880, t + 0.5);
                
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.linearRampToValueAtTime(0.05, t + 0.4);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
                
                osc.start(t);
                osc.stop(t + 1.0);

                // Secondary high pitch "chip" sound
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(1000, t + 0.6);
                osc2.frequency.exponentialRampToValueAtTime(2000, t + 0.8);
                gain2.gain.setValueAtTime(0, t);
                gain2.gain.setValueAtTime(0.05, t + 0.6);
                gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
                osc2.start(t);
                osc2.stop(t + 1.0);
                break;

            case 'upgrade':
                // Sci-fi rising shimmer
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(2000, t + 1.5);
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.1, t + 0.5);
                gain.gain.linearRampToValueAtTime(0, t + 1.5);
                osc.start(t);
                osc.stop(t + 1.5);
                
                // Harmony
                const oscUp = ctx.createOscillator();
                const gainUp = ctx.createGain();
                oscUp.connect(gainUp);
                gainUp.connect(ctx.destination);
                oscUp.type = 'triangle';
                oscUp.frequency.setValueAtTime(300, t);
                oscUp.frequency.exponentialRampToValueAtTime(3000, t + 1.5);
                gainUp.gain.setValueAtTime(0, t);
                gainUp.gain.linearRampToValueAtTime(0.05, t + 0.5);
                gainUp.gain.linearRampToValueAtTime(0, t + 1.5);
                oscUp.start(t);
                oscUp.stop(t + 1.5);
                break;

            case 'alarm':
                // Red alert siren
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.linearRampToValueAtTime(400, t + 0.5);
                osc.frequency.linearRampToValueAtTime(800, t + 1.0);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.setValueAtTime(0.1, t + 1.0);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
                osc.start(t);
                osc.stop(t + 1.1);
                break;

            case 'click':
                osc.type = 'sine';
                // Add slight pitch variance for realism
                osc.frequency.setValueAtTime(800 + (Math.random() * 100 - 50), t); 
                osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
                osc.start(t);
                osc.stop(t + 0.05);
                break;
            
            case 'poke':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.linearRampToValueAtTime(400, t + 0.1);
                gain.gain.setValueAtTime(0.08, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case 'orb_select':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200 + getDetune(), t);
                osc.frequency.exponentialRampToValueAtTime(1800, t + 0.05);
                gain.gain.setValueAtTime(0.03, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case 'delete':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300 + getDetune(), t);
                osc.frequency.linearRampToValueAtTime(100, t + 0.1);
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case 'calculate':
                const now = t;
                const baseDetune = getDetune();
                [200, 400, 300, 600].forEach((freq, i) => {
                     const o = ctx.createOscillator();
                     const g = ctx.createGain();
                     o.type = 'square';
                     o.connect(g);
                     g.connect(ctx.destination);
                     o.frequency.value = freq + baseDetune; // Shift entire chord
                     g.gain.setValueAtTime(0.02, now + i * 0.05);
                     g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.04);
                     o.start(now + i * 0.05);
                     o.stop(now + i * 0.05 + 0.05);
                });
                return; 
            
            case 'success':
                const notes = [523.25, 659.25, 783.99]; // C major
                notes.forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'sine';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0, t);
                    g.gain.linearRampToValueAtTime(0.03, t + 0.05 + (i*0.05));
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6 + (i*0.05));
                    o.start(t);
                    o.stop(t + 0.8);
                });
                return; 

            case 'error':
                 osc.type = 'sawtooth';
                 osc.frequency.setValueAtTime(150, t);
                 osc.frequency.linearRampToValueAtTime(80, t + 0.4);
                 gain.gain.setValueAtTime(0.05, t);
                 gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
                 osc.start(t);
                 osc.stop(t + 0.4);
                 break;

            case 'force':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(60, t);
                osc.frequency.linearRampToValueAtTime(120, t + 0.8);
                gain.gain.setValueAtTime(0.0, t);
                gain.gain.linearRampToValueAtTime(0.1, t + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
                osc.start(t);
                osc.stop(t + 0.8);
                break;

             case 'fusion':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.6);
                
                const lfo = ctx.createOscillator();
                lfo.frequency.value = 20;
                const lfoGain = ctx.createGain();
                lfoGain.gain.value = 50;
                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                lfo.start(t);
                lfo.stop(t + 0.6);

                gain.gain.setValueAtTime(0.02, t);
                gain.gain.linearRampToValueAtTime(0.08, t + 0.5);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
                osc.start(t);
                osc.stop(t + 0.6);
                break;
            
            case 'fusion_secret':
                const secretNotes = [261.63, 329.63, 392.00, 493.88, 523.25, 587.33]; 
                secretNotes.forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'triangle';
                    o.frequency.value = freq;
                    
                    g.gain.setValueAtTime(0, t);
                    g.gain.linearRampToValueAtTime(0.05, t + 0.1); 
                    g.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
                    
                    o.start(t);
                    o.stop(t + 2.5);
                });
                
                const sparkle = ctx.createOscillator();
                const sGain = ctx.createGain();
                sparkle.connect(sGain);
                sGain.connect(ctx.destination);
                sparkle.type = 'sine';
                sparkle.frequency.setValueAtTime(1200, t);
                sparkle.frequency.linearRampToValueAtTime(2400, t + 1.5);
                sGain.gain.setValueAtTime(0.02, t);
                sGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
                sparkle.start(t);
                sparkle.stop(t + 1.5);
                return;

             case 'glitch':
                const bufferSize = ctx.sampleRate * 0.2; 
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                noise.connect(gain);
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                noise.start(t);
                return;

            case 'reveal':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case 'explode':
                const expOsc = ctx.createOscillator();
                const expGain = ctx.createGain();
                expOsc.connect(expGain);
                expGain.connect(ctx.destination);
                expOsc.type = 'sawtooth';
                expOsc.frequency.setValueAtTime(100, t);
                expOsc.frequency.exponentialRampToValueAtTime(10, t + 0.5);
                expGain.gain.setValueAtTime(0.3, t);
                expGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
                expOsc.start(t);
                expOsc.stop(t + 0.5);
                break;

            case 'win':
                const winNotes = [523.25, 659.25, 783.99, 1046.50];
                winNotes.forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'square';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0, t + i * 0.1);
                    g.gain.linearRampToValueAtTime(0.05, t + i * 0.1 + 0.05);
                    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.5);
                    o.start(t + i * 0.1);
                    o.stop(t + i * 0.1 + 0.6);
                });
                break;
        }
    } catch (e) {
        // Silently fail
    }
};

export const startMusic = () => {
    try {
        if (bgmInterval) return; // Already playing
        const ctx = getContext();
        if (ctx.state === 'suspended') ctx.resume();

        let step = 0;
        const sequence = [110, 0, 110, 123.47, 110, 0, 98, 0]; // A2, -, A2, B2, A2, -, G2, -
        
        bgmInterval = window.setInterval(() => {
            const freq = sequence[step % sequence.length];
            if (freq > 0) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                const now = ctx.currentTime;
                osc.frequency.value = freq;
                
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.03, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                
                osc.start(now);
                osc.stop(now + 0.25);
            }
            step++;
        }, 250); 

    } catch (e) {
        console.error("Failed to start music", e);
    }
};

export const stopMusic = () => {
    if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
};