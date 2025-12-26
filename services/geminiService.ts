
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceProfile, SynthesisConfig } from "../types";

/**
 * Encodes audio bytes to Base64
 */
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes Base64 to binary bytes
 */
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM data into a standard AudioBuffer
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Converts an AudioBuffer to a WAV Blob
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [];
  let offset = 0;
  let pos = 0;

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);

  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArray], { type: 'audio/wav' });

  function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
  function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }
}

const VALID_VOICES = ['Aoede', 'Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

/**
 * Utility to convert Blob to Base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      resolve(res.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Step 1: Deep Neural Analysis & Transcription.
 */
export const analyzeVoiceSample = async (audioBlob: Blob): Promise<VoiceProfile> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Audio = await blobToBase64(audioBlob);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Audio, mimeType: audioBlob.type } },
        { text: `VOICE ANALYSIS & TRANSCRIPTION TASK: 
        1. IDENTITY: Deconstruct this speaker's timbre, gender, and regional Kenyan accent patterns.
        2. TRANSCRIPTION: Transcribe the exact words spoken in the audio sample.
        
        MANDATORY: Map identity to closest base voice from: ${VALID_VOICES.join(', ')}. 
        (CRITICAL: Use 'Aoede' for female voices).
        
        Return JSON format: 
        {
          "gender": "Female" | "Male",
          "characteristics": ["list", "of", "traits"],
          "bestMatchVoice": "string",
          "neuralIdentityDescriptor": "Detailed description for TTS engine to mirror this voice precisely.",
          "accent": "string",
          "suggestedScript": "The full transcription of the provided audio.",
          "pitch": 1.0,
          "pacing": 1.0,
          "name": "Cloned Identity"
        }` }
      ]
    },
    config: {
      responseMimeType: 'application/json'
    }
  });

  const defaultProfile: VoiceProfile = {
    name: "User Identity",
    gender: "Female",
    characteristics: ["Natural"],
    bestMatchVoice: "Aoede",
    pitch: 1.0,
    pacing: 1.0,
    accent: "Neutral",
    neuralIdentityDescriptor: "A natural feminine human voice.",
    suggestedScript: ""
  };

  try {
    const rawText = response.text || '{}';
    const cleanJson = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    let voice = parsed.bestMatchVoice;
    if (!VALID_VOICES.includes(voice)) voice = parsed.gender === 'Female' ? "Aoede" : "Zephyr";

    return { ...defaultProfile, ...parsed, bestMatchVoice: voice };
  } catch (e) {
    console.error("Analysis Parse Error:", e);
    return defaultProfile;
  }
};

/**
 * Step 2: High-Fidelity Synthesis with Professional Studio Mastering.
 */
export const synthesizeSpeech = async (
  text: string, 
  profile: VoiceProfile,
  config: SynthesisConfig
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const professionalDirectives = config.professionalMode ? `
    PROFESSIONAL MASTERING ENGINE ACTIVE:
    - OUTPUT QUALITY: 24-bit studio broadcast standard.
    - VOCAL PROCESSING: Apply deep neural polishing. Eliminate all background noise, room echo, vocal artifacts, and non-speech sounds.
    - ARTICULATION: Ensure absolute clarity and crispness of vowels and consonants.
    - TONAL BALANCE: Add rich, resonant warmth. Balance the frequency response for a 'radio host' or 'high-end podcast' feel.
    - DELIVERY: Professional, authoritative yet natural pacing.
  ` : "";

  const styledPrompt = `
    TASK: Reconstruct the following text using the analyzed vocal identity fingerprint.
    GENDER: ${profile.gender}
    IDENTITY: ${profile.neuralIdentityDescriptor}
    ACCENT: ${profile.accent || 'Kenyan Native'}
    EMOTION: ${config.emotion}
    SPEED: ${config.speed}x

    ${professionalDirectives}

    MANDATORY: Maintain the exact soul and timbre of the original speaker, but elevated to a professional studio performance.

    TEXT TO SYNTHESIZE: "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: styledPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { 
              voiceName: profile.bestMatchVoice || (profile.gender === 'Female' ? 'Aoede' : 'Zephyr')
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("Neural synthesis returned empty audio data.");
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
    return URL.createObjectURL(audioBufferToWav(audioBuffer));
  } catch (err: any) {
    console.error("Synthesis Engine Error:", err);
    throw new Error(err?.message || "Internal Neural Engine Error.");
  }
};
