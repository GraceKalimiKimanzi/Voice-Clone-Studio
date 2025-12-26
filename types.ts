
export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  GENERATING = 'GENERATING'
}

export interface VoiceSample {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
  status: 'pending' | 'processed';
}

export interface VoiceProfile {
  name: string;
  gender: string;
  characteristics: string[];
  bestMatchVoice: string;
  pitch: number;
  pacing: number;
  accent: string;
  neuralIdentityDescriptor: string;
  suggestedScript?: string;
}

export interface SynthesisConfig {
  speed: number;
  pitch: number;
  emphasis: string;
  emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'serious';
  format: 'mp3' | 'wav';
  professionalMode: boolean;
}
