var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_supabase_js = require("@supabase/supabase-js");
import_dotenv.default.config();
var supabaseAdmin = (0, import_supabase_js.createClient)(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
);
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use((0, import_cors.default)());
  app.use(import_express.default.json({ limit: "50mb" }));
  app.post("/api/generate-recipe", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header" });
        return;
      }
      const token = authHeader.split(" ")[1];
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (authError || !user) {
        res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
        return;
      }
      const { text, imageBase64, imageMimeType, language } = req.body;
      const langMap = {
        "en": "English",
        "es": "Spanish",
        "fr": "French",
        "de": "German",
        "it": "Italian",
        "pt": "Portuguese",
        "zh": "Chinese",
        "ja": "Japanese",
        "ko": "Korean",
        "ru": "Russian",
        "hi": "Hindi",
        "bn": "Bengali",
        "ta": "Tamil",
        "ml": "Malayalam"
      };
      const langName = language && langMap[language] ? langMap[language] : "English";
      const langInstruction = `CRITICAL: You MUST write the title, ingredients names, notes, steps, and pickyHack ENTIRELY in ${langName}. Do not use English unless the user requested English.`;
      let hasInputForAnalysis = false;
      const parts = [];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: imageMimeType || "image/jpeg",
            data: imageBase64
          }
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
          type: import_genai.Type.OBJECT,
          properties: {
            isValid: {
              type: import_genai.Type.BOOLEAN,
              description: "True if the input primarily consists of common, recognizable, edible food ingredients. False if it contains nonsense, non-food items, harmful substances, or unrecognizable input."
            },
            errorMessage: {
              type: import_genai.Type.STRING,
              description: "If isValid is false, explain why the ingredients are not recognized or invalid."
            },
            title: { type: import_genai.Type.STRING, description: "Title of the recipe" },
            time: { type: import_genai.Type.STRING, description: "Time to make, e.g. '30 min'" },
            difficulty: { type: import_genai.Type.STRING, description: "Easy, Medium, or Hard" },
            baseServings: { type: import_genai.Type.NUMBER, description: "Number of servings" },
            region: { type: import_genai.Type.STRING, description: "The regional cuisine category, e.g., Italian, Mexican, Asian, Indian, American, etc. Use 'Global' if unknown." },
            ingredients: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  amount: { type: import_genai.Type.NUMBER, description: "Numeric amount" },
                  unit: { type: import_genai.Type.STRING, description: "Unit of measure, e.g. cups, tbsp, or 'to taste'" },
                  name: { type: import_genai.Type.STRING, description: "Ingredient name" },
                  category: { type: import_genai.Type.STRING, description: "One of: Produce, Meat, Dairy, Pantry, Main, Other" },
                  notes: { type: import_genai.Type.STRING, description: "Any helpful extra details, e.g. 'about 4 large potatoes' or 'finely chopped'" }
                },
                required: ["amount", "unit", "name", "category"]
              }
            },
            steps: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING },
              description: "Step by step instructions"
            },
            pickyHack: {
              type: import_genai.Type.STRING,
              description: "A fun tip trick for serving to picky eaters kids"
            }
          },
          required: ["isValid"]
        }
      };
      const tryModel = async (modelName, retries = 1) => {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config
          });
          return JSON.parse(response.text || "{}");
        } catch (e) {
          if (retries > 0 && (e.status === 429 || e.message && e.message.includes("429"))) {
            console.log("Rate limit hit, waiting 60s before retrying...");
            await new Promise((resolve) => setTimeout(resolve, 6e4));
            return await tryModel(modelName, retries - 1);
          }
          throw e;
        }
      };
      let recipeData = await tryModel("gemini-3.5-flash");
      if (!recipeData.isValid) {
        return res.status(400).json({ error: recipeData.errorMessage || "Hmm, we don't recognize those ingredients. Try common food items!" });
      }
      let imageResult = void 0;
      let generatedImageUrl = void 0;
      if (imageBase64 && imageMimeType) {
        recipeData.image = `data:${imageMimeType};base64,${imageBase64}`;
      } else {
        recipeData.image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
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
          } catch (pexelsErr) {
            console.error("Failed to fetch image from Pexels:", pexelsErr);
          }
        }
      }
      res.json(recipeData);
    } catch (e) {
      console.error(e);
      if (e.status === 503 || e.message?.includes("high demand") || e.message?.includes("UNAVAILABLE")) {
        res.status(503).json({ error: "The AI model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later." });
      } else {
        res.status(500).json({ error: e.message || "Failed to generate recipe. Please try again." });
      }
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
