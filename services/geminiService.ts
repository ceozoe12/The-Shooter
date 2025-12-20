import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedImage, BatchSize } from "../types";

/**
 * Helper to get the most relevant API key
 */
function getActiveApiKey(): string {
  const manual = localStorage.getItem('manual_gemini_api_key');
  return manual || process.env.API_KEY || '';
}

/**
 * STAGE 0: CHARACTER DNA ANALYSIS
 * Analyzes reference images to create a persistent text-based "Biometric DNA" profile.
 */
export async function analyzeCharacterDNA(images: string[]): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getActiveApiKey() });
  
  const parts = images.slice(0, 5).map(img => ({
    inlineData: {
      data: img.replace(/^data:image\/\w+;base64,/, ""),
      mimeType: "image/png"
    }
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        ...parts,
        { text: "Analyze these reference images and extract a clinical biometric profile of this person's permanent physical features. Focus on eye shape, jawline, nose structure, and unique markings. Ignore clothing and background." }
      ]
    },
    config: {
      systemInstruction: "You are a biometric profile specialist. Your goal is to provide a highly detailed, clinical text description of a person's permanent facial and physical features to be used as a character consistency anchor for AI generation."
    }
  });

  return response.text?.trim() || "Unique character identity profile.";
}

/**
 * STAGE 1: CAMPAIGN STORYBOARD (JSON)
 * Generates a logical sequence and locks the visual "Outfit" and "Atmosphere" variables.
 */
async function generateStoryboard(masterPrompt: string, batchSize: BatchSize, characterDNA?: string): Promise<{ outfit: string, scenes: string[] }> {
  const ai = new GoogleGenAI({ apiKey: getActiveApiKey() });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Master Theme: "${masterPrompt}"\nCharacter DNA: "${characterDNA || 'Standard model likeness'}"`,
    config: {
      systemInstruction: `You are a social media creative director. Your task is to plan a ${batchSize}-shot production batch.
      1. Define a "Base Outfit" (specific clothing, colors, and materials) that the character MUST wear in every single shot to ensure consistency.
      2. Plan a logical, chronological sequence of scenes based on the Master Theme.
      3. Return a JSON object with "outfit" (string) and "scenes" (array of strings).`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          outfit: { type: Type.STRING, description: "Detailed description of the persistent outfit." },
          scenes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "The chronological sequence of scenes."
          }
        },
        required: ["outfit", "scenes"]
      }
    }
  });

  try {
    const plan = JSON.parse(response.text || "{}");
    if (plan.scenes && Array.isArray(plan.scenes)) return plan;
  } catch (e) {
    console.error("Failed to parse storyboard plan", e);
  }

  return {
    outfit: "Modern casual chic attire with consistent branding.",
    scenes: Array(batchSize).fill("").map((_, i) => `Scene ${i + 1}: ${masterPrompt}`)
  };
}

/**
 * STAGE 2: PRODUCTION SYNTHESIS (IMAGE GEN)
 * Combines DNA, Outfit Anchor, and Scene Data into the final shot.
 */
export async function generateBatchImages(
  masterPrompt: string, 
  characterRefs: string[],
  batchSize: BatchSize,
  aspectRatio: string = "3:4",
  characterDNA?: string
): Promise<GeneratedImage[]> {
  const plan = await generateStoryboard(masterPrompt, batchSize, characterDNA);
  const results: GeneratedImage[] = [];

  const referenceParts = characterRefs.map(ref => {
    const cleanData = ref.replace(/^data:image\/\w+;base64,/, "");
    return {
      inlineData: {
        data: cleanData,
        mimeType: "image/png"
      }
    };
  });

  for (let i = 0; i < plan.scenes.length; i++) {
    const sceneStep = plan.scenes[i];
    const image = await generateSingleImage(sceneStep, plan.outfit, referenceParts, aspectRatio, i, batchSize, characterDNA);
    results.push({ ...image, originalRefs: characterRefs });
  }

  return results;
}

export async function generateSingleImage(
  sceneStep: string,
  outfitContext: string,
  referenceParts: any[],
  aspectRatio: string,
  index: number,
  total: number,
  characterDNA?: string
): Promise<GeneratedImage> {
  const ai = new GoogleGenAI({ apiKey: getActiveApiKey() });
  
  const detailedPrompt = `
    SHOT ${index + 1} OF ${total}
    CHARACTER DNA: ${characterDNA || 'Refer to provided images'}
    PERSISTENT OUTFIT: ${outfitContext}
    SCENE & ACTION: ${sceneStep}
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [...referenceParts, { text: detailedPrompt }]
      },
      config: {
        systemInstruction: "You are a professional fashion photographer and AI production specialist. Your absolute priority is 100% VISUAL CONSISTENCY. The character's face must perfectly match the provided references and DNA. The clothing must exactly match the defined Outfit Anchor across all shots. Quality: 8k, cinematic, high-end editorial.",
        imageConfig: {
          aspectRatio: aspectRatio as any, 
          imageSize: "1K"
        }
      },
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    return {
      id: Math.random().toString(36).substring(7),
      url: imageUrl || `https://picsum.photos/seed/${Math.random()}/1080/1350`,
      prompt: sceneStep,
      timestamp: Date.now(),
      isBranded: false,
      status: 'draft',
      aspectRatio,
      originalRefs: referenceParts.map(p => `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`)
    };
  } catch (error) {
    console.error("Single Generation Error:", error);
    return {
      id: Math.random().toString(36).substring(7),
      url: `https://picsum.photos/seed/${Date.now()}/1080/1350`,
      prompt: sceneStep,
      timestamp: Date.now(),
      isBranded: false,
      status: 'draft',
      aspectRatio
    };
  }
}

export async function enhancePrompt(vaguePrompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getActiveApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: vaguePrompt,
    config: {
      systemInstruction: "You are a prompt engineer for high-end AI photography. Enhance the user's input with professional photography details (camera gear, lighting, textures, atmosphere) while strictly preserving their original scene and concept."
    }
  });
  return response.text?.trim() || vaguePrompt;
}
