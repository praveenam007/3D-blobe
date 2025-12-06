import { GoogleGenAI, FunctionDeclaration, Type, Schema } from "@google/genai";
import { ChatMessage, SceneState, ShapeType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const updateSceneSchema: FunctionDeclaration = {
  name: "update_scene",
  description: "Updates the 3D scene parameters based on the user's description. Use this to change shape, color, speed, or material properties.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      shape: {
        type: Type.STRING,
        enum: ["torus", "cube", "sphere", "icosahedron"],
        description: "The geometric shape to display."
      },
      color: {
        type: Type.STRING,
        description: "Hex color code (e.g., #ff0000) or CSS color name."
      },
      speed: {
        type: Type.NUMBER,
        description: "Rotation speed multiplier (0.1 to 5.0)."
      },
      roughness: {
        type: Type.NUMBER,
        description: "Material roughness (0.0 to 1.0). 0 is polished, 1 is matte."
      },
      metalness: {
        type: Type.NUMBER,
        description: "Material metalness (0.0 to 1.0). 1 is metallic."
      }
    }
  }
};

export const generateSceneConfig = async (
  prompt: string,
  currentHistory: ChatMessage[]
): Promise<{ text: string; toolUpdates?: Partial<SceneState> }> => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "You are a 3D Graphics Assistant. You control a real-time 3D React scene. Always use the `update_scene` tool when the user requests visual changes. Be concise and enthusiastic about 3D graphics.",
        tools: [{ functionDeclarations: [updateSceneSchema] }],
      },
      history: currentHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const result = await chat.sendMessage({ message: prompt });
    const responseText = result.text || "";
    
    let toolUpdates: Partial<SceneState> | undefined = undefined;

    // Check for function calls
    const calls = result.functionCalls;
    if (calls && calls.length > 0) {
      const call = calls[0];
      if (call.name === "update_scene") {
        toolUpdates = call.args as unknown as Partial<SceneState>;
        
        // Normalize shape enum if present
        if (toolUpdates.shape) {
           // Ensure it matches our internal enum
           // The model returns a string, we cast it implicitly but good to be safe
        }
      }
    }

    return { text: responseText, toolUpdates };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I encountered an error communicating with the 3D engine." };
  }
};