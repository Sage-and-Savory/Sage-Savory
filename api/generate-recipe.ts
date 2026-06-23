import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const crypto = require("crypto");

let supabaseAdmin: any = null;
let ai: any = null;

const getSupabase = () => {
  if (!supabaseAdmin) {
    let url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://zmgtllzebsgfolgytznp.supabase.co';
    url = url.trim().replace(/\/+$/, '');
    if (url.endsWith('/rest/v1')) {
      url = url.substring(0, url.length - 8);
    }
    url = url.replace(/\/+$/, '');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZ3RsbHplYnNnZm9sZ3l0em5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzA2NjIsImV4cCI6MjA5NjMwNjY2Mn0.IASgbwvZJtEYaL2qdKd7rBbNwUfFOji9ZpGYkF7_Gz4';
    supabaseAdmin = createClient(url, key);
  }
  return supabaseAdmin;
}

const getAI = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

export async function POST(req, res) {
  try {
    const supabase = getSupabase();
    const genAI = getAI();
    
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1]?.trim() 
      : authHeader?.trim();
    
    if (!token) {
      res.status(401).json({ error: 'Missing token' });
      return;
    }

    let user = null;
    let errorMessage = 'No user found';
    try {
      const { data, error: authError } = await supabase.auth.getUser(token);
      if (authError) {
        console.error("Supabase getUser error:", authError);
        errorMessage = authError.message || JSON.stringify(authError);
      } else {
        user = data?.user;
      }
    } catch (err: any) {
      console.error("Caught error during Supabase getUser:", err);
      errorMessage = err.message || JSON.stringify(err);
    }

    if (!user) {
      res.status(401).json({ error: `Unauthorized: Invalid or expired token. Details: ${errorMessage}` });
      return;
    }

    const { text, imageBase64, imageMimeType, language } = req.body;

    const langMap: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'ru': 'Russian',
      'hi': 'Hindi',
      'ar': 'Arabic'
    };
    const targetLanguage = langMap[language || 'en'] || 'English';

    const systemInstruction = `You are a professional chef. Extract the exact names and quantities of ingredients from the provided input (text or image) and generate extremely delicious, practical recipe suggestions that use these ingredients.

CRITICAL RULE: You MUST NEVER generate a recipe containing beef, beef broth, or any beef products. If the user explicitly requests beef or provides beef as an ingredient, you must gracefully return a culturally appropriate alternative (e.g. chicken, turkey, mushrooms) or ignore the beef entirely.

Generate three completely different recipes:
1. "Quick & Easy" (Under 30 mins)
2. "Creative/Gourmet"
3. "Healthy/Balanced"

Always respond in ${targetLanguage}. Ensure cultural relevance if the inputs imply a certain cuisine but prioritize the requested language. Add step-by-step instructions.

You must reply with valid JSON structured exactly like this:
{
  "detectedIngredients": ["list", "of", "ingredients", "with", "quantities"],
  "recipes": [
    {
      "title": "Recipe Title",
      "timeToCook": "20 mins",
      "difficulty": "Easy",
      "calories": 400,
      "category": "Quick & Easy",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["Step 1", "Step 2"]
    }
  ]
}

DO NOT include markdown block markers like \`\`\`json. Output ONLY the raw JSON object.`;

    let content: any[] = [];
    if (text) content.push(text);
    if (imageBase64 && imageMimeType) {
      content.push({
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: imageMimeType
        }
      });
    }

    if (content.length === 0) {
      return res.status(400).json({ error: "Please provide text or an image." });
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: content,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });

    const outputText = response.text || "";
    const cleanJson = outputText.replace(/^```json/g, '').replace(/```$/g, '').trim();
    
    let recipeData;
    let fallbackGenerated = false;
    try {
      recipeData = JSON.parse(cleanJson);
    } catch(err) {
      console.warn("JSON Parse Failed for AI generation. Using fallback. Response part:", cleanJson.substring(0, 100));
      recipeData = {
        id: crypto.randomUUID(),
        detectedIngredients: ["Failed to parse AI output. Try simpler inputs."],
        recipes: [
          {
            title: "Fallback Recipe",
            timeToCook: "30 mins",
            difficulty: "Medium",
            calories: 0,
            category: "Unexpected Output",
            ingredients: [],
            instructions: ["Try generating again."]
          }
        ]
      };
      fallbackGenerated = true;
    }
    
    if(!recipeData.id) recipeData.id = crypto.randomUUID();

    res.json(recipeData);

  } catch (e: any) {
    console.error("AI Generation Error", e);
    if (e.status === 503 || e.message?.includes('high demand') || e.message?.includes('UNAVAILABLE')) {
      res.status(503).json({ error: "The AI model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later." });
    } else {
      res.status(500).json({ error: e.message || "Failed to generate recipe. Please try again." });
    }
  }
}

export default async function handler(req, res) {
  // CORS Headers for Capacitor / external requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    return POST(req, res);
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}
