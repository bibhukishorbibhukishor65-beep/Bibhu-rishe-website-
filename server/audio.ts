import fs from "fs";
import path from "path";
import type { StoryPackage } from "../src/types.ts";

/**
 * Creates a standard 44.1kHz 16-bit Stereo WAV buffer
 */
export function createWavBuffer(sampleRate: number, numChannels: number, samples: Float32Array[]): Buffer {
  const numSamples = samples[0].length;
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = numSamples * numChannels * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write interleaved PCM 16-bit samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const s = Math.max(-1, Math.min(1, samples[channel][i]));
      const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
      buffer.writeInt16LE(Math.floor(val), offset);
      offset += 2;
    }
  }

  return buffer;
}

/**
 * Generates an evocative, synchronized cinematic soundtrack matching story mood, dialogue, and SFX
 */
export async function generateFullSoundtrack(
  story: StoryPackage,
  totalDurationSeconds: number,
  outputPath: string
): Promise<string> {
  const sampleRate = 44100;
  // Cap soundtrack duration at 60s for file generation efficiency while looping/mixing cleanly for longer targets
  const renderDuration = Math.min(60, totalDurationSeconds);
  const totalSamples = Math.floor(sampleRate * renderDuration);

  const leftChannel = new Float32Array(totalSamples);
  const rightChannel = new Float32Array(totalSamples);

  // 1. Synthesize Background Music
  const mood = story.musicMood || 'Cinematic';
  synthesizeMusicLayer(mood, leftChannel, rightChannel, sampleRate, totalSamples);

  // 2. Synthesize Environmental Foley & SFX
  synthesizeSfxLayer(story, leftChannel, rightChannel, sampleRate, totalSamples);

  // 3. Synthesize Character Voices & Dialogue Formants
  synthesizeDialogueLayer(story, leftChannel, rightChannel, sampleRate, totalSamples);

  // Write final WAV file
  const wavBuffer = createWavBuffer(sampleRate, 2, [leftChannel, rightChannel]);
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.promises.writeFile(outputPath, wavBuffer);

  return outputPath;
}

function synthesizeMusicLayer(
  mood: StoryPackage['musicMood'],
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  totalSamples: number
) {
  // Harmonic root frequencies for different moods
  let baseFreqs = [55, 65.4, 82.4, 110]; // A1, C2, E2, A2 (Cinematic Minor)
  let leadChord = [220, 261.6, 329.6, 392.0]; // A Minor 7

  if (mood === 'Adventure') {
    baseFreqs = [65.4, 82.4, 98.0, 130.8]; // C Major / D
    leadChord = [261.6, 329.6, 392.0, 523.2];
  } else if (mood === 'Suspense') {
    baseFreqs = [43.6, 46.2, 58.2, 87.3]; // Low dissonance F/F#
    leadChord = [174.6, 185.0, 233.0, 277.0];
  } else if (mood === 'Fantasy') {
    baseFreqs = [73.4, 92.5, 110.0, 146.8]; // D Dorian
    leadChord = [293.6, 369.9, 440.0, 587.3];
  } else if (mood === 'Emotional') {
    baseFreqs = [58.2, 65.4, 87.3, 116.5]; // Bb Major / F
    leadChord = [233.0, 293.6, 349.2, 466.1];
  } else if (mood === 'Peaceful') {
    baseFreqs = [65.4, 73.4, 82.4, 98.0]; // Pentatonic calm
    leadChord = [261.6, 293.6, 329.6, 392.0];
  }

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const progress = i / totalSamples;

    // Fade in and out envelope
    let masterEnv = 1;
    if (t < 2) masterEnv = t / 2;
    else if (t > (totalSamples / sampleRate) - 2) masterEnv = Math.max(0, ((totalSamples / sampleRate) - t) / 2);

    // Deep Sub-bass Drone
    const drone = Math.sin(2 * Math.PI * baseFreqs[0] * t) * 0.18 +
                  Math.sin(2 * Math.PI * (baseFreqs[0] * 1.5) * t) * 0.08;

    // Warm Pad Chords with slow chorusing
    const lfo1 = Math.sin(2 * Math.PI * 0.2 * t);
    const lfo2 = Math.cos(2 * Math.PI * 0.23 * t);

    let padLeft = 0;
    let padRight = 0;
    for (let c = 0; c < leadChord.length; c++) {
      const f = leadChord[c];
      const detuneL = f * (1 + 0.003 * lfo1);
      const detuneR = f * (1 - 0.003 * lfo2);
      padLeft += Math.sin(2 * Math.PI * detuneL * t) * 0.04;
      padRight += Math.sin(2 * Math.PI * detuneR * t) * 0.04;
    }

    // Melodic Arpeggiation pulse (Hans Zimmer style pulse)
    const tempoPulse = (t * 2) % 1; // 120 bpm pulses
    const pulseEnv = Math.exp(-tempoPulse * 4);
    const noteIdx = Math.floor((t * 2) % leadChord.length);
    const arpHertz = leadChord[noteIdx] * 2;
    const arpVal = Math.sin(2 * Math.PI * arpHertz * t) * pulseEnv * 0.05;

    const totalL = (drone + padLeft + arpVal) * masterEnv * 0.45;
    const totalR = (drone + padRight + arpVal) * masterEnv * 0.45;

    left[i] += totalL;
    right[i] += totalR;
  }
}

