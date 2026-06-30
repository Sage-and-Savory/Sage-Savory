import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

dotenv.config();

let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://zmgtllzebsgfolgytznp.supabase.co";
supabaseUrl = supabaseUrl.trim().replace(/\/+$/, '');
if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.substring(0, supabaseUrl.length - 8);
}
supabaseUrl = supabaseUrl.replace(/\/+$/, '');

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZ3RsbHplYnNnZm9sZ3l0em5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzA2NjIsImV4cCI6MjA5NjMwNjY2Mn0.IASgbwvZJtEYaL2qdKd7rBbNwUfFOji9ZpGYkF7_Gz4";

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// API routes FIRST
app.post("/api/generate-recipe", async (req, res) => {
    try {
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
        const { data, error: authError } = await supabaseAdmin.auth.getUser(token);
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
        'bn': 'Bengali',
        'ta': 'Tamil',
        'ml': 'Malayalam'
      };
      
      const langName = language && langMap[language] ? langMap[language] : 'English';
      const langInstruction = `CRITICAL: You MUST write the title, ingredients names, notes, steps, and pickyHack ENTIRELY in ${langName}. Do not use English unless the user requested English.

EXTREMELY STRICT DIETARY RULE: You MUST NEVER generate a recipe containing beef, beef broth, or any beef products. If the user explicitly requests beef, provides beef as an input, or the image contains beef, you MUST set isValid to false and provide an errorMessage stating that beef recipes are not supported on this platform.`;

      let hasInputForAnalysis = false;

      const parts: any[] = [];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: imageMimeType || "image/jpeg",
            data: imageBase64,
          },
        });
        parts.push({
          text: `Analyze this image and identify the food ingredients present. Then, create a magical, delicious recipe based on those ingredients (plus standard pantry staples). Provide the recipe details matching the requested schema. ${langInstruction}`
        });
        hasInputForAnalysis = true;
      } else if (text) {
        parts.push({
          text: `Create a magical, delicious recipe using the following ingredients: ${text}. You can include standard pantry staples. Provide the recipe details matching the requested schema. ${langInstruction}`
        });
        hasInputForAnalysis = true;
      }

      if (!hasInputForAnalysis) {
        return res.status(400).json({ error: "Please provide ingredients text or an image." });
      }

      const config = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: {
              type: Type.BOOLEAN,
              description: "True if the input primarily consists of common, recognizable, edible food ingredients. False if it contains nonsense, non-food items, harmful substances, or unrecognizable input."
            },
            errorMessage: {
              type: Type.STRING,
              description: "If isValid is false, explain why the ingredients are not recognized or invalid."
            },
            title: { type: Type.STRING, description: "Title of the recipe" },
            time: { type: Type.STRING, description: "Time to make, e.g. '30 min'" },
            difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" },
            baseServings: { type: Type.NUMBER, description: "Number of servings" },
            region: { type: Type.STRING, description: "The regional cuisine category, e.g., Italian, Mexican, Asian, Indian, American, etc. Use 'Global' if unknown." },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  amount: { type: Type.NUMBER, description: "Numeric amount" },
                  unit: { type: Type.STRING, description: "Unit of measure, e.g. cups, tbsp, or 'to taste'" },
                  name: { type: Type.STRING, description: "Ingredient name" },
                  category: { type: Type.STRING, description: "One of: Produce, Meat, Dairy, Pantry, Main, Other" },
                  notes: { type: Type.STRING, description: "Any helpful extra details, e.g. 'about 4 large potatoes' or 'finely chopped'" }
                },
                required: ["amount", "unit", "name", "category"]
              }
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step by step instructions"
            },
            pickyHack: {
              type: Type.STRING,
              description: "A fun tip trick for serving to picky eaters kids"
            }
          },
          required: ["isValid"]
        }
      };

      const tryModels = async (models: string[], retries = 2): Promise<any> => {
        for (const modelName of models) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: { parts },
              config
            });
            return JSON.parse(response.text || "{}");
          } catch (e: any) {
            console.error(`Error with model ${modelName}:`, e.message || e);
            // Check for 429 (Rate Limit) or 503 (Service Unavailable / Overloaded)
            if (e.status === 429 || e.status === 503 || (e.message && (e.message.includes('429') || e.message.includes('503')))) {
              console.log(`Model ${modelName} overloaded or rate limited. Trying next model...`);
              continue; // try next model
            }
            throw e; // throw other errors immediately
          }
        }
        
        // If all models failed, try the first one again after waiting if retries > 0
        if (retries > 0) {
           console.log("All models failed due to rate limits or overload. Waiting 5s before retrying...");
           await new Promise(resolve => setTimeout(resolve, 5000));
           return await tryModels(models, retries - 1);
        }
        
        throw new Error("All AI models are currently experiencing high demand. Please try again later.");
      };

      let recipeData = await tryModels(["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]);

      if (!recipeData.isValid) {
        return res.status(400).json({ error: recipeData.errorMessage || "Hmm, we don't recognize those ingredients. Try common food items!" });
      }

      let imageResult = undefined;
      let generatedImageUrl = undefined;
      
      if (imageBase64 && imageMimeType) {
        recipeData.image = `data:${imageMimeType};base64,${imageBase64}`;
      } else {
        recipeData.image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';
        if (process.env.PEXELS_API_KEY) {
          try {
            const pexelsQuery = encodeURIComponent(`${recipeData.title} food`);
            const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${pexelsQuery}&per_page=1`, {
              headers: { Authorization: process.env.PEXELS_API_KEY }
            });
            if (pexelsRes.ok) {
              const pexelsData = await pexelsRes.json();
              if (pexelsData.photos && pexelsData.photos.length > 0) {
                recipeData.image = pexelsData.photos[0].src.large2x;
              }
            } else {
              console.error("Pexels API error:", pexelsRes.status, await pexelsRes.text());
            }
          } catch (pexelsErr: any) {
            console.error("Failed to fetch image from Pexels:", pexelsErr);
          }
        }
      }

      res.json(recipeData);

    } catch (e: any) {
      console.error(e);
      if (e.status === 503 || e.message?.includes('high demand') || e.message?.includes('UNAVAILABLE')) {
        res.status(503).json({ error: "The AI model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later." });
      } else {
        res.status(500).json({ error: e.message || "Failed to generate recipe. Please try again." });
      }
    }
  });



async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Catch-all route 
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
