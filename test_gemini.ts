import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "hello"
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("SDK Error Name:", err.name);
    console.error("SDK Error Message:", err.message);
    console.error("SDK Error Status:", err.status);
  }
}
run();
