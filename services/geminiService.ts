
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, StoryEngineResponse, ImageResolution } from "../types";

// Create a new instance right before each API call to ensure the latest API key is used
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const STORY_SYSTEM_PROMPT = `You are a world-class dungeon master and story weaver. Your goal is to guide the user through an infinite, reactive choose-your-own-adventure.
Rules:
1. Every choice must genuinely change the plot.
2. Track items and quests strictly. If the user gains an item, it must be added to inventory.
3. Keep descriptions evocative but concise (2-3 paragraphs).
4. Provide 4 distinct options for the next step.
5. You MUST return valid JSON matching the schema.
6. The visual style is fixed by the user at the start. Use it to create image prompts.`;

export async function generateInitialState(genre: string, visualStyle: string): Promise<StoryEngineResponse> {
  const ai = getAI();
  const prompt = `Start a new adventure in the genre: ${genre}. The visual style for the journey is: ${visualStyle}. Provide the opening scene, initial inventory, a starting quest, and 4 options.`;

  const response = await ai.models.generateContent({
    // Use Gemini 3 Pro for complex story generation tasks
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: STORY_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          storyText: { type: Type.STRING },
          inventory: { type: Type.ARRAY, items: { type: Type.STRING } },
          currentQuest: { type: Type.STRING },
          imagePrompt: { type: Type.STRING, description: "A detailed prompt for an image generator based on the scene" },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['label', 'description']
            }
          }
        },
        required: ['storyText', 'inventory', 'currentQuest', 'imagePrompt', 'options']
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function updateStory(
  currentState: GameState,
  choice: string
): Promise<StoryEngineResponse> {
  const ai = getAI();
  const context = `
    CURRENT QUEST: ${currentState.currentQuest}
    INVENTORY: ${currentState.inventory.join(', ')}
    RECENT STORY: ${currentState.history.slice(-3).join('\n')}
    VISUAL STYLE: ${currentState.visualStyle}
    USER CHOICE: ${choice}
  `;

  const response = await ai.models.generateContent({
    // Use Gemini 3 Pro for complex story generation tasks
    model: 'gemini-3-pro-preview',
    contents: context,
    config: {
      systemInstruction: STORY_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          storyText: { type: Type.STRING },
          inventory: { type: Type.ARRAY, items: { type: Type.STRING } },
          currentQuest: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['label', 'description']
            }
          }
        },
        required: ['storyText', 'inventory', 'currentQuest', 'imagePrompt', 'options']
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function generateGameImage(prompt: string, style: string, resolution: ImageResolution): Promise<string | null> {
  const ai = getAI();
  const fullPrompt = `${prompt}. Visual style: ${style}. Highly detailed, consistent art style, cinematic lighting.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: resolution as any
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    // If the request fails due to missing key or project, reset the state
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_RESET");
    }
    console.error("Image generation error:", error);
  }
  return null;
}

export async function chatWithCompanion(message: string, history: {role: string, content: string}[], storyContext: string) {
  const ai = getAI();
  const systemPrompt = `You are "The Chronicler", an AI companion for the user's adventure. You know everything about the current story state: ${storyContext}. Answer questions, provide hints, or just chat in character. Stay helpful and immersive.`;

  // Construct multi-turn history for generateContent
  const contents = [
    ...history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents,
    config: { systemInstruction: systemPrompt }
  });

  return response.text;
}
