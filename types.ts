
export interface GameState {
  storyText: string;
  inventory: string[];
  currentQuest: string;
  imagePrompt: string;
  options: GameOption[];
  visualStyle: string;
  history: string[];
}

export interface GameOption {
  label: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum ImageResolution {
  R1K = '1K',
  R2K = '2K',
  R4K = '4K'
}

export interface StoryEngineResponse {
  storyText: string;
  inventory: string[];
  currentQuest: string;
  imagePrompt: string;
  options: GameOption[];
}
