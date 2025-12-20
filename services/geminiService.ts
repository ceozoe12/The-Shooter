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
 * NEW: Analyzes reference images to create a persistent "Character DNA" profile.
 * This biometric description helps the model maintain consistency beyond just visual references.
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
        { text: "Act as a biometric profile specialist. Analyze these reference images of the same person. Provide a highly detailed, clinical description of their permanent facial features (eyes, nose, jawline, specific unique markers), hair texture/color, and body type. This description will be used as a 'Character DNA' anchor for consistent AI generation. Focus ONLY on physical traits. Do not describe clothing or background." }
      ]
    }
  });

  return response.text?.trim() || "Unique character identity profile.";
}

/**
 * Stage 1: Generate a logical storyboard sequence with a persistent visual anchor.
 */
async function generateStoryboard(masterPrompt: string, batchSize: BatchSize, characterDNA?: string): Promise<{ outfit: string, scenes: string[] }> {
  const ai = new GoogleGenAI({ apiKey: getActiveApiKey() });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a social media creative director for a top-tier AI Influencer agency.
    Master Theme: "${masterPrompt}"
    ${characterDNA ? `Character Profile: "${characterDNA}"` : ''}
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
    AI INFLUENCER PRODUCTION - SHOT ${index + 1} of ${total}
    
    STRICT CHARACTER DNA ANCHOR:
    ${characterDNA ? characterDNA : 'Use provided reference images for physical appearance.'}
    
    STRICT VISUAL OUTFIT (MUST NOT CHANGE):
    - CHARACTER CLOTHING & STYLE: ${outfitContext}
    
    CURRENT ACTION & SCENE: ${sceneStep}
    
    PRODUCTION RULES:
    1. FACIAL CONSISTENCY: The facial features must perfectly match the biometric DNA and provided reference images.
    2. CLOTHING CONSISTENCY: The character MUST wear the exact same colors and fabrics as defined in the anchor.
    3. LIGHTING CONSISTENCY: Maintain the environment's current time-of-day lighting.
    4. PHOTOGRAPHY: 8k resolution, cinematic fashion shoot, high-end professional look.
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
 */
export async function enhancePrompt(vaguePrompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getActiveApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a prompt engineer for high-end AI fashion photography. 
    Your task is to take the user's input and ENHANCE it with professional photography details, 
    texture descriptions, specific lighting setups, and environmental depth. 
    
    STRICT MANDATE:
    1. PRESERVE the user's original scene, concept, and core action EXACTLY as described. Do not reinvent the scenario.
    2. ADD detail regarding camera gear, lighting, textures, and atmosphere.
    3. DO NOT introduce new characters or major objects the user did not specify.
    4. Focus on making the prompt sound like a professional production script.
    
    Original Input: "${vaguePrompt}"
    
    Return ONLY the enhanced production-ready text.`,
  });
  return response.text?.trim() || vaguePrompt;
}
