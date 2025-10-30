import { GoogleGenAI, LiveSession, Modality, Chat } from "@google/genai";
import { encode, createBlob } from '../utils/audio';
import { type DreamEntry } from "../types";

const MODEL_TEXT = 'gemini-2.5-flash';
const MODEL_IMAGE = 'imagen-4.0-generate-001';
const MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025';

let ai: GoogleGenAI;
function getAi() {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    }
    return ai;
}

export async function startTranscriptionSession(onTranscriptionUpdate: (text: string) => void): Promise<LiveSession> {
  const ai = getAi();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

  const sessionPromise: Promise<LiveSession> = ai.live.connect({
    model: MODEL_LIVE,
    callbacks: {
      onopen: () => {
        console.log('Live session opened.');
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);

        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          sessionPromise.then((session) => {
             session.sendRealtimeInput({ media: pcmBlob });
          });
        };

        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: (message) => {
        if (message.serverContent?.inputTranscription) {
          const text = message.serverContent.inputTranscription.text;
          if (text) {
            onTranscriptionUpdate(text);
          }
        }
      },
      onerror: (e) => {
        console.error('Live session error:', e);
      },
      onclose: () => {
        console.log('Live session closed.');
        stream.getTracks().forEach(track => track.stop());
        inputAudioContext.close();
      },
    },
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
    },
  });

  return sessionPromise;
}

export async function generateDreamImage(prompt: string): Promise<string> {
  const ai = getAi();
  const fullPrompt = `Generate a surrealist, dream-like, artistic image representing the core emotional theme of this dream: "${prompt}"`;
  
  const response = await ai.models.generateImages({
    model: MODEL_IMAGE,
    prompt: fullPrompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9',
    },
  });

  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  return `data:image/png;base64,${base64ImageBytes}`;
}

export async function interpretDream(dreamText: string): Promise<string> {
  const ai = getAi();
  const prompt = `You are a dream psychologist. Provide a structured psychological interpretation of the following dream based on recognized archetypes (e.g., Jungian). Analyze the key symbols, emotions, and narrative. Format the output in markdown. Dream: "${dreamText}"`;

  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: prompt,
  });

  return response.text;
}

export async function createDreamChat(dreamText: string): Promise<Chat> {
  const ai = getAi();
  const chat = ai.chats.create({
    model: MODEL_TEXT,
    config: {
      systemInstruction: `You are a helpful and insightful dream interpretation assistant. The user has just had a dream which they transcribed as: "${dreamText}". Your role is to answer their follow-up questions about specific symbols, feelings, or parts of the dream. Be thoughtful and draw upon common psychological and symbolic meanings, but present them as possibilities for reflection, not absolute facts.`,
    },
  });
  return chat;
}

export async function analyzeDreamPatterns(dreams: DreamEntry[]): Promise<string> {
  const ai = getAi();
  const dreamSummaries = dreams.map(dream => 
    `Date: ${dream.date}\nLucid: ${dream.isLucid}\nTags: ${dream.tags.join(', ')}\nTranscription: ${dream.transcription}\n`
  ).join('\n---\n');

  const prompt = `You are a psychoanalyst specializing in dream patterns. Analyze the following dream journal entries to find recurring patterns, symbols, emotions, and potential archetypal connections. Provide a comprehensive summary in markdown format. Structure your analysis with headings for "Recurring Themes", "Common Symbols", "Emotional Landscape", and "Overall Summary".\n\nHere are the dreams:\n${dreamSummaries}`;

  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: prompt,
  });

  return response.text;
}