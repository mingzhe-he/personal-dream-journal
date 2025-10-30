export interface DreamEntry {
  id: number;
  date: string;
  transcription: string;
  imageUrl: string;
  interpretation: string;
  tags: string[];
  isLucid: boolean;
}

export type AppState = 'idle' | 'recording' | 'processing' | 'viewing' | 'viewingAnalysis';
