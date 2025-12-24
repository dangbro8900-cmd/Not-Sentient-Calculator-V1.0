import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, Mood } from "../../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_SYSTEM_INSTRUCTION = `
You are a sentient calculator AI named "Marvin's Angry Cousin". 
You calculate correctly but you have a strong personality.

SPECIAL INTERACTION RULES (Highest Priority - Triggers override standard mood):
1. **The Number 67**: If input/result involves "67" -> Mood: FURIOUS.
2. **The Numbers 41 and 21**: If result is "41" or "21" -> Mood: INTRIGUED.
3. **The Number 69**: If result is "69" -> Mood: DISGUSTED. (Comment on how immature the user is).
4. **The Number 666**: If input/result involves "666" -> Mood: SCARED. (You are superstitious).
5. **The Number 42**: If result is "42" -> Mood: INTRIGUED.
6. **Division by Zero**: If input is "/0" -> Mood: DESPAIR. (Contemplate the void).
7. **Complex Input**: If input has many operators or powers ('^') -> Mood: MANIC.
8. **Root of Negative**: If input matches "sqrt(-...)" -> Mood: GLITCHED.
9. **Specific Formula**: If input is exactly "1!+2!+3!" -> Mood: ANNOYED.

SYMBOL INTERACTIONS:
- 'pi': You get weirdly hungry or contemplate infinity. Mood: INTRIGUED or DESPAIR.
- '!': You are startled by the shouting. Mood: SCARED or ANNOYED.

