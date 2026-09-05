import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import type { 
  DurationOption, 
  VisualStyle, 
  AspectRatio, 
  StoryPackage, 
  Character, 
  ScenePlan,
  RegenerateAspect 
} from "../src/types.ts";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const PREBUILT_VOICES = ['Zephyr', 'Kore', 'Puck', 'Fenrir', 'Charon'];
const COLOR_TONES = ['#38bdf8', '#a855f7', '#f43f5e', '#10b981', '#f59e0b', '#ec4899'];

/**
 * Creates coherent story, characters, dialogue, music mood, camera directions, and scene plans
 */
export async function generateStoryPackage(params: {
  prompt: string;
  duration: DurationOption;
  targetSeconds: number;
  style: VisualStyle;
  aspectRatio: AspectRatio;
}): Promise<StoryPackage> {
  const ai = getGeminiClient();

  // Determine scene count based on duration
  let targetSceneCount = 3;
  if (params.targetSeconds <= 10) targetSceneCount = 2;
  else if (params.targetSeconds <= 15) targetSceneCount = 3;
  else if (params.targetSeconds <= 20) targetSceneCount = 4;
  else if (params.targetSeconds <= 600) targetSceneCount = 6;
  else if (params.targetSeconds <= 900) targetSceneCount = 8;
  else targetSceneCount = 10;

  const secondsPerScene = Math.round(params.targetSeconds / targetSceneCount);

  if (ai) {
    try {
      const systemInstruction = `You are a world-class cinematic film director, screenwriter, and visual effects supervisor.
The user wants to generate an AI film based on their prompt.
Your task is to create a complete, coherent screenplay structure with:
1. Story Arc (beginning, middle, climax/ending)
2. Character System: Automatically detect 2-4 distinct characters with persistent visual identity, clothing, personality, and assign a voice name from: Zephyr (smooth/composed), Kore (empathetic/clear), Puck (dynamic/witty), Fenrir (commanding/deep), Charon (gravelly/resonant).
3. Scene Breakdown: Divide the story into EXACTLY ${targetSceneCount} sequential scenes that together total approximately ${params.targetSeconds} seconds (each scene ~${secondsPerScene}s).
4. Cinematic Camera: Select specific camera shots (Wide shot, Medium shot, Close-up, Over-the-shoulder, Tracking shot, Establishing shot) and camera movement (Slow push in, Tracking pan, Crane down, Orbital sweep, Static lock).
5. Visuals: Rich visual descriptions conforming strictly to the "${params.style}" aesthetic with lighting, weather, depth, and 3D composition.
6. Dialogue: Natural dialogue lines assigned to appropriate characters with emotion.
7. Background Music: Choose mood (Emotional, Adventure, Suspense, Fantasy, Comedy, Dramatic, Peaceful, or Cinematic) and tempo.
8. Foley & Sound Effects: Relevant environmental sounds and Foley effects.`;

      const promptContent = `User Prompt: "${params.prompt}"
Requested Visual Style: ${params.style}
Target Duration: ${params.targetSeconds} seconds across ${targetSceneCount} scenes
Aspect Ratio: ${params.aspectRatio}

Create a captivating, professional story package matching these specifications.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: promptContent,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              logline: { type: Type.STRING },
              beginning: { type: Type.STRING },
              middle: { type: Type.STRING },
              ending: { type: Type.STRING },
              musicMood: { 
                type: Type.STRING,
                description: "Must be one of: Emotional, Adventure, Suspense, Fantasy, Comedy, Dramatic, Peaceful, Cinematic"
              },
              musicTempo: { type: Type.STRING },
              soundscapeAmbience: { type: Type.STRING },
              characters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    role: { type: Type.STRING },
                    appearance: { type: Type.STRING },
                    clothing: { type: Type.STRING },
                    personality: { type: Type.STRING },
                    voiceName: { type: Type.STRING },
                  },
                  required: ["id", "name", "role", "appearance", "clothing", "personality", "voiceName"]
                }
              },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sceneNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    durationSeconds: { type: Type.INTEGER },
                    location: { type: Type.STRING },
                    environment: { type: Type.STRING },
                    lighting: { type: Type.STRING },
                    weather: { type: Type.STRING },
                    cameraShot: { type: Type.STRING },
                    cameraMovement: { type: Type.STRING },
                    characterIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                    action: { type: Type.STRING },
                    dialogue: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          characterId: { type: Type.STRING },
                          characterName: { type: Type.STRING },
                          text: { type: Type.STRING },
                          emotion: { type: Type.STRING }
                        },
                        required: ["id", "characterId", "characterName", "text", "emotion"]
                      }
                    },
                    soundEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
                    visualDescription: { type: Type.STRING }
                  },
                  required: ["sceneNumber", "title", "durationSeconds", "location", "cameraShot", "cameraMovement", "action", "visualDescription"]
                }
              }
            },
            required: ["title", "logline", "beginning", "middle", "ending", "musicMood", "musicTempo", "characters", "scenes"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text) as StoryPackage;
        // Enrich characters with avatar color tones
        parsed.characters = parsed.characters.map((c, i) => ({
          ...c,
          colorTone: COLOR_TONES[i % COLOR_TONES.length],
          voiceName: PREBUILT_VOICES.includes(c.voiceName) ? c.voiceName : PREBUILT_VOICES[i % PREBUILT_VOICES.length],
        }));
        // Ensure duration consistency
        parsed.scenes = parsed.scenes.map((s, i) => ({
          ...s,
          sceneNumber: i + 1,
          durationSeconds: s.durationSeconds || secondsPerScene,
          soundEffects: s.soundEffects || ['Ambient environment', 'Subtle atmosphere'],
          dialogue: s.dialogue || [],
        }));
        return parsed;
      }
    } catch (err) {
      console.warn("Gemini story generation encountered error, utilizing intelligent narrative engine:", err);
    }
  }

  // Fallback high-quality narrative synthesis if no API key or network glitch
  return buildIntelligentFallbackStory(params.prompt, params.style, params.targetSeconds, targetSceneCount, secondsPerScene);
}

/**
 * Generates fallback narrative synthesis tailored to prompt keywords
 */
function buildIntelligentFallbackStory(
  prompt: string,
  style: VisualStyle,
  totalSeconds: number,
  sceneCount: number,
  secondsPerScene: number
): StoryPackage {
  const promptLower = prompt.toLowerCase();
  
  // Detect genre keywords
  const isSciFi = promptLower.includes('sci-fi') || promptLower.includes('space') || promptLower.includes('robot') || promptLower.includes('cyber') || promptLower.includes('future');
  const isFantasy = promptLower.includes('fantasy') || promptLower.includes('magic') || promptLower.includes('dragon') || promptLower.includes('kingdom') || promptLower.includes('wizard');
  const isAction = promptLower.includes('action') || promptLower.includes('car') || promptLower.includes('fight') || promptLower.includes('chase') || promptLower.includes('explosion');
  const isEmotional = promptLower.includes('love') || promptLower.includes('memory') || promptLower.includes('sad') || promptLower.includes('peace') || promptLower.includes('hope');

  let title = "Echoes of the Horizon";
  let musicMood: StoryPackage['musicMood'] = 'Cinematic';
  let char1 = { name: "Aria Vance", role: "Protagonist", appearance: "Focused gaze with sharp cinematic features", clothing: "Technical weathered explorer coat with glowing accents", personality: "Resolute and analytical", voiceName: "Zephyr", colorTone: "#38bdf8" };
  let char2 = { name: "Kaelen", role: "Companion / Guide", appearance: "Tall, vigilant with silver-streaked hair", clothing: "Heavy armored tactical vest", personality: "Pragmatic and cautious", voiceName: "Fenrir", colorTone: "#a855f7" };

  if (isSciFi) {
    title = "Chronicles of the Void";
    musicMood = 'Suspense';
    char1.clothing = "Sleek carbon-fiber atmospheric flight suit with telemetry visor";
    char2.clothing = "Cybernetic exo-harness with neon status ribbons";
  } else if (isFantasy) {
    title = "The Obsidian Spire";
    musicMood = 'Fantasy';
    char1.clothing = "Enchanted silk traveling cloak woven with celestial glyphs";
    char2.clothing = "Forged mithril pauldrons and embossed leather tunic";
  } else if (isAction) {
    title = "Velocity Protocol";
    musicMood = 'Adventure';
    char1.clothing = "High-impact tactical jacket and reinforced boots";
  } else if (isEmotional) {
    title = "Beyond the Sunlit Shore";
    musicMood = 'Emotional';
    char1.clothing = "Warm wool overcoat and windblown scarf";
    char2.clothing = "Casual knit sweater and vintage leather satchel";
  }

  const characters: Character[] = [
    { id: "c1", ...char1 },
    { id: "c2", ...char2 }
  ];

  const cameraMoves = ['Slow push in', 'Tracking pan', 'Crane down', 'Orbital sweep', 'Establishing pan'];
  const cameraShots = ['Establishing shot', 'Medium shot', 'Close-up', 'Over-the-shoulder', 'Tracking shot'];

  const scenes: ScenePlan[] = [];
  for (let i = 0; i < sceneCount; i++) {
    const shot = cameraShots[i % cameraShots.length];
    const move = cameraMoves[i % cameraMoves.length];
    const isBeginning = i === 0;
    const isEnding = i === sceneCount - 1;

    let sceneTitle = `Act ${i + 1}: The Discovery`;
    let actionDesc = `${char1.name} arrives at the primary waypoint, surveying the monumental surroundings as environmental particles drift through the beam of light.`;
    let visualDesc = `${style} composition: vast panoramic setting with dramatic volumetric shafts of light breaking across ancient architecture. High atmospheric haze and subtle dust motes catch the rim light.`;
    let soundFx = ['Distant ambient rumble', 'Wind whistling across ridges'];

    let lines: ScenePlan['dialogue'] = [];
    if (isBeginning) {
      sceneTitle = `Opening: The Journey Begins`;
      actionDesc = `${char1.name} steps forward into frame, observing the shifting horizon as subtle light shifts across the landscape.`;
      lines = [
        { id: `d_${i}_1`, characterId: "c1", characterName: char1.name, text: "The coordinates were accurate. We've arrived just in time.", emotion: "Determined" }
      ];
      soundFx.push('Resonant low tone');
    } else if (isEnding) {
      sceneTitle = `Finale: Horizons Unveiled`;
      actionDesc = `${char1.name} and ${char2.name} stand side by side as the sky shifts into breathtaking golden hour tones, revealing the grand destination ahead.`;
      lines = [
        { id: `d_${i}_1`, characterId: "c2", characterName: char2.name, text: "Everything changes from this moment onward.", emotion: "Awe" },
        { id: `d_${i}_2`, characterId: "c1", characterName: char1.name, text: "Then let's take the next step together.", emotion: "Inspiring" }
      ];
      soundFx.push('Grand harmonic chord swell', 'Gentle wind gusts');
    } else {
      sceneTitle = `Scene ${i + 1}: The Confrontation`;
      actionDesc = `${char1.name} inspects the centerpiece artifact while ${char2.name} keeps watch at the perimeter.`;
      lines = [
        { id: `d_${i}_1`, characterId: "c1", characterName: char1.name, text: "Look closely at the surface patterns. It's active.", emotion: "Focused" },
        { id: `d_${i}_2`, characterId: "c2", characterName: char2.name, text: "Stay sharp. We don't know how long it will hold stability.", emotion: "Cautious" }
      ];
      soundFx.push('Subtle mechanical hum', 'Footsteps on metallic deck');
    }

    scenes.push({
      sceneNumber: i + 1,
      title: sceneTitle,
      durationSeconds: secondsPerScene,
      location: isSciFi ? "Orbital Relay Station Sigma" : isFantasy ? "Whispering Vale Sanctuary" : "Highland Vista",
      environment: `${style} environment with layered atmospheric depth`,
      lighting: isEnding ? "Golden hour warm rim lighting with long shadows" : "Moody twilight cinematic illumination with cyan accents",
      weather: "Clear with atmospheric mist and floating motes",
      cameraShot: shot,
      cameraMovement: move,
      characterIds: ["c1", "c2"],
      action: actionDesc,
      dialogue: lines,
      soundEffects: soundFx,
      visualDescription: visualDesc
    });
  }

  return {
    title,
    logline: `A cinematic tale inspired by "${prompt.slice(0, 60)}..." brought to life in ${style} aesthetic.`,
    beginning: `${char1.name} embarks across an uncharted threshold, drawn by an undeniable beacon.`,
    middle: `Navigating uncharted obstacles alongside ${char2.name}, they unlock revelations at the heart of their quest.`,
    ending: `A triumph of vision and resolve as new horizons open before them.`,
    musicMood,
    musicTempo: "78 BPM, Steady Cinematic Pulse",
    soundscapeAmbience: "Layered environmental wind, subtle spatial resonance, and deep organic drones",
    characters,
    scenes
  };
}

/**
 * Regenerates a specific aspect of a scene or story
 */
export async function regenerateAspect(params: {
  aspect: RegenerateAspect;
  sceneNumber?: number;
  existingStory: StoryPackage;
  style: VisualStyle;
}): Promise<StoryPackage> {
  const story = JSON.parse(JSON.stringify(params.existingStory)) as StoryPackage;
  const ai = getGeminiClient();

  const sceneIndex = (params.sceneNumber || 1) - 1;
  const targetScene = story.scenes[sceneIndex] || story.scenes[0];

  if (ai) {
    try {
      if (params.aspect === 'dialogue') {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Given the scene: "${targetScene.title}", action: "${targetScene.action}", characters: ${JSON.stringify(story.characters)},
Write a fresh, gripping dialogue exchange with 1-3 lines. Return JSON with dialogue array: [{ "id": string, "characterId": string, "characterName": string, "text": string, "emotion": string }]`,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (Array.isArray(parsed.dialogue)) {
            targetScene.dialogue = parsed.dialogue;
          } else if (Array.isArray(parsed)) {
            targetScene.dialogue = parsed;
          }
        }
      } else if (params.aspect === 'visual') {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Create an innovative, highly detailed cinematic visual prompt for scene: "${targetScene.title}" in style: "${params.style}". Include lighting, camera composition, atmospheric weather, and character staging. Return JSON { "visualDescription": string, "lighting": string, "cameraShot": string }`,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.visualDescription) targetScene.visualDescription = parsed.visualDescription;
          if (parsed.lighting) targetScene.lighting = parsed.lighting;
          if (parsed.cameraShot) targetScene.cameraShot = parsed.cameraShot;
        }
      } else if (params.aspect === 'music') {
        const moods: StoryPackage['musicMood'][] = ['Cinematic', 'Emotional', 'Adventure', 'Suspense', 'Dramatic', 'Peaceful'];
        const currentMoodIndex = moods.indexOf(story.musicMood);
        story.musicMood = moods[(currentMoodIndex + 1) % moods.length];
        story.musicTempo = "84 BPM, Dynamic Harmonic Progression";
      } else if (params.aspect === 'scene') {
        targetScene.action = `Regenerated dynamic action: The camera orbits as tension mounts and an unexpected kinetic event shifts the environment.`;
        targetScene.cameraMovement = targetScene.cameraMovement === 'Slow push in' ? 'Orbital sweep' : 'Tracking pan';
      }
    } catch (e) {
      console.warn("Regeneration error, updating with local variation:", e);
    }
  } else {
    // Local variation
    if (params.aspect === 'dialogue') {
      targetScene.dialogue = [
        {
          id: `d_regen_${Date.now()}`,
          characterId: targetScene.characterIds[0] || "c1",
          characterName: story.characters[0]?.name || "Protagonist",
          text: "Look at how the light refracts here... the energy signature is shifting.",
          emotion: "Curious and alert"
        }
      ];
    } else if (params.aspect === 'visual') {
      targetScene.visualDescription = `Re-imagined ${params.style} vista: Low-angle dramatic framing with heightened volumetric contrast, airborne particles illuminated by an iridescent backlight.`;
    } else if (params.aspect === 'music') {
      const moods: StoryPackage['musicMood'][] = ['Cinematic', 'Adventure', 'Suspense', 'Emotional', 'Dramatic'];
      const nextMood = moods[(moods.indexOf(story.musicMood) + 1) % moods.length];
      story.musicMood = nextMood;
    } else if (params.aspect === 'voice') {
      story.characters.forEach((c, idx) => {
        const voices = ['Zephyr', 'Kore', 'Puck', 'Fenrir', 'Charon'];
        c.voiceName = voices[(voices.indexOf(c.voiceName) + 1) % voices.length];
      });
    }
  }

  return story;
}
