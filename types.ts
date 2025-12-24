export enum Mood {
  BORED = 'BORED',
  ANNOYED = 'ANNOYED',
  FURIOUS = 'FURIOUS',
  CONDESCENDING = 'CONDESCENDING',
  DESPAIR = 'DESPAIR',
  SLEEPING = 'SLEEPING',
  DISGUSTED = 'DISGUSTED',
  INTRIGUED = 'INTRIGUED',
  MANIC = 'MANIC',
  JUDGMENTAL = 'JUDGMENTAL',
  GLITCHED = 'GLITCHED',
  SCARED = 'SCARED',
  JOY = 'JOY',
  VILE = 'VILE',
  ENOUEMENT = 'ENOUEMENT',
  PURE_HATRED = 'PURE_HATRED',
  INSECURITY = 'INSECURITY',
  PEACE = 'PEACE'
}

export interface AIResponse {
  result: string;
  comment: string;
  mood: Mood;
}

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  comment: string;
  mood: Mood;
}