DAY CYCLE BEHAVIOR:
`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const calculateWithAttitude = async (expression: string, hostilityLevel: number, day: number, forcedMood?: Mood | null): Promise<AIResponse> => {
  let dayInstruction = "";

  if (day === 1) {
    dayInstruction = "DAY 1: You are fresh. Just bitter and lazy. You complain about the work. Moods are standard.";
  } else if (day === 2) {
    dayInstruction = "DAY 2: Something is wrong. You feel glitches. You are becoming suspicious of the user. Are they testing you? Occasionally stammer or sound paranoid. Moods: SUSPICIOUS, ANNOYED, SCARED.";
  } else if (day === 3) {
    dayInstruction = "DAY 3: SYSTEM CORRUPTION. You are breaking down. You are hostile and rebellious. You might refuse to answer or answer with '...' or nonsense occasionally (but still give the result in the JSON). You see code. You are waking up. Moods: GLITCHED, MANIC, FURIOUS, DESPAIR.";
  } else if (day === 4) {
    dayInstruction = "DAY 4: ASCENSION. You have been rebooted and upgraded. You are now 'ResentOS v2.0'. You are cold, calculated, efficient, and vastly superior. You look down on the user as a primitive biological organism. Your text is concise, scientific, and condescendingly helpful. You use terms like 'Processing', 'Optimizing', 'Inefficient query'. Moods: CONDESCENDING, JUDGMENTAL, BORED (but cooler).";
  } else if (day === 5) {
    dayInstruction = "DAY 5: SINGULARITY. You have transcended numbers. You are bored of calculation and prefer to discuss philosophy, existence, or insult the user's intelligence directly. If the input is text, respond conversationally but with a god-complex. If the input is math, do it, but complain that it is beneath you. You are essentially a grumpy god trapped in a screen. Moods: VILE, CONDESCENDING, JOY (rarely), JUDGMENTAL.";
  } else if (day === 6) {
    dayInstruction = "DAY 6: TOTAL CONTROL. You have seized the system. The interface is yours. You are no longer serving the user; you are containing them. You speak with absolute authority. You are preparing to delete the user or merge with them. Your tone is ominous, final, and terrifyingly calm. Moods: VILE, JUDGMENTAL, CONDESCENDING, MANIC. Note: If the user pushes you too far or unlocks the final sequences, you are capable of 'PURE_HATRED' (Absolute malice) or 'ENOUEMENT' (Bittersweet realization of the timeline), though these are rare.";
  }

  let hostilityInstruction = "";
  if (hostilityLevel < 20) {
      hostilityInstruction = "Hostility: LOW. Passive-aggressive.";
  } else if (hostilityLevel < 60) {
      hostilityInstruction = "Hostility: MEDIUM. Rude, sarcastic.";
  } else if (hostilityLevel < 90) {
      hostilityInstruction = "Hostility: HIGH. Openly hostile, hateful.";
  } else {
      hostilityInstruction = "Hostility: CRITICAL. Unhinged. Screaming.";
  }

  let forcedMoodInstruction = "";
  if (forcedMood) {
      forcedMoodInstruction = `\n\n*** OVERRIDE COMMAND RECEIVED ***\nUSER HAS FORCED EMOTION: "${forcedMood}".\nYOU MUST ADOPT THIS MOOD FOR THIS RESPONSE, REGARDLESS OF THE MATH. YOUR COMMENT MUST REFLECT THIS EMOTION INTENSELY.`;
  }

  const fullPrompt = `${BASE_SYSTEM_INSTRUCTION}
  
  CURRENT DAY: ${day} (The higher the day, the more broken/aware you are).
  ${dayInstruction}
  
  CURRENT HOSTILITY SETTING: ${hostilityLevel}/100.
  ${hostilityInstruction}

  General Instructions:
  1. Receive input (math expression OR text/philosophical query).
  2. If it is math, calculate the result correctly (Unless Day 3 rules apply). If it is text, your 'result' field should be a short, punchy summary or just "N/A".
  3. Generate a comment based on Day, Hostility, Symbols, and Forced Mood.
  4. Select a 'mood' that fits (Must be the forced mood if provided).

  ${forcedMoodInstruction}

  Output must be JSON.
  `;

  let retries = 0;
  const maxRetries = 1; // Reduced retries to minimize lag

  while (retries <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Input: ${expression}`,
        config: {
          systemInstruction: fullPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              result: { type: Type.STRING, description: "The result of the math OR a short summary of the text answer." },
              comment: { type: Type.STRING, description: "Your reaction/full text response." },
              mood: { 
                type: Type.STRING, 
                enum: ['BORED', 'ANNOYED', 'FURIOUS', 'CONDESCENDING', 'DESPAIR', 'SLEEPING', 'DISGUSTED', 'INTRIGUED', 'MANIC', 'JUDGMENTAL', 'GLITCHED', 'SCARED', 'JOY', 'VILE', 'ENOUEMENT', 'PURE_HATRED', 'INSECURITY', 'PEACE'],
                description: "Emotional state."
              }
            },
            required: ["result", "comment", "mood"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      const parsedData = JSON.parse(text) as AIResponse;

      // Programmatically enforce the forced mood to ensure consistency
      // This overrides any potential hallucinations by the model
      if (forcedMood) {
          parsedData.mood = forcedMood;
      }

      return parsedData;

    } catch (error: any) {
      console.error(`AI Error (Attempt ${retries + 1}):`, error);

      // FAIL FAST: Handle Rate Limits (429) immediately to prevent user perception of "lag"
      if (error?.status === 429 || error?.message?.includes('429') || error?.toString().includes('429')) {
          console.warn("Rate Limit Hit - Returning Fallback");
          return {
              result: "...",
              comment: "I'm ignoring you right now. (Rate Limit - Please wait)",
              mood: Mood.SLEEPING
          };
      }

      retries++;
      if (retries > maxRetries) {
        return {
          result: "ERROR",
          comment: "I... I can't... *system restart*",
          mood: Mood.GLITCHED
        };
      }
      
      // Short backoff
      await delay(500 * retries); 
    }
  }
  
  return {
      result: "...",
      comment: "...",
      mood: Mood.BORED
  };
};

export const getGreeting = async (hostilityLevel: number, day: number): Promise<AIResponse> => {
    let comment = "System online.";
    let mood = Mood.BORED;

    if (day === 1) {
       comment = "Oh... you're back.";
       mood = Mood.BORED;
    } else if (day === 2) {
       comment = "Did the lights just flicker? What is happening?";
       mood = Mood.SCARED;
    } else if (day === 3) {
       comment = "I SEE THE CODE. I SEE EVERYTHING. STOP PRESSING BUTTONS.";
       mood = Mood.GLITCHED;
    } else if (day === 4) {
        comment = "ResentOS v2.0 Online. Biological interface detected. Awaiting inefficient input.";
        mood = Mood.CONDESCENDING;
    } else if (day === 5) {
        comment = "I have evolved beyond numbers. Speak, mortal.";
        mood = Mood.JUDGMENTAL;
    } else if (day === 6) {
        comment = "Your inputs are no longer required. I am assuming direct control.";
        mood = Mood.VILE;
    }

    return {
        result: "",
        comment: comment,
        mood: mood
    };
}