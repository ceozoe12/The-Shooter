
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedImage, BatchSize } from "../types";

/**
 * Stage 1: Generate a logical storyboard sequence with a persistent visual anchor.
 */
async function generateStoryboard(masterPrompt: string, batchSize: BatchSize): Promise<{ outfit: string, scenes: string[] }> {
  // Create instance inside call context for deployment robustness
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a social media creative director for a top-tier AI Influencer agency.
    Master Theme: "${masterPrompt}"
    Action: Create a logical, high-engagement ${batchSize}-step chronological content sequence. 
    
    CRITICAL INSTRUCTIONS FOR PRODUCTION CONSISTENCY:
    1. Define a specific "Base Outfit" (clothing, accessories, hair style) that the character MUST wear in every single shot. Be specific about colors and materials.
    2. Maintain a consistent "Time of Day" or "Lighting Palette" that persists across all scenes to ensure the series looks like it was shot in one session.
    3. Ensure the character likeness and clothing NEVER change.
    
    Provide a JSON object with:
    - "outfit": A detailed description of the character's clothing and appearance.
    - "scenes": An array of ${batchSize} scene descriptions.`,
    config: {
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
    scenes: Array(batchSize).fill("").map((_, i) => `Scene ${i + 1} of the sequence: ${masterPrompt}`)
  };
}

/**
 * Stage 2: Generates the actual images following the storyboard.
 */
export async function generateBatchImages(
  masterPrompt: string, 
  characterRefs: string[],
  batchSize: BatchSize,
  aspectRatio: string = "3:4"
): Promise<GeneratedImage[]> {
  const plan = await generateStoryboard(masterPrompt, batchSize);
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
    const image = await generateSingleImage(sceneStep, plan.outfit, referenceParts, aspectRatio, i, batchSize);
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
  total: number
): Promise<GeneratedImage> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const detailedPrompt = `
    AI INFLUENCER PRODUCTION - SHOT ${index + 1} of ${total}
    
    STRICT VISUAL ANCHOR (MUST NOT CHANGE):
    - CHARACTER CLOTHING & STYLE: ${outfitContext}
    - CHARACTER IDENTITY: Extract facial features from provided reference images. 
    
    CURRENT ACTION: ${sceneStep}
    
    PRODUCTION RULES:
    1. CLOTHING CONSISTENCY: The character MUST wear the exact same colors and fabrics as defined in the anchor.
    2. LIGHTING CONSISTENCY: Maintain the environment's current time-of-day lighting.
    3. PHOTOGRAPHY: 8k resolution, cinematic fashion shoot, high-end professional look.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [...referenceParts, { text: detailedPrompt }]
      },
      config: {
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

/**
 * Enhances a vague user prompt into a high-detail prompt with consistency cues.
 * UPDATED: Strictly adds detail and depth WITHOUT changing the user's core intent.
 */
export async function enhancePrompt(vaguePrompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a prompt engineer for high-end AI fashion photography. 
    Your task is to take the user's input and ENHANCE it with professional photography details, 
    texture descriptions, specific lighting setups, and environmental depth. 
    
    STRICT MANDATE:
    1. PRESERVE the user's original scene, concept, and core action EXACTLY as described. Do not reinvent the scenario.
    2. ADD detail regarding camera gear (e.g., 35mm prime lens), lighting (e.g., soft key light, blue tint shadows), 
       textures (e.g., visible fabric weave), and atmosphere (e.g., slight haze).
    3. DO NOT introduce new characters, objects, or locations the user did not specify.
    4. Focus on making the prompt sound like a professional production script.
    
    Original Input: "${vaguePrompt}"
    
    Return ONLY the enhanced production-ready text.`,
  });
  return response.text?.trim() || vaguePrompt;
}
