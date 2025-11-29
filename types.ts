export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface ImageState {
  original: string | null; // Base64
  generated: string | null; // Base64
  currentView: 'original' | 'generated';
}

export interface GenerationConfig {
  aspectRatio: AspectRatio;
  prompt?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}