function synthesizeSfxLayer(
  story: StoryPackage,
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  totalSamples: number
) {
  // Environmental wind / atmospheric air noise
  let noiseFilter = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const whiteNoise = (Math.random() * 2 - 1) * 0.035;
    const windMod = (Math.sin(2 * Math.PI * 0.15 * t) + 1) * 0.5;
    noiseFilter = noiseFilter * 0.96 + whiteNoise * 0.04;
    
    left[i] += noiseFilter * windMod * 0.6;
    right[i] += noiseFilter * (1 - windMod * 0.3) * 0.6;
  }

  // Dramatic cinematic impact hit at start of key scenes
  const sceneInterval = Math.max(4, Math.floor((totalSamples / sampleRate) / (story.scenes.length || 1)));
  for (let s = 0; s < story.scenes.length; s++) {
    const impactStart = Math.floor(s * sceneInterval * sampleRate);
    if (impactStart >= totalSamples) break;

    const impactSamples = Math.min(sampleRate * 3, totalSamples - impactStart);
    for (let j = 0; j < impactSamples; j++) {
      const it = j / sampleRate;
      const decay = Math.exp(-it * 2.5);
      const subBoom = Math.sin(2 * Math.PI * (50 * Math.exp(-it * 1.8)) * it) * 0.25 * decay;
      const crackle = (Math.random() * 2 - 1) * 0.08 * Math.exp(-it * 12);
      
      left[impactStart + j] += (subBoom + crackle) * 0.7;
      right[impactStart + j] += (subBoom + crackle) * 0.7;
    }
  }
}

function synthesizeDialogueLayer(
  story: StoryPackage,
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  totalSamples: number
) {
  // Synthesize voice lines at scene intervals
  const sceneCount = story.scenes.length || 1;
  const timePerScene = (totalSamples / sampleRate) / sceneCount;

  story.scenes.forEach((scene, sceneIdx) => {
    if (!scene.dialogue || scene.dialogue.length === 0) return;

    scene.dialogue.forEach((line, lineIdx) => {
      // Find character voice
      const char = story.characters.find(c => c.id === line.characterId) || story.characters[0];
      let pitch = 140; // Default male baritone
      if (char?.voiceName === 'Kore') pitch = 220; // Clear female alto
      else if (char?.voiceName === 'Fenrir') pitch = 95; // Deep resonant bass
      else if (char?.voiceName === 'Puck') pitch = 185; // Energetic tenor
      else if (char?.voiceName === 'Charon') pitch = 80; // Low gravel

      // Line timing
      const lineStartTime = sceneIdx * timePerScene + 1.2 + (lineIdx * 2.5);
      const startSample = Math.floor(lineStartTime * sampleRate);
      if (startSample >= totalSamples) return;

      // Render stylized vocal formants for the words
      const words = line.text.split(' ');
      const wordDuration = 0.22; // ~220ms per word cadence
      let currentSample = startSample;

      for (let w = 0; w < words.length; w++) {
        const wordSamples = Math.floor(wordDuration * sampleRate);
        if (currentSample + wordSamples >= totalSamples) break;

        // Vowel formant modulation (F1 ~ 500Hz, F2 ~ 1500Hz, F3 ~ 2500Hz)
        const vowelType = w % 4;
        let f1 = 500;
        let f2 = 1500;
        if (vowelType === 1) { f1 = 300; f2 = 2200; } // "ee"
        else if (vowelType === 2) { f1 = 700; f2 = 1100; } // "ah"
        else if (vowelType === 3) { f1 = 350; f2 = 800; } // "oo"

        for (let s = 0; s < wordSamples; s++) {
          const t = s / sampleRate;
          const env = Math.sin((s / wordSamples) * Math.PI); // Smooth bell envelope

          // Glottal pulse with natural vibrato
          const vibrato = 1 + 0.015 * Math.sin(2 * Math.PI * 5.5 * t);
          const f0 = pitch * vibrato;
          
          // Harmonic overtone synthesis
          const voiceSignal = (
            Math.sin(2 * Math.PI * f0 * t) * 0.4 +
            Math.sin(2 * Math.PI * f1 * t) * 0.3 * Math.exp(-t * 8) +
            Math.sin(2 * Math.PI * f2 * t) * 0.2 * Math.exp(-t * 6) +
            (Math.random() * 2 - 1) * 0.03 // Breathiness
          ) * env * 0.35;

          // Pan slightly according to character index
          const pan = scene.characterIds.indexOf(char?.id || '') === 0 ? 0.45 : 0.55;
          left[currentSample + s] += voiceSignal * (1 - pan);
          right[currentSample + s] += voiceSignal * pan;
        }

        // Inter-word pause
        currentSample += wordSamples + Math.floor(0.06 * sampleRate);
      }
    });
  });
}
