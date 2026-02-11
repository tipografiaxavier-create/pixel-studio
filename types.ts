
export interface PixelImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  aspectRatio: string;
  style?: string;
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface GenerationSettings {
  aspectRatio: AspectRatio;
  style: string;
  enhancePrompt: boolean;
}

export enum GenerationState {
  IDLE = 'IDLE',
  REFINING = 'REFINING',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR'
